// POST /api/auth/register
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityMiddleware } from '../_lib/security.js';
import { RegisterSchema, validate } from '../_lib/schemas.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Rate limit en register: 5 intentos por minuto
  const blocked = applySecurityMiddleware(req, res, { maxRequests: 5, windowMs: 60_000 });
  if (blocked) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const validation = validate(RegisterSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  const { name, email, password } = validation.data;

  // Demo mode: registration disabled
  return res.status(403).json({
    error: 'Demo mode: Account creation is disabled. Use test accounts (cliente@shopflow.com or admin@shopflow.com).',
  });
}
