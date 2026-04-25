// GET /api/auth/me — returns current authenticated user
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { queryOne } from '../_lib/db';
import { requireAuth, setCorsHeaders, handleOptions } from '../_lib/middleware';
import type { User } from '../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) {
    return;
  }
  setCorsHeaders(res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const payload = requireAuth(req, res);
  if (!payload) {
    return;
  }

  const user = await queryOne<Pick<User, 'id' | 'name' | 'email' | 'roles'>>(
    'SELECT id, name, email, roles FROM users WHERE id = $1',
    [payload.userId],
  );

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const roles = Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles as any);

  return res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    roles,
  });
}
