# ShopFlow — AGENTS.md (OpenCode Instructions)

> **MODELO EN USO:** nvidia/glm-4 (o glm-5.1)
> **REGLA ABSOLUTA:** Solo implementa lo que está escrito aquí. No inventes código. No refactorices lo que no se pide. No renombres archivos. No cambies el schema de la base de datos. Si tienes duda sobre algo que no está en este archivo, detente y pregunta.

---

## ESTRUCTURA DEL PROYECTO (no modificar esta estructura)

```
ShopFlow/
├── api/                    # Vercel Serverless Functions (Node.js + TypeScript)
│   ├── _lib/               # Utilidades compartidas
│   │   ├── db.ts           # Pool de conexión a Neon PostgreSQL
│   │   ├── auth.ts         # JWT helpers
│   │   ├── stripe.ts       # Cliente Stripe
│   │   ├── middleware.ts   # Auth middleware actual
│   │   ├── init-db.ts      # Creación de tablas
│   │   └── seed.ts         # Datos de prueba
│   ├── auth/               # register.ts, login.ts, logout.ts, me.ts
│   ├── products/           # index.ts, [id].ts
│   ├── categories/         # index.ts, [id].ts
│   ├── cart/               # index.ts
│   ├── orders/             # index.ts, [id].ts
│   ├── admin/              # dashboard.ts, orders.ts, orders/[id].ts
│   └── stripe/             # create-payment-intent.ts, webhook.ts
├── client/                 # Nuxt 3 app
│   ├── pages/              # 14 páginas .vue
│   ├── stores/             # auth.ts, cart.ts (Pinia)
│   ├── components/         # TheHeader.vue, ProductCard.vue, etc.
│   ├── layouts/            # default.vue, admin.vue
│   ├── composables/        # useApi.ts
│   └── nuxt.config.ts
├── vercel.json
├── package.json            # Root
├── tsconfig.json
└── .env.example
```

---

## CONVENCIONES OBLIGATORIAS (leer antes de escribir cualquier línea)

### TypeScript

- Strict mode habilitado. NUNCA uses `any` explícito.
- Imports en API usan extensión `.js` (ES modules): `import { pool } from './_lib/db.js'`
- Imports en client usan alias `~/`: `import type { Product } from '~/types'`
- Return types explícitos en funciones exportadas.

### Formato de código

- API: comillas simples, CON punto y coma al final.
- Client: comillas simples, SIN punto y coma al final.
- Indentación: 2 espacios en todos los archivos.
- Máximo 120 caracteres por línea.

### Respuestas de la API

- Éxito: `{ data: T }` o `{ data: T[], meta: { total, page, limit, totalPages } }`
- Error: `{ error: string }` con el status HTTP correcto.
- NUNCA devuelvas stacks de error en producción.

### Autenticación

- JWT en localStorage con claves `shopflow_token` y `shopflow_user`.
- Header: `Authorization: Bearer <token>`
- Expiración: 7 días (`'7d'`).

### Base de datos

- SIEMPRE usa queries parametrizadas: `pool.query('SELECT * FROM users WHERE id = $1', [id])`
- NUNCA uses template strings para construir SQL.
- SSL Neon: `rejectUnauthorized: false` (ya configurado en `_lib/db.ts`, no lo cambies).

---

## TAREAS — ORDEN OBLIGATORIO

Implementa las tareas **en el orden numerado**. No saltes a la siguiente hasta completar y verificar la actual.
Cada tarea tiene: archivos a modificar/crear + código exacto + comando de verificación.

---

## TAREA 1 — Verificación de firma en Stripe Webhook

**Por qué:** Sin esto, cualquier atacante puede enviar POSTs falsos a `/api/stripe/webhook` y marcar pedidos como pagados sin haber pagado.

**Archivo a modificar:** `api/stripe/webhook.ts`

