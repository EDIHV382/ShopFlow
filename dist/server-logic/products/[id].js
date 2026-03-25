"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../_lib/db");
const middleware_1 = require("../_lib/middleware");
const zod_1 = require("zod");
const updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive().optional(),
    stock: zod_1.z.number().int().min(0).optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    category_id: zod_1.z.number().int().positive().nullable().optional(),
});
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const id = parseInt(String(req.query.id), 10);
    if (isNaN(id))
        return res.status(400).json({ error: 'ID inválido' });
    if (req.method === 'GET') {
        const product = await (0, db_1.queryOne)(`SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`, [id]);
        if (!product)
            return res.status(404).json({ error: 'Producto no encontrado' });
        return res.status(200).json(product);
    }
    if (req.method === 'PUT') {
        const admin = (0, middleware_1.requireAdmin)(req, res);
        if (!admin)
            return;
        const parsed = updateProductSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }
        const existing = await (0, db_1.queryOne)('SELECT * FROM products WHERE id = $1', [id]);
        if (!existing)
            return res.status(404).json({ error: 'Producto no encontrado' });
        const updates = parsed.data;
        const fields = [];
        const values = [];
        let idx = 1;
        if (updates.name !== undefined) {
            fields.push(`name = $${idx++}`);
            values.push(updates.name);
        }
        if (updates.description !== undefined) {
            fields.push(`description = $${idx++}`);
            values.push(updates.description);
        }
        if (updates.price !== undefined) {
            fields.push(`price = $${idx++}`);
            values.push(updates.price);
        }
        if (updates.stock !== undefined) {
            fields.push(`stock = $${idx++}`);
            values.push(updates.stock);
        }
        if (updates.images !== undefined) {
            fields.push(`images = $${idx++}`);
            values.push(JSON.stringify(updates.images));
        }
        if (updates.category_id !== undefined) {
            fields.push(`category_id = $${idx++}`);
            values.push(updates.category_id);
        }
        if (fields.length === 0)
            return res.status(400).json({ error: 'No hay campos para actualizar' });
        values.push(id);
        const [updated] = await (0, db_1.query)(`UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
        return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
        const admin = (0, middleware_1.requireAdmin)(req, res);
        if (!admin)
            return;
        const existing = await (0, db_1.queryOne)('SELECT id FROM products WHERE id = $1', [id]);
        if (!existing)
            return res.status(404).json({ error: 'Producto no encontrado' });
        await (0, db_1.query)('DELETE FROM products WHERE id = $1', [id]);
        return res.status(204).end();
    }
    return res.status(405).json({ error: 'Método no permitido' });
}
