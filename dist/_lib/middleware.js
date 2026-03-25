"use strict";
// Request/response middleware helpers for Vercel serverless functions
// Handles auth extraction, CORS, and role checks
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCorsHeaders = setCorsHeaders;
exports.handleOptions = handleOptions;
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
exports.getPagination = getPagination;
const auth_1 = require("./auth");
/** Sets CORS headers — allows the Nuxt client to call the API */
function setCorsHeaders(res) {
    const origin = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}
/** Handles preflight OPTIONS requests */
function handleOptions(req, res) {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return true;
    }
    return false;
}
/** Requires valid JWT. Returns the decoded payload or sends 401 */
function requireAuth(req, res) {
    const token = (0, auth_1.extractBearerToken)(req.headers.authorization);
    if (!token) {
        res.status(401).json({ error: 'Token de autenticación requerido' });
        return null;
    }
    try {
        return (0, auth_1.verifyToken)(token);
    }
    catch {
        res.status(401).json({ error: 'Token inválido o expirado' });
        return null;
    }
}
/** Requires ROLE_ADMIN. Returns payload or sends 403 */
function requireAdmin(req, res) {
    const payload = requireAuth(req, res);
    if (!payload)
        return null;
    if (!payload.roles.includes('ROLE_ADMIN')) {
        res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
        return null;
    }
    // DEMO MODE BLOCK
    if (req.method !== 'GET') {
        res.status(403).json({ error: '🔒 Modo de Prueba: Las modificaciones en la base de datos están deshabilitadas en esta demostración.' });
        return null;
    }
    return payload;
}
/** Parses pagination query params */
function getPagination(query) {
    const page = Math.max(1, parseInt(String(query.page || '1'), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '12'), 10)));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}
