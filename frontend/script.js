// Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : '/api';

// DOM Elements
const payButton = document.getElementById('pay-button');
const amountInput = document.getElementById('amount');
const btnLoader = payButton.querySelector('.btn-loader');
const btnText = payButton.querySelector('.btn-text');
const statusOverlay = document.getElementById('status-overlay');
const statusIcon = document.getElementById('status-icon');
const statusTitle = document.getElementById('status-title');
const statusMessage = document.getElementById('status-message');
const closeStatusBtn = document.getElementById('close-status');

// Helper to show/hide loader
const setButtonLoading = (isLoading) => {
    payButton.disabled = isLoading;
    if (isLoading) {
        btnLoader.style.display = 'block';
        btnText.innerText = 'Processing...';
    } else {
        btnLoader.style.display = 'none';
        btnText.innerText = 'Pay Now';
    }
};

// Helper to show status overlay
const showStatus = (type, title, message) => {
    statusOverlay.classList.remove('hidden');
    statusIcon.className = 'status-icon ' + type;
    statusTitle.innerText = title;
    statusMessage.innerText = message;
    
    if (type !== 'loading') {
        closeStatusBtn.classList.remove('hidden');
    } else {
        closeStatusBtn.classList.add('hidden');
    }
};

closeStatusBtn.addEventListener('click', () => {
    statusOverlay.classList.add('hidden');
});

// Main Payment Logic
const handlePayment = async () => {
    const amount = amountInput.value;
    const upiId = document.getElementById('upi-id').value.trim();

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    try {
        setButtonLoading(true);
        btnText.innerText = "Redirecting to UPI...";

        // 1. Create Order on Backend
        const orderResponse = await fetch(`${API_URL}/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });

        const orderData = await orderResponse.json();

        if (!orderData.success) throw new Error('Order creation failed');

        // 2. Configure Razorpay Options for Mobile-First Redirection
        const options = {
            key: orderData.keyId,
            amount: orderData.order.amount,
            currency: "INR",
            name: "SleekPay",
            description: "You will be redirected to your UPI app",
            order_id: orderData.order.id,
            
            // REDIRECTION CONFIGURATION
            callback_url: `${window.location.origin}/api/verify-payment`,
            redirect: true,
            
            prefill: {
                name: "Customer",
                email: "customer@example.com",
                contact: "9999999999"
            },
            
            // MOBILE UPI FOCUS
            config: {
                display: {
                    blocks: {
                        upi: {
                            name: "Pay via UPI",
                            instruments: [
                                { method: "upi" }
                            ]
                        }
                    },
                    sequence: ["block.upi"],
                    preferences: { show_default_blocks: true }
                }
            },
            
            theme: { color: "#818cf8" }
        };

        // If user entered a UPI ID, use it directly to trigger intent faster
        if (upiId) {
            options.method = 'upi';
            options.vpa = upiId;
        }

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (error) {
        console.error('Payment Error:', error);
        setButtonLoading(false);
        alert("System Error: Could not initiate payment.");
    }
};

payButton.addEventListener('click', handlePayment);
