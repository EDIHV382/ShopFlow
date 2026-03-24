// Request/response middleware helpers for Vercel serverless functions
// Handles auth extraction, CORS, and role checks

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, extractBearerToken } from './auth.js';
import type { JwtPayload } from './types.js';

/** Sets CORS headers — allows the Nuxt client to call the API */
export function setCorsHeaders(res: VercelResponse): void {
  const origin = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

/** Handles preflight OPTIONS requests */
export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

/** Requires valid JWT. Returns the decoded payload or sends 401 */
export function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): JwtPayload | null {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Token de autenticación requerido' });
    return null;
  }
  try {
    return verifyToken(token);
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
    return null;
  }
}

/** Requires ROLE_ADMIN. Returns payload or sends 403 */
export function requireAdmin(
  req: VercelRequest,
  res: VercelResponse
): JwtPayload | null {
  const payload = requireAuth(req, res);
  if (!payload) return null;
  if (!payload.roles.includes('ROLE_ADMIN')) {
    res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
    return null;
  }
  return payload;
}

/** Parses pagination query params */
export function getPagination(query: VercelRequest['query']): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '12'), 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
