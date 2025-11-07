# Task 2 — Implement Checkout (create order without payment)

Status: draft

## Goal

Implement a first-stage checkout flow where the customer can submit their cart as an Order for a Chef to review. This stage intentionally omits any payment processing: the Chef will review the order, confirm delivery address, and contact the customer to arrange payment and delivery.

## High-level requirements

- Add backend models and API to create orders and order items in the database (Prisma + Express).
- Add a client-side `/checkout` page that shows cart summary, delivery address, and a "Proceed to Checkout" flow that submits the order to the server.
- Do not implement payment collection. The order will be created with a status such as `PENDING_CHEF_REVIEW` and visible to the chef (chef-side UI is a follow-up).
- Show clear copy on the checkout page explaining the process: no online payments yet; chef will confirm and contact customer.

## Assumptions

- The project uses Prisma (Postgres) on the server and Next.js + RTK Query on the client (see `ai_docs/copilot-instructions.md`).
- Authentication is already available (server and client) and can provide the current customer id via the request (if not, we'll send customer info in the request body as fallback). If auth is not present, the API will accept a customerId field and validate it.
- Delivery address: for the first iteration we'll accept a simple `deliveryAddress` text field submitted with the order. Later we can add a structured address model and saved addresses.
- No payment or payment gateway integration is required in this task.

## Contract: API design

POST /api/orders

- Description: Create a new order for a chef from the customer's cart.
- Request body (JSON):
  {
  "chefId": string, // required - the chef who will fulfill the order
  "customerId"?: string, // optional if auth provides it
  "items": [ // required - items copied from cart
  { "mealId": string, "quantity": number }
  ],
  "notes"?: string // optional customer notes
  }
- Response (201 Created):

1. The checkout page already exists at `client/src/app/checkout` and the form component (mock data) lives in `client/src/features/checkout` — reuse or replace that UI as needed.
2. The server already has Prisma models for `Order` and the join `MealsOnOrders` (see `server/prisma/schema.prisma`). I inspected the schema and confirmed `Order` and `MealsOnOrders` exist — see the Server-side section below. Let me know if you want to add deliveryAddress/total fields; I note they are not currently present in the schema.
3. No payment or payment gateway integration is required in this task.

- Errors: 400 for validation errors, 401 if auth required and missing, 500 for server errors.

Notes about schema:

- The repository already defines `Order` and `MealsOnOrders` in `server/prisma/schema.prisma`. Per your instruction we'll add one field to `Order`:

  deliveryAddress String?

  We will NOT add a `total` field; totals will be computed from the meals list when needed. The `Order.status` enum already exists and will be used (e.g., `PENDING`).

  If you prefer, we can also store an optional `notes` field at the same time; otherwise notes can be passed into the existing `Order` record if a suitable column exists.

## Server-side: Controller and route

- Validate payload with zod.
- Compute total server-side (sum price \* quantity) and save `Order`+`OrderItem[]` via Prisma client transaction.
- Add `server/src/routes/orderRoutes.ts` and wire into the app (see existing routes pattern).

Use a zod schema mirroring the API request body. Check for non-empty items array, positive quantity, non-negative price, and presence of chefId and deliveryAddress.

## Client-side: UX and page

- Add a `/checkout` page under `client/src/app/checkout/page.tsx`.
- The page will show:
  - Cart summary (list of items, subtotal, delivery fee, total) imported from the existing shopping cart context.
  - A simple textarea/input for `Delivery address` (required).
  - Optional `Notes for chef` textarea.
  - Clear copy near the submit button: "No online payments yet — after you place this order the Chef will review the order and the delivery address, confirm availability, and contact you to arrange payment and delivery."
  - A `Place Order` button which triggers the create order API call.
- After successful creation, show a confirmation view with the order id, status, and next steps.

## Client-side: API integration (RTK Query)

## Client-side: shopping cart integration

- Wire the existing `ShoppingCartSheet` `Proceed to Checkout` button to navigate to `/checkout` instead of performing submission inline. (Minimal change: replace the Button to a `Link` or use router push onClick.)
- On the checkout page, the `Place Order` action will collect cart items from `useShoppingCart()` context and submit them.

## Acceptance criteria

1. New POST `/api/orders` endpoint exists and creates Order + OrderItems in the DB.
2. `/checkout` page shows cart, allows entering delivery address, and submits order.
3. Orders created have status `PENDING_CHEF_REVIEW` and a server-calculated `total`.
4. Successful submission displays order id and clear instructions to customer about next steps (chef review and contact).
5. No payment processors or payment fields are added.

## Edge cases and validation

- Empty cart: the checkout page should not allow placing an order (disable button and show message).
- Missing delivery address: show inline validation and block submission.
- Price tampering: server must calculate total using submitted item prices but could later verify canonical meal prices from the DB. For now we trust the price in the request but compute total server-side from the request payload; a follow-up should validate against the meal records.
- Concurrent writes: use a Prisma transaction when writing Order + OrderItems.

## Tests

- Backend unit/integration tests for `POST /orders`:
  - happy path: creates Order and OrderItems
  - validation errors: missing chefId/items/deliveryAddress
  - ensures total equals sum(items)
- Frontend: a simple RTL test for checkout page rendering and for calling the mutation mock.

## Implementation steps (concrete)

1. Add todo: update Prisma models in `server/prisma/schema.prisma` (add `Order` and `OrderItem`).
2. Run a migration locally: `cd server && npx prisma migrate dev --name add_orders` (developer will run this).
3. Create `server/src/controllers/orderController.ts` with the `createOrder` handler and zod validation.
4. Create `server/src/routes/orderRoutes.ts` and register in `src/index.ts` (or the app's router setup).
5. Add RTK Query mutation in `client/src/state/api.ts` (or a new api slice) named `createOrder`.
6. Add `client/src/app/checkout/page.tsx` with the UI and submission flow (use `.unwrap()` on mutation).
7. Update `client/src/features/shopping-cart/components/shoppingCartSheet.tsx` to navigate to `/checkout` when clicking "Proceed to Checkout".
8. Add tests and update docs.

## Follow-ups / future improvements

- Chef dashboard to view and accept/reject orders.
- Email/notification when new order is created.
- Persisted customer addresses and saved addresses UI.
- Payment gateway integration once the chef agrees to paid flows.

## Developer notes

- Follow the repo's coding conventions: TypeScript strict, zod for validation, use Prisma transactions, and RTK Query mutation `.unwrap()`.
- Keep server error handling consistent with existing controllers (try/catch + appropriate status codes).

## References

- `ai_docs/copilot-instructions.md` (project conventions)
- Existing server routes (look at `uploadController.ts` and other controllers to match patterns)