**Reemplaza el contenido COMPLETO del archivo con esto:**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { pool } from '../_lib/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    // req.body debe ser el raw body (Buffer). Vercel lo provee automáticamente.
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));

    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error('Webhook signature verification failed:', message);
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;

        if (orderId) {
          await pool.query(`UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1`, [orderId]);
          console.log(`Order ${orderId} marked as paid`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;

        if (orderId) {
          await pool.query(`UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = $1`, [orderId]);
          console.log(`Order ${orderId} marked as failed`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error processing webhook:', message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
```

**IMPORTANTE — configurar raw body en Vercel:**

En `vercel.json`, verifica que el webhook tenga `bodyParser` deshabilitado. Agrega esto dentro del array `"functions"` si no existe:

```json
{
  "functions": {
    "api/stripe/webhook.ts": {
      "memory": 128,
      "maxDuration": 10
    }
  }
}
```

Y crea o modifica `api/stripe/webhook.config.ts` (archivo de configuración de Vercel para raw body):

**Archivo NUEVO a crear:** `api/stripe/webhook.config.ts`

```typescript
export const config = {
  api: {
    bodyParser: false,
  },
};
```

**Variable de entorno requerida:** Agrega en `.env` (y en Vercel Dashboard):

```
STRIPE_WEBHOOK_SECRET=whsec_tu_signing_secret_aqui
```

**Verificación:**

```bash
# Debe compilar sin errores
cd api && npx tsc --noEmit
```

---

## TAREA 2 — Middleware de seguridad (Rate Limiting + Helmet + CORS)

**Por qué:** La API está expuesta sin límites de peticiones ni headers de seguridad.

**Paso 2.1 — Mover paquetes de devDependencies a dependencies en `api/package.json`:**

Abre `api/package.json` y mueve estos paquetes de `devDependencies` a `dependencies`:

- `express-rate-limit`
- `helmet`

Si no tiene su propio `package.json`, usa el root `package.json` y haz lo mismo.

**Paso 2.2 — Crear el archivo de middleware de seguridad:**

**Archivo NUEVO a crear:** `api/_lib/security.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── CORS ────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3000',
  'https://shopflow.vercel.app', // cambia por tu dominio real en producción
].filter(Boolean);

export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin ?? '';

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true; // indica que se manejó el preflight, no continuar
  }

  return false;
}

// ─── SECURITY HEADERS (Helmet equivalente para Vercel) ───────────────────────

export function applySecurityHeaders(res: VercelResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; frame-src https://js.stripe.com; connect-src 'self' https://api.stripe.com"
  );
}

// ─── RATE LIMITING (en memoria, por IP, serverless-compatible) ───────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Map global en memoria (se resetea por cold start, suficiente para serverless)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * @param maxRequests - máximo de requests permitidos en la ventana
 * @param windowMs - ventana de tiempo en milisegundos
 */
export function checkRateLimit(req: VercelRequest, res: VercelResponse, maxRequests = 60, windowMs = 60_000): boolean {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.socket?.remoteAddress ?? 'unknown';

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return false; // no bloqueado
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', '0');
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return true; // bloqueado
  }

  res.setHeader('X-RateLimit-Limit', String(maxRequests));
  res.setHeader('X-RateLimit-Remaining', String(maxRequests - entry.count));
  return false; // no bloqueado
}

// ─── HELPER: aplica todo de una vez ──────────────────────────────────────────

/**
 * Aplica CORS + headers de seguridad + rate limiting.
 * Retorna true si la respuesta ya fue enviada (preflight o rate limit).
 */
export function applySecurityMiddleware(
  req: VercelRequest,
  res: VercelResponse,
  options: { maxRequests?: number; windowMs?: number } = {}
): boolean {
  applySecurityHeaders(res);

  const isPreflight = applyCors(req, res);
  if (isPreflight) return true;

  const isRateLimited = checkRateLimit(req, res, options.maxRequests, options.windowMs);
  if (isRateLimited) return true;

  return false;
}
```

**Paso 2.3 — Aplicar el middleware en los endpoints de auth (los más sensibles):**

**Archivo a modificar:** `api/auth/login.ts`

Al inicio del handler, agrega estas dos líneas (después de los imports existentes):

```typescript
import { applySecurityMiddleware } from '../_lib/security.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Rate limit más estricto en login: 10 intentos por minuto
  const blocked = applySecurityMiddleware(req, res, { maxRequests: 10, windowMs: 60_000 });
  if (blocked) return;

  // ... resto del código existente del handler sin cambios ...
}
```

**Archivo a modificar:** `api/auth/register.ts`

Misma operación, rate limit: `maxRequests: 5, windowMs: 60_000`.

**Archivo a modificar:** `api/products/index.ts`

Rate limit general: `maxRequests: 60, windowMs: 60_000` (usa los valores por defecto).

**Verificación:**

```bash
cd api && npx tsc --noEmit
```

---

## TAREA 3 — Validación de inputs con Zod

**Por qué:** Los endpoints aceptan cualquier payload sin validar. Un input malicioso puede causar crashes o comportamiento inesperado.

**Zod ya está instalado** (`"zod": "^3.22.4"` en package.json). No instales nada nuevo.

**Paso 3.1 — Crear schemas centralizados:**

**Archivo NUEVO a crear:** `api/_lib/schemas.ts`

```typescript
import { z } from 'zod';

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category_id: z.number().int().positive(),
  images: z.array(z.string().url()).max(10).optional().default([]),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  category: z.coerce.number().int().positive().optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest']).optional().default('newest'),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
});

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

