# Bring Me Food 🍽️

A platform for home chefs and local food businesses to take orders online.

**Problem:** Small food businesses take orders via Instagram DMs and WhatsApp with zero system. It's chaos.

**Solution:** Every chef gets a shareable page (`bringmefood.app/chef/[username]`). Customers browse, subscribe, and order. Chef gets an email when an order lands. Done.

---

## What It Does

### For Chefs
- Create a public profile with bio, location, and specialties
- Add meals with photos, prices, allergens, and ingredients
- Build weekly menus from their meal library
- **Publish & Send** — one click emails the menu to all subscribers
- View and manage incoming orders (confirm / deliver / cancel)
- Dashboard with real-time stats: revenue, orders, pending, subscribers

### For Customers
- Browse the chef directory or visit a direct link
- Subscribe to weekly menu emails (no account required)
- **Order without signing up** — guest checkout with name + phone
- Optionally create an account to track order history
- Get an order confirmation email after placing a guest order

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 · React 19 · TailwindCSS · shadcn/ui |
| Backend | Express.js · Prisma ORM |
| Database | PostgreSQL |
| Storage | MinIO (dev) / AWS S3 (prod) |
| Email | Resend (3k emails/month free) |
| Auth | JWT (simple, no Cognito) |
| Language | TypeScript everywhere |

---

## Quick Start (Local Dev)

### Prerequisites
- Docker Desktop
- Node.js 22+

### 1. Start infrastructure

```bash
docker-compose up -d
```

Starts PostgreSQL (port 5432) and MinIO (port 9000 / console 9001).

### 2. Backend

```bash
cd server
cp .env.example .env   # fill in your values
npm install
npx prisma migrate dev --name init
npm run dev
```

API at: http://localhost:8000/api

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

App at: http://localhost:3000

---

## Project Structure

```
bring-me-food-aws/
├── client/               # Next.js 15 app
│   ├── src/
│   │   ├── app/          # Pages (App Router)
│   │   ├── features/     # Feature-scoped components
│   │   ├── components/   # Shared UI components
│   │   ├── state/        # RTK Query API client
│   │   └── schema/       # Zod schemas + TypeScript types
│   └── vercel.json       # Vercel deployment config
├── server/               # Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # Express routers
│   │   ├── middleware/   # Auth, error handling
│   │   ├── lib/          # Email service (Resend)
│   │   └── utils/        # JWT helpers
│   ├── prisma/           # Schema + migrations
│   ├── Dockerfile        # Production container
│   └── railway.json      # Railway deployment config
├── docker-compose.yml    # Dev infrastructure
├── DEPLOY.md             # Production deployment guide
└── README.md
```

---

## Environment Variables

### Server (`.env`)

```env
PORT=8000
DATABASE_URL=postgresql://bmf:bmf_password@localhost:5432/bring_me_food
JWT_SECRET=your-random-32-char-secret

# MinIO / S3
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=bring-me-food
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_PUBLIC_URL=http://localhost:9000/bring-me-food
FINAL_PREFIX=uploads/final
TMP_PREFIX=uploads/tmp

# Email (get free key at resend.com)
RESEND_API_KEY=re_your_key_here
APP_BASE_URL=http://localhost:3000
```

### Client (`.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

---

## Key API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Sign up as chef or customer |
| POST | `/auth/signin` | — | Sign in, returns JWT |
| GET | `/chefs` | — | List/search all chefs |
| GET | `/chefs/:username/profile` | — | Get chef profile |
| GET | `/chefs/:chefId/menu` | — | Get chef's current weekly menu |
| POST | `/menus` | Chef | Create menu |
| POST | `/menus/:menuId/distribute` | Chef | Email menu to all subscribers |
| POST | `/subscribers/:chefId` | — | Subscribe to chef emails |
| GET | `/subscribers/:chefId/unsubscribe` | — | Unsubscribe (from email link) |
| POST | `/orders` | Optional | Place order (guest or logged-in) |
| PATCH | `/orders/:orderId/status` | Chef | Update order status |
| POST | `/upload/presign` | Auth | Presign URL for image upload |

---

## Deployment

See [DEPLOY.md](./DEPLOY.md) for step-by-step instructions.

**Recommended (free tier):**
- Frontend → [Vercel](https://vercel.com)
- Backend → [Railway](https://railway.app) with Dockerfile
- Database → Railway PostgreSQL
- Storage → AWS S3 (Sydney region)
- Email → [Resend](https://resend.com) (free: 3k/month)

---

## License

MIT
