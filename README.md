# ShopFlow 🛍️

E-commerce completo con **Nuxt.js 3** (frontend) + **Vercel Serverless Functions** (backend API) + **Neon PostgreSQL** (base de datos) + **Stripe** (pagos).

## Stack

| Layer | Tech |
|---|---|
| Frontend | Nuxt.js 3, Vue 3, TypeScript, TailwindCSS |
| Backend API | Vercel Serverless Functions (Node.js + TypeScript) |
| Base de datos | Neon (PostgreSQL serverless) |
| Pagos | Stripe (modo test) |
| Estado global | Pinia |
| Deploy | Vercel (monorepo — 1 proyecto) |

## Estructura

```
ShopFlow/
├── vercel.json          # Configuración de build y rutas
├── package.json         # Scripts raíz: dev, build, deploy
├── .env.example         # Variables de entorno (copia a .env)
├── api/                 # Vercel Serverless Functions (Node.js)
│   ├── _lib/            # db.ts, auth.ts, stripe.ts, middleware.ts
│   ├── auth/            # register, login, logout, me
│   ├── products/        # CRUD + filtros + paginación
│   ├── categories/      # CRUD
│   ├── cart/            # Carrito autenticado
│   ├── orders/          # Pedidos del usuario
│   ├── admin/           # Dashboard + pedidos admin
│   └── stripe/          # PaymentIntent + Webhook
└── client/              # Nuxt.js 3 app
    ├── pages/           # 14 páginas
    ├── stores/          # Pinia (auth, cart)
    ├── components/      # TheHeader, ProductCard, etc.
    ├── layouts/         # default, admin
    └── composables/     # useApi
```

## Instalación local

### 1. Prerrequisitos
- Node.js 18+
- Cuenta en [Neon](https://neon.tech) (gratis)
- Cuenta en [Stripe](https://stripe.com) para las API keys (modo test)
- Vercel CLI: `npm i -g vercel`

### 2. Clonar y configurar
```bash
git clone https://github.com/tu-usuario/shopflow.git
cd shopflow

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales
```

### 3. Variables de entorno (`.env`)
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=tu-secret-super-largo-aqui
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NUXT_PUBLIC_API_BASE=http://localhost:3000
```

### 4. Inicializar base de datos
```bash
# Instalar dependencias de la API
cd api && npm install && cd ..

# Crear tablas
node api/_lib/init-db.js

# Insertar datos de prueba (10 categorías, 50 productos, 2 usuarios)
node api/_lib/seed.js
```

### 5. Instalar dependencias del cliente
```bash
cd client && npm install && cd ..
```

### 6. Iniciar en desarrollo
```bash
# Instala la CLI de Vercel si no la tienes
npm install

# Inicia el servidor local (API + Nuxt juntos)
vercel dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@shopflow.com | Admin1234! |
| Cliente | cliente@shopflow.com | Cliente1234! |

## Stripe — Pago de prueba

En la página de Checkout usa esta tarjeta de prueba:

| Campo | Valor |
|---|---|
| Número de tarjeta | `4242 4242 4242 4242` |
| Fecha de expiración | Cualquier fecha futura (ej: 12/29) |
| CVC | Cualquier 3 dígitos (ej: 123) |
| Nombre/ZIP | Cualquier valor |

> Para simular un pago fallido usa: `4000 0000 0000 9995`

## Deploy en Vercel

### 1. Subir a GitHub
```bash
git add .
git commit -m "Initial ShopFlow commit"
git push origin main
```

### 2. Crear proyecto en Vercel
1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio
3. **No cambies nada** — Vercel detectará el `vercel.json` en la raíz
4. En **Environment Variables** agrega todas las del `.env`

### 3. Configurar Neon para producción
- En Neon Dashboard → Connection → copia el `Connection string`
- Pégalo como `DATABASE_URL` en Vercel
- Corre las migraciones localmente contra Neon:
  ```bash
  node api/_lib/init-db.js  # con el DATABASE_URL de producción en .env
  node api/_lib/seed.js
  ```

### 4. Configurar Stripe Webhook
1. En Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://tu-app.vercel.app/api/stripe/webhook`
3. Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copia el **Signing secret** → ponlo como `STRIPE_WEBHOOK_SECRET` en Vercel

### 5. Deploy
```bash
vercel --prod
```

## Funcionalidades

- ✅ Registro/Login con JWT
- ✅ Catálogo con filtros, búsqueda, paginación (12/página)
- ✅ Ordenar por precio, nombre, más nuevo
- ✅ Vista de producto con galería de imágenes
- ✅ Badge "Agotado" cuando stock = 0
- ✅ Carrito persistente en localStorage + sync con backend
- ✅ Checkout con Stripe Elements (dark mode)
- ✅ Webhook de Stripe para confirmar/cancelar pedidos
- ✅ Historial de pedidos del usuario
- ✅ Panel admin con dashboard de métricas
- ✅ CRUD completo de productos y categorías
- ✅ Gestión de pedidos con cambio de estado
- ✅ Diseño dark mode con TailwindCSS
- ✅ Skeleton loaders, toast notifications
- ✅ SSR con Nuxt 3 para SEO óptimo
- ✅ TypeScript estricto en frontend y API
