// GET /api/categories — public
// POST /api/categories — create (ROLE_ADMIN)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db';
import { applyMiddleware, handleOptions, requireAdmin } from '../_lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) {
    return;
  }
  applyMiddleware(req, res);

  if (req.method === 'GET') {
    const categories = await query<Category & { product_count: number }>(
      `SELECT c.*, COUNT(p.id)::int as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name ASC`,
    );
    return res.status(200).json(categories);
  }

  if (req.method === 'POST') {
    const admin = requireAdmin(req, res);
    if (!admin) {
      return;
    }

    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const [cat] = await query<Category>(
      'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *',
      [parsed.data.name, parsed.data.slug],
    );
    return res.status(201).json(cat);
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
