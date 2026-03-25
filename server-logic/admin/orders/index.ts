// GET /api/admin/orders — all orders (ROLE_ADMIN)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../_lib/db';
import { setCorsHeaders, handleOptions, requireAdmin, getPagination } from '../../_lib/middleware';
import type { Order } from '../../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  const { page, limit, offset } = getPagination(req.query);
  const { status } = req.query;

  let whereClause = '';
  const params: unknown[] = [];
  if (status) {
    whereClause = 'WHERE o.status = $1';
    params.push(status);
  }

  const totalResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM orders o ${whereClause}`, params
  );
  const total = parseInt(totalResult[0]?.count || '0', 10);

  params.push(limit, offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;

  const orders = await query<Order & { user_name: string; user_email: string }>(
    `SELECT o.*, u.name as user_name, u.email as user_email
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     ${whereClause}
     ORDER BY o.created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );

  return res.status(200).json({
    data: orders,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
