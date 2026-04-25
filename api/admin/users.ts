// GET  /api/admin/users        — list all users (paginated)
// PATCH /api/admin/users        — NOT USED (id required)
// DELETE /api/admin/users       — NOT USED (id required)
// PATCH /api/admin/users?id=X  — toggle admin role
// DELETE /api/admin/users?id=X — delete user
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_lib/db';
import { setCorsHeaders, handleOptions, requireAdmin, getPagination } from '../_lib/middleware';
import { z } from 'zod';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  created_at: Date;
}

const patchSchema = z.object({
  roles: z.array(z.enum(['ROLE_USER', 'ROLE_ADMIN'])).min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) {
    return;
  }
  setCorsHeaders(res);

  const admin = requireAdmin(req, res);
  if (!admin) {
    return;
  }

  // GET /api/admin/users
  if (req.method === 'GET') {
    const { page, limit, offset } = getPagination(req.query);
    const search = req.query.search as string | undefined;

    const params: unknown[] = [];
    let where = '';
    if (search) {
      where = `WHERE name ILIKE $1 OR email ILIKE $1`;
      params.push(`%${search}%`);
    }

    const countParams = params.slice();
    const [countRow] = await query<{ count: string }>(
      `SELECT COUNT(*)::int as count FROM users ${where}`,
      countParams,
    );
    const total = parseInt(countRow?.count || '0', 10);

    params.push(limit, offset);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;

    const users = await query<AdminUser>(
      `SELECT id, name, email, roles, created_at
       FROM users
       ${where}
       ORDER BY created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    // Parse roles if stored as JSON string
    const normalized = users.map((u: AdminUser) => ({
      ...u,
      roles: Array.isArray(u.roles) ? u.roles : JSON.parse(u.roles as unknown as string),
    }));

    return res.status(200).json({
      data: normalized,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  }

  // PATCH /api/admin/users?id=X — update roles
  if (req.method === 'PATCH') {
    const id = parseInt(req.query.id as string, 10);
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' });
    }

    // Prevent admin from removing their own admin role
    if (id === admin.userId) {
      return res.status(400).json({ error: 'No puedes modificar tu propio rol' });
    }

    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const user = await queryOne<AdminUser>(
      'UPDATE users SET roles = $1 WHERE id = $2 RETURNING id, name, email, roles, created_at',
      [JSON.stringify(parsed.data.roles), id],
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      ...user,
      roles: Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles as unknown as string),
    });
  }

  // DELETE /api/admin/users?id=X
  if (req.method === 'DELETE') {
    const id = parseInt(req.query.id as string, 10);
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' });
    }

    if (id === admin.userId) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    await query('DELETE FROM users WHERE id = $1', [id]);
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
