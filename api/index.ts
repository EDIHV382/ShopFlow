import express from 'express';
import cors from 'cors';

// Import all route handlers
import products from './_routes/products/index.js';
import productsId from './_routes/products/[id].js';
import categories from './_routes/categories/index.js';
import categoriesId from './_routes/categories/[id].js';
import authLogin from './_routes/auth/login.js';
import authRegister from './_routes/auth/register.js';
import authMe from './_routes/auth/me.js';
import authLogout from './_routes/auth/logout.js';
import cart from './_routes/cart/index.js';
import cartItems from './_routes/cart/items/index.js';
import cartItemsId from './_routes/cart/items/[id].js';
import orders from './_routes/orders/index.js';
import ordersId from './_routes/orders/[id].js';
import adminDash from './_routes/admin/dashboard.js';
import adminUsers from './_routes/admin/users.js';
import adminOrders from './_routes/admin/orders/index.js';
import adminOrdersStatus from './_routes/admin/orders/[id]/status.js';
import adminSalesChart from './_routes/admin/sales-chart.js';
import stripeIntent from './_routes/stripe/create-payment-intent.js';
import stripeWebhook from './_routes/stripe/webhook.js';

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