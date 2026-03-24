// POST /api/auth/login
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { queryOne } from '../_lib/db.js';
import { comparePassword, signToken } from '../_lib/auth.js';
import { setCorsHeaders, handleOptions } from '../_lib/middleware.js';
import { z } from 'zod';
import type { User } from '../_lib/types.js';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { email, password } = parsed.data;

  const user = await queryOne<User>(
    'SELECT id, name, email, password_hash, roles FROM users WHERE email = $1',
    [email]
  );

  if (!user) {
    // Timing-safe: still run bcrypt to prevent user enumeration
    await comparePassword(password, '$2b$12$invalid.hash.to.prevent.timing.attack');
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const passwordValid = await comparePassword(password, user.password_hash);
  if (!passwordValid) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const roles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles as any);
  const token = signToken({ userId: user.id, email: user.email, roles });

  return res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, roles },
  });
}
