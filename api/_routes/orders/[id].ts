// GET /api/orders/:id — get single order (must belong to user)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_lib/db.js';
import { setCorsHeaders, handleOptions, requireAuth } from '../_lib/middleware.js';
import type { Order, OrderItem } from '../_lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  const payload = requireAuth(req, res);
  if (!payload) return;

  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  const id = parseInt(String(req.query.id), 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const order = await queryOne<Order>('SELECT * FROM orders WHERE id = $1', [id]);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  // Admin can see any order, users can only see their own
  const isAdmin = payload.roles.includes('ROLE_ADMIN');
  if (!isAdmin && order.user_id !== payload.userId) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const items = await query<OrderItem>('SELECT * FROM order_items WHERE order_id = $1', [id]);

  return res.status(200).json({ ...order, items });
}
