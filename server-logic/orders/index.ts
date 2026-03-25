// GET /api/orders — authenticated user's order history
// POST /api/orders — create new order
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_lib/db';
import { setCorsHeaders, handleOptions, requireAuth } from '../_lib/middleware';
import { z } from 'zod';
import type { Order, OrderItem, Cart } from '../_lib/types';

const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  phone: z.string().min(7),
});

const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  stripePaymentId: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  const payload = requireAuth(req, res);
  if (!payload) return;

  if (req.method === 'GET') {
    const orders = await query<Order>(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [payload.userId]
    );

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await query<OrderItem>(
          'SELECT * FROM order_items WHERE order_id = $1',
          [order.id]
        );
        return { ...order, items };
      })
    );

    return res.status(200).json(ordersWithItems);
  }

  if (req.method === 'POST') {
    return res.status(403).json({ error: '🔒 Modo de Prueba: La creación de pedidos está deshabilitada para evitar modificaciones en la base de datos.' });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
