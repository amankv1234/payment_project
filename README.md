# SleekPay - Secure UPI Payment Integration

A modern, mobile-first payment integration using Razorpay with auto-redirection and server-side verification.

## Features
- **Mobile UPI Intent**: Automatically opens UPI apps (GPay, PhonePe, etc.) on mobile.
- **Glassmorphism UI**: Beautiful, responsive, and animated design.
- **Server-Side Verification**: Secure signature verification on the backend.
- **Auto Redirection**: Smooth flow to Success/Failed/Cancel pages.
- **Vercel Ready**: Pre-configured for seamless deployment.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **API**: Razorpay SDK

## Environment Variables
Create a `.env` file in the `backend` folder or set these in Vercel:
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
PORT=5000
```

## Local Development
1. Clone the repository.
2. `cd backend && npm install`
3. Add your keys to `backend/.env`.
4. `node server.js`
5. Open `http://localhost:5000` in your browser.

## Deployment on Vercel
1. Push this project to GitHub.
2. Connect your repository to Vercel.
3. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in **Project Settings > Environment Variables**.
4. Deploy! Vercel will use `vercel.json` for routing.
