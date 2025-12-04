# Authentication & Route Protection Implementation

This document describes the new authentication and route protection system implemented for Bring Me Food.

## Overview

A three-layer authentication system has been implemented following Next.js App Router best practices:

1. **Next.js Middleware** - Fast, server-side route protection (blocks access at request time)
2. **Component-level Guards** - React hooks for UI-level protection and role verification
3. **Express Backend Middleware** - API route protection (prevents unauthorized API calls)

**Default Policy**: All routes require authentication EXCEPT explicitly marked public routes.

---

## Architecture

### 1. Next.js Middleware (`client/src/middleware.ts`)

Runs on every HTTP request before the page renders. Provides the fastest protection by redirecting unauthenticated users immediately.

**Public Routes** (accessible without login):
- `/` - Home page
- `/how-it-works` - Info page
- `/search` - Browse available meals
- `/chef/[username]` - Public chef profiles

**Protected Routes** (require login):
- `/account/*` - All account-related routes
- `/account/chef/*` - Chef dashboard, meals, menus, orders, profile (chef-only)
- `/account/customer/*` - Customer profile, orders, checkout (customer-only)

**How it works**:
```typescript
// middleware.ts reads session cookie
const sessionCookie = request.cookies.get(SESSION_KEY)?.value;
const sessionData = sessionCookie ? JSON.parse(sessionCookie) : null;

// Denies unauthenticated access to protected routes
if (!sessionData && !isPublicRoute) {
  return NextResponse.redirect(new URL("/", request.url));
}

// Prevents role mixing (chefs can't access customer routes, etc.)
if (isChefRoute && !sessionData.isChef) {
  return NextResponse.redirect(new URL("/", request.url));
}
```

---

### 2. Auth Context & useAuthGuard Hook

#### Updated Auth Context (`client/src/lib/auth.tsx`)

- Maintains user state in React Context
- Stores session in both `sessionStorage` (for React state) and cookies (for middleware)
- Provides `isLoading` state to handle hydration race conditions

```typescript
const { user, isLoading } = useAuth();

if (isLoading) return <div>Loading...</div>;
// user is now guaranteed to be populated or null
```

#### useAuthGuard Hook (`client/src/hooks/useAuthGuard.ts`)

A React hook for protecting pages/components with auth checks. Redirects if:
- User is not logged in
- User doesn't have required role (chef/customer)
- Loading is complete (avoids race conditions)

**Usage**:
```typescript
"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function ChefDashboard() {
  // Ensures only chefs can access this page
  const { user, isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) return <div>Loading...</div>;

  return <div>Welcome {user?.email}</div>;
}
```

**Options**:
```typescript
useAuthGuard({
  requireChef: true,        // Only chefs
  requireCustomer: true,    // Only customers (non-chefs)
  redirectTo: "/",          // Where to redirect on access denied (default: "/")
})
```

---

### 3. Express Backend Middleware (`server/src/middleware/auth.ts`)

Protects API routes by verifying the session cookie and attaching user info to `req.user`.

#### Middleware Functions

