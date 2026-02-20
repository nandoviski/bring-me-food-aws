# Local Development Guide

Everything you need to run Bring Me Food on your machine from scratch.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | 22+ | [nodejs.org](https://nodejs.org) |
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop) — must be running |
| **npm** | Bundled with Node | |

Optional but recommended:
- **PM2** (`npm install -g pm2`) — keeps servers running in the background

---

## 1. Clone & Install

```bash
git clone https://github.com/nandoviski/bring-me-food-aws.git
cd bring-me-food-aws

# Install server and client dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..
```

---

## 2. Start Infrastructure (Docker)

From the **repo root**:

```bash
docker-compose up -d
```

This starts two containers:

| Container | What | Ports |
|---|---|---|
| `bmf-postgres` | PostgreSQL database | `5432` |
| `bmf-minio` | S3-compatible file storage | `9000` (API), `9001` (console) |

**Verify they're running:**
```bash
docker ps
```
You should see both containers with status `Up`.

**MinIO console** (web UI for browsing uploaded files):  
→ http://localhost:9001 · Username: `minioadmin` · Password: `minioadmin`

> The MinIO bucket (`bring-me-food`) is **auto-created** when the server boots. You don't need to create it manually.

---

## 3. Configure Environment Variables

### Server (`server/.env`)

Copy the example and fill in your values:

```bash
cp server/.env.example server/.env
```

Full config for local dev:

```env
# Server
PORT=8000
NODE_ENV=development

# Database (matches docker-compose defaults)
DATABASE_URL=postgresql://bmf:bmf_password@localhost:5432/bring_me_food

# Auth — generate a random secret (any long string works for local dev)
JWT_SECRET=change-this-to-a-long-random-string-at-least-32-chars

# MinIO (S3-compatible local storage — matches docker-compose defaults)
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=bring-me-food
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_URL=http://localhost:9000/bring-me-food
FINAL_PREFIX=uploads/final
TMP_PREFIX=uploads/tmp

# Email — get a free API key at resend.com
# For local testing, Resend's free tier only sends to your verified account email
RESEND_API_KEY=re_your_key_here
EMAIL_FROM_MENU=onboarding@resend.dev
EMAIL_FROM_ORDERS=onboarding@resend.dev

# App URL (used in email links like password reset)
APP_BASE_URL=http://localhost:3000
```

### Client (`client/.env.local`)

```bash
cp client/.env.example client/.env.local
```

For local dev this file only needs one line:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

---

## 4. Set Up the Database

Run migrations (creates all tables):

```bash
cd server
npx prisma migrate dev
```

If you want to inspect the database visually:

```bash
npx prisma studio
```

→ Opens at http://localhost:5555

---

## 5. Run the App

### Option A — PM2 (recommended, runs in background)

```bash
npm install -g pm2

pm2 start npm --name "bmf-server" --cwd ./server   -- run dev
pm2 start npm --name "bmf-client" --cwd ./client   -- run dev

pm2 save   # saves process list so you can restore it later
```

Useful PM2 commands:
```bash
pm2 list              # see all running processes
pm2 logs bmf-server   # stream server logs
pm2 logs bmf-client   # stream client logs
pm2 restart all       # restart everything
pm2 stop all          # stop everything
pm2 resurrect         # restore saved process list after a reboot
```

### Option B — Two separate terminals

**Terminal 1 — Backend:**
```bash
cd server && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
```

### App is running at:

| URL | What |
|---|---|
| http://localhost:3000 | Main app (customer + chef UI) |
| http://localhost:8000/api | REST API |
| http://localhost:8000/api/health | Health check endpoint |
| http://localhost:9001 | MinIO console (file browser) |

---

## 6. Email Setup (Resend)

Email is used for:
- **Menu distribution** — chefs send weekly menus to subscribers
- **Order notifications** — chef gets an email when an order is placed
- **Order confirmation** — guest customers get a confirmation email
- **Password reset** — users get a reset link by email

### Get a free Resend key

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys → Create Key
3. Copy the key into `server/.env` as `RESEND_API_KEY`

