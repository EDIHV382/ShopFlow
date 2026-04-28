// PUT /api/categories/:id — update (ROLE_ADMIN)
// DELETE /api/categories/:id — delete (ROLE_ADMIN)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_lib/db';
import { setCorsHeaders, handleOptions, requireAdmin } from '../_lib/middleware';
import { z } from 'zod';
import type { Category } from '../_lib/types';

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
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

  const id = parseInt(String(req.query.id), 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const existing = await queryOne<Category>('SELECT * FROM categories WHERE id = $1', [id]);
  if (!existing) {
    return res.status(404).json({ error: 'Categoría no encontrada' });
  }

  if (req.method === 'PUT') {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { name, slug } = parsed.data;
    const [updated] = await query<Category>(
      `UPDATE categories SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug)
       WHERE id = $3 RETURNING *`,
      [name ?? null, slug ?? null, id],
    );
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    await query('DELETE FROM categories WHERE id = $1', [id]);
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
