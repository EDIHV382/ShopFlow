// POST /api/auth/register
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_lib/db.js';
import { hashPassword, validatePassword } from '../_lib/auth.js';
import { signToken } from '../_lib/auth.js';
import { setCorsHeaders, handleOptions } from '../_lib/middleware.js';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(8),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { name, email, password } = parsed.data;

  // Validate password strength
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  // Check email uniqueness
  const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
  if (existing) {
    return res.status(409).json({ error: 'Este email ya está registrado' });
  }

  const passwordHash = await hashPassword(password);
  const roles = ['ROLE_USER'];

  const [user] = await query<{ id: number; name: string; email: string; roles: string[] }>(
    `INSERT INTO users (name, email, password_hash, roles)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, roles`,
    [name, email, passwordHash, JSON.stringify(roles)]
  );

  const token = signToken({ userId: user.id, email: user.email, roles: user.roles as any });

  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, roles: user.roles },
  });
}
