"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const middleware_1 = require("../_lib/middleware");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(8),
});
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    return res.status(403).json({ error: "🔒 Modo de Prueba: La creación de cuentas está deshabilitada. Usa las cuentas de prueba (cliente@shopflow.com o admin@shopflow.com)." });
}
