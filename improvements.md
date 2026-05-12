# ShopFlow — Reporte completo de mejoras

> Análisis basado en revisión del repositorio `EDIHV382/ShopFlow` · Mayo 2026  
> Ordenado por **prioridad de impacto**: Crítico → Alto → Medio → Bajo

---

## Índice

1. [Archivos y carpetas a eliminar](#1-archivos-y-carpetas-a-eliminar)
2. [Correcciones críticas de seguridad](#2-correcciones-críticas-de-seguridad)
3. [Correcciones de configuración](#3-correcciones-de-configuración)
4. [Dependencias a mover o actualizar](#4-dependencias-a-mover-o-actualizar)
5. [Testing](#5-testing)
6. [CI/CD — GitHub Actions](#6-cicd--github-actions)
7. [API — mejoras de código](#7-api--mejoras-de-código)
8. [Cliente Nuxt — mejoras de código](#8-cliente-nuxt--mejoras-de-código)
9. [Base de datos](#9-base-de-datos)
10. [Stripe y pagos](#10-stripe-y-pagos)
11. [Observabilidad y monitoreo](#11-observabilidad-y-monitoreo)
12. [Performance](#12-performance)
13. [SEO](#13-seo)
14. [Admin panel](#14-admin-panel)
15. [Documentación](#15-documentación)
16. [Estructura final recomendada](#16-estructura-final-recomendada)

---

## 1. Archivos y carpetas a eliminar

Estos elementos no deben existir en el repositorio. Elimínalos y actualiza `.gitignore`.

### Eliminar del repo (y del historial con `git filter-repo` si contienen datos sensibles)

| Ruta                     | Razón                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dist/`                  | Artefactos de build. Nunca deben commitearse. Agregar a `.gitignore`.                                                                                     |
| `server/`                | Contiene PHP (21.5% del repo). Completamente fuera del stack declarado (Node.js). Si es código muerto, eliminar. Si tiene lógica útil, portarla a `api/`. |
| `server-logic/`          | Mismo caso que `server/`. Duplicidad de responsabilidades con `api/`.                                                                                     |
| `fix-imports.ts`         | Script de parche temporal que indica un problema de configuración no resuelto. Resolver en `tsconfig.json` y eliminar este archivo.                       |
| `implementation_plan.md` | Artefacto interno de agente de IA. No aporta valor al repo público.                                                                                       |
| `AGENTS.md`              | Instrucciones para agentes de IA. No es documentación útil para colaboradores humanos. Reemplazar con un `CONTRIBUTING.md` real.                          |

### Agregar a `.gitignore`

```gitignore
# Build artifacts
dist/
client/.output/
client/.nuxt/

# Environment
.env
.env.local
.env.*.local

# Vercel
.vercel/

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/settings.json
.idea/
```

---

## 2. Correcciones críticas de seguridad

Estas son las únicas que pueden causar pérdidas económicas o exposición de datos en producción.

### 2.1 Verificación de firma de webhook de Stripe

**Archivo:** `api/stripe/webhook.ts`

Sin esto, cualquiera puede hacer un POST a tu endpoint y confirmar pedidos sin pagar.

```typescript
// ❌ Antes (sin verificar)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const event = req.body
  // ...
}

// ✅ Después
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body — ver nota abajo
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }
  // ...
}
```

> **Nota:** Para que `constructEvent` funcione, el body debe llegar sin parsear (raw Buffer). Configura el middleware para que la ruta `/api/stripe/webhook` reciba el body crudo.

### 2.2 Rate limiting en producción

**Archivo:** `api/_lib/middleware.ts`

`express-rate-limit` está en `devDependencies` (ver sección 4). Además de moverlo, implementarlo:

```typescript
import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos de login por IP
  message: { error: 'Demasiados intentos. Intenta en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto
  message: { error: 'Límite de requests alcanzado.' },
})
```

Aplicar en los handlers de auth específicamente:

```typescript
// api/auth/login.ts
import { authLimiter } from '../_lib/middleware'
// Aplicar antes del handler principal
```

### 2.3 JWT almacenado en localStorage

**Archivo:** `client/stores/auth.ts`  
**Referencia AGENTS.md:** `JWT tokens stored in localStorage`

localStorage es accesible desde JavaScript — vulnerable a XSS. Migrar a cookies HttpOnly:

```typescript
// ❌ Actual
localStorage.setItem('shopflow_token', token)

// ✅ Mejor: dejar que el servidor establezca la cookie
// En api/auth/login.ts:
res.setHeader('Set-Cookie', [
  `shopflow_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 3600}`,
])

// En el cliente, eliminar el manejo manual del token
// Las cookies HttpOnly se envían automáticamente en cada request
```

### 2.4 CORS configurado explícitamente

**Archivo:** `api/_lib/middleware.ts`

```typescript
// ❌ Antes — acepta cualquier origen
import cors from 'cors'
app.use(cors())

// ✅ Después
const allowedOrigins = [process.env.NUXT_PUBLIC_API_BASE!, 'https://tu-app.vercel.app']

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)
```

### 2.5 Validación Zod en todos los endpoints

**Carpeta:** `api/` — todos los handlers

Actualmente Zod está en `dependencies` pero el TODO confirma que no se usa en todos los endpoints.

```typescript
// Ejemplo para api/products/index.ts
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().uuid(),
  description: z.string().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const result = createProductSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() })
    }
    const data = result.data // tipado y validado
    // ...
  }
}
```

---

## 3. Correcciones de configuración

### 3.1 Bug en `vercel.json` — ruta incorrecta de serverless functions

**Archivo:** `vercel.json`

```json
// ❌ Actual — apunta a una carpeta que no existe
{
  "functions": {
    "api/index.ts": {
      "includeFiles": "src/api/**/*"
    }
  }
}

// ✅ Corrección
{
  "functions": {
    "api/**/*.ts": {
      "includeFiles": "api/**/*"
    }
  }
}
```

### 3.2 Resolver `fix-imports.ts` en `tsconfig.json`

**Archivo raíz:** `fix-imports.ts` → eliminar  
**Archivo:** `tsconfig.json`

El script existe porque hay rutas de importación mal resueltas. La solución correcta:

```json
// tsconfig.json en la raíz
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@api/*": ["api/*"],
      "@client/*": ["client/*"]
    },
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

Y en `api/tsconfig.json`:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "module": "ESNext",
    "target": "ES2022"
  },
  "include": ["./**/*.ts"]
}
```

### 3.3 Configurar ESLint correctamente

El `package.json` define scripts de lint pero no hay `.eslintrc` en `client/` ni en `api/`.

**Crear:** `api/.eslintrc.json`

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": ["warn", { "allow": ["error", "warn"] }]
  }
}
```

**Crear:** `client/.eslintrc.json`

```json
{
  "root": true,
  "extends": ["@nuxt/eslint-config", "plugin:vue/vue3-recommended", "@vue/eslint-config-typescript"],
  "rules": {
    "vue/multi-word-component-names": "off"
  }
}
```

### 3.4 Configurar Prettier

**Crear:** `.prettierrc` en la raíz

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 120,
  "vueIndentScriptAndStyle": false
}
```

**Crear:** `.prettierignore`

```
dist/
client/.output/
client/.nuxt/
node_modules/
*.lock
```

---

## 4. Dependencias a mover o actualizar

### 4.1 Mover de `devDependencies` a `dependencies`

Estas librerías se usan en producción y no estarán disponibles en el servidor si permanecen en `devDependencies`:

| Paquete              | Acción                 |
| -------------------- | ---------------------- |
| `express-rate-limit` | Mover a `dependencies` |
| `helmet`             | Mover a `dependencies` |
| `pino`               | Mover a `dependencies` |
| `pino-http`          | Mover a `dependencies` |

```bash
npm install express-rate-limit helmet pino pino-http
npm uninstall -D express-rate-limit helmet pino pino-http
```

### 4.2 Actualizar Stripe SDK

La versión actual (`^14.12.0`) está dos versiones mayores detrás. La v17 trae mejoras de seguridad, mejor soporte para webhooks y TypeScript mejorado.

```bash
npm install stripe@latest
```

> Revisar changelog de breaking changes entre v14 y v17 antes de actualizar: https://github.com/stripe/stripe-node/blob/master/CHANGELOG.md

### 4.3 Revisar versión de Express

El proyecto usa `express@^5.2.1` (Express 5 en beta/RC). Express 5 todavía no es estable para producción. Evaluar si quedarse en `^4.21.x` hasta que Express 5 sea LTS, o aceptar los riesgos del RC.

---

## 5. Testing

Actualmente hay 0% de cobertura a pesar de tener Vitest y Playwright instalados.

### 5.1 Setup de Vitest para la API

**Crear:** `api/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 70,
        functions: 70,
      },
    },
  },
})
```

### 5.2 Tests unitarios prioritarios

**Crear:** `api/__tests__/auth.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { hashPassword, comparePassword, generateToken, verifyToken } from '../_lib/auth'

