# ShopFlow — Full-Stack E-Commerce Application

Monorepo que sigue el mismo patrón de deploy que **Taskflow**: [vercel.json](file:///c:/Users/eduar/Desktop/PROYECTOS%20GITHUB/REACT/taskflow/vercel.json) en la raíz, `/client` para el frontend Nuxt, `/api` para funciones serverless Node.js en Vercel, y `/server` como referencia Symfony para desarrollo local.

## Stack de Deploy (igual que Taskflow)

| Layer | Servicio | Detalle |
|---|---|---|
| Frontend (Nuxt 3) | **Vercel** | Build estático via `nuxi generate` |
| Backend (API) | **Vercel** | `/api` folder → Serverless Functions (Node.js) |
| Base de datos | **Neon** | PostgreSQL serverless (driver `pg`) |
| Backend local | **Symfony 6** | `/server` para desarrollo local únicamente |

### Estructura del monorepo
```
ShopFlow/
├── vercel.json          ← igual que taskflow
├── package.json         ← scripts: dev, build, deploy
├── .gitignore
├── client/              ← Nuxt.js 3
├── api/                 ← Vercel Serverless Functions (Node.js + TypeScript)
│   ├── _lib/            ← db.ts, auth.ts, stripe.ts, types.ts
│   ├── auth/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── orders/
│   ├── admin/
│   └── stripe/
└── server/              ← Symfony 6 (solo local)
```

### vercel.json (raíz)
```json
{
  "buildCommand": "cd client && npm install && npm run generate",
  "outputDirectory": "client/.output/public",
  "installCommand": "npm install && cd api && npm install",
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/client/.output/public/$1" }
  ]
}
```

---

## User Review Required

> [!IMPORTANT]
> **Stripe Keys Required**: Configura `STRIPE_PUBLIC_KEY` y `STRIPE_SECRET_KEY` en las variables de entorno de Vercel. Tarjeta de prueba: `4242 4242 4242 4242`.

> [!IMPORTANT]
> **Prerequisites**:
> - Node.js 18+
> - PHP 8.2+ + Composer (solo para `/server` local)
> - Cuenta en [neon.tech](https://neon.tech) para obtener `DATABASE_URL`
> - Cuenta en [Vercel](https://vercel.com) → 1 proyecto desde la raíz del repo

> [!NOTE]
> `/server` (Symfony) es para desarrollo local. En Vercel, toda la API corre en `/api` como funciones serverless Node.js — exactamente igual que Taskflow usa `@vercel/node` + Prisma.

---

## Proposed Changes

### Root — Monorepo config

#### [NEW] vercel.json
Rutas: `/api/*` → Serverless Functions, `/*` → Nuxt static output

#### [NEW] package.json
Scripts: `dev` (vercel dev), `build`, `deploy` (vercel --prod)

#### [NEW] .gitignore
Cubre Node, PHP, Nuxt, Symfony, .env

---

### `/api` — Vercel Serverless Functions (Node.js + TypeScript)

Mismo patrón que Taskflow `/api`:

#### [NEW] `api/_lib/`
- `db.ts` — pool PostgreSQL (`pg`) conectado a Neon
- `auth.ts` — helpers JWT (jsonwebtoken), hashPassword, verifyToken
- `stripe.ts` — instancia Stripe
- `types.ts` — interfaces TypeScript
- `middleware.ts` — requireAuth, requireAdmin

#### [NEW] `api/auth/`
- `register.ts` — POST /api/auth/register
- `login.ts` — POST /api/auth/login
- `logout.ts` — POST /api/auth/logout
- `me.ts` — GET /api/auth/me

#### [NEW] `api/products/`
- `index.ts` — GET (público, filtros + paginación) / POST (admin)
- `[id].ts` — GET / PUT / DELETE

#### [NEW] `api/categories/`
- `index.ts` — GET / POST (admin)
- `[id].ts` — PUT / DELETE (admin)

#### [NEW] `api/cart/`
- `index.ts` — GET / DELETE
- `items/index.ts` — POST
- `items/[id].ts` — PUT / DELETE

#### [NEW] `api/orders/`
- `index.ts` — GET historial / POST crear pedido
- `[id].ts` — GET detalle

#### [NEW] `api/admin/`
- `orders/index.ts` — GET todos (admin)
- `orders/[id]/status.ts` — PATCH estado
- `dashboard.ts` — GET métricas (ventas, pedidos pendientes, stock bajo)

#### [NEW] `api/stripe/`
- `create-payment-intent.ts` — POST
- `webhook.ts` — POST (verifica firma Stripe, actualiza stock)

#### [NEW] [api/package.json](file:///c:/Users/eduar/Desktop/PROYECTOS%20GITHUB/REACT/taskflow/api/package.json)
Deps: `@vercel/node`, `pg`, `jsonwebtoken`, `bcryptjs`, `stripe`, `zod`

---

### `/client` — Nuxt.js 3

#### [NEW] Core config
- `nuxt.config.ts` — TailwindCSS, Pinia, `nitro.preset: 'static'`, `runtimeConfig`
- `tsconfig.json` — `strict: true`
- `tailwind.config.ts` — design system custom

#### [NEW] Stores (Pinia)
- `stores/auth.ts` — user state, login/logout/register
- `stores/cart.ts` — cart + localStorage sync + backend sync

#### [NEW] Composables
- `composables/useAuth.ts`
- `composables/useCart.ts`
- `composables/useProducts.ts`

#### [NEW] Middleware
- `middleware/auth.ts` — redirige no autenticados
- `middleware/admin.ts` — redirige no-admin

#### [NEW] Plugins
- `plugins/toast.client.ts` — vue-toastification

#### [NEW] Pages
- `pages/index.vue` — Home (hero + featured products)
- `pages/products/index.vue` — Catálogo + filtros + paginación + sort
- `pages/products/[id].vue` — Detalle + galería + zoom
- `pages/cart.vue` — Carrito con resumen
- `pages/checkout.vue` — Checkout + Stripe Elements
- `pages/orders/index.vue` — Historial pedidos
- `pages/orders/[id].vue` — Detalle pedido
- `pages/auth/login.vue`
- `pages/auth/register.vue`
- `pages/admin/dashboard.vue` — métricas
- `pages/admin/products/index.vue`
- `pages/admin/products/create.vue`
- `pages/admin/products/[id]/edit.vue`
- `pages/admin/categories.vue`
- `pages/admin/orders/index.vue`

#### [NEW] Layouts
- `layouts/default.vue` — header + footer
- `layouts/admin.vue` — sidebar admin

#### [NEW] Components
- `TheHeader.vue`, `TheFooter.vue`
- `ProductCard.vue` (skeleton + badge "Agotado")
- `ProductGallery.vue` (zoom)
- `CartItem.vue`, `SkeletonCard.vue`
- `ConfirmModal.vue`, `Pagination.vue`, `FilterSidebar.vue`
- `admin/MetricCard.vue`, `admin/ProductForm.vue`

#### [NEW] Types
- `types/index.ts` — User, Product, Category, Order, OrderItem, Cart

#### [NEW] SEO
- `useSeoMeta()` en cada página
- OG tags en productos
- `@nuxtjs/sitemap`

---

### `/server` — Symfony 6 (local dev reference)

Estructura Symfony completa:
- Entidades: User, Product, Category, Order, OrderItem, Cart, CartItem
- Controllers, Services, DataFixtures (50 productos, 10 categorías, 2 usuarios)
- JWT via LexikJWTAuthenticationBundle
- `DATABASE_URL` apunta a Neon PostgreSQL en `.env`

---

## Verification Plan

### Local
```bash
vercel dev    # desde raíz — corre /api serverless + /client Nuxt
```

### Deploy
```bash
vercel --prod   # desde raíz
```

Variables de entorno en Vercel Dashboard:
```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=supersecretkey
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...
NUXT_PUBLIC_API_BASE=https://tu-proyecto.vercel.app
```

### Flujo manual
1. Register → Login → Catálogo → Carrito → Checkout (`4242 4242 4242 4242`)
2. Admin (`admin@shopflow.com` / `Admin1234!`) → `/admin/dashboard`
3. CRUD productos, cambio de estado de pedidos

### TypeScript
```bash
cd client && npx nuxi typecheck
```
