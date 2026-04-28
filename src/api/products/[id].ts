// GET /api/products/:id — public product detail
// PUT /api/products/:id — update product (ROLE_ADMIN)
// DELETE /api/products/:id — delete product (ROLE_ADMIN)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_lib/db';
import { setCorsHeaders, handleOptions, requireAdmin } from '../_lib/middleware';
import { z } from 'zod';
import type { Product } from '../_lib/types';

const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  category_id: z.number().int().positive().nullable().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) {
    return;
  }
  setCorsHeaders(res);

  const id = parseInt(String(req.query.id), 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  if (req.method === 'GET') {
    const product = await queryOne<Product>(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id],
    );
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.status(200).json(product);
  }

  if (req.method === 'PUT') {
    const admin = requireAdmin(req, res);
    if (!admin) {
      return;
    }

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const existing = await queryOne<Product>('SELECT * FROM products WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updates = parsed.data;
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(updates.description);
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${idx++}`);
      values.push(updates.price);
    }
    if (updates.stock !== undefined) {
      fields.push(`stock = $${idx++}`);
      values.push(updates.stock);
    }
    if (updates.images !== undefined) {
      fields.push(`images = $${idx++}`);
      values.push(JSON.stringify(updates.images));
    }
    if (updates.category_id !== undefined) {
      fields.push(`category_id = $${idx++}`);
      values.push(updates.category_id);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);
    const [updated] = await query<Product>(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    const admin = requireAdmin(req, res);
    if (!admin) {
      return;
    }

    const existing = await queryOne('SELECT id FROM products WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await query('DELETE FROM products WHERE id = $1', [id]);
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
