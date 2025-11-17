# Authentication Quick Reference Guide

## Quick Start: Protecting a New Page

### Chef-Only Page
```typescript
"use client";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function MyPage() {
  const { user, isLoading } = useAuthGuard({ requireChef: true });

  if (isLoading) return <div>Loading...</div>;
  return <div>Chef content: {user?.email}</div>;
}
```

### Customer-Only Page
```typescript
"use client";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function MyPage() {
  const { user, isLoading } = useAuthGuard({ requireCustomer: true });

  if (isLoading) return <div>Loading...</div>;
  return <div>Customer content: {user?.email}</div>;
}
```

### Any Logged-In User
```typescript
"use client";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function MyPage() {
  const { user, isLoading } = useAuthGuard();

  if (isLoading) return <div>Loading...</div>;
  return <div>Private content: {user?.email}</div>;
}
```

### Public Page with Optional Login
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

## Protecting Backend Routes

### Require Login
```typescript
import { requireAuth } from "@/middleware/auth";

router.post("/orders", requireAuth, createOrder);
// Returns 401 if not authenticated
```

### Require Chef Role
```typescript
import { requireAuth, requireChef } from "@/middleware/auth";

router.post("/meals", requireAuth, requireChef, createMeal);
// Returns 401 if not authenticated, 403 if not a chef
```

### Require Customer Role
```typescript
import { requireAuth, requireCustomer } from "@/middleware/auth";

router.post("/orders", requireAuth, requireCustomer, createOrder);
// Returns 401 if not authenticated, 403 if not a customer
```

---

## Current Access Control

### Public (No Login Required)
- `/` - Home
- `/how-it-works` - Info
- `/search` - Browse meals
- `/chef/[username]` - Chef profiles

### Chef Only
- `/account/chef/*` (all chef routes)

### Customer Only
- `/account/customer/*` (all customer routes)
- `/checkout`

### All Other Routes
- Require login (redirects to home if not authenticated)

---

## Middleware Details

### How to Change Public Routes
Edit `client/src/middleware.ts`:
```typescript
const publicRoutes = ["/", "/how-it-works", "/search", "/chef"];
// Add or remove routes here
```

### How to Change Route Behavior
Middleware checks in this order:
1. Is it a public route? → Allow
2. Is user logged in? → Check roles
3. Does user have required role? → Allow or deny

---

## Testing Checklist

- [ ] Log in as chef, access `/account/chef/dashboard` → ✅ Works
- [ ] Log in as chef, try `/account/customer/profile` → ❌ Redirects to home
- [ ] Log in as customer, access `/account/customer/profile` → ✅ Works
- [ ] Log in as customer, try `/account/chef/dashboard` → ❌ Redirects to home
- [ ] Log out, try `/account/chef/dashboard` → ❌ Redirects to home
- [ ] Visit `/` without login → ✅ Works
- [ ] Visit `/search` without login → ✅ Works

---

## Common Patterns

### Check if User is Chef
```typescript
const { user } = useAuth();
if (user?.isChef) {
  // Chef-specific UI
}
```

### Get Current User Email
```typescript
const { user } = useAuth();
console.log(user?.email);
```

### Redirect After Login
```typescript
const router = useRouter();
const { user } = useAuthGuard({ requireChef: true });
// Already redirected by hook if not chef
// No need to manually redirect
```

### Conditional Rendering Based on Role
```typescript
const { user } = useAuth();

return (
  <>
    {user?.isChef && <ChefMenu />}
    {!user?.isChef && user && <CustomerMenu />}
    {!user && <LoginPrompt />}
  </>
);
```

---

## API Integration Example

```typescript
// Frontend: Get authenticated user's data
const { user } = useAuth();

// Make API request (cookie automatically included)
const response = await fetch("/api/meals", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // Important: sends cookies
  body: JSON.stringify({ name: "Pasta" }),
});

// Backend: Verify auth
router.post("/meals", requireAuth, requireChef, (req, res) => {
  const userId = req.user.id; // Attached by authMiddleware
  console.log(`Chef ${userId} creating meal`);
});
```

---

## Debugging Auth Issues

### Enable Auth Debugging
Add to `client/src/lib/auth.tsx`:
```typescript
useEffect(() => {
  console.log("Auth state changed:", user);
}, [user]);
```

### Check Session Cookie
```javascript
// In browser console
document.cookie  // See 'session' cookie
console.log(JSON.parse(decodeURIComponent(document.cookie.split("session=")[1])))
```

### Check Backend Auth Middleware
```typescript
// In server logs
export function authMiddleware(req, res, next) {
  console.log("Auth middleware running...");
  console.log("User:", req.user);
  next();
}
```

---

## Important Notes

⚠️ **Key Points**:
1. Always use `useAuthGuard` in protected pages (not `useAuth` alone)
2. Check `isLoading` before rendering content (prevents flash)
3. Backend routes must be protected with `requireAuth`, `requireChef`, or `requireCustomer`
4. Session persists for 24 hours in cookie
5. This is mock auth - will be replaced with real auth system

---

## Migration to Real Auth

When implementing real authentication:

1. Replace `useAuth` login with API call
2. Update `authMiddleware` to verify JWT token
3. Keep all routing logic the same
4. All protected pages will continue to work

No changes needed to:
- `useAuthGuard` hook
- Middleware route rules
- Protected page components
- Backend middleware structure