// ─── CART ─────────────────────────────────────────────────────────────────────

export const AddToCartSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99),
});

export const UpdateCartSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(99),
});

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed']),
});

// ─── STRIPE ───────────────────────────────────────────────────────────────────

export const CreatePaymentIntentSchema = z.object({
  order_id: z.number().int().positive(),
  amount: z.number().int().positive('Amount must be positive (in cents)'),
  currency: z.string().length(3).optional().default('usd'),
});

// ─── HELPER ───────────────────────────────────────────────────────────────────

/**
 * Valida un schema de Zod y retorna { success, data, error }.
 * Usa esto en cada handler para validar req.body o req.query.
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  return { success: false, error: message };
}
```

**Paso 3.2 — Aplicar validación en el endpoint de registro:**

**Archivo a modificar:** `api/auth/register.ts`

Agrega esto INMEDIATAMENTE DESPUÉS de la verificación del método POST y ANTES de cualquier lógica de negocio:

```typescript
import { RegisterSchema, validate } from '../_lib/schemas.js';

// Dentro del handler, después del rate limit check:
const validation = validate(RegisterSchema, req.body);
if (!validation.success) {
  return res.status(400).json({ error: validation.error });
}
const { name, email, password } = validation.data;
// Usa estas variables (name, email, password) en el resto del handler.
// NO uses req.body.name, req.body.email, etc. directamente.
```

**Archivo a modificar:** `api/auth/login.ts`

```typescript
import { LoginSchema, validate } from '../_lib/schemas.js';

// Dentro del handler:
const validation = validate(LoginSchema, req.body);
if (!validation.success) {
  return res.status(400).json({ error: validation.error });
}
const { email, password } = validation.data;
```

**Archivo a modificar:** `api/products/index.ts` (para el query de listado)

```typescript
import { ProductQuerySchema, CreateProductSchema, validate } from '../_lib/schemas.js';

// Para GET (listado):
const queryValidation = validate(ProductQuerySchema, req.query);
if (!queryValidation.success) {
  return res.status(400).json({ error: queryValidation.error });
}
const { page, limit, category, search, sort, min_price, max_price } = queryValidation.data;

// Para POST (crear producto, solo admin):
const bodyValidation = validate(CreateProductSchema, req.body);
if (!bodyValidation.success) {
  return res.status(400).json({ error: bodyValidation.error });
}
const productData = bodyValidation.data;
```

**Verificación:**

```bash
cd api && npx tsc --noEmit
```

---

## TAREA 4 — Configurar ESLint y Prettier

**Por qué:** ESLint y Prettier están instalados pero sin configuración. Husky y lint-staged ya están en package.json pero inactivos.

**Paso 4.1 — Crear `.eslintrc.cjs` en la raíz del proyecto:**

**Archivo NUEVO a crear:** `.eslintrc.cjs` (en la raíz, junto a package.json)

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['client/**/*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
      },
      extends: ['plugin:vue/vue3-recommended', 'plugin:@typescript-eslint/recommended'],
      rules: {
        'vue/multi-word-component-names': 'off',
        'vue/no-v-html': 'warn',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', '.nuxt/', '.output/', '*.d.ts'],
};
```

**Paso 4.2 — Crear `.prettierrc` en la raíz:**

**Archivo NUEVO a crear:** `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 120,
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "client/**/*.vue",
      "options": {
        "semi": false
      }
    }
  ]
}
```

**Paso 4.3 — Inicializar Husky:**

```bash
# Desde la raíz del proyecto:
npx husky init
```

Esto crea `.husky/pre-commit`. Reemplaza su contenido con:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**Paso 4.4 — Verificar que lint-staged en package.json sea correcto:**

El `package.json` raíz ya tiene esto (no lo cambies):

```json
"lint-staged": {
  "*.{js,ts,vue,cjs}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

**Verificación:**

```bash
# Desde la raíz:
npx eslint api/_lib/security.ts --max-warnings 5
npx prettier --check api/_lib/schemas.ts
```

---

## TAREA 5 — Tests básicos con Vitest

**Por qué:** No hay ningún test. Los paquetes Vitest y Supertest ya están instalados.

**Paso 5.1 — Crear `vitest.config.ts` en la raíz:**

**Archivo NUEVO a crear:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['api/**/*.test.ts', 'api/**/*.spec.ts'],
    exclude: ['node_modules', '.nuxt', '.output', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['api/**/*.ts'],
      exclude: ['api/_lib/init-db.ts', 'api/_lib/seed.ts'],
    },
  },
});
```

**Paso 5.2 — Crear tests para el helper de validación:**

**Archivo NUEVO a crear:** `api/_lib/schemas.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { validate, RegisterSchema, LoginSchema, ProductQuerySchema } from './schemas.js';

