# Deployment Guide — Bring Me Food

Recommended stack: **Vercel** (frontend) + **Railway** (backend + PostgreSQL) + **AWS S3** (images).

All free tiers. Estimated cost at launch: **$0/month**.

---

## Prerequisites

- GitHub account (push this repo)
- [Railway](https://railway.app) account
- [Vercel](https://vercel.com) account
- (Optional) [Resend](https://resend.com) account for emails
- (Optional) AWS account + S3 bucket for image storage

---

## 1. Deploy the Backend (Railway)

### a. Create a new Railway project
1. Go to [railway.app](https://railway.app) → New Project → **Deploy from GitHub**
2. Select your `bring-me-food-aws` repo
3. Set the **root directory** to `server/`
4. Railway will detect the Dockerfile automatically

### b. Add a PostgreSQL database
1. In the Railway project → **New Service** → **Database** → PostgreSQL
2. Railway auto-creates a `DATABASE_URL` variable — copy it into your service's env vars

### c. Set environment variables (Railway service settings → Variables)

```
PORT=8000
DATABASE_URL=<from Railway PostgreSQL>
JWT_SECRET=<generate: openssl rand -hex 32>
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Images — use AWS S3 or keep blank for local (MinIO not available on Railway)
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=bring-me-food
S3_REGION=ap-southeast-2
S3_ACCESS_KEY=<your AWS access key>
S3_SECRET_KEY=<your AWS secret key>
S3_PUBLIC_URL=https://<bucket>.s3.ap-southeast-2.amazonaws.com
FINAL_PREFIX=uploads/final
TMP_PREFIX=uploads/tmp

# Email (get your key at resend.com — free: 3000 emails/month)
RESEND_API_KEY=re_your_key_here
APP_BASE_URL=https://your-vercel-app.vercel.app
```

### d. Deploy
Railway will build and deploy automatically on every push to `main`.

Your API will be available at: `https://your-service.up.railway.app/api`

---

## 2. Deploy the Frontend (Vercel)

### a. Import the project
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select `bring-me-food-aws`
3. Set **Root Directory** to `client/`
4. Framework preset: **Next.js** (auto-detected)

### b. Set environment variables (Vercel project settings → Environment Variables)

```
NEXT_PUBLIC_API_BASE_URL=https://your-railway-service.up.railway.app/api
```

### c. Deploy
Vercel deploys automatically on every push. Your app will be at:
`https://your-project.vercel.app`

To use a custom domain (e.g. `bringmefood.app`), add it in Vercel project settings.

---

## 3. AWS S3 Setup (for image uploads)

1. Create an S3 bucket in `ap-southeast-2` (Sydney) or your preferred region
2. Set bucket CORS to allow uploads from your Vercel domain:
   ```json
   [{"AllowedOrigins": ["https://your-vercel-app.vercel.app"], "AllowedMethods": ["GET", "PUT"], "AllowedHeaders": ["*"]}]
   ```
3. Create an IAM user with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` permissions on the bucket
4. Add the access key + secret to Railway environment variables

---

## 4. Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com) — free tier: 3,000 emails/month
2. Verify your domain (e.g. `bringmefood.app`) or use `onboarding@resend.dev` for testing
3. Create an API key and add it to Railway as `RESEND_API_KEY`
4. Update the `from` addresses in `server/src/lib/email.ts` to match your verified domain

---

## 5. Post-deploy checklist

- [ ] Hit `GET /api/health` — should return `{"status": "ok", "db": "connected"}`
- [ ] Create a chef account and sign in
- [ ] Add a meal and create a menu
- [ ] Visit `https://your-app.vercel.app/chef/[username]` — public profile visible
- [ ] Subscribe to the email list (use your own email)
- [ ] Click "Publish & Send" on a menu — verify the email arrives
- [ ] Place a guest order — verify chef receives notification email
- [ ] Set up custom domain in Vercel

---

## Local Dev (for reference)

```bash
# Start infrastructure
docker-compose up -d

# Backend
cd server && npm install && npm run dev

# Frontend  
cd client && npm install && npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:8000/api  
MinIO console: http://localhost:9001 (user: minioadmin, pass: minioadmin)
