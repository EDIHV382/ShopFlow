import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── CORS ────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3000',
  'https://shopflow.vercel.app', // cambia por tu dominio real en producción
].filter(Boolean);

export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin ?? '';

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true; // indica que se manejó el preflight, no continuar
  }

  return false;
}

// ─── SECURITY HEADERS (Helmet equivalente para Vercel) ───────────────────────

export function applySecurityHeaders(res: VercelResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; frame-src https://js.stripe.com; connect-src 'self' https://api.stripe.com"
  );
}

// ─── RATE LIMITING (en memoria, por IP, serverless-compatible) ───────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Map global en memoria (se resetea por cold start, suficiente para serverless)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * @param maxRequests - máximo de requests permitidos en la ventana
 * @param windowMs - ventana de tiempo en milisegundos
 */
export function checkRateLimit(req: VercelRequest, res: VercelResponse, maxRequests = 60, windowMs = 60_000): boolean {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.socket?.remoteAddress ?? 'unknown';

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return false; // no bloqueado
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', '0');
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return true; // bloqueado
  }

  res.setHeader('X-RateLimit-Limit', String(maxRequests));
  res.setHeader('X-RateLimit-Remaining', String(maxRequests - entry.count));
  return false; // no bloqueado
}

// ─── HELPER: aplica todo de una vez ──────────────────────────────────────────

/**
 * Aplica CORS + headers de seguridad + rate limiting.
 * Retorna true si la respuesta ya fue enviada (preflight o rate limit).
 */
export function applySecurityMiddleware(
  req: VercelRequest,
  res: VercelResponse,
  options: { maxRequests?: number; windowMs?: number } = {}
): boolean {
  applySecurityHeaders(res);

  const isPreflight = applyCors(req, res);
  if (isPreflight) return true;

  const isRateLimited = checkRateLimit(req, res, options.maxRequests, options.windowMs);
  if (isRateLimited) return true;

  return false;
}
