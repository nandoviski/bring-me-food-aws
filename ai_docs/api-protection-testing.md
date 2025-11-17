# API Route Protection Testing Guide

This guide provides detailed instructions for testing the newly protected API routes using curl or Postman.

## Quick Reference Table

| Route | Method | Auth Required | Role Required | Status Codes |
|-------|--------|---------------|---------------|--------------|
| **Meals** | | | | |
| `/api/meals` | POST | ✅ | Chef | 201/400/401/403 |
| `/api/meals/:id` | PUT | ✅ | Chef | 200/400/401/403 |
| `/api/meals/:chefId/byChef` | GET | ❌ | - | 200 |
| **Menus** | | | | |
| `/api/menus` | POST | ✅ | Chef | 201/400/401/403 |
| `/api/menus/:id` | PUT | ✅ | Chef | 200/400/401/403 |
| `/api/menus/:id` | DELETE | ✅ | Chef | 204/401/403 |
| `/api/menus/:chefId/byChef` | GET | ❌ | - | 200 |
| **Orders** | | | | |
| `/api/orders` | POST | ✅ | Customer | 201/400/401/403 |
| `/api/orders/chef/:chefId` | GET | ✅ | Chef | 200/401/403 |
| **Chefs** | | | | |
| `/api/chefs/:id` | PUT | ✅ | Chef | 200/400/401/403 |
| `/api/chefs/:username/profile` | GET | ❌ | - | 200 |
| `/api/chefs/:username/exists` | GET | ❌ | - | 200 |
| `/api/chefs/:id/menu` | GET | ❌ | - | 200 |
| `/api/chefs/byUserId/:userId` | GET | ❌ | - | 200 |
| **Customers** | | | | |
| `/api/customers/:userId` | PUT | ✅ | Any | 200/400/401 |
| `/api/customers/:userId` | GET | ✅ | Any | 200/401 |
| `/api/customers/:userId/orders` | GET | ✅ | Customer | 200/401/403 |

---

## Test Setup

### 1. Get Session Cookies

First, you need to get session cookies from the frontend. The session is stored as an HTTP-only cookie called `session`.

**Option A: From Browser DevTools**

1. Open the Bring Me Food app: `http://localhost:3000`
2. Log in as a user
3. Open DevTools → Application → Cookies → localhost:3000
4. Find the `session` cookie
5. Copy the full value

**Option B: Decode from sessionStorage**

1. Log in to the app
2. Open DevTools Console
3. Run: `JSON.stringify(JSON.parse(sessionStorage.getItem('bmf_user')))`
4. Copy the output (this is what gets stored in the cookie)

### 2. Test Users Available

**Chef User:**
```json
{
  "id": "879c31a3-5354-49ed-be60-8ab4b00c9537",
  "email": "sarah@example.com",
  "isChef": true
}
```

**Customer User:**
```json
{
  "id": "eacc7be0-860d-450e-a4d4-4b069fb9cd47",
  "email": "fmarostega@gmail.com",
  "isChef": false
}
```

---

## Testing with cURL

### Test 1: Chef Cannot Create Meals

**Scenario:** Log in as a chef and try to create a meal (should work)

```bash
# 1. Get session cookie from browser
CHEF_SESSION='{"id":"879c31a3-5354-49ed-be60-8ab4b00c9537","email":"sarah@example.com","isChef":true}'

# 2. Try to create meal (should succeed)
curl -X POST http://localhost:8000/api/meals \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$(echo $CHEF_SESSION | jq -r '@uri')" \
  -d '{
    "name": "Spaghetti Carbonara",
    "description": "Classic Italian pasta",
    "price": 15.99,
    "chefId": "879c31a3-5354-49ed-be60-8ab4b00c9537"
  }'

# Expected: 201 Created (or 400 validation error, not 401/403)
```

### Test 2: Customer Cannot Create Meals

**Scenario:** Log in as a customer and try to create a meal (should fail with 403)

