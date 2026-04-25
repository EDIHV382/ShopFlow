
# 🛍️ ShopFlow

[![Deploy Status](https://img.shields.io/badge/deploy-vercel-black?logo=vercel&logoColor=white)](https://shopflow-demo-2026.vercel.app/)
[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.x-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00E699?logo=postgresql&logoColor=white)](https://neon.tech/)

> Plataforma de e-commerce fullstack de producción construida con **Nuxt 3**, **Vercel Serverless Functions** y **Neon PostgreSQL**. Incluye autenticación JWT, catálogo completo, carrito persistente, checkout con Stripe y panel de administración con métricas.

---

## 🌐 Live Demo

**🔗 [https://shopflow-demo-2026.vercel.app/](https://shopflow-demo-2026.vercel.app/)**

---

## 🧰 Stack Tecnológico

| Capa | Tecnología | Descripción |
|------|-----------|-------------|
| **Frontend** | Nuxt 3 + Vue 3 | SSR / SSG con Composition API |
| **Lenguaje** | TypeScript (Strict) | Tipado estricto en todo el proyecto |
| **Estilos** | TailwindCSS | Utility-first CSS framework |
| **Estado** | Pinia | State management para Vue 3 |
| **Validación** | Vee-Validate + Zod | Formularios y esquemas de validación |
| **Backend** | Vercel Serverless Functions | Node.js + TypeScript, sin servidor |
| **Base de datos** | Neon (PostgreSQL) | PostgreSQL serverless escalable |
| **Pagos** | Stripe + Webhooks | Checkout seguro con confirmación automática |
| **Auth** | JWT | Tokens con expiración de 7 días |
| **Deploy** | Vercel (Monorepo) | CI/CD automático desde GitHub |

---

## ✨ Funcionalidades

### 🔐 Autenticación
- [x] Registro de usuario con validación de contraseña (8+ chars, mayúscula, dígito)
- [x] Login con JWT almacenado en `localStorage`
- [x] Roles diferenciados: `admin` y `customer`
- [x] Protección de rutas por rol

### 🛒 Catálogo y Carrito
- [x] Listado de productos con **filtros, búsqueda y paginación**
- [x] Ordenamiento por precio (asc/desc) y nombre (A-Z / Z-A)
- [x] Vista de producto individual con **galería de imágenes**
- [x] Badge de **"Agotado"** cuando `stock === 0`
- [x] Carrito persistente en `localStorage` sincronizado con backend
- [x] Actualización de cantidades y eliminación de ítems en tiempo real

### 💳 Pagos con Stripe
- [x] **Stripe Elements** integrado en dark mode
- [x] Creación de `PaymentIntent` desde el backend
- [x] **Webhook** de Stripe para confirmar o cancelar pedidos automáticamente
- [x] Historial de pedidos con estado actualizado

### 🛠️ Panel de Administración
- [x] Dashboard con **métricas en tiempo real** (ventas, pedidos, usuarios)
- [x] CRUD completo de **productos** (crear, editar, eliminar, gestionar stock)
- [x] CRUD completo de **categorías**
- [x] Gestión de **pedidos** con cambio de estado (pendiente → procesando → enviado → entregado)

### 🎨 UX / DX
- [x] **Skeleton loaders** en todas las vistas de carga
- [x] **Toast notifications** con `vue-toastification`
- [x] SSR completo con Nuxt 3
- [x] TypeScript estricto en frontend y backend

---

## 🔑 Credenciales de Prueba

### 👑 Administrador
```
Email:    admin@shopflow.com
Password: Admin123!
```

### 👤 Cliente
```
Email:    cliente@shopflow.com
Password: Cliente123!
```

---

## 💳 Pagos de Prueba con Stripe

Usa las siguientes tarjetas de prueba en el checkout (modo **test**):

| Escenario | Número de Tarjeta | CVC | Fecha |
|-----------|------------------|-----|-------|
| ✅ Pago exitoso | `4242 4242 4242 4242` | Cualquier 3 dígitos | Cualquier fecha futura |
| ❌ Pago rechazado | `4000 0000 0000 0002` | Cualquier 3 dígitos | Cualquier fecha futura |
| 🔐 Requiere autenticación | `4000 0025 0000 3155` | Cualquier 3 dígitos | Cualquier fecha futura |

> **Nota:** El campo ZIP puede ser cualquier valor de 5 dígitos (ej. `12345`).

---

## 📁 Estructura del Proyecto

```
ShopFlow/
├── api/                          # ⚙️ Vercel Serverless Functions (TypeScript)
│   ├── _lib/                     #    Utilidades compartidas (db, auth, stripe)
│   ├── auth/                     #    Registro y Login
│   │   ├── register.ts
│   │   └── login.ts
│   ├── products/                 #    CRUD de productos
│   ├── categories/               #    CRUD de categorías
│   ├── cart/                     #    Gestión del carrito
│   ├── orders/                   #    Historial y creación de pedidos
│   ├── admin/                    #    Rutas protegidas de administración
│   └── stripe/                   #    PaymentIntent y Webhook
│       ├── create-payment-intent.ts
│       └── webhook.ts
│
├── client/                       # 🎨 Nuxt 3 App (Vue 3 + TypeScript)
│   ├── assets/                   #    Estilos globales
│   ├── components/               #    Componentes reutilizables
│   │   ├── ProductCard.vue
│   │   ├── TheHeader.vue
│   │   └── ...
│   ├── composables/              #    Lógica reutilizable (useApi, useFilters...)
│   ├── layouts/                  #    Layouts (default, admin)
│   ├── pages/                    #    Rutas automáticas de Nuxt
│   │   ├── index.vue             #    Catálogo principal
│   │   ├── product/[id].vue      #    Vista de producto
│   │   ├── cart.vue
│   │   ├── checkout.vue
│   │   ├── orders.vue
│   │   └── admin/               #    Panel de administración
│   ├── stores/                   #    Pinia stores (auth, cart, products...)
│   ├── types/                    #    Interfaces y tipos TypeScript
│   ├── nuxt.config.ts
│   └── tailwind.config.ts
│
├── .env.example                  # 🔒 Variables de entorno de ejemplo
├── vercel.json                   # 🚀 Configuración de Vercel (monorepo)
└── package.json                  # 📦 Scripts raíz
```

---

## 🚀 Instalación Local

### Prerrequisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- Cuenta en [Neon](https://neon.tech/) (PostgreSQL serverless gratuito)
- Cuenta en [Stripe](https://stripe.com/) (modo test)
- [Vercel CLI](https://vercel.com/docs/cli) (para funciones serverless locales)

### 1. Clonar el repositorio

```bash
git clone https://github.com/EDIHV382/ShopFlow.git
cd ShopFlow
```

### 2. Instalar dependencias

```bash
npm run install:all
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/shopflow?sslmode=require

# Autenticación
JWT_SECRET=tu-secreto-jwt-super-seguro

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cliente (Nuxt)
NUXT_PUBLIC_API_BASE=http://localhost:3000
STRIPE_PUBLIC_KEY=pk_test_...
```

### 4. Inicializar la base de datos

```bash
# Crear tablas
npm run db:init

# Poblar con datos de prueba (categorías, productos, usuarios)
npm run db:seed
```

### 5. Iniciar el servidor de desarrollo

Necesitas **dos terminales** simultáneas:

```bash
# Terminal 1 — API (Vercel Dev)
cd api && npm run dev
# → http://localhost:3000

# Terminal 2 — Cliente (Nuxt)
cd client && npm run dev
# → http://localhost:3001
```

### 6. Configurar Webhook de Stripe (opcional, local)

```bash
# Instalar Stripe CLI y hacer forward al servidor local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## ☁️ Deploy en Vercel

### Opción A — Deploy automático desde GitHub

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new)
2. Vercel detectará automáticamente la configuración desde `vercel.json`
3. Agrega las variables de entorno en **Settings → Environment Variables**
4. Haz clic en **Deploy** ✅

### Opción B — Deploy manual con CLI

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Deploy a producción
npm run deploy
```

### Variables de entorno requeridas en Vercel

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión Neon PostgreSQL |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe (`whsec_...`) |
| `STRIPE_PUBLIC_KEY` | Clave pública de Stripe (`pk_live_...`) |
| `NUXT_PUBLIC_API_BASE` | URL base de la API en producción |

> **Webhook en producción:** Registra el endpoint `https://tu-dominio.vercel.app/api/stripe/webhook` en el dashboard de Stripe con el evento `payment_intent.succeeded` y `payment_intent.payment_failed`.

---

## 📜 Scripts Disponibles

### Raíz del proyecto

| Comando | Descripción |
|---------|-------------|
| `npm run install:all` | Instala dependencias en raíz, `/api` y `/client` |
| `npm run build` | Build de producción (`nuxt generate`) |
| `npm run deploy` | Deploy a Vercel (`vercel --prod`) |
| `npm run db:init` | Inicializa las tablas en la base de datos |
| `npm run db:seed` | Puebla la BD con datos de prueba |

### Cliente (`cd client`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo Nuxt |
| `npm run build` | Build de producción |
| `npm run generate` | Generación estática |
| `npm run typecheck` | Verificación de tipos TypeScript |

---

## 🤝 Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit de tus cambios: `git commit -m 'feat: agrega nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un **Pull Request**

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

Hecho con ❤️ por **[EDIHV382](https://github.com/EDIHV382)**

⭐ Si este proyecto te fue útil, ¡dale una estrella en GitHub!

</div>
