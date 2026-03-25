import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors())
app.use(express.json())

// Import all API routes
const routes = {
  'GET /api/products': (await import('./products/index.js')).default,
  'GET /api/products/:id': (await import('./products/[id].js')).default,
  'GET /api/categories': (await import('./categories/index.js')).default,
  'GET /api/categories/:id': (await import('./categories/[id].js')).default,
  'POST /api/auth/login': (await import('./auth/login.js')).default,
  'POST /api/auth/register': (await import('./auth/register.js')).default,
  'GET /api/auth/me': (await import('./auth/me.js')).default,
  'POST /api/auth/logout': (await import('./auth/logout.js')).default,
  'GET /api/cart': (await import('./cart/index.js')).default,
  'POST /api/cart/items': (await import('./cart/items/index.js')).default,
  'DELETE /api/cart/items/:id': (await import('./cart/items/[id].js')).default,
  'GET /api/orders': (await import('./orders/index.js')).default,
  'GET /api/orders/:id': (await import('./orders/[id].js')).default,
  'GET /api/admin/dashboard': (await import('./admin/dashboard.js')).default,
  'GET /api/admin/users': (await import('./admin/users.js')).default,
  'GET /api/admin/orders': (await import('./admin/orders/index.js')).default,
  'PUT /api/admin/orders/:id/status': (await import('./admin/orders/[id]/status.js')).default,
}

// Simple router
app.use('/api/products', (req, res) => {
  const handler = routes['GET /api/products']
  if (handler) handler(req, res)
})

app.use('/api/products/:id', (req, res) => {
  const handler = routes['GET /api/products/:id']
  if (handler) handler(req, res)
})

app.use('/api/categories', (req, res) => {
  const handler = routes['GET /api/categories']
  if (handler) handler(req, res)
})

app.use('/api/auth/login', (req, res) => {
  const handler = routes['POST /api/auth/login']
  if (handler) handler(req, res)
})

app.use('/api/auth/register', (req, res) => {
  const handler = routes['POST /api/auth/register']
  if (handler) handler(req, res)
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`✅ API Server running on http://localhost:${PORT}`)
  console.log(`📦 Products endpoint: http://localhost:${PORT}/api/products`)
})