describe('auth helpers', () => {
  it('hashPassword genera un hash distinto al original', async () => {
    const hash = await hashPassword('Admin1234!')
    expect(hash).not.toBe('Admin1234!')
  })

  it('comparePassword valida correctamente', async () => {
    const hash = await hashPassword('Admin1234!')
    expect(await comparePassword('Admin1234!', hash)).toBe(true)
    expect(await comparePassword('Wrong', hash)).toBe(false)
  })

  it('generateToken y verifyToken son inversos', () => {
    const payload = { id: '123', email: 'test@test.com', role: 'client' }
    const token = generateToken(payload)
    const decoded = verifyToken(token)
    expect(decoded.id).toBe(payload.id)
  })
})
```

**Crear:** `api/__tests__/products.test.ts` — tests con Supertest para los endpoints REST.

### 5.3 Tests de integración con Supertest

```typescript
import request from 'supertest'
import { describe, it, expect } from 'vitest'

describe('GET /api/products', () => {
  it('devuelve lista paginada', async () => {
    const res = await request('http://localhost:3000').get('/api/products').expect(200)

    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.meta).toHaveProperty('total')
    expect(res.body.meta).toHaveProperty('page')
  })
})
```

### 5.4 Setup de Playwright para E2E

**Crear:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'vercel dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Crear:** `e2e/checkout.spec.ts` — flujo crítico de compra end-to-end.

### 5.5 Agregar script al `package.json`

```json
{
  "scripts": {
    "test:unit": "vitest run --coverage",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "test:all": "npm run test:unit && npm run test:e2e"
  }
}
```

---

## 6. CI/CD — GitHub Actions

No existe ningún workflow. El proyecto se despliega sin ninguna validación automática.

### 6.1 Workflow principal

**Crear:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm run install:all
      - run: npm run lint
      - run: cd client && npm run typecheck
      - run: cd api && npx tsc --noEmit

  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm run install:all
      - run: cd api && npm run test:unit
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: api/coverage/

  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: test-unit
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm run install:all
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY_TEST }}
```

