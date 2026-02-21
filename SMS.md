# SMS Menu Distribution — Setup Guide

Chefs can now send weekly menu updates via SMS in addition to email. 
Powered by [Twilio](https://twilio.com).

---

## 1. Get Twilio Credentials

1. Sign up at [console.twilio.com](https://console.twilio.com) (free trial available)
2. From the dashboard, copy:
   - **Account SID** (starts with `AC...`)
   - **Auth Token**
3. Get a phone number: **Phone Numbers → Buy a number** (Australia: ~$1.50/month)
   - Alternatively, create a **Messaging Service** (recommended for production) and use the SID (`MG...`)

---

## 2. Add to `.env`

In `server/.env`, add:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# Option A: a single Twilio phone number (E.164)
TWILIO_FROM_NUMBER=+61298765432

# Option B: a Messaging Service SID (recommended — supports alphanumeric sender IDs)
TWILIO_FROM_NUMBER=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then restart the server:
```bash
pm2 restart bmf-server --update-env
```

---

## 3. How It Works

When a chef clicks **Publish & Send** on a menu:

1. **Email** is sent to all email subscribers (as before)
2. **SMS** is sent to all subscribers who provided a phone number and haven't opted out

The SMS body looks like:

```
🍽️ Claudia's weekly menu is ready!

Week of 3 Mar – 9 Mar
• Feijoada — $18.00
• Coxinha — $12.00
• Pão de queijo — $8.00

Order by Sun 8 Mar.
👉 bringmefood.app/chef/claudia

Reply STOP to unsubscribe from SMS.
```

The opt-out link redirects to the `/unsubscribed?channel=sms` page.

---

## 4. Subscribing with a Phone Number

On any chef's public profile page, the subscribe widget now shows an optional **phone number** field.

- Customers enter their email (required) + phone (optional)
- Phone must be in **E.164 format**: `+61412345678`
- An existing subscriber can add their phone by re-subscribing with the same email

---

## 5. Pricing (Twilio)

| Action | Cost (approx.) |
|---|---|
| Australian phone number | ~$1.50 AUD/month |
| Outbound SMS (Australia) | ~$0.07–0.10 AUD/message |
| 100 SMS subscribers × weekly | ~$4–7 AUD/week |

Trial accounts get ~$15 credit to start.

---

## 6. Without Twilio

If `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` are not set:
- The distribute endpoint still sends emails normally
- SMS is skipped silently (no error)
- The chef dashboard distribute toast will note how many subscribers have SMS enabled but Twilio isn't configured

---

## 7. Testing

Use Twilio's **Test Credentials** (from the Twilio console) for local testing:
- Test Account SID: `ACtest...`
- No real SMS is sent, but the API call succeeds
- Or use your real credentials + your own Australian mobile

---

## 8. Production (Railway)

Add the three env vars in Railway under your `bmf-server` service:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
