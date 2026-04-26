// PATCH /api/admin/orders/:id/status — update order status (ROLE_ADMIN)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../../../_lib/db';
import { applyMiddleware, handleOptions, requireAdmin } from '../../../_lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) {
    return;
  }
  applyMiddleware(req, res);

  const admin = requireAdmin(req, res);
  if (!admin) {
    return;
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const id = parseInt(String(req.query.id), 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: `Estado inválido. Válidos: ${validStatuses.join(', ')}`,
    });
  }

  const existing = await queryOne<Order>('SELECT * FROM orders WHERE id = $1', [id]);
  if (!existing) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  const [updated] = await query<Order>('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [
    parsed.data.status,
    id,
  ]);

  return res.status(200).json(updated);
}