### 6.2 Workflow de seguridad

**Crear:** `.github/workflows/security.yml`

```yaml
name: Security scan

on:
  schedule:
    - cron: '0 9 * * 1' # Lunes 9am
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - run: cd api && npm audit --audit-level=high
      - run: cd client && npm audit --audit-level=high
```

---

## 7. API — mejoras de código

### 7.1 Logging estructurado con Pinia (ya está instalado)

**Archivo:** `api/_lib/logger.ts` — crear este archivo

```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
})
```

Reemplazar todos los `console.log` / `console.error` con `logger.info` / `logger.error`.

### 7.2 Centralizar manejo de errores

**Crear:** `api/_lib/errors.ts`

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

// Handler central
export function handleError(err: unknown, res: VercelResponse) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code })
  }
  logger.error(err)
  return res.status(500).json({ error: 'Error interno del servidor' })
}
```

### 7.3 Utilidad de paginación reutilizable

**Crear:** `api/_lib/pagination.ts`

```typescript
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export function getPaginationParams(query: Record<string, string | string[]>) {
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 12))
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

export function buildMeta(total: number, page: number, limit: number): PaginationMeta {
  return { total, page, limit, totalPages: Math.ceil(total / limit) }
}
```

### 7.4 Helmet en todos los handlers

**Archivo:** `api/_lib/middleware.ts`

```typescript
import helmet from 'helmet'

// Wrapper para aplicar helmet a handlers de Vercel
export function withSecurity(handler: VercelApiHandler): VercelApiHandler {
  return async (req, res) => {
    // Aplicar headers de helmet manualmente (Vercel no usa Express)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-DNS-Prefetch-Control', 'off')
    res.setHeader('X-Download-Options', 'noopen')
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.removeHeader('X-Powered-By')
    return handler(req, res)
  }
}
```

---

## 8. Cliente Nuxt — mejoras de código

### 8.1 Módulo de imágenes

**Instalar:**

```bash
cd client && npm install @nuxt/image
```

**En `client/nuxt.config.ts`:**

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  image: {
    provider: 'vercel',
    quality: 80,
    formats: ['webp', 'avif'],
  },
})
```

