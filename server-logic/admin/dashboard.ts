// GET /api/admin/dashboard — metrics for admin dashboard
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { queryOne, query } from '../../_lib/db';
import { setCorsHeaders, handleOptions, requireAdmin } from '../../_lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  const [todaySales] = await query<{ total: string; count: string }>(
    `SELECT COALESCE(SUM(total), 0)::numeric as total, COUNT(*)::int as count
     FROM orders
     WHERE created_at >= CURRENT_DATE AND status != 'cancelled'`
  );

  const [pendingOrders] = await query<{ count: string }>(
    `SELECT COUNT(*)::int as count FROM orders WHERE status = 'pending'`
  );

  const [processingOrders] = await query<{ count: string }>(
    `SELECT COUNT(*)::int as count FROM orders WHERE status = 'processing'`
  );

  const lowStockProducts = await query<{ id: number; name: string; stock: number }>(
    `SELECT id, name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 10`
  );

  const [totalProducts] = await query<{ count: string }>(
    `SELECT COUNT(*)::int as count FROM products`
  );

  const [totalUsers] = await query<{ count: string }>(
    `SELECT COUNT(*)::int as count FROM users`
  );

  const recentOrders = await query<{
    id: number; status: string; total: number; created_at: Date; user_name: string;
  }>(
    `SELECT o.id, o.status, o.total, o.created_at, u.name as user_name
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC
     LIMIT 5`
  );

  return res.status(200).json({
    todaySales: {
      total: parseFloat(todaySales?.total || '0'),
      count: parseInt(todaySales?.count || '0', 10),
    },
    pendingOrders: parseInt(pendingOrders?.[0]?.count || '0', 10),
    processingOrders: parseInt(processingOrders?.[0]?.count || '0', 10),
    lowStockProducts,
    totalProducts: parseInt(totalProducts?.[0]?.count || '0', 10),
    totalUsers: parseInt(totalUsers?.[0]?.count || '0', 10),
    recentOrders,
  });
}
