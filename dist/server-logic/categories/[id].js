"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../_lib/db");
const middleware_1 = require("../_lib/middleware");
const zod_1 = require("zod");
const updateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    slug: zod_1.z.string().regex(/^[a-z0-9-]+$/).optional(),
});
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const admin = (0, middleware_1.requireAdmin)(req, res);
    if (!admin)
        return;
    const id = parseInt(String(req.query.id), 10);
    if (isNaN(id))
        return res.status(400).json({ error: 'ID inválido' });
    const existing = await (0, db_1.queryOne)('SELECT * FROM categories WHERE id = $1', [id]);
    if (!existing)
        return res.status(404).json({ error: 'Categoría no encontrada' });
    if (req.method === 'PUT') {
        const parsed = updateSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.errors[0].message });
        const { name, slug } = parsed.data;
        const [updated] = await (0, db_1.query)(`UPDATE categories SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug)
       WHERE id = $3 RETURNING *`, [name ?? null, slug ?? null, id]);
        return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
        await (0, db_1.query)('DELETE FROM categories WHERE id = $1', [id]);
        return res.status(204).end();
    }
    return res.status(405).json({ error: 'Método no permitido' });
}