**Reemplazar** todos los `<img>` por `<NuxtImg>` en los componentes.

### 8.2 Meta tags dinámicos por producto

**Archivo:** `client/pages/products/[id].vue`

```typescript
// Agregar en el <script setup>
useSeoMeta({
  title: () => `${product.value?.name} — ShopFlow`,
  description: () => product.value?.description,
  ogTitle: () => product.value?.name,
  ogImage: () => product.value?.images?.[0],
  ogType: 'product',
})
```

### 8.3 Sitemap y robots.txt

```bash
cd client && npm install @nuxtjs/sitemap
```

**En `client/nuxt.config.ts`:**

```typescript
modules: ['@nuxtjs/sitemap'],
sitemap: {
  hostname: 'https://tu-app.vercel.app',
  routes: async () => {
    // Fetch dinámico de URLs de productos
    const products = await $fetch('/api/products?limit=1000');
    return products.data.map((p: Product) => `/products/${p.id}`);
  },
},
```

**Crear:** `client/public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Sitemap: https://tu-app.vercel.app/sitemap.xml
```

### 8.4 Lazy loading de componentes pesados

```typescript
// En páginas con ProductCard múltiple
const ProductCard = defineAsyncComponent(() => import('~/components/ProductCard.vue'))
```

### 8.5 Estado de error global

**Crear:** `client/composables/useErrorHandler.ts`

```typescript
export function useErrorHandler() {
  const toast = useToast() // o tu lib de toast

  function handleError(err: unknown) {
    if (err instanceof Error) {
      toast.error(err.message)
    } else {
      toast.error('Ocurrió un error inesperado')
    }
    console.error(err)
  }

  return { handleError }
}
```

---

## 9. Base de datos

### 9.1 Sistema de migraciones

El esquema actual se maneja con `init-db.ts` que recrea las tablas. No hay versionado de cambios.

**Instalar:**

```bash
npm install -D db-migrate db-migrate-pg
```

**Crear:** `api/_migrations/001_initial_schema.sql` con el schema actual.

Cada cambio futuro al schema = nuevo archivo `002_add_column_x.sql`.

```json
// package.json
{
  "scripts": {
    "db:migrate": "db-migrate up",
    "db:rollback": "db-migrate down",
    "db:migrate:create": "db-migrate create"
  }
}
```

### 9.2 Backup automático

Neon ofrece point-in-time recovery en los planes pagos. Para el plan gratuito:

**Crear:** `.github/workflows/db-backup.yml`

```yaml
name: Database backup

on:
  schedule:
    - cron: '0 3 * * *' # 3am diario

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - run: |
          pg_dump "${{ secrets.DATABASE_URL }}" \
            --no-owner --no-acl \
            | gzip > backup-$(date +%Y%m%d).sql.gz
      - uses: actions/upload-artifact@v4
        with:
          name: db-backup-${{ github.run_number }}
          path: '*.sql.gz'
          retention-days: 30
```

### 9.3 Índices recomendados

Agregar en `api/_lib/init-db.ts`:

```sql
-- Para búsquedas de productos
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('spanish', name));

-- Para pedidos de usuario
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Para items del carrito
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
```

---

## 10. Stripe y pagos

### 10.1 Actualizar versión del SDK (ver sección 4.2)

### 10.2 Idempotency keys en PaymentIntents

```typescript
// api/stripe/create-payment-intent.ts
const paymentIntent = await stripe.paymentIntents.create(
  {
    amount: totalCents,
    currency: 'mxn',
    metadata: { orderId },
  },
  {
    idempotencyKey: `order-${orderId}`, // Evita cobros duplicados
  }
)
```

### 10.3 Soporte de reembolsos para admin

**Crear:** `api/admin/refund.ts`

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { orderId, reason } = req.body
  // 1. Buscar order y su payment_intent_id en la DB
  // 2. stripe.refunds.create({ payment_intent: paymentIntentId, reason })
  // 3. Actualizar estado del pedido a 'refunded'
  // 4. Responder
}
```

### 10.4 Usar claves reales de Stripe (modo test es OK para dev)

Verificar que en Vercel production estén configuradas las claves reales (no placeholders del `.env.example`).

---

## 11. Observabilidad y monitoreo

### 11.1 Sentry para error tracking

```bash
npm install @sentry/node @sentry/nuxt
```

**En `api/_lib/sentry.ts`:**

```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})

