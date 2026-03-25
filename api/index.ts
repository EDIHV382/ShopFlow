import express from 'express';
import cors from 'cors';

// Import all route handlers
import products from '../server-logic/products/index';
import productsId from '../server-logic/products/[id]';
import categories from '../server-logic/categories/index';
import categoriesId from '../server-logic/categories/[id]';
import authLogin from '../server-logic/auth/login';
import authRegister from '../server-logic/auth/register';
import authMe from '../server-logic/auth/me';
import authLogout from '../server-logic/auth/logout';
import cart from '../server-logic/cart/index';
import cartItems from '../server-logic/cart/items/index';
import cartItemsId from '../server-logic/cart/items/[id]';
import orders from '../server-logic/orders/index';
import ordersId from '../server-logic/orders/[id]';
import adminDash from '../server-logic/admin/dashboard';
import adminUsers from '../server-logic/admin/users';
import adminOrders from '../server-logic/admin/orders/index';
import adminOrdersStatus from '../server-logic/admin/orders/[id]/status';
import adminSalesChart from '../server-logic/admin/sales-chart';
import stripeIntent from '../server-logic/stripe/create-payment-intent';
import stripeWebhook from '../server-logic/stripe/webhook';

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

app.all('*', (req: any, res: any) => res.status(404).json({ error: 'Ruta no encontrada' }));

export default app;