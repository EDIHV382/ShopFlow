// GET /api/orders/:id — get single order (must belong to user)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../../../_lib/db';
import { setCorsHeaders, handleOptions, requireAuth } from '../../../_lib/middleware';
import type { Order, OrderItem } from '../../../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) {
    return;
  }
  setCorsHeaders(res);

  const payload = requireAuth(req, res);
  if (!payload) {
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const id = parseInt(String(req.query.id), 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // DEMO MOCK: Simulate success for fake order
  if (id === 999999) {
    return res.status(200).json({
      id: 999999,
      user_id: payload.userId,
      status: 'processing',
      total: '0.00',
      shipping_address: { fullName: 'Usuario Demo', address: 'Compra simulada con éxito' },
      stripe_payment_id: 'demo_payment',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [
        {
          id: 99999,
          order_id: 999999,
          product_id: 1,
          product_name: 'Producto Demo - Pago Simulado (Sin Cobro Real)',
          quantity: 1,
          unit_price: '0.00',
          product_images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'],
        },
      ],
    });
  }

  const order = await queryOne<Order>('SELECT * FROM orders WHERE id = $1', [id]);
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  // Admin can see any order, users can only see their own
  const isAdmin = payload.roles.includes('ROLE_ADMIN');
  if (!isAdmin && order.user_id !== payload.userId) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const items = await query<OrderItem>('SELECT * FROM order_items WHERE order_id = $1', [id]);

  return res.status(200).json({ ...order, items });
}
