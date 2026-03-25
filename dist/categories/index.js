"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../_lib/db");
const middleware_1 = require("../_lib/middleware");
const zod_1 = require("zod");
const createSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    slug: zod_1.z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones'),
});
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    if (req.method === 'GET') {
        const categories = await (0, db_1.query)(`SELECT c.*, COUNT(p.id)::int as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name ASC`);
        return res.status(200).json(categories);
    }
    if (req.method === 'POST') {
        const admin = (0, middleware_1.requireAdmin)(req, res);
        if (!admin)
            return;
        const parsed = createSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.errors[0].message });
        const [cat] = await (0, db_1.query)('INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *', [parsed.data.name, parsed.data.slug]);
        return res.status(201).json(cat);
    }
    return res.status(405).json({ error: 'Método no permitido' });
}