export { Sentry }
```

**En `client/plugins/sentry.client.ts`:**

```typescript
import * as Sentry from '@sentry/nuxt'

export default defineNuxtPlugin(() => {
  Sentry.init({
    dsn: useRuntimeConfig().public.sentryDsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  })
})
```

### 11.2 Variables de entorno adicionales a documentar

Agregar al `.env.example`:

```bash
# Monitoring
SENTRY_DSN=https://xxx@sentry.io/yyy
NUXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/yyy

# Analytics (opcional)
NUXT_PUBLIC_PLAUSIBLE_DOMAIN=tu-app.vercel.app
```

---

## 12. Performance

### 12.1 Compresión de respuestas API

**En `api/_lib/middleware.ts`:**

```typescript
import { gzip } from 'zlib'
import { promisify } from 'util'

const gzipAsync = promisify(gzip)

export async function compressResponse(data: unknown, res: VercelResponse) {
  const json = JSON.stringify(data)
  if (json.length > 1024) {
    const compressed = await gzipAsync(json)
    res.setHeader('Content-Encoding', 'gzip')
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).end(compressed)
  }
  return res.status(200).json(data)
}
```

### 12.2 Cache de respuestas con headers

```typescript
// Para endpoints de solo lectura (productos, categorías)
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
```

### 12.3 Connection pooling — verificar configuración

**En `api/_lib/db.ts`:**

```typescript
import { Pool } from 'pg'

