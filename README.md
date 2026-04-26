<div align="center">

# 🛍️ ShopFlow

[![CI/CD](https://github.com/EDIHV382/ShopFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/EDIHV382/ShopFlow/actions/workflows/ci.yml)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://shopflow-demo-2026.vercel.app/)
[![Nuxt 3](https://img.shields.io/badge/Nuxt-3-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E5BF?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

**Aplicación de e-commerce fullstack de nivel producción construida como proyecto de portafolio.**  
Autenticación JWT · Catálogo con filtros · Pagos con Stripe · Panel de administración · SSR con Nuxt 3

[🌐 Ver Demo en Vivo](https://shopflow-demo-2026.vercel.app/) · [📦 Repositorio](https://github.com/EDIHV382/ShopFlow) · [🐛 Reportar Bug](https://github.com/EDIHV382/ShopFlow/issues)

</div>

---

## 📋 Tabla de Contenidos

- [🧰 Stack Tecnológico](#-stack-tecnológico)
- [✨ Funcionalidades](#-funcionalidades)
- [🌐 Live Demo](#-live-demo)
- [🔐 Credenciales de Prueba](#-credenciales-de-prueba)
- [💳 Pagos con Stripe](#-pagos-con-stripe)
- [🚀 Instalación Local](#-instalación-local)
- [☁️ Deploy en Vercel](#️-deploy-en-vercel)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)

---

## 🧰 Stack Tecnológico

| Capa              | Tecnología                                                                   | Descripción                                  |
| ----------------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| **Frontend**      | [Nuxt 3](https://nuxt.com/) + [Vue 3](https://vuejs.org/)                    | SSR / SSG, Composition API, `<script setup>` |
| **Tipado**        | [TypeScript](https://www.typescriptlang.org/)                                | Modo estricto en cliente y API               |
| **Estilos**       | [TailwindCSS](https://tailwindcss.com/)                                      | Diseño utility-first, dark mode              |
| **Estado**        | [Pinia](https://pinia.vuejs.org/)                                            | Stores reactivos con persistencia            |
| **Validación**    | [Vee-Validate](https://vee-validate.logaretm.com/) + [Zod](https://zod.dev/) | Validación de formularios y schemas          |
| **Backend**       | [Vercel Serverless Functions](https://vercel.com/docs/functions)             | Node.js + TypeScript, sin servidor           |
| **Base de datos** | [Neon PostgreSQL](https://neon.tech/)                                        | PostgreSQL serverless, pool de conexiones    |
| **Pagos**         | [Stripe](https://stripe.com/)                                                | Elements dark mode + Webhooks                |
| **Auth**          | JWT                                                                          | Tokens con expiración de 7 días              |
| **Deploy**        | [Vercel](https://vercel.com/)                                                | Monorepo con cliente + API unificados        |

---

## ✨ Funcionalidades

### 🔐 Autenticación

- [x] Registro de usuarios con validación de contraseña (8+ chars, mayúscula, número)
- [x] Login con JWT almacenado en `localStorage`
- [x] Rutas protegidas para clientes y administradores
- [x] Cierre de sesión y limpieza de estado global

### 🛒 Catálogo & Productos

- [x] Listado con filtros por categoría, precio y disponibilidad
- [x] Búsqueda en tiempo real por nombre
- [x] Paginación del catálogo
- [x] Ordenamiento por nombre (A-Z / Z-A) y precio (asc / desc)
- [x] Vista de detalle de producto con galería de imágenes
- [x] Badge de **"Agotado"** para productos sin stock

### 🛍️ Carrito & Checkout

- [x] Carrito persistente en `localStorage` con sincronización al backend
- [x] Agregar, editar cantidad y eliminar ítems
- [x] Checkout con **Stripe Elements** en dark mode
- [x] Confirmación de pago mediante **Webhook de Stripe**
- [x] Cancelación automática del pedido si el pago falla

### 📦 Pedidos

- [x] Historial de pedidos del usuario autenticado
- [x] Estado de pedido en tiempo real (pendiente / pagado / cancelado / enviado)
- [x] Detalle completo de cada orden

### 🔧 Panel de Administración

- [x] Dashboard con métricas clave (ventas, pedidos, usuarios, ingresos)
- [x] **CRUD completo** de productos (crear, editar, eliminar, imagen)
- [x] **CRUD completo** de categorías
- [x] Gestión de pedidos con cambio de estado manual

### 🎨 UX & Rendimiento

- [x] Skeleton loaders en toda la aplicación
- [x] Toast notifications con `vue-toastification`
- [x] SSR con Nuxt 3 (SEO-friendly)
- [x] TypeScript estricto en cliente y funciones serverless
- [x] Diseño responsive (mobile-first)

---

## 🌐 Live Demo

> 🚀 La aplicación está desplegada en Vercel y disponible en:

### **[https://shopflow-demo-2026.vercel.app/](https://shopflow-demo-2026.vercel.app/)**

---

## 🔐 Credenciales de Prueba

> ⚠️ **Nota**: Estas cuentas existen en la base de datos de prueba (Neon PostgreSQL). No utilices datos personales reales.

### 👤 Cliente

| Campo          | Valor                  |
| -------------- | ---------------------- |
| **Email**      | `cliente@shopflow.com` |
| **Contraseña** | `Cliente123`           |

### 🔧 Administrador

| Campo          | Valor                |
| -------------- | -------------------- |
| **Email**      | `admin@shopflow.com` |
| **Contraseña** | `Admin1234`          |

---

## 💳 Pagos con Stripe

> ShopFlow utiliza **Stripe en modo test**. No se realizan cargos reales.

### Tarjeta de Prueba

| Campo                   | Valor                                |
| ----------------------- | ------------------------------------ |
| **Número**              | `4242 4242 4242 4242`                |
| **Fecha de expiración** | Cualquier fecha futura (ej. `12/29`) |
| **CVC**                 | Cualquier 3 dígitos (ej. `123`)      |
| **Código postal**       | Cualquier código (ej. `10001`)       |

### Otros escenarios de prueba

| Tarjeta               | Resultado                        |
| --------------------- | -------------------------------- |
| `4000 0000 0000 0002` | Pago rechazado                   |
| `4000 0025 0000 3155` | Requiere autenticación 3D Secure |
| `4000 0000 0000 9995` | Fondos insuficientes             |

> 📖 Ver todos los escenarios en la [documentación de Stripe](https://stripe.com/docs/testing#cards).

---

## 🚀 Instalación Local

### Prerrequisitos

- **Node.js** v18 o superior
- **npm** v9 o superior
- Cuenta en [Neon](https://neon.tech/) (PostgreSQL gratuito)
- Cuenta en [Stripe](https://stripe.com/) (modo test)
- [Vercel CLI](https://vercel.com/docs/cli) (para el servidor de desarrollo del API)

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/EDIHV382/ShopFlow.git
cd ShopFlow
```

### 2. Instalar dependencias

```bash
npm run install:all
```

> Esto instala las dependencias de la raíz, `/api` y `/client` automáticamente.

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y rellena los valores:

```bash
cp .env.example .env
```

```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL=postgresql://usuario:password@host/shopflow?sslmode=require

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# Cliente Nuxt
NUXT_PUBLIC_API_BASE=http://localhost:3000
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
```

### 4. Inicializar la base de datos

```bash
# Crear las tablas
npm run db:init

# Poblar con datos de prueba (categorías, productos, usuarios)
npm run db:seed
```

### 5. Iniciar el servidor de desarrollo

Necesitas **dos terminales** simultáneas:

**Terminal 1 — API (Vercel Dev):**

```bash
cd api
npm run dev
# → http://localhost:3000/api
```

**Terminal 2 — Cliente (Nuxt):**

```bash
cd client
npm run dev
# → http://localhost:3001
```

### 6. (Opcional) Webhook de Stripe en local

Para probar el webhook localmente, instala el [Stripe CLI](https://stripe.com/docs/stripe-cli) y ejecuta:

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

Copia el `whsec_...` que aparece en la consola y agrégalo a tu `.env` como `STRIPE_WEBHOOK_SECRET`.

---

## ☁️ Deploy en Vercel

### Opción A — Deploy con un clic

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EDIHV382/ShopFlow)

### Opción B — Deploy manual con CLI

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Autenticarse
vercel login

# Deploy a producción
npm run deploy
```

### Variables de entorno en Vercel

Ve a tu proyecto en [vercel.com](https://vercel.com) → **Settings** → **Environment Variables** y agrega:

| Variable                | Entorno             | Descripción                                           |
| ----------------------- | ------------------- | ----------------------------------------------------- |
| `DATABASE_URL`          | Production, Preview | URL de conexión a Neon PostgreSQL con SSL             |
| `JWT_SECRET`            | Production, Preview | Secreto para firmar tokens JWT (mínimo 32 caracteres) |
| `STRIPE_SECRET_KEY`     | Production, Preview | Stripe secret key (sk*test*... o sk*live*...)         |
| `STRIPE_WEBHOOK_SECRET` | Production          | Stripe webhook signing secret (whsec\_...)            |
| `STRIPE_PUBLIC_KEY`     | Production, Preview | Stripe publishable key (pk*test*... o pk*live*...)    |
| `NUXT_PUBLIC_API_BASE`  | Production, Preview | URL base de la API (dominio de Vercel)                |

> **`NUXT_PUBLIC_API_BASE`** debe apuntar a tu dominio de Vercel:  
> Ej: `https://shopflow-demo-2026.vercel.app`

### Configurar el Webhook de Stripe en producción

1. Ve a [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Haz clic en **"Add endpoint"**
3. URL del endpoint: `https://shopflow-demo-2026.vercel.app/api/stripe/webhook`
4. Eventos a escuchar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copia el **Signing secret** (`whsec_...`) y agrégalo como `STRIPE_WEBHOOK_SECRET` en Vercel.

---

## 📁 Estructura del Proyecto

```
ShopFlow/
│
├── 📂 api/                          # Express.js (Node.js + TS) Serverless on Vercel
│   ├── index.ts                     # Entry point & middlewares
│   ├── 📂 _lib/                     # Utilidades compartidas
│   │   ├── db.ts                    # Pool de conexión Neon PostgreSQL
│   │   ├── schemas.ts               # Zod validation schemas
│   │   ├── pagination.ts            # Paginación
│   │   ├── auth.ts                  # Helpers JWT
│   │   ├── init-db.ts               # Inicialización de tablas
│   │   └── seed.ts                  # Datos de prueba
│   └── 📂 _routes/                  # Controladores
│       ├── auth/                    # Rutas de autenticación
│       ├── products/                # CRUD de productos
│       ├── categories/              # CRUD de categorías
│       ├── cart/                    # Sincronización del carrito
│       ├── orders/                  # Gestión de pedidos
│       ├── admin/                   # Endpoints del panel admin
│       └── stripe/                  # Intents de pago + webhook
│
├── 📂 client/                       # Nuxt 3 App (Vue 3 + TypeScript)

│   ├── 📂 pages/                    # Rutas de la aplicación
│   │   ├── index.vue                # Página principal / catálogo
│   │   ├── product/[id].vue         # Detalle de producto
│   │   ├── cart.vue                 # Carrito de compras
│   │   ├── checkout.vue             # Pago con Stripe
│   │   ├── orders.vue               # Historial de pedidos
│   │   ├── login.vue
│   │   ├── register.vue
│   │   └── 📂 admin/               # Panel de administración
│   │       ├── index.vue            # Dashboard de métricas
│   │       ├── products.vue         # Gestión de productos
│   │       ├── categories.vue       # Gestión de categorías
│   │       └── orders.vue           # Gestión de pedidos
│   ├── 📂 components/               # Componentes Vue reutilizables
│   ├── 📂 stores/                   # Pinia stores
│   │   ├── useAuthStore.ts
│   │   ├── useCartStore.ts
│   │   └── useProductStore.ts
│   ├── 📂 composables/              # Composables reutilizables
│   │   └── useApi.ts
│   ├── 📂 layouts/                  # Layouts de Nuxt
│   ├── 📂 types/                    # Tipos TypeScript globales
│   └── nuxt.config.ts
│
├── 📄 vercel.json                   # Configuración de build y routing
├── 📄 .env.example                  # Plantilla de variables de entorno
├── 📄 package.json                  # Scripts raíz del monorepo
└── 📄 README.md
```

---

## 🏗️ Arquitectura del Sistema

```mermaid
graph TD
    A[Cliente Nuxt 3] -->|HTTPS| B[Vercel Edge Network]
    B -->|Serverless Functions| C[Express API]
    C -->|Zod Validation| D[Middleware]
    D -->|JWT Auth| E[Auth Middleware]
    D -->|Admin Check| F[Admin Middleware]
    D -->|Rate Limit| G[Rate Limiter]
    E -->|SQL Queries| H[Neon PostgreSQL]
    F -->|SQL Queries| H
    C -->|Stripe API| I[Stripe]
    I -->|Webhooks| C
    H -->|SSL Connection| J[Database Pool]
```

### Flujo de Datos

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Nuxt 3    │────>│ Vercel CDN   │────>│ Express API │────>│   Neon DB    │
│  (Client)   │<────│  (Edge Net)  │<────│ (Node.js)   │<────│ (PostgreSQL) │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
       │                    │                    │                    │
       │                    │                    │                    │
       └────────────────────┴────────────────────┴────────────────────┘
                            │                    │
                            │                    └───> Stripe API
                            │
                            └───> Stripe Webhooks
```

---

## 🔧 Troubleshooting

### Error 1: "Cannot connect to database"

**Causa:** La URL de conexión a Neon PostgreSQL es inválida o la base de datos no está accesible.

**Solución:**

1. Verifica que `DATABASE_URL` en `.env` tenga el formato correcto:
   ```
   DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```
2. Asegúrate de que el modo SSL esté habilitado (`sslmode=require`)
3. Ejecuta `npm run db:init` para verificar la conexión

### Error 2: "Stripe webhook signature invalid"

**Causa:** El webhook secret no coincide o el cuerpo del request fue modificado.

**Solución:**

1. Obtén el webhook secret desde [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Actualiza `STRIPE_WEBHOOK_SECRET` en tu `.env`
3. En local, usa `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Error 3: "JWT token expired" o "Token inválido"

**Causa:** El token JWT expiró (7 días) o fue modificado.

**Solución:**

1. Cierra sesión y vuelve a iniciar
2. Limpia el localStorage: `localStorage.clear()`
3. Verifica que `JWT_SECRET` en `.env` sea el mismo que en producción

---

<div align="center">

## 🛠️ Desarrollado con ❤️ como proyecto de portafolio

Si este proyecto te fue útil, considera darle una ⭐ en GitHub.

[![GitHub stars](https://img.shields.io/github/stars/EDIHV382/ShopFlow?style=social)](https://github.com/EDIHV382/ShopFlow/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/EDIHV382/ShopFlow?style=social)](https://github.com/EDIHV382/ShopFlow/network/members)

</div>
