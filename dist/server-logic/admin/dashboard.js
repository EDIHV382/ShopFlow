"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../_lib/db");
const middleware_1 = require("../_lib/middleware");
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const admin = (0, middleware_1.requireAdmin)(req, res);
    if (!admin)
        return;
    if (req.method !== 'GET')
        return res.status(405).json({ error: 'Método no permitido' });
    const [todaySales] = await (0, db_1.query)(`SELECT COALESCE(SUM(total), 0)::numeric as total, COUNT(*)::int as count
     FROM orders
     WHERE created_at >= CURRENT_DATE AND status != 'cancelled'`);
    const [pendingOrders] = await (0, db_1.query)(`SELECT COUNT(*)::int as count FROM orders WHERE status = 'pending'`);
    const [processingOrders] = await (0, db_1.query)(`SELECT COUNT(*)::int as count FROM orders WHERE status = 'processing'`);
    const lowStockProducts = await (0, db_1.query)(`SELECT id, name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 10`);
    const [totalProducts] = await (0, db_1.query)(`SELECT COUNT(*)::int as count FROM products`);
    const [totalUsers] = await (0, db_1.query)(`SELECT COUNT(*)::int as count FROM users`);
    const recentOrders = await (0, db_1.query)(`SELECT o.id, o.status, o.total, o.created_at, u.name as user_name
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC
     LIMIT 5`);
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