// Serverless-friendly: pool pequeño, timeout corto
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5, // Máximo 5 conexiones simultáneas
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})
```

---

## 13. SEO

| Mejora                            | Archivo                          | Estado    |
| --------------------------------- | -------------------------------- | --------- |
| `<title>` dinámico por página     | `client/pages/*.vue`             | Pendiente |
| `<meta description>` por producto | `client/pages/products/[id].vue` | Pendiente |
| Open Graph tags                   | `client/layouts/default.vue`     | Pendiente |
| `sitemap.xml`                     | `@nuxtjs/sitemap`                | Pendiente |
| `robots.txt`                      | `client/public/robots.txt`       | Pendiente |
| Schema.org `Product` JSON-LD      | `client/pages/products/[id].vue` | Pendiente |
| Canonical URLs                    | `client/nuxt.config.ts`          | Pendiente |

**Ejemplo de JSON-LD para productos:**

```vue
<!-- client/pages/products/[id].vue -->
<script setup>
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.value?.name,
        description: product.value?.description,
        offers: {
          '@type': 'Offer',
          price: product.value?.price,
          priceCurrency: 'MXN',
          availability: product.value?.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      }),
    },
  ],
})
</script>
```

---

## 14. Admin panel

| Mejora                      | Descripción                                        |
| --------------------------- | -------------------------------------------------- |
| Gestión de usuarios         | CRUD de usuarios (activar/desactivar, cambiar rol) |
| Importación masiva CSV      | Upload de productos desde Excel/CSV                |
| Alertas de stock bajo       | Notificación cuando `stock < umbral`               |
| Gráficas de ventas          | Recharts o Chart.js para revenue, pedidos por día  |
| Procesamiento de reembolsos | UI para emitir reembolso desde un pedido           |
| Exportar pedidos            | Descargar CSV de pedidos filtrado por fecha        |

---

## 15. Documentación

### Archivos a crear

| Archivo                            | Contenido                                                            |
| ---------------------------------- | -------------------------------------------------------------------- |
| `CONTRIBUTING.md`                  | Cómo contribuir, convenciones, proceso de PR (reemplaza `AGENTS.md`) |
| `CHANGELOG.md`                     | Historial de cambios por versión                                     |
| `docs/architecture.md`             | Diagrama y descripción del sistema                                   |
| `docs/api.md` o OpenAPI spec       | Documentación de endpoints                                           |
| `docs/deployment.md`               | Guía paso a paso para producción                                     |
| `.github/pull_request_template.md` | Template de PR para el equipo                                        |

### Ejemplo de `.github/pull_request_template.md`

```markdown
## ¿Qué hace este PR?

## Tipo de cambio

- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Refactor
- [ ] Documentación

## Checklist

- [ ] Tests escritos/actualizados
- [ ] Lint pasa (`npm run lint`)
- [ ] Typecheck pasa
- [ ] Variables de entorno documentadas en `.env.example`
```

---

## 16. Estructura final recomendada

```
ShopFlow/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              ← nuevo
│   │   ├── security.yml        ← nuevo
│   │   └── db-backup.yml       ← nuevo
│   └── pull_request_template.md ← nuevo
│
├── api/
│   ├── __tests__/              ← nuevo
│   │   ├── auth.test.ts
│   │   ├── products.test.ts
│   │   └── orders.test.ts
│   ├── _lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── stripe.ts
│   │   ├── middleware.ts       ← agregar rate limit + CORS + helmet
│   │   ├── logger.ts           ← nuevo
│   │   ├── errors.ts           ← nuevo
│   │   ├── pagination.ts       ← nuevo
│   │   └── sentry.ts           ← nuevo
│   ├── _migrations/            ← nuevo
│   │   └── 001_initial_schema.sql
│   ├── auth/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── orders/
│   ├── admin/
│   └── stripe/
│       ├── create-payment-intent.ts
│       └── webhook.ts          ← agregar verificación de firma
│
├── client/
│   ├── components/
│   ├── composables/
│   │   └── useErrorHandler.ts  ← nuevo
│   ├── layouts/
│   ├── pages/
│   ├── plugins/
│   │   └── sentry.client.ts    ← nuevo
│   ├── public/
│   │   └── robots.txt          ← nuevo
│   └── stores/
│
├── e2e/                        ← nuevo
│   ├── checkout.spec.ts
│   └── auth.spec.ts
│
├── docs/                       ← nuevo
│   ├── architecture.md
│   ├── api.md
│   └── deployment.md
│
├── .env.example                ← actualizar con nuevas variables
├── .eslintrc.json              ← nuevo (raíz)
├── .gitignore                  ← actualizar (agregar dist/, server/, etc.)
├── .prettierrc                 ← nuevo
├── CHANGELOG.md                ← nuevo
├── CONTRIBUTING.md             ← nuevo (reemplaza AGENTS.md)
├── playwright.config.ts        ← nuevo
├── package.json
├── tsconfig.json               ← corregir paths
└── vercel.json                 ← corregir includeFiles

── ELIMINAR ──────────────────────────────────
├── dist/                       ← ❌ eliminar y agregar a .gitignore
├── server/                     ← ❌ eliminar (PHP, fuera del stack)
├── server-logic/               ← ❌ eliminar (PHP, fuera del stack)
├── fix-imports.ts              ← ❌ eliminar (resolver en tsconfig)
├── implementation_plan.md      ← ❌ eliminar (artefacto de IA)
└── AGENTS.md                   ← ❌ reemplazar con CONTRIBUTING.md
```

---

## Resumen ejecutivo de prioridades

| #   | Tarea                                            | Impacto    | Esfuerzo |
| --- | ------------------------------------------------ | ---------- | -------- |
| 1   | Verificar firma webhook Stripe                   | 🔴 Crítico | 30 min   |
| 2   | Mover `rate-limit` + `helmet` a `dependencies`   | 🔴 Crítico | 5 min    |
| 3   | Corregir `includeFiles` en `vercel.json`         | 🔴 Crítico | 2 min    |
| 4   | Eliminar `dist/`, `server/`, `server-logic/`     | 🟠 Alto    | 1 hora   |
| 5   | JWT en HttpOnly cookies en lugar de localStorage | 🟠 Alto    | 2 horas  |
| 6   | Configurar CORS con orígenes explícitos          | 🟠 Alto    | 30 min   |
| 7   | Añadir Zod a todos los endpoints                 | 🟠 Alto    | 4 horas  |
| 8   | Resolver `fix-imports.ts` en `tsconfig.json`     | 🟡 Medio   | 1 hora   |
| 9   | Configurar ESLint + Prettier                     | 🟡 Medio   | 1 hora   |
| 10  | Escribir tests unitarios de la API               | 🟡 Medio   | 1 día    |
| 11  | GitHub Actions CI                                | 🟡 Medio   | 2 horas  |
| 12  | Actualizar Stripe a v17                          | 🟡 Medio   | 2 horas  |
| 13  | Sistema de migraciones DB                        | 🟡 Medio   | 4 horas  |
| 14  | Sentry para error tracking                       | 🟢 Bajo    | 1 hora   |
| 15  | SEO meta tags + sitemap                          | 🟢 Bajo    | 3 horas  |
| 16  | OpenAPI/Swagger docs                             | 🟢 Bajo    | 4 horas  |

---

_Generado por análisis estático del repositorio · ShopFlow v1.0.0_
