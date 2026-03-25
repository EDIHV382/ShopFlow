"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../_lib/db");
const middleware_1 = require("../_lib/middleware");
const zod_1 = require("zod");
const patchSchema = zod_1.z.object({
    roles: zod_1.z.array(zod_1.z.enum(['ROLE_USER', 'ROLE_ADMIN'])).min(1),
});
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const admin = (0, middleware_1.requireAdmin)(req, res);
    if (!admin)
        return;
    // GET /api/admin/users
    if (req.method === 'GET') {
        const { page, limit, offset } = (0, middleware_1.getPagination)(req.query);
        const search = req.query.search;
        const params = [];
        let where = '';
        if (search) {
            where = `WHERE name ILIKE $1 OR email ILIKE $1`;
            params.push(`%${search}%`);
        }
        const countParams = params.slice();
        const [countRow] = await (0, db_1.query)(`SELECT COUNT(*)::int as count FROM users ${where}`, countParams);
        const total = parseInt(countRow?.count || '0', 10);
        params.push(limit, offset);
        const limitIdx = params.length - 1;
        const offsetIdx = params.length;
        const users = await (0, db_1.query)(`SELECT id, name, email, roles, created_at
       FROM users
       ${where}
       ORDER BY created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`, params);
        // Parse roles if stored as JSON string
        const normalized = users.map((u) => ({
            ...u,
            roles: Array.isArray(u.roles) ? u.roles : JSON.parse(u.roles),
        }));
        return res.status(200).json({
            data: normalized,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }
    // PATCH /api/admin/users?id=X — update roles
    if (req.method === 'PATCH') {
        const id = parseInt(req.query.id, 10);
        if (!id)
            return res.status(400).json({ error: 'ID requerido' });
        // Prevent admin from removing their own admin role
        if (id === admin.userId) {
            return res.status(400).json({ error: 'No puedes modificar tu propio rol' });
        }
        const parsed = patchSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.errors[0].message });
        const user = await (0, db_1.queryOne)('UPDATE users SET roles = $1 WHERE id = $2 RETURNING id, name, email, roles, created_at', [JSON.stringify(parsed.data.roles), id]);
        if (!user)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        return res.status(200).json({
            ...user,
            roles: Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles),
        });
    }
    // DELETE /api/admin/users?id=X
    if (req.method === 'DELETE') {
        const id = parseInt(req.query.id, 10);
        if (!id)
            return res.status(400).json({ error: 'ID requerido' });
        if (id === admin.userId) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
        }
        await (0, db_1.query)('DELETE FROM users WHERE id = $1', [id]);
        return res.status(204).end();
    }
    return res.status(405).json({ error: 'Método no permitido' });
}
