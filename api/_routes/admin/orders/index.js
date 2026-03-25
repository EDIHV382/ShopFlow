"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../../_lib/db");
const middleware_1 = require("../../_lib/middleware");
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const admin = (0, middleware_1.requireAdmin)(req, res);
    if (!admin)
        return;
    if (req.method !== 'GET')
        return res.status(405).json({ error: 'Método no permitido' });
    const { page, limit, offset } = (0, middleware_1.getPagination)(req.query);
    const { status } = req.query;
    let whereClause = '';
    const params = [];
    if (status) {
        whereClause = 'WHERE o.status = $1';
        params.push(status);
    }
    const totalResult = await (0, db_1.query)(`SELECT COUNT(*) as count FROM orders o ${whereClause}`, params);
    const total = parseInt(totalResult[0]?.count || '0', 10);
    params.push(limit, offset);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;
    const orders = await (0, db_1.query)(`SELECT o.*, u.name as user_name, u.email as user_email
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     ${whereClause}
     ORDER BY o.created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`, params);
    return res.status(200).json({
        data: orders,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
}
