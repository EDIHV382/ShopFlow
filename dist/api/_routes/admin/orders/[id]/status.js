"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../../../_lib/db");
const middleware_1 = require("../../../_lib/middleware");
const zod_1 = require("zod");
const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const admin = (0, middleware_1.requireAdmin)(req, res);
    if (!admin)
        return;
    if (req.method !== 'PATCH')
        return res.status(405).json({ error: 'Método no permitido' });
    const id = parseInt(String(req.query.id), 10);
    if (isNaN(id))
        return res.status(400).json({ error: 'ID inválido' });
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: `Estado inválido. Válidos: ${validStatuses.join(', ')}`
        });
    }
    const existing = await (0, db_1.queryOne)('SELECT * FROM orders WHERE id = $1', [id]);
    if (!existing)
        return res.status(404).json({ error: 'Pedido no encontrado' });
    const [updated] = await (0, db_1.query)('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [parsed.data.status, id]);
    return res.status(200).json(updated);
}
