# ADMIN.md — Admin Panel Guide

The admin panel is live at `/admin` in the Bring Me Food app. It's only visible to users with `isAdmin: true`.

## Accessing the Admin Panel

1. Go to `http://localhost:3000/admin` (or your production URL)
2. Sign in with your account (fmarostega@gmail.com)
3. You'll see the **Admin Panel** link in the navbar → click it

> ℹ️ Your account was made admin automatically during the overnight build. You're already set up.

---

## What's in the Admin Panel

### 📊 Dashboard (`/admin/dashboard`)
- Total users (chefs + customers)
- Total orders + pending count
- Total paid revenue
- Email subscriber count
- Weekly orders + revenue at a glance
- **Revenue trend chart** — 7/30/90 day toggle (AreaChart — only shows paid orders)
- Recent chefs who joined
- Recent orders with status

### 👨‍🍳 Chefs (`/admin/chefs`)
- All chef accounts with their stats (orders, meals, subscribers, revenue)
- Search by name, username, or location
- Pagination (20 per page)
- **Status management**: Set Active / Inactive / Block any user
- **Admin toggle**: Make any user an admin (or revoke)
- **View public page** link → opens `/chef/:username`

### 🛒 Orders (`/admin/orders`)
- All orders across the platform
- Filter by order status (Pending / Confirmed / Delivered / Cancelled)
- Filter by payment status (Unpaid / Paid / Refunded / Failed)
- **Order detail modal**: click the 👁 icon to see full order breakdown
  - Customer info (name, email, phone)
  - Chef
  - Line items + quantities
  - Promo code applied
  - Delivery fee
  - Total

---

## Making Someone an Admin (Production)

### Via the Admin Panel (if you already have admin access)
1. Go to `/admin/chefs`
2. Find the user's chef row
3. Click `⋯` → **Make admin**

### Via the Database (Railway CLI or psql)

```bash
# Railway production
railway run psql $DATABASE_URL
```

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your@email.com';
```

### Via a Node.js script (local dev)

```bash
cd server
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.update({
  where: { email: 'your@email.com' },
  data: { isAdmin: true }
}).then(u => { console.log('Done:', u.email, 'isAdmin:', u.isAdmin); prisma.\$disconnect(); });
"
```

---

## API Endpoints

All admin endpoints require `Authorization: Bearer <token>` and `isAdmin: true`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/stats` | Platform-wide stats |
| `GET` | `/api/admin/chefs` | All chefs (paginated, searchable) |
| `GET` | `/api/admin/orders` | All orders (paginated, filterable) |
| `GET` | `/api/admin/revenue-trend` | Daily revenue for N days |
| `PATCH` | `/api/admin/users/:id/status` | Update user status (ACTIVE/BLOCKED/etc.) |
| `PATCH` | `/api/admin/users/:id/make-admin` | Toggle isAdmin flag |

---

## Security

- The `isAdmin` flag is stored in the `User` table
- All admin routes check `req.user.isAdmin` on the server (not just the client)
- Blocked users cannot sign in (backend validates status on auth/me calls)
- The admin panel in the frontend redirects non-admin users to `/`

---

_Built overnight 2026-02-23 by Finn 🐟_
