"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../_lib/db");
const middleware_1 = require("../_lib/middleware");
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const payload = (0, middleware_1.requireAuth)(req, res);
    if (!payload)
        return;
    if (req.method !== 'GET')
        return res.status(405).json({ error: 'Método no permitido' });
    const id = parseInt(String(req.query.id), 10);
    if (isNaN(id))
        return res.status(400).json({ error: 'ID inválido' });
    const order = await (0, db_1.queryOne)('SELECT * FROM orders WHERE id = $1', [id]);
    if (!order)
        return res.status(404).json({ error: 'Pedido no encontrado' });
    // Admin can see any order, users can only see their own
    const isAdmin = payload.roles.includes('ROLE_ADMIN');
    if (!isAdmin && order.user_id !== payload.userId) {
        return res.status(403).json({ error: 'No autorizado' });
    }
    const items = await (0, db_1.query)('SELECT * FROM order_items WHERE order_id = $1', [id]);
    return res.status(200).json({ ...order, items });
}
