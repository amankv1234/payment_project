const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');

// Load environment variables relative to this file
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve frontend static files

// Safety check for keys
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("❌ CRITICAL ERROR: Razorpay API keys are missing in .env file!");
    process.exit(1);
}

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Route: Create Order
 */
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) return res.status(400).json({ success: false, message: "Amount required" });

        const options = {
            amount: Math.round(parseFloat(amount) * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ success: false, message: "Could not create order" });
    }
});

/**
 * Route: Verify Payment (Callback Handler)
 * Purpose: Razorpay redirects here after payment attempt
 */
app.post('/api/verify-payment', async (req, res) => {
    try {
        // Razorpay sends data in req.body for POST callback
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // 1. Signature Verification
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature !== razorpay_signature) {
            console.error("❌ Signature mismatch!");
            return res.redirect('/failed.html');
        }

        // 2. Fetch Payment Details to finalize
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        
        if (payment.status === 'captured' || payment.status === 'authorized') {
            console.log(`✅ Payment Verified: ${razorpay_payment_id}`);
            return res.redirect('/success.html');
        } else {
            return res.redirect('/failed.html');
        }

    } catch (error) {
        console.error("Verification Redirection Error:", error);
        res.redirect('/failed.html');
    }
});

// Basic Health Check
app.get('/health', (req, res) => {
    res.send("Razorpay Backend is running 🚀");
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running locally on http://localhost:${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
