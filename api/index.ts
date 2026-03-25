import express from 'express';
import cors from 'cors';

// Import all route handlers
import products from '../server-logic/products/index.js';
import productsId from '../server-logic/products/[id].js';
import categories from '../server-logic/categories/index.js';
import categoriesId from '../server-logic/categories/[id].js';
import authLogin from '../server-logic/auth/login.js';
import authRegister from '../server-logic/auth/register.js';
import authMe from '../server-logic/auth/me.js';
import authLogout from '../server-logic/auth/logout.js';
import cart from '../server-logic/cart/index.js';
import cartItems from '../server-logic/cart/items/index.js';
import cartItemsId from '../server-logic/cart/items/[id].js';
import orders from '../server-logic/orders/index.js';
import ordersId from '../server-logic/orders/[id].js';
import adminDash from '../server-logic/admin/dashboard.js';
import adminUsers from '../server-logic/admin/users.js';
import adminOrders from '../server-logic/admin/orders/index.js';
import adminOrdersStatus from '../server-logic/admin/orders/[id]/status.js';
import adminSalesChart from '../server-logic/admin/sales-chart.js';
import stripeIntent from '../server-logic/stripe/create-payment-intent.js';
import stripeWebhook from '../server-logic/stripe/webhook.js';

const app = express();
app.use(cors());

// Webhook specifically handles its own body
app.all('/api/stripe/webhook', stripeWebhook);

app.use(express.json());

// Express to Vercel req.query adapter
function adapt(handler: any, idParamName = 'id') {
  return async (req: any, res: any) => {
    if (req.params[idParamName]) {
      req.query[idParamName] = req.params[idParamName];
    }
    return handler(req, res);
  };
}

app.all('/api/products', adapt(products));
app.all('/api/products/:id', adapt(productsId));
app.all('/api/categories', adapt(categories));
app.all('/api/categories/:id', adapt(categoriesId));
app.all('/api/auth/login', adapt(authLogin));
app.all('/api/auth/register', adapt(authRegister));
app.all('/api/auth/me', adapt(authMe));
app.all('/api/auth/logout', adapt(authLogout));
app.all('/api/cart', adapt(cart));
app.all('/api/cart/items', adapt(cartItems));
app.all('/api/cart/items/:id', adapt(cartItemsId));
app.all('/api/orders', adapt(orders));
app.all('/api/orders/:id', adapt(ordersId));
app.all('/api/admin/dashboard', adapt(adminDash));
app.all('/api/admin/users', adapt(adminUsers));
app.all('/api/admin/orders', adapt(adminOrders));
app.all('/api/admin/orders/:id/status', adapt(adminOrdersStatus));
app.all('/api/admin/sales-chart', adapt(adminSalesChart));
app.all('/api/stripe/create-payment-intent', adapt(stripeIntent));

app.all('*', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

export default app;