# 🤖 Copilot Project Context

This document helps AI tools (like GitHub Copilot or ChatGPT) understand the architecture, conventions, and goals of this project.

---

## 🧱 Architecture

**Client**

- Framework: Next.js 16 + React 19
- Language: TypeScript
- Styling: TailwindCSS + shadcn/ui
- State management: Redux Toolkit (RTK Query)
- Validation: zod
- API layer: `/client/src/state/api.ts` uses RTK Query `fetchBaseQuery` calling the Express backend at `process.env.NEXT_PUBLIC_API_BASE_URL`.

**Server**

- Framework: Express.js (Typescript)
- ORM: Prisma
- Database: PostgreSQL
- Middleware: cors, express.json()
- We have routes under `/server/src/routes/*` that handle API requests from the client.
- We have the route implementations in `/server/src/controllers/*` using Prisma to interact with the database.

---

## 🧭 Conventions

- TypeScript strict mode on.
- React functional components using hooks.
- Zod for schema validation.
- Async/await for async logic.
- Consistent error handling with `try/catch` and HTTP codes.
- Named exports only.
- Prisma schema: `/server/prisma/schema.prisma`.
- Backend routes: `/server/src/routes/*`.

---

## 🪄 Copilot Should:

- Suggest new Next.js pages, components, and API routes.
- Use RTK Query for API hooks.
- Suggest Express routes using Prisma.
- Generate zod schemas and form logic with Tailwind + shadcn.
- Write JSDoc and comments.
- Follow consistent ESLint + Prettier formatting.

---

## 🧪 Testing

- Frontend: React Testing Library
- Backend: Jest or Vitest
- Prefer isolated test utilities for async database tests.

---

## 🧾 Helpful context

Client root: `/client`
Server root: `/server`

---

## 🛠️ Prisma migration workflow (how to apply schema changes)

- Preferred workflow: edit `server/prisma/schema.prisma` to make model/constraint changes, then run the Prisma migration tool to generate and apply the migration. This keeps the schema and migrations in sync with Prisma's expectations.

- Typical commands (development):

  - `cd server`
  - `npx prisma migrate dev --name descriptive_migration_name`

- For deploying migrations in CI / production:

  - `cd server`
  - `npx prisma migrate deploy`

- Rollback note: If you need to undo a migration you created with `migrate dev`, use `npx prisma migrate reset` (development only) or create a new migration that reverses the change. Be careful: `migrate reset` drops and recreates the database — don't run it against production.

- Avoid directly creating ad-hoc SQL migration files unless you have a specific reason. If you do add raw SQL, prefer generating a proper Prisma migration (so `prisma migrate` knows about it) or document clearly how to apply it manually. If a migration fails due to data conflicts (for example case-insensitive collisions), handle data cleanup first and then re-run the migration.

- After applying migrations, run `prisma generate` to update the Prisma Client if your code depends on newly generated types or client changes:

  - `cd server`
  - `npx prisma generate`

# RTK Query: Prefer `.unwrap()` for mutations

This short note explains the convention used in this repository when calling RTK Query mutations from components or async handlers.

- Use the promise returned by a mutation's trigger and call `.unwrap()` to either get the actual response value or have it throw the error.
- This makes `try/catch` handling straightforward and avoids checking `result.data` nested shapes.

Example:

```ts
const [createItem] = useCreateItemMutation();
try {
  await createItem(payload).unwrap();
  // success
} catch (err) {
  // handle error
}
```

Reason: `.unwrap()` provides direct access to the fulfilled value and throws on rejection, matching normal async/await semantics and simplifying component code.
