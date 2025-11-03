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