describe('validate() helper', () => {
  it('retorna success:true con datos válidos', () => {
    const result = validate(LoginSchema, { email: 'test@example.com', password: 'password123' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
    }
  });

  it('retorna success:false con email inválido', () => {
    const result = validate(LoginSchema, { email: 'no-es-email', password: '123' });
    expect(result.success).toBe(false);
  });

  it('retorna success:false con objeto vacío', () => {
    const result = validate(RegisterSchema, {});
    expect(result.success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  it('valida un registro correcto', () => {
    const result = validate(RegisterSchema, {
      name: 'Eduardo',
      email: 'eduardo@example.com',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza contraseña sin mayúsculas', () => {
    const result = validate(RegisterSchema, {
      name: 'Eduardo',
      email: 'eduardo@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('uppercase');
    }
  });

  it('rechaza contraseña corta', () => {
    const result = validate(RegisterSchema, {
      name: 'Eduardo',
      email: 'eduardo@example.com',
      password: 'Ab1',
    });
    expect(result.success).toBe(false);
  });
});

describe('ProductQuerySchema', () => {
  it('aplica valores por defecto correctamente', () => {
    const result = validate(ProductQuerySchema, {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(12);
      expect(result.data.sort).toBe('newest');
    }
  });

  it('coerce strings a números', () => {
    const result = validate(ProductQuerySchema, { page: '2', limit: '24' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(24);
    }
  });

  it('rechaza sort inválido', () => {
    const result = validate(ProductQuerySchema, { sort: 'invalid_sort' });
    expect(result.success).toBe(false);
  });

  it('rechaza limit mayor a 100', () => {
    const result = validate(ProductQuerySchema, { limit: '200' });
    expect(result.success).toBe(false);
  });
});
```

**Paso 5.3 — Crear tests para el middleware de seguridad:**

**Archivo NUEVO a crear:** `api/_lib/security.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock mínimo de req y res para tests unitarios
function makeReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'GET',
    headers: {},
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides,
  } as unknown as VercelRequest;
}

function makeRes(): { res: VercelResponse; headers: Record<string, string>; statusCode: number; body: unknown } {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: unknown = null;

  const res = {
    setHeader: (key: string, value: string) => {
      headers[key] = value;
    },
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: unknown) => {
      body = data;
      return res;
    },
    end: () => res,
  } as unknown as VercelResponse;

  return { res, headers, statusCode, body };
}

describe('applySecurityHeaders', () => {
  it('agrega X-Content-Type-Options: nosniff', async () => {
    const { applySecurityHeaders } = await import('./security.js');
    const { res, headers } = makeRes();
    applySecurityHeaders(res);
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
  });

  it('agrega X-Frame-Options: DENY', async () => {
    const { applySecurityHeaders } = await import('./security.js');
    const { res, headers } = makeRes();
    applySecurityHeaders(res);
    expect(headers['X-Frame-Options']).toBe('DENY');
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('no bloquea dentro del límite', async () => {
    const { checkRateLimit } = await import('./security.js');
    const req = makeReq({ headers: { 'x-forwarded-for': '10.0.0.1' } });
    const { res } = makeRes();
    const blocked = checkRateLimit(req, res, 5, 60_000);
    expect(blocked).toBe(false);
  });
});
```

**Paso 5.4 — Actualizar el script de tests en `package.json` raíz:**

Modifica el script `"test:unit"` de:

```json
"test:unit": "vitest run"
```

a:

```json
"test:unit": "vitest run --config vitest.config.ts"
```

**Verificación:**

```bash
# Desde la raíz:
npm run test:unit
# Debe pasar todos los tests sin errores
```

---

## TAREA 6 — GitHub Actions CI

**Por qué:** Sin CI, los errores de TypeScript o ESLint solo se detectan en producción.

**Archivo NUEVO a crear:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    name: Lint & Typecheck
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install root dependencies
        run: npm ci

      - name: Install API dependencies
        run: cd api && npm ci

      - name: Install client dependencies
        run: cd client && npm ci

      - name: Typecheck API
        run: cd api && npx tsc --noEmit

      - name: Typecheck client
        run: cd client && npm run typecheck

      - name: ESLint
        run: npx eslint api --ext .ts --max-warnings 10

  tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm run install:all

      - name: Run unit tests
        run: npm run test:unit
```

**Verificación:**

```bash
# Verifica que el YAML sea válido (sin espacios de tabulación):
cat .github/workflows/ci.yml | grep -P '\t' && echo "ERROR: tabs encontrados" || echo "OK: sin tabs"
```

---

## TAREA 7 — Eliminar archivos PHP del repositorio

**Por qué:** El repositorio reporta 21.5% PHP en un proyecto Node.js/Vue. Esto puede ser `dist/` commiteado o archivos legacy.

**Paso 7.1 — Investigar primero (NO borres nada sin haber hecho esto):**

```bash
# Encontrar todos los archivos PHP en el repo:
find . -name "*.php" -not -path "./node_modules/*" -not -path "./.git/*"

# Ver si dist/ está commiteado:
git ls-files | grep ".php"
git ls-files | grep "dist/"
```

**Paso 7.2 — Según el resultado:**

**Si los archivos PHP están en `dist/`:** El `dist/` no debería estar trackeado. Agrega al `.gitignore`:

```
dist/
.output/
.nuxt/
```

Luego ejecuta:

```bash
git rm -r --cached dist/
git add .gitignore
git commit -m "chore: remove dist from tracking, update .gitignore"
```

**Si los archivos PHP son de otra carpeta:** Muéstrame el resultado del `find` antes de borrar nada.

**Verificación:**

```bash
git ls-files | grep ".php"
# Debe retornar vacío
```

---

## TAREA 8 — Logging estructurado en la API

**Por qué:** `pino` y `pino-pretty` ya están instalados en devDependencies. Con logs estructurados es mucho más fácil debuggear en producción en Vercel.

**Archivo NUEVO a crear:** `api/_lib/logger.ts`

```typescript
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

/**
 * Loggea un error de API con contexto.
 */
export function logApiError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logger.error({ context, message, stack }, `API Error in ${context}`);
}
```

**Cómo usarlo en los handlers (ejemplo):**

```typescript
import { logger, logApiError } from '../_lib/logger.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    logger.info({ method: req.method, path: req.url }, 'Request received');
    // ... lógica ...
  } catch (error) {
    logApiError('products.index', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Verificación:**

```bash
cd api && npx tsc --noEmit
```

---

## REGLAS DE ORO PARA EL AGENTE

1. **Lee el archivo completo antes de modificarlo.** No asumas qué hay dentro.
2. **Un archivo a la vez.** Termina y verifica antes de pasar al siguiente.
3. **Si un archivo no existe, créalo desde cero** con el código exacto de este documento.
4. **Si un archivo existe**, modifica SOLO la parte indicada. No toques el resto.
5. **No cambies** `api/_lib/db.ts`, `api/_lib/auth.ts`, `api/_lib/init-db.ts`, `api/_lib/seed.ts` a menos que una tarea lo indique explícitamente.
6. **No cambies** ningún archivo `.vue` del client a menos que una tarea lo indique explícitamente.
7. **No cambies** `vercel.json` más allá de lo indicado en la Tarea 1.
8. **No cambies** el schema de la base de datos ni ejecutes `npm run db:init` en producción.
9. **Después de cada tarea**, ejecuta el comando de verificación indicado. Si falla, corrige antes de continuar.
10. **No instales paquetes nuevos** que no estén mencionados explícitamente en este documento. Todo lo necesario ya está instalado.

---

## VARIABLES DE ENTORNO REQUERIDAS

Estas deben existir en `.env` local y en Vercel Dashboard antes de hacer deploy:

```env
# Base de datos (no cambiar formato)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# JWT (cambiar en producción por un string aleatorio de 64+ caracteres)
JWT_SECRET=cambia-esto-por-un-string-aleatorio-muy-largo-en-produccion

# Stripe (modo test para desarrollo, modo live para producción)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   ← OBLIGATORIO para la Tarea 1

# Client
NUXT_PUBLIC_API_BASE=http://localhost:3000   ← en producción: https://tu-app.vercel.app
```

---

## ORDEN DE EJECUCIÓN RESUMIDO

```
✅ TAREA 1 → api/stripe/webhook.ts (firma Stripe)
✅ TAREA 2 → api/_lib/security.ts + aplicar en auth endpoints
✅ TAREA 3 → api/_lib/schemas.ts + aplicar en register/login/products
✅ TAREA 4 → .eslintrc.cjs + .prettierrc + .husky/pre-commit
✅ TAREA 5 → vitest.config.ts + tests unitarios
✅ TAREA 6 → .github/workflows/ci.yml
✅ TAREA 7 → Limpiar archivos PHP del repo
✅ TAREA 8 → api/_lib/logger.ts
```

Cada tarea mejora el proyecto sin romper lo que ya funciona. Implementa en orden.
