# ShopFlow — Full-Stack E-Commerce Application

Monorepo con **vercel.json** en la raíz, `/client` para el frontend Nuxt, `/api` para la API Express monolito desplegada como Vercel Serverless Function.

## Stack de Deploy

| Layer             | Servicio   | Detalle                                                     |
| ----------------- | ---------- | ----------------------------------------------------------- |
| Frontend (Nuxt 3) | **Vercel** | Build estático via `nuxi generate`                          |
| Backend (API)     | **Vercel** | `/api/index.ts` → Express monolito como Serverless Function |
| Base de datos     | **Neon**   | PostgreSQL serverless (driver `pg`)                         |

### Estructura del monorepo

```
ShopFlow/
├── vercel.json          ← config Vercel (rewrites /api/* → /api/index.ts)
├── package.json         ← scripts: dev, build, deploy
├── tsconfig.json        ← TypeScript config para /api
├── .gitignore
├── client/              ← Nuxt.js 3 (frontend)
├── api/                 ← API Express monolito + handlers
│   ├── index.ts         ← Express entry point (todas las rutas)
│   ├── _lib/            ← db.ts, auth.ts, stripe.ts, types.ts, middleware.ts, schemas.ts
│   ├── auth/            ← login, register, logout, me
│   ├── products/        ← index, [id]
│   ├── categories/      ← index, [id]
│   ├── cart/            ← index, items/index, items/[id]
│   ├── orders/          ← index, [id]
│   ├── admin/           ← dashboard, users, orders/*, sales-chart
│   └── stripe/          ← create-payment-intent, webhook
├── legacy/              ← Referencia Symfony 6 (no parte del deploy, solo consulta)
└── e2e/                 ← Playwright E2E tests
```

### vercel.json (raíz)

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "client/.output/public",
  "installCommand": "npm run install:all",
  "framework": "nuxtjs",
  "functions": {
    "api/**/*.ts": {
      "includeFiles": "api/**/*"
    }
  },
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/index.ts" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Decisión de arquitectura: Express monolito

La API usa un **Express monolito** en `api/index.ts` que maneja todas las rutas. Ventajas:

- Un solo cold start (toda la app Express carga una vez)
- Middleware compartido (helmet, cors, rate-limit, logging, validation)
- Fácil de mantener y debuggear localmente con `vercel dev`
- Los handlers están separados en `api/` por dominio para organización

---

## User Review Required

> [!IMPORTANT]
> **Stripe Keys Required**: Configura `STRIPE_PUBLIC_KEY` y `STRIPE_SECRET_KEY` en las variables de entorno de Vercel. Tarjeta de prueba: `4242 4242 4242 4242`.

