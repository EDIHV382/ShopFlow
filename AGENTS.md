# ShopFlow — Agent Guidelines

## Project Overview

Full-stack e-commerce: **Nuxt 3** (client) + **Vercel Serverless Functions** (API) + **Neon PostgreSQL** + **Stripe**

## Monorepo Structure

```
ShopFlow/
├── api/           # Vercel serverless functions (TypeScript)
├── client/        # Nuxt 3 app (Vue 3 + TypeScript)
├── vercel.json    # Build/deploy config
└── package.json   # Root scripts
```

## Commands

### Root Level

| Command               | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm run install:all` | Install deps for root, api, and client       |
| `npm run build`       | Build client (`nuxt generate`)               |
| `npm run deploy`      | Deploy to Vercel (`vercel --prod`)           |
| `npm run db:init`     | Initialize database tables                   |
| `npm run db:seed`     | Seed test data (categories, products, users) |

### Client (`cd client`)

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start Nuxt dev server    |
| `npm run build`     | Build for production     |
| `npm run generate`  | Static generation        |
| `npm run typecheck` | Run TypeScript typecheck |

### API (`cd api`)

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Vercel dev server (via `vercel dev`) |
| No test command | Tests not configured                 |

## Running a Single Test

No test framework is currently configured. To add tests:

- Client: Use Vitest (`npm install -D vitest @nuxt/test-utils`)
- API: Use Jest or Vitest

## Code Style & Conventions

### TypeScript

- **Strict mode** enabled in both client and API
- `noImplicitAny: true`, `strictNullChecks: true`
- Client: `noUnusedLocals: false`, `noUnusedParameters: false`
- Use explicit return types for exported functions
- Prefer interfaces over types for object shapes

### Naming Conventions

| Type        | Convention                 | Example                              |
| ----------- | -------------------------- | ------------------------------------ |
| Files       | kebab-case                 | `useApi.ts`, `dashboard.ts`          |
| Components  | PascalCase                 | `ProductCard.vue`, `TheHeader.vue`   |
| Stores      | camelCase + `Store` suffix | `useAuthStore`, `useCartStore`       |
| Composables | camelCase + `use` prefix   | `useApi`, `useProductFilters`        |
| API routes  | kebab-case                 | `create-payment-intent.ts`           |
| Types       | PascalCase                 | `UserRole`, `OrderStatus`, `Product` |
| Constants   | SCREAMING_SNAKE_CASE       | `JWT_SECRET`, `DATABASE_URL`         |

### Imports

- Client: Use Nuxt auto-imports for composables/stores
- Use `~/` alias for client root (e.g., `~/types`)
- API: Use relative imports with `.js` extension for ES modules
- Group imports: external libs → local modules → types

### Error Handling

- **API**: Throw descriptive errors, catch at route level
- **Client**: Use try/finally for loading states
- Validate inputs with Zod schemas
- Return consistent error shapes: `{ error: string }`
- Log errors to console for debugging

### Authentication

- JWT tokens stored in localStorage (`shopflow_token`, `shopflow_user`)
- Bearer token in `Authorization` header
- Token expiry: 7 days
- Password requirements: 8+ chars, 1 uppercase, 1 digit

### Database

- Use parameterized queries to prevent SQL injection
- SSL required for Neon: `rejectUnauthorized: false`
- Connection pool max: 5 (serverless-friendly)

### Formatting

- Single quotes in client, single quotes in API
- Semicolons in API, no semicolons in client
- 2-space indentation
- Max line length: 120 chars
- Trailing commas in multiline objects

### Vue 3 / Nuxt Patterns

- Use Composition API with `<script setup>`
- Pinia stores for state management
- `vee-validate` + `zod` for form validation
- Toast notifications via `vue-toastification`
- TailwindCSS for styling

### API Response Patterns

- Success: `{ data: T, meta?: Meta }`
- Paginated: `{ data: T[], meta: { total, page, limit, totalPages } }`
- Error: `{ error: string }`

### Environment Variables

| Variable               | Location | Description                |
| ---------------------- | -------- | -------------------------- |
| `DATABASE_URL`         | API      | Neon PostgreSQL connection |
| `JWT_SECRET`           | API      | JWT signing secret         |
| `STRIPE_SECRET_KEY`    | API      | Stripe secret key          |
| `STRIPE_PUBLIC_KEY`    | Client   | Stripe publishable key     |
| `NUXT_PUBLIC_API_BASE` | Client   | API base URL               |

## Git & Deployment

- Deploy via Vercel (auto-deploys on push)
- No CI tests configured
- `vercel.json` handles build output and routing
- Client builds to `client/.output/public`

## Common Tasks

- **Add new API route**: Create file in `api/` folder, export `handler`
- **Add new page**: Create `.vue` in `client/pages/`
- **Add new store**: Create file in `client/stores/` with `defineStore`
- **Add new composable**: Create file in `client/composables/` with `useXxx`
- **Update schema**: Modify `api/_lib/init-db.js` and re-run `npm run db:init`
