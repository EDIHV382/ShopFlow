// POST /api/auth/login
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { queryOne } from '../_lib/db';
import { comparePassword, signToken } from '../_lib/auth';
import { applySecurityMiddleware } from '../_lib/security.js';
import { LoginSchema, validate } from '../_lib/schemas.js';
import type { User } from '../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Rate limit más estricto en login: 10 intentos por minuto
  const blocked = applySecurityMiddleware(req, res, { maxRequests: 10, windowMs: 60_000 });
  if (blocked) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const validation = validate(LoginSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  const { email, password } = validation.data;

  const user = await queryOne<User>('SELECT id, name, email, password_hash, roles FROM users WHERE email = $1', [
    email,
  ]);

  if (!user) {
    // Timing-safe: still run bcrypt to prevent user enumeration
    await comparePassword(password, '$2b$12$invalid.hash.to.prevent.timing.attack');
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const passwordValid = await comparePassword(password, user.password_hash);
  if (!passwordValid) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const roles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles as string);
  const token = signToken({ userId: user.id, email: user.email, roles });

  // Set HttpOnly cookie for security
  res.setHeader('Set-Cookie', [
    `shopflow_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 3600}`,
  ]);

  return res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email, roles },
  });
}