**`authMiddleware`** - Parses session cookie (permissive, doesn't fail)
```typescript
app.use(authMiddleware);
// Now req.user contains { id, email, isChef } if logged in
```

**`requireAuth`** - Requires login
```typescript
router.post("/orders", requireAuth, createOrder);
// Returns 401 if not logged in
```

**`requireChef`** - Requires chef role
```typescript
router.post("/meals", requireAuth, requireChef, createMeal);
// Returns 403 if not a chef
```

**`requireCustomer`** - Requires customer role
```typescript
router.post("/orders", requireAuth, requireCustomer, createOrder);
// Returns 403 if chef or not logged in
```

---

## Implementation Details

### Session Storage

Session is stored in **cookies** (for middleware access) and **sessionStorage** (for React access):

```typescript
// When user logs in
const expiresIn = new Date();
expiresIn.setHours(expiresIn.getHours() + 24);
document.cookie = `session=${encodeURIComponent(
  JSON.stringify(user)
)}; path=/; expires=${expiresIn.toUTCString()}; SameSite=Strict`;
```

**Cookie Properties**:
- Expires in 24 hours
- `SameSite=Strict` for CSRF protection
- Path: `/` (accessible to entire app)
- Both frontend and backend can read it

### User Object Structure

```typescript
interface User {
  id: string;
  email: string;
  status: "CREATED" | "ACTIVE" | "INACTIVE";
  isChef?: boolean;  // Key for role-based access
  chef?: {
    // Chef profile data
  };
  customer?: {
    // Customer profile data
  };
}
```

---

## Protected Pages Updated

All protected pages now use `useAuthGuard`:

### Chef Pages
- ✅ `/account/chef/dashboard` - `requireChef: true`
- ✅ `/account/chef/profile` - `requireChef: true`
- ✅ `/account/chef/meals` - `requireChef: true`
- ✅ `/account/chef/menus` - `requireChef: true`
- ✅ `/account/chef/orders` - `requireChef: true`

### Customer Pages
- ✅ `/account/customer/profile` - `requireCustomer: true`
- ✅ `/account/customer/orders` - `requireCustomer: true`
- ✅ `/checkout` - `requireCustomer: true`

---

## Future Migration to Real Authentication

This implementation is **framework-agnostic** and ready for real authentication systems:

### To implement real auth (JWT/OAuth):

1. **Update Auth Context**:
   ```typescript
   // Replace mock users with real auth call
   async function login(email: string, password: string) {
     const response = await fetch("/api/auth/login", {
       method: "POST",
       body: JSON.stringify({ email, password }),
     });
     const { user, token } = await response.json();
     setUser(user);
     // Store token in cookie (same as now)
     document.cookie = `session=${token}; ...`;
   }
   ```

2. **Update Backend Middleware**:
   ```typescript
   // Verify JWT token instead of parsing user object
   function authMiddleware(req, res, next) {
     const token = req.cookies.session;
     const user = verifyJWT(token);
     req.user = user;
     next();
   }
   ```

3. **Keep Everything Else The Same** - Middleware, hooks, and route protection logic remain unchanged.

---

## Access Control Matrix

| Route | Public | Logged In | Chef Only | Customer Only | Notes |
|-------|--------|-----------|-----------|---------------|-------|
| `/` | ✅ | ✅ | - | - | Home page |
| `/how-it-works` | ✅ | ✅ | - | - | Info page |
| `/search` | ✅ | ✅ | - | - | Browse meals |
| `/chef/[username]` | ✅ | ✅ | - | - | Public profiles |
| `/account/chef/*` | ❌ | ✅ | ✅ | ❌ | Chef only |
| `/account/customer/profile` | ❌ | ✅ | ❌ | ✅ | Customer only |
| `/account/customer/orders` | ❌ | ✅ | ❌ | ✅ | Customer only |
| `/checkout` | ❌ | ✅ | ❌ | ✅ | Customer only |

---

## Adding New Protected Routes

### For Chef-Only Pages:

1. Create page component:
   ```typescript
   // app/account/chef/my-page/page.tsx
   "use client";

   import { useAuthGuard } from "@/hooks/useAuthGuard";

   export default function MyPage() {
     const { user, isLoading } = useAuthGuard({ requireChef: true });

     if (isLoading) return <div>Loading...</div>;
     return <div>Welcome {user?.email}</div>;
   }
   ```

2. Middleware automatically blocks non-chefs (already configured)

### For Customer-Only Pages:

1. Create page component:
   ```typescript
   // app/account/customer/my-page/page.tsx
   "use client";

   import { useAuthGuard } from "@/hooks/useAuthGuard";

   export default function MyPage() {
     const { user, isLoading } = useAuthGuard({ requireCustomer: true });

     if (isLoading) return <div>Loading...</div>;
     return <div>Welcome {user?.email}</div>;
   }
   ```

2. Middleware automatically blocks chefs (already configured)

### For Public Pages with Auth Benefits:

If you want a page public but showing different content to logged-in users:

```typescript
"use client";

import { useAuth } from "@/lib/auth";

export default function MyPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>Welcome back {user.email}</div>
      ) : (
        <div>Please sign in</div>
      )}
    </div>
  );
}
```

---

## Testing the Implementation

### 1. Test Public Routes (No Login Required)
```bash
curl http://localhost:3000/                    # ✅ Works
curl http://localhost:3000/how-it-works        # ✅ Works
curl http://localhost:3000/search              # ✅ Works
curl http://localhost:3000/chef/sarah_kitchen  # ✅ Works
```

### 2. Test Protected Routes (Login Required)
```bash
# Without login - should redirect to home
curl http://localhost:3000/account/chef/dashboard  # ❌ Redirects to /

# With login - should work
# (Log in via UI first, then test)
```

### 3. Test Role-Based Access
- **Chef Login** → Can access `/account/chef/*`
- **Chef Login** → Cannot access `/account/customer/*`, redirected to home
- **Customer Login** → Can access `/account/customer/*`
- **Customer Login** → Cannot access `/account/chef/*`, redirected to home

### 4. Test Backend API Protection
```bash
# Create order (requires customer role)
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"items": [...]}'
# Without auth: 401
# With chef auth: 403
# With customer auth: 200
```

---

## Key Design Decisions

### Why Cookies + sessionStorage?

1. **Cookies**: Read by Next.js middleware (server-side)
2. **sessionStorage**: Read by React (client-side)
3. **Redundancy**: Works even if middleware is bypassed (defense in depth)

### Why useAuthGuard Instead of Middleware Alone?

1. **Prevents flash of content**: Middleware redirects before React renders
2. **Component-level control**: Can conditionally render based on role
3. **Better UX**: Can show loading state while auth loads

### Why Three Layers?

1. **Middleware**: Fastest protection (happens before React)
2. **React Hook**: Best UX (loading states, conditional rendering)
3. **Backend**: Real protection (prevents direct API calls without auth)

---

## Common Issues & Solutions

### Issue: Page flashes content before redirecting

**Solution**: Use `useAuthGuard` and check `isLoading`:
```typescript
if (isLoading) return <div>Loading...</div>;
// Content only renders after auth verified
```

### Issue: Backend receives request without auth

**Solution**: Add `requireAuth` middleware to routes:
```typescript
router.post("/meals", requireAuth, requireChef, createMeal);
```

### Issue: Cookie not sent to backend

**Solution**: Ensure CORS `credentials` is set:
```typescript
// server/src/index.ts
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,  // Allow cookies
}));
```

---

## Files Changed

- ✅ `client/src/middleware.ts` - Created
- ✅ `client/src/lib/auth.tsx` - Updated (added isLoading, cookies)
- ✅ `client/src/hooks/useAuthGuard.ts` - Created
- ✅ `server/src/middleware/auth.ts` - Created
- ✅ `server/src/index.ts` - Updated (added authMiddleware import)
- ✅ `client/src/app/account/chef/dashboard/page.tsx` - Updated
- ✅ `client/src/app/account/chef/profile/page.tsx` - Updated
- ✅ `client/src/app/account/chef/meals/page.tsx` - Updated
- ✅ `client/src/app/account/chef/menus/page.tsx` - Updated
- ✅ `client/src/app/account/chef/orders/page.tsx` - Updated
- ✅ `client/src/app/account/customer/profile/page.tsx` - Updated
- ✅ `client/src/app/account/customer/orders/page.tsx` - Updated
- ✅ `client/src/app/checkout/page.tsx` - Updated

---

## Next Steps

1. **Protect More API Routes**: Add `requireAuth`, `requireChef`, `requireCustomer` to meal, menu, chef, and customer routes
2. **Implement Real Authentication**: Replace mock login with JWT/OAuth
3. **Add Session Refresh**: Implement token refresh for long-lived sessions
4. **Add Logout API**: Create `/api/auth/logout` endpoint
5. **Add Audit Logging**: Log all auth events for security

---

## References

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/guides/authentication)
- [Next.js Auth Best Practices](https://nextjs.org/docs/app/api-reference/file-conventions/middleware)
- [HTTP Only Cookies vs localStorage](https://auth0.com/docs/secure/tokens/token-storage)
