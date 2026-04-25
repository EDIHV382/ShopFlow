import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { z } from 'zod';

// Import all route handlers
import productsIndex from './_routes/products/index';
import productsId from './_routes/products/[id]';
import categoriesIndex from './_routes/categories/index';
import categoriesId from './_routes/categories/[id]';
import authLogin from './_routes/auth/login';
import authRegister from './_routes/auth/register';
import authMe from './_routes/auth/me';
import authLogout from './_routes/auth/logout';
import cartIndex from './_routes/cart/index';
import cartItemsIndex from './_routes/cart/items/index';
import cartItemsId from './_routes/cart/items/[id]';
import ordersIndex from './_routes/orders/index';
import ordersId from './_routes/orders/[id]';
import adminDashboard from './_routes/admin/dashboard';
import adminUsers from './_routes/admin/users';
import adminOrdersIndex from './_routes/admin/orders/index';
import adminOrdersStatus from './_routes/admin/orders/[id]/status';
import adminSalesChart from './_routes/admin/sales-chart';
import stripeCreatePaymentIntent from './_routes/stripe/create-payment-intent';
import stripeWebhook from './_routes/stripe/webhook';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
const origin = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000';
app.use(
  cors({
    origin: origin,
    credentials: true,
  }),
);

// Request Logging
app.use(
  pinoHttp({
    logger,
    customProps: (_req, _res) => ({
      context: 'API-Request',
    }),
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  }),
);

// General Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter Rate Limiting for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

// Stripe webhook needs raw body, so we define it before express.json()
app.all('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook as any);

// Parse JSON bodies
app.use(express.json());

// Apply rate limits
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Adapt Vercel req/res to Express
function adapt(handler: any, idParamName: string = 'id') {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      if (req.params[idParamName]) {
        req.query[idParamName] = req.params[idParamName];
      }
      await handler(req, res);
    } catch (err) {
      next(err);
    }
  };
}

import {
  registerSchema,
  loginSchema,
  productSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  cartItemSchema,
  updateCartItemSchema,
} from './_lib/schemas';

// Validation Middleware Helper
function validateBody(schema: z.ZodType<any, any>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }
    req.body = parsed.data;
    next();
  };
}

// Routes Definition
app.get('/api/products', adapt(productsIndex));
app.post('/api/products', validateBody(productSchema), adapt(productsIndex));
app.get('/api/products/:id', adapt(productsId));
app.put('/api/products/:id', validateBody(productSchema), adapt(productsId));
app.delete('/api/products/:id', adapt(productsId));

app.get('/api/categories', adapt(categoriesIndex));
app.post('/api/categories', adapt(categoriesIndex));
app.put('/api/categories/:id', adapt(categoriesId));
app.delete('/api/categories/:id', adapt(categoriesId));

app.post('/api/auth/login', validateBody(loginSchema), adapt(authLogin));
app.post('/api/auth/register', validateBody(registerSchema), adapt(authRegister));
app.get('/api/auth/me', adapt(authMe));
app.post('/api/auth/logout', adapt(authLogout));

app.get('/api/cart', adapt(cartIndex));
app.delete('/api/cart', adapt(cartIndex));
app.post('/api/cart/items', validateBody(cartItemSchema), adapt(cartItemsIndex));
app.put('/api/cart/items/:id', validateBody(updateCartItemSchema), adapt(cartItemsId));
app.delete('/api/cart/items/:id', adapt(cartItemsId));

app.get('/api/orders', adapt(ordersIndex));
app.post('/api/orders', validateBody(createOrderSchema), adapt(ordersIndex));
app.get('/api/orders/:id', adapt(ordersId));

app.get('/api/admin/dashboard', adapt(adminDashboard));
app.get('/api/admin/users', adapt(adminUsers));
app.get('/api/admin/orders', adapt(adminOrdersIndex));
app.patch(
  '/api/admin/orders/:id/status',
  validateBody(updateOrderStatusSchema),
  adapt(adminOrdersStatus),
);
app.get('/api/admin/sales-chart', adapt(adminSalesChart));

app.post('/api/stripe/create-payment-intent', adapt(stripeCreatePaymentIntent));

// Catch 404
app.all(/^.*$/, (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Centralized Error Handler
app.use(
  (err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, 'Unhandled API Error');
    res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
  },
);

export default app;