### Limitation on free Resend (no domain verified)

Without a verified domain, Resend restricts sending to **your own account email only**.

- Emails **will work** for your account email
- Emails to other addresses **will be rejected** by Resend

**To send to anyone**, verify a domain:
1. Go to resend.com/domains → Add Domain
2. Add the DNS records they give you (takes a few minutes to propagate)
3. Update `EMAIL_FROM_MENU` and `EMAIL_FROM_ORDERS` in `server/.env` to use your domain (e.g. `noreply@yourdomain.com`)

For local testing, you can leave it as `onboarding@resend.dev` — just note that emails only go to your Resend account email.

---

## 7. Test the Full Flow

Once everything is running, here's the end-to-end test:

### As a Chef

1. Go to http://localhost:3000 → Sign In → Create Account → **Chef** tab
2. Fill in name, email, password, location
3. After signing in, go to your **Dashboard** → follow the onboarding checklist:
   - Upload a profile photo
   - Add a few meals (name, price, photo, ingredients)
   - Create a weekly menu from your meals
   - Publish the menu (sends email to subscribers)
4. Your public page is at: `http://localhost:3000/chef/[your-username]`

### As a Customer

1. Visit a chef's public page (e.g. http://localhost:3000/chef/[username])
2. Browse the weekly menu
3. Add meals to cart (cart icon shows in the navbar)
4. Click the cart → **Proceed to Checkout**
5. Choose **Guest checkout** or sign in with an account
6. Fill in your details and confirm the order

### Verify the order

- Chef's dashboard → Orders → the order should appear as **Pending**
- Chef can Confirm → Deliver → (or Cancel) the order

---

## 8. After a Reboot

Docker containers and PM2 processes don't survive a Mac reboot automatically.

**Restart everything:**

```bash
# Start Docker containers
docker start bmf-postgres bmf-minio

# Restore PM2 processes (if you ran pm2 save earlier)
pm2 resurrect

# Or start manually
pm2 start npm --name "bmf-server" --cwd ./server -- run dev
pm2 start npm --name "bmf-client" --cwd ./client -- run dev
```

**Want auto-start on boot?** Run `pm2 startup` and follow the instructions it prints.

---

## 9. Troubleshooting

**"Can't connect to database"**
→ Docker not running. Start Docker Desktop, then `docker start bmf-postgres`.

**"Bucket does not exist" or image uploads fail**
→ The bucket auto-creates at server boot. If it fails, check MinIO is running (`docker ps`) and that `S3_ENDPOINT=http://localhost:9000` in `server/.env`.

**"Invalid email or password" on sign in**
→ Use "Forgot password?" link in the sign-in modal to reset via email.

**Emails not sending**
→ Check `RESEND_API_KEY` is set. Without it, email calls silently fail. Also check that the `to` address is your Resend account email until a domain is verified.

**Port already in use**
→ Something else is using 3000 or 8000. Find and kill it: `lsof -ti:3000 | xargs kill` (Mac/Linux).

**Prisma errors after pulling new code**
→ Run `cd server && npx prisma migrate dev` to apply any new migrations.

---

## 10. Project Structure (quick reference)

```
bring-me-food-aws/
├── client/               # Next.js 15 frontend
│   ├── src/app/          # Pages (App Router)
│   ├── src/features/     # Feature modules (chef, meal, order, cart...)
│   ├── src/components/   # Shared UI (navbar, modals, auth...)
│   ├── src/state/        # RTK Query API client
│   └── src/schema/       # Zod schemas + TypeScript types
├── server/               # Express.js backend
│   ├── src/controllers/  # Route handlers
│   ├── src/routes/       # Express routers
│   ├── src/middleware/   # Auth (JWT), guards
│   ├── src/lib/          # Email service (Resend), S3 client
│   └── src/utils/        # JWT helpers
├── server/prisma/        # Prisma schema + migrations
├── docker-compose.yml    # PostgreSQL + MinIO for local dev
├── LOCAL_DEV.md          # ← you are here
├── README.md             # Product overview + API reference
└── DEPLOY.md             # Production deployment (Railway + Vercel)
```
