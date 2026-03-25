"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const middleware_1 = require("../_lib/middleware");
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    // Client should delete the JWT from storage
    return res.status(200).json({ message: 'Sesión cerrada correctamente' });
}
