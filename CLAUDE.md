# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bring Me Food** is a full-stack web application for connecting home chefs with customers for meal prep ordering. It follows a monorepo structure with a Next.js 16 frontend and Express.js backend, using PostgreSQL for data persistence and AWS S3/MinIO for file storage.

## Architecture

### High-Level Structure

```
bring-me-food-aws/
├── client/           # Next.js 16 frontend (React 19, Redux Toolkit, TailwindCSS)
├── server/           # Express.js backend (Prisma ORM, PostgreSQL)
├── ai_docs/          # Architecture and development guidelines
└── .vscode/          # VSCode workspace configuration
```

### Core Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Redux Toolkit + RTK Query, TailwindCSS, shadcn/ui |
| **Backend** | Express.js 5, Prisma ORM, PostgreSQL |
| **Storage** | AWS S3 / MinIO (presigned URL-based uploads) |
| **Validation** | Zod (shared between frontend and backend) |
| **Forms** | React Hook Form |

### Feature Organization

#### Frontend (Client)

**Routes** (`src/app/`):
- Home page, Search, Checkout, How-it-works
- Chef dashboard and profile (`/account/chef/*`)
- Customer profile and orders (`/account/customer/*`)
- Public chef profile (`/chef/[username]`)

**Features** (`src/features/`):
- `chef/` - Profile, dashboard, meal items
- `customer/` - Profile forms, order tracking
- `meal/` - Meal management dialogs and forms
- `menu/` - Menu management dialogs and forms
- `checkout/` - Order creation and checkout flow
- `shopping-cart/` - Shopping cart context

**Components** (`src/components/`):
- `ui/` - shadcn/ui components
- `auth/` - Authentication components
- Global navbar, loading states, error boundaries

**State** (`src/state/`):
- `api.ts` - RTK Query endpoints for all CRUD operations
- Redux store configuration with theme and sidebar state

#### Backend (Server)

**Routes** (`src/routes/`): 6 main endpoint groups
- Meals, Menus, Chefs, Customers, Orders, Uploads

**Controllers** (`src/controllers/`): Business logic for each route

**Database** (`prisma/schema.prisma`):
- Models: User, Chef, Customer, Meal, Menu, Order, MealsOnOrders
- Migrations tracked in `prisma/migrations/`

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- (Optional) MinIO for local S3-compatible storage

### Quick Start

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Setup environment
cp server/.env.example server/.env        # Configure DATABASE_URL and S3
cp client/.env.example client/.env        # Add NEXT_PUBLIC_API_BASE_URL

# Initialize database
cd server
npx prisma migrate dev --name init
npm run seed

# Start development
cd server && npm run dev           # Terminal 1: Port 8000
cd client && npm run dev           # Terminal 2: Port 3000
```

## Commands

### Frontend (client/)

```bash
npm run dev      # Start development server (Turbo, port 3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

### Backend (server/)

```bash
npm run dev                                    # TypeScript watch + nodemon
npm run build                                  # Compile TypeScript
npm start                                      # Build and run
npm run seed                                   # Seed database with test data
npx prisma migrate dev --name <name>          # Create and apply migration
npx prisma migrate deploy                     # Apply migrations (CI/prod)
npx prisma generate                           # Regenerate Prisma Client
npx prisma reset                              # Reset database (dev only)
```

## Key Implementation Patterns

### RTK Query API Usage
- Always use `.unwrap()` on mutations for straightforward error handling
- Pattern: `try { await mutation(payload).unwrap(); } catch(err) { /* handle */ }`

### Component Naming
- Files: kebab-case (e.g., `meal-item.tsx`)
- Exports: Named exports only
- Placement:
  - Feature-specific: `src/features/[feature]/components/`
  - Global shared: `src/components/`

### Validation
- Frontend and backend: Zod schemas in feature folders
- All API inputs validated with Zod

### Database Changes
1. Edit `server/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <descriptive_name>`
3. Prisma Client types auto-regenerate
4. Update any RTK Query endpoints if needed

### File Uploads (S3/MinIO)
- Client requests presigned URL from `/api/upload`
- Client uploads to temporary S3 location
- Backend promotes temporary file to final location when creating/updating meal/menu
- Environment variables control S3 endpoint (AWS or MinIO)

## Code Quality

**Linting & Formatting:**
- ESLint configuration: `.eslintrc.cjs` (root, shared)
- Prettier config: `.prettierrc` (semi: true, singleQuote: false, tabWidth: 2)
- Run: `npm run lint` in client or server directory

**TypeScript:**
- Strict mode enabled
- tsconfig path aliases:
  - Frontend: `@/*` → `src/`, `@/features/*`, `@/state/*`
  - Backend: Default paths

## Important Notes

### Authentication
- Currently session-based (development mock implementation)
- Test users available in `ai_docs/`
- Email-based user identification

### Database
- Prisma migrations are version-controlled
- Always use `npx prisma migrate dev` in development
- Use `npx prisma migrate deploy` in CI/production

### Copilot Instructions
- See `ai_docs/copilot-instructions.md` for comprehensive architecture guidelines
- See `ai_docs/prompts.md` for quick task reference

### Current Status
- Branch: `master`
- Modified files: `page.tsx`, `login-modal.tsx`, `navbar.tsx`, `globals.css`
- Recent work: Checkout flow, S3 upload refactoring

## Common Development Patterns

### Adding a New Feature

1. **Create feature folder** in `src/features/[feature]/`
2. **Add Zod schema** in `src/features/[feature]/schema/`
3. **Create components** in `src/features/[feature]/components/`
4. **Add RTK Query endpoints** if needed in `client/src/state/api.ts`
5. **Create backend routes** in `server/src/routes/`
6. **Implement controllers** in `server/src/controllers/`
7. **Add/update Prisma models** if needed and run migration

### Adding a Database Model

1. Edit `server/prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name add_[model_name]`
3. Update RTK Query endpoints if exposing new data
4. Update controllers to use new model

## Environment Variables

**Server** (`.env`):
```
PORT=8000
DATABASE_URL=postgresql://user:password@localhost/bring_me_food
S3_ENDPOINT=http://localhost:9000    # or AWS S3 endpoint
S3_BUCKET=mybucket
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_FORCE_PATH_STYLE=true             # true for MinIO, false for AWS
S3_PUBLIC_URL=http://localhost:9000
FINAL_PREFIX=uploads/final
TMP_PREFIX=uploads/tmp
```

**Client** (`.env.local`):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Testing

Testing infrastructure not yet implemented. Recommendations:
- Frontend: React Testing Library + Jest
- Backend: Jest or Vitest

## Resources

- `ai_docs/copilot-instructions.md` - Comprehensive architecture and conventions
- `README.md` - Project overview and access restrictions
- Prisma docs: https://www.prisma.io/docs/
- Next.js docs: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com/