```bash
# 1. Get customer session
CUSTOMER_SESSION='{"id":"eacc7be0-860d-450e-a4d4-4b069fb9cd47","email":"fmarostega@gmail.com","isChef":false}'

# 2. Try to create meal (should fail)
curl -X POST http://localhost:8000/api/meals \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$(echo $CUSTOMER_SESSION | jq -r '@uri')" \
  -d '{
    "name": "Pizza",
    "description": "Test meal",
    "price": 10,
    "chefId": "879c31a3-5354-49ed-be60-8ab4b00c9537"
  }'

# Expected: 403 Forbidden - "Chef access required"
```

### Test 3: Unauthenticated Cannot Create Meals

**Scenario:** Try to create a meal without login (should fail with 401)

```bash
curl -X POST http://localhost:8000/api/meals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pizza",
    "description": "Test meal",
    "price": 10,
    "chefId": "879c31a3-5354-49ed-be60-8ab4b00c9537"
  }'

# Expected: 401 Unauthorized - "Authentication required"
```

### Test 4: Customer Can Create Orders

**Scenario:** Log in as a customer and create an order (should succeed)

```bash
CUSTOMER_SESSION='{"id":"eacc7be0-860d-450e-a4d4-4b069fb9cd47","email":"fmarostega@gmail.com","isChef":false}'

curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$(echo $CUSTOMER_SESSION | jq -r '@uri')" \
  -d '{
    "customerId": "eacc7be0-860d-450e-a4d4-4b069fb9cd47",
    "items": [
      {
        "mealId": "meal-1",
        "quantity": 2
      }
    ]
  }'

# Expected: 201 Created (or 400/404 if meal not found, not 401/403)
```

### Test 5: Chef Cannot Create Orders

**Scenario:** Log in as a chef and try to create an order (should fail with 403)

```bash
CHEF_SESSION='{"id":"879c31a3-5354-49ed-be60-8ab4b00c9537","email":"sarah@example.com","isChef":true}'

curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$(echo $CHEF_SESSION | jq -r '@uri')" \
  -d '{
    "customerId": "879c31a3-5354-49ed-be60-8ab4b00c9537",
    "items": [{"mealId": "meal-1", "quantity": 1}]
  }'

# Expected: 403 Forbidden - "Customer access required"
```

### Test 6: Public Routes Still Work

**Scenario:** Get meals by chef without authentication (should succeed)

```bash
curl http://localhost:8000/api/meals/879c31a3-5354-49ed-be60-8ab4b00c9537/byChef

# Expected: 200 OK with meals array
```

---

## Testing with Postman

### Setup Collection

1. **Create New Collection:** "Bring Me Food API"
2. **Create Folder:** "Meals"
3. **Set Collection Variables:**
   - `base_url`: `http://localhost:8000/api`
   - `chef_session`: Paste chef session cookie value
   - `customer_session`: Paste customer session cookie value

### Test Requests

#### Request 1: Create Meal (Chef)

```
POST {{base_url}}/meals
Content-Type: application/json
Cookie: session={{chef_session}}

{
  "name": "Pasta Carbonara",
  "description": "Classic pasta",
  "price": 15.99,
  "chefId": "879c31a3-5354-49ed-be60-8ab4b00c9537"
}
```

**Expected:** 201 Created

#### Request 2: Create Meal (Customer - Should Fail)

```
POST {{base_url}}/meals
Content-Type: application/json
Cookie: session={{customer_session}}

{
  "name": "Pizza",
  "description": "Test",
  "price": 10,
  "chefId": "879c31a3-5354-49ed-be60-8ab4b00c9537"
}
```

**Expected:** 403 Forbidden

#### Request 3: Get Meals (Public)

```
GET {{base_url}}/meals/879c31a3-5354-49ed-be60-8ab4b00c9537/byChef
```

**Expected:** 200 OK (no auth needed)

