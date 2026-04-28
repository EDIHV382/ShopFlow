// Request/response middleware helpers for Vercel serverless functions
// Handles auth extraction, CORS, helmet, rate limiting, logging, and role checks

import type { VercelRequest, VercelResponse } from '@vercel/node';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { verifyToken, extractBearerToken } from './auth';
import type { JwtPayload } from './types';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

// Pino HTTP logger
const logMiddleware = pinoHttp({
  logger,
  customProps: () => ({ context: 'API-Request' }),
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});

// CORS configuration
const origin = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000';
export function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// Apply security headers with helmet
export function applySecurityHeaders(res: VercelResponse): void {
  const helmetMiddleware = helmet();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  helmetMiddleware({} as any, res as any, () => {});
}

// Rate limiters
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

// Apply rate limit to request
export function applyRateLimiter(
  req: VercelRequest,
  res: VercelResponse,
  limiter: ReturnType<typeof rateLimit>,
): void {
  let key = 'anonymous';
  if (req.headers['x-forwarded-for']) {
    key = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  limiter((options) => {
    options.key = key as string;
    options.skip = () => false;
    options.request = () => 1;
  })(req as any, res as any, () => {});
}

// Logging middleware
export function applyLogging(req: VercelRequest, res: VercelResponse): void {
  logMiddleware(req as any, res as any, () => {});
}

/** Handles preflight OPTIONS requests */
export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(204).end();
    return true;
  }
  return false;
}

// Apply all middleware at once
export function applyMiddleware(
  req: VercelRequest,
  res: VercelResponse,
  isAuthRoute = false,
): void {
  applySecurityHeaders(res);
  setCorsHeaders(res);
  applyLogging(req, res);

  const limiter = isAuthRoute ? authLimiter : generalLimiter;
  applyRateLimiter(req, res, limiter);
}

/** Requires valid JWT. Returns the decoded payload or sends 401 */
export function requireAuth(req: VercelRequest, res: VercelResponse): JwtPayload | null {
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
export function requireAdmin(req: VercelRequest, res: VercelResponse): JwtPayload | null {
  const payload = requireAuth(req, res);
  if (!payload) {
    return null;
  }
  if (!payload.roles.includes('ROLE_ADMIN')) {
    res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
    return null;
  }

  // DEMO MODE BLOCK
  if (req.method !== 'GET') {
    res.status(403).json({
      error:
        '🔒 Modo de Prueba: Las modificaciones en la base de datos están deshabilitadas en esta demostración.',
    });
    return null;
  }

  return payload;
}
