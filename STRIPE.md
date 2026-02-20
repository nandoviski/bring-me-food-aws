# Stripe Payments Setup Guide

## Overview

Bring Me Food now supports Stripe Checkout for online payments. Customers are redirected to Stripe's hosted payment page after placing an order, and payment status is tracked in real-time via webhooks.

## What was built

- **Stripe Checkout**: customers are redirected to a Stripe-hosted payment page after order creation
- **Webhook handler**: Stripe notifies the server when payment is complete → order marked as PAID automatically
- **Payment status tracking**: every order shows Paid / Unpaid / Refunded status in the chef dashboard
- **Chef dashboard stats**: "Awaiting Payment" card + Stripe-confirmed revenue breakdown
- **Order success page**: `/order/success` shown after successful payment
- **Graceful fallback**: if Stripe is not configured, the old confirmation flow still works

## Setup (takes ~5 minutes)

### Step 1: Get your Stripe keys

1. Go to [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Create an account if needed (free)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)

### Step 2: Add to server/.env

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here   # see Step 4
```

Also make sure this is set (it's used for Stripe success/cancel redirects):

```env
APP_BASE_URL=http://localhost:3000   # or your production URL
```

### Step 3: Restart the server

```bash
pm2 restart bmf-server
```

### Step 4: Set up the webhook (for payment confirmation)

#### Local development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run:
   ```bash
   stripe login
   stripe listen --forward-to localhost:8000/api/stripe/webhook
   ```
3. Copy the `whsec_...` secret it prints → add to `server/.env` as `STRIPE_WEBHOOK_SECRET`
4. Restart the server again

#### Production (Railway):

1. In Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-railway-url.railway.app/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `charge.refunded`
4. Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET` in Railway environment variables

### Step 5: Test it

1. Open the app at `http://localhost:3000`
2. Add meals to cart, go to checkout
3. Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC
4. Complete payment
5. Check the chef dashboard — the order should show **Paid ✓**

## Test cards (Stripe test mode)

| Card number | Scenario |
|---|---|
| 4242 4242 4242 4242 | Payment succeeds |
| 4000 0000 0000 9995 | Card declined (insufficient funds) |
| 4000 0025 0000 3155 | Requires 3D Secure authentication |

## Going live

When ready to accept real payments:
1. Activate your Stripe account (add business details)
2. Switch to **live** keys in Stripe Dashboard
3. Update `STRIPE_SECRET_KEY` to `sk_live_...`
4. Update the webhook to use live keys too
5. Stripe takes **2.9% + 30¢** per transaction (standard)

## Architecture

```
Customer → Checkout form → POST /api/orders → Order created (paymentStatus: PENDING)
         → POST /api/orders/:id/checkout → Stripe Checkout Session created
         → Redirected to Stripe-hosted payment page
         → Payment completes → Stripe webhook → POST /api/stripe/webhook
         → paymentStatus → PAID
         → Customer sees /order/success page
```

The webhook is mounted **before** Express body parsers (required by Stripe for signature verification).