> [!IMPORTANT]
> **Prerequisites**:
>
> - Node.js 18+
> - Cuenta en [neon.tech](https://neon.tech) para obtener `DATABASE_URL`
> - Cuenta en [Vercel](https://vercel.com) → 1 proyecto desde la raíz del repo

---

## `/api` — Express Monolito + Handlers

### `api/index.ts` — Entry Point

Express app con middleware stack:

1. `helmet()` — security headers
2. `cors()` — con `origin` desde `NUXT_PUBLIC_API_BASE`
3. `pinoHttp()` — structured logging
4. Rate limiting: general (100/15min), auth (10/15min)
5. `express.json()` body parsing
6. Zod `validateBody()` para rutas con body

### `api/_lib/`

- `db.ts` — pool PostgreSQL (`pg`) conectado a Neon
- `auth.ts` — helpers JWT (jsonwebtoken), hashPassword, verifyToken
- `stripe.ts` — instancia Stripe
- `types.ts` — interfaces TypeScript
- `middleware.ts` — requireAuth, requireAdmin, CORS, helmet
- `schemas.ts` — Zod schemas (register, login, product, cart, order)
- `pagination.ts` — helpers de paginación
- `errors.ts` — error types
- `init-db.ts` — script de inicialización de tablas
- `seed.ts` — script de seed con datos de prueba

### Rutas API

| Método         | Ruta                                | Handler                           |
| -------------- | ----------------------------------- | --------------------------------- |
| GET/POST       | `/api/products`                     | `products/index.ts`               |
| GET/PUT/DELETE | `/api/products/:id`                 | `products/[id].ts`                |
| GET/POST       | `/api/categories`                   | `categories/index.ts`             |
| PUT/DELETE     | `/api/categories/:id`               | `categories/[id].ts`              |
| POST           | `/api/auth/login`                   | `auth/login.ts`                   |
| POST           | `/api/auth/register`                | `auth/register.ts`                |
| GET            | `/api/auth/me`                      | `auth/me.ts`                      |
| POST           | `/api/auth/logout`                  | `auth/logout.ts`                  |
| GET/DELETE     | `/api/cart`                         | `cart/index.ts`                   |
| POST           | `/api/cart/items`                   | `cart/items/index.ts`             |
| PUT/DELETE     | `/api/cart/items/:id`               | `cart/items/[id].ts`              |
| GET/POST       | `/api/orders`                       | `orders/index.ts`                 |
| GET            | `/api/orders/:id`                   | `orders/[id].ts`                  |
| GET            | `/api/admin/dashboard`              | `admin/dashboard.ts`              |
| GET            | `/api/admin/users`                  | `admin/users.ts`                  |
| GET            | `/api/admin/orders`                 | `admin/orders/index.ts`           |
| PATCH          | `/api/admin/orders/:id/status`      | `admin/orders/[id]/status.ts`     |
| GET            | `/api/admin/sales-chart`            | `admin/sales-chart.ts`            |
| POST           | `/api/stripe/create-payment-intent` | `stripe/create-payment-intent.ts` |
| ALL            | `/api/stripe/webhook`               | `stripe/webhook.ts` (raw body)    |

---

### `/client` — Nuxt.js 3

#### Core config

- `nuxt.config.ts` — TailwindCSS, Pinia, `nitro.preset: 'static'`, `runtimeConfig`
- `tsconfig.json` — `strict: true`
- `tailwind.config.ts` — design system custom

#### Stores (Pinia)

- `stores/auth.ts` — user state, login/logout/register
- `stores/cart.ts` — cart + localStorage sync + backend sync

#### Composables

- `composables/useApi.ts`

#### Middleware

- `middleware/auth.ts` — redirige no autenticados
- `middleware/admin.ts` — redirige no-admin

#### Plugins

- `plugins/toast.client.ts` — vue-toastification

#### Pages

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
- `pages/admin/users.vue`

#### Layouts

- `layouts/default.vue` — header + footer
- `layouts/admin.vue` — sidebar admin

#### Components

- `TheHeader.vue`, `TheFooter.vue`
- `ProductCard.vue` (skeleton + badge "Agotado")
- `CartItem.vue`, `SkeletonCard.vue`
- `ConfirmModal.vue`, `Pagination.vue`
- `AdminNavLink.vue`

#### Types

- `types/index.ts` — User, Product, Category, Order, OrderItem, Cart

#### SEO

- `useSeoMeta()` en cada página
- OG tags en productos
- `@nuxtjs/sitemap`

---

### `/legacy` — Symfony 6 (referencia, no deploy)

Código Symfony 6 preservado como referencia para consultas. No forma parte del deploy ni del build. Contiene:

- Entidades: User, Product, Category, Order, OrderItem, Cart, CartItem
- Controllers, Services, DataFixtures
- JWT via LexikJWTAuthenticationBundle

---

## Verification Plan

### Local

```bash
vercel dev # desde raíz — corre /api serverless + /client Nuxt
```

### Deploy

```bash
vercel --prod # desde raíz
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

ShopFlow/
├── vercel.json ← igual que taskflow
├── package.json ← scripts: dev, build, deploy
├── .gitignore
├── client/ ← Nuxt.js 3
├── api/ ← Vercel Serverless Functions (Node.js + TypeScript)
│ ├── \_lib/ ← db.ts, auth.ts, stripe.ts, types.ts
│ ├── auth/
│ ├── products/
│ ├── categories/
│ ├── cart/
│ ├── orders/
│ ├── admin/
│ └── stripe/
└── server/ ← Symfony 6 (solo local)

````

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
````

---

## User Review Required

> [!IMPORTANT]
> **Stripe Keys Required**: Configura `STRIPE_PUBLIC_KEY` y `STRIPE_SECRET_KEY` en las variables de entorno de Vercel. Tarjeta de prueba: `4242 4242 4242 4242`.

> [!IMPORTANT]
> **Prerequisites**:
>
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
