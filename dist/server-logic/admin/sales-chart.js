"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../_lib/db");
const middleware_1 = require("../_lib/middleware");
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    if (!(0, middleware_1.requireAdmin)(req, res))
        return;
    if (req.method !== 'GET')
        return res.status(405).json({ error: 'Método no permitido' });
    const days = Math.min(parseInt(req.query.days || '30', 10), 90);
    const rows = await (0, db_1.query)(`SELECT
       TO_CHAR(created_at::date, 'YYYY-MM-DD') as date,
       COALESCE(SUM(total), 0)::numeric as total,
       COUNT(*)::int as orders
     FROM orders
     WHERE
       created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
       AND status != 'cancelled'
     GROUP BY created_at::date
     ORDER BY created_at::date ASC`, [days - 1]);
    // Fill missing days with zero so the chart always has a full range
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const found = rows.find((r) => r.date === dateStr);
        result.push(found ? { ...found, total: parseFloat(found.total) } : { date: dateStr, total: 0, orders: 0 });
    }
    return res.status(200).json(result);
}