#### Request 4: Create Order (Customer)

```
POST {{base_url}}/orders
Content-Type: application/json
Cookie: session={{customer_session}}

{
  "customerId": "eacc7be0-860d-450e-a4d4-4b069fb9cd47",
  "items": [
    {
      "mealId": "meal-1",
      "quantity": 2
    }
  ]
}
```

**Expected:** 201 Created (or validation error, not 401/403)

#### Request 5: Create Order (Chef - Should Fail)

```
POST {{base_url}}/orders
Content-Type: application/json
Cookie: session={{chef_session}}

{
  "customerId": "879c31a3-5354-49ed-be60-8ab4b00c9537",
  "items": [{"mealId": "meal-1", "quantity": 1}]
}
```

**Expected:** 403 Forbidden

---

## Expected Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | OK | GET public route, authenticated GET |
| **201** | Created | Successful POST to create resource |
| **204** | No Content | Successful DELETE |
| **400** | Bad Request | Invalid data, missing fields |
| **401** | Unauthorized | No session cookie or invalid session |
| **403** | Forbidden | Authenticated but wrong role (Chef/Customer) |
| **404** | Not Found | Resource doesn't exist |
| **500** | Server Error | Something went wrong |

---

## Troubleshooting

### Issue: 401 Unauthorized When Should Succeed

**Cause:** Session cookie not sent or invalid

**Solution:**
1. Verify you're logged in on the frontend
2. Check cookie is properly URL-encoded in curl
3. Use `-H "Cookie: session=VALUE"` format
4. Verify session value is valid JSON with `id`, `email`, `isChef`

### Issue: 403 Forbidden for Wrong Route

**Cause:** Role mismatch or wrong middleware applied

**Solution:**
1. Check which role is needed for this route
2. Verify you're logged in with the right role
3. Check route file has correct middleware: `requireChef` vs `requireCustomer`

### Issue: 401 on Public Route

**Cause:** Route shouldn't require auth but does

**Solution:**
1. Check route file - public routes shouldn't have `requireAuth`
2. Verify GET requests for browsing are public (no auth)
3. Only POST/PUT/DELETE to create/modify should need auth

### Issue: Session Cookie Not Persisting

**Cause:** Cookie settings or browser settings

**Solution:**
1. Check DevTools → Application → Cookies
2. Verify `SameSite` is not blocking cookies
3. Log in again to refresh cookie
4. Check `credentials: true` in frontend fetch calls

---

## Recommended Test Order

1. ✅ **Test public routes** (should work without auth)
   - GET `/api/meals/CHEF_ID/byChef`
   - GET `/api/chefs/USERNAME/profile`
   - GET `/api/menus/CHEF_ID/byChef`

2. ✅ **Test authentication required** (should fail without auth)
   - POST `/api/meals` (no session)
   - PUT `/api/chefs/:id` (no session)
   - GET `/api/customers/:id` (no session)

3. ✅ **Test chef-only routes** (chef should pass, customer should fail)
   - POST `/api/meals` (chef yes, customer no)
   - POST `/api/menus` (chef yes, customer no)
   - PUT `/api/chefs/:id` (chef yes, customer no)

4. ✅ **Test customer-only routes** (customer should pass, chef should fail)
   - POST `/api/orders` (customer yes, chef no)
   - GET `/api/customers/:id/orders` (customer yes, chef no)

5. ✅ **Test role-specific routes** (only correct role can access)
   - GET `/api/orders/chef/:chefId` (chef only)

---

## Success Criteria

All tests should show these results:

| Test | Expected | Status |
|------|----------|--------|
| Public route without auth | 200 | ✅ |
| Protected route without auth | 401 | ✅ |
| Chef route as customer | 403 | ✅ |
| Customer route as chef | 403 | ✅ |
| Chef route as chef | 200/201/204 | ✅ |
| Customer route as customer | 200/201 | ✅ |

If all tests pass, the API protection is working correctly!
