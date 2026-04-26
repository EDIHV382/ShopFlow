import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { z } from 'zod';

// Import all route handlers
import productsIndex from './products/index';
import productsId from './products/[id]';
import categoriesIndex from './categories/index';
import categoriesId from './categories/[id]';
import authLogin from './auth/login';
import authRegister from './auth/register';
import authMe from './auth/me';
import authLogout from './auth/logout';
import cartIndex from './cart/index';
import cartItemsIndex from './cart/items/index';
import cartItemsId from './cart/items/[id]';
import ordersIndex from './orders/index';
import ordersId from './orders/[id]';
import adminDashboard from './admin/dashboard';
import adminUsers from './admin/users';
import adminOrdersIndex from './admin/orders/index';
import adminOrdersStatus from './admin/orders/[id]/status';
import adminSalesChart from './admin/sales-chart';
import stripeCreatePaymentIntent from './stripe/create-payment-intent';
import stripeWebhook from './stripe/webhook';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.all('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook as any);

// Parse JSON bodies
app.use(express.json());

// Apply rate limits
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Adapt Vercel req/res to Express
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
app.all(/^.*$/, (req: express.Request, res: express.Response) =>
  res.status(404).json({ error: 'Ruta no encontrada' }),
);

// Centralized Error Handler
app.use(
  (err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, 'Unhandled API Error');
    res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
  },
);

export default app;
