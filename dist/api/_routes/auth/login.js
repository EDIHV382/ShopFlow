"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../_lib/db");
const auth_1 = require("../_lib/auth");
const middleware_1 = require("../_lib/middleware");
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'Contraseña requerida'),
});
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
    }
    const { email, password } = parsed.data;
    const user = await (0, db_1.queryOne)('SELECT id, name, email, password_hash, roles FROM users WHERE email = $1', [email]);
    if (!user) {
        // Timing-safe: still run bcrypt to prevent user enumeration
        await (0, auth_1.comparePassword)(password, '$2b$12$invalid.hash.to.prevent.timing.attack');
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const passwordValid = await (0, auth_1.comparePassword)(password, user.password_hash);
    if (!passwordValid) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const roles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles);
    const token = (0, auth_1.signToken)({ userId: user.id, email: user.email, roles });
    return res.status(200).json({
        token,
        user: { id: user.id, name: user.name, email: user.email, roles },
    });
}
