// GET /api/admin/sales-chart?days=30 — daily sales aggregation for chart
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../_lib/db';
import { setCorsHeaders, handleOptions, requireAdmin } from '../../_lib/middleware';

interface SalesChartDay {
  date: string;
  total: number;
  orders: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (!requireAdmin(req, res)) return;

  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  const days = Math.min(parseInt(req.query.days as string || '30', 10), 90);

  const rows = await query<SalesChartDay>(
    `SELECT
       TO_CHAR(created_at::date, 'YYYY-MM-DD') as date,
       COALESCE(SUM(total), 0)::numeric as total,
       COUNT(*)::int as orders
     FROM orders
     WHERE
       created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
       AND status != 'cancelled'
     GROUP BY created_at::date
     ORDER BY created_at::date ASC`,
    [days - 1]
  );

  // Fill missing days with zero so the chart always has a full range
  const result: SalesChartDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const found = rows.find((r) => r.date === dateStr);
    result.push(found ? { ...found, total: parseFloat(found.total as unknown as string) } : { date: dateStr, total: 0, orders: 0 });
  }

  return res.status(200).json(result);
}
