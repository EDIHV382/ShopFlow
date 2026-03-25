"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../_lib/db");
const middleware_1 = require("../_lib/middleware");
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const payload = (0, middleware_1.requireAuth)(req, res);
    if (!payload)
        return;
    const user = await (0, db_1.queryOne)('SELECT id, name, email, roles FROM users WHERE id = $1', [payload.userId]);
    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const roles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles);
    return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        roles,
    });
}
