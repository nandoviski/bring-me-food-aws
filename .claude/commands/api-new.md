---
description: Create a new Express API route with validation, error handling, and TypeScript
model: claude-sonnet-4-5
---

Create a new Express API route following modern best practices for solo developers.

## Requirements

API Endpoint: $ARGUMENTS

## Implementation Guidelines

### 1. **Express Router** (Recommended)

Use Express Router in `server/src/routes/` directory with TypeScript

### 2. **Validation**

- Use Zod for runtime type validation
- Name schemas meaningfully based on their purpose:
  - **Request body schemas**: `CreateUserSchema`, `UpdateUserSchema`, `CreateOrderSchema`
  - **Parameter schemas**: `UserIdParamSchema`, `ChefIdParamSchema`, `OrderIdParamSchema`
  - **Query schemas**: `ListOrdersQuerySchema`, `SearchMealsQuerySchema`
- Try to reuse existing schemas where possible and extend them if necessary (naming conventions should be followed)
- Validate input early (before DB/API calls)
- Return clear validation error messages

### 3. **Error Handling**

- Global error handling with try/catch
- Consistent error response format
- Appropriate HTTP status codes
- Never expose sensitive error details

### 4. **TypeScript**

- Strict typing for requests/responses
- Shared type definitions
- No `any` types

### 5. **Security**

- Input sanitization
- CORS configuration if needed
- Rate limiting considerations
- Authentication/authorization checks

### 6. **Response Format**

If successful:

- Return just the data in the response body.
- Do not wrap in additional objects. Return the data directly.

On error, return:

```typescript
// Error
{ error: string, details?: unknown, success: false }
```

### 7. **Database** (`prisma/schema.prisma`):

- Use Prisma Client for DB operations
- Models: Check schema first. Define necessary models in `prisma/schema.prisma` if not already present
- Migrations tracked in `prisma/migrations/`

## Code Structure

Create a complete API route with:

1. **Route Handler File** - `server/src/routes/[route]Routes.ts`
2. **Route Implementation File** - `server/src/controllers/[route]Controller.ts`
3. **Validation Schema** - Zod schemas for request/response
4. **Type Definitions** - Shared TypeScript types
5. **Error Handler** - Centralized error handling

## Best Practices to Follow

-  Early validation before expensive operations
-  Proper HTTP status codes (200, 201, 400, 401, 404, 500)
-  Consistent error response format
-  TypeScript strict mode
-  Minimal logic in routes (use controllers file for business logic)
-  Environment variable validation
-  Request/response logging for debugging
- L No sensitive data in responses
- L No database queries without validation
- L No inline business logic (extract to services)

Generate production-ready code that I can immediately use in my Next.js project.

## Implementation Approach

### Route already exists:

- Create the endpoint in the existing route file (e.g., `server/src/routes/[existingRoute]Routes.ts`)
- Add controller function in existing controller file (e.g., `server/src/controllers/[existingRoute]Controller.ts`)

### New Route:

- Create new route file in `server/src/routes/` (e.g., `server/src/routes/[newRoute]Routes.ts`)
- Create new controller file in `server/src/controllers/` (e.g., `server/src/controllers/[newRoute]Controller.ts`)
- Add the new route to the main Express app router file (e.g., `server/src/index.ts`)

Ensure all code adheres to the guidelines above.
Ensure there are no errors and that the code is ready to run in a Next.js project with Express backend.
