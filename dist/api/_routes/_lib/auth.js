"use strict";
// JWT + password helpers for authentication
// Stateless JWT — no refresh tokens needed for this app
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.extractBearerToken = extractBearerToken;
exports.validatePassword = validatePassword;
exports.isAdmin = isAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 12);
}
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
/** Extracts the Bearer token from an Authorization header */
function extractBearerToken(authHeader) {
    if (!authHeader?.startsWith('Bearer '))
        return null;
    return authHeader.slice(7);
}
/** Validates password strength */
function validatePassword(password) {
    if (password.length < 8)
        return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(password))
        return 'La contraseña debe tener al menos una mayúscula';
    if (!/[0-9]/.test(password))
        return 'La contraseña debe tener al menos un número';
    return null;
}
/** Checks if roles array includes ROLE_ADMIN */
function isAdmin(roles) {
    return roles.includes('ROLE_ADMIN');
}
