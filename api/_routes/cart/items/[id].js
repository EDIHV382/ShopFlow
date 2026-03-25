"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../../_lib/db");
const middleware_1 = require("../../_lib/middleware");
const zod_1 = require("zod");
const updateSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1).max(99),
});
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const payload = (0, middleware_1.requireAuth)(req, res);
    if (!payload)
        return;
    const itemId = parseInt(String(req.query.id), 10);
    if (isNaN(itemId))
        return res.status(400).json({ error: 'ID inválido' });
    // Validate that the cart item belongs to the authenticated user
    const item = await (0, db_1.queryOne)(`SELECT ci.*, ca.user_id
     FROM cart_items ci
     JOIN carts ca ON ci.cart_id = ca.id
     WHERE ci.id = $1`, [itemId]);
    if (!item)
        return res.status(404).json({ error: 'Item no encontrado' });
    if (item.user_id !== payload.userId)
        return res.status(403).json({ error: 'No autorizado' });
    if (req.method === 'PUT') {
        const parsed = updateSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.errors[0].message });
        // Check stock
        const product = await (0, db_1.queryOne)('SELECT stock FROM products WHERE id = $1', [item.product_id]);
        if (product && product.stock < parsed.data.quantity) {
            return res.status(400).json({ error: `Stock insuficiente (disponible: ${product.stock})` });
        }
        const [updated] = await (0, db_1.query)('UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *', [parsed.data.quantity, itemId]);
        return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
        await (0, db_1.query)('DELETE FROM cart_items WHERE id = $1', [itemId]);
        return res.status(204).end();
    }
    return res.status(405).json({ error: 'Método no permitido' });
}
