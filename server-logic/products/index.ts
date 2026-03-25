// GET /api/products — public product listing with filters, sorting, pagination
// POST /api/products — create product (ROLE_ADMIN)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_lib/db';
import { setCorsHeaders, handleOptions, requireAdmin, getPagination } from '../_lib/middleware';
import { z } from 'zod';
import type { Product } from '../_lib/types';

const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().default(''),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  images: z.array(z.string()).default([]),
  category_id: z.number().int().positive().nullable().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method === 'GET') {
    const { page, limit, offset } = getPagination(req.query);
    const { category, minPrice, maxPrice, search, sortBy, available } = req.query;

    let conditions: string[] = [];
    let params: unknown[] = [];
    let paramIdx = 1;

    if (category) {
      conditions.push(`c.slug = $${paramIdx++}`);
      params.push(category);
    }
    if (minPrice) {
      conditions.push(`p.price >= $${paramIdx++}`);
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      conditions.push(`p.price <= $${paramIdx++}`);
      params.push(Number(maxPrice));
    }
    if (search) {
      conditions.push(`p.name ILIKE $${paramIdx++}`);
      params.push(`%${search}%`);
    }
    if (available === 'true') {
      conditions.push(`p.stock > 0`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    const sortMap: Record<string, string> = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      name_asc: 'p.name ASC',
      name_desc: 'p.name DESC',
      newest: 'p.created_at DESC',
    };
    const orderBy = sortMap[String(sortBy)] || 'p.created_at DESC';

    // Count total
    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}`,
      params
    );
    const total = parseInt(countResult?.count || '0', 10);

    // Fetch page
    const products = await query<Product>(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY ${orderBy}
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  if (req.method === 'POST') {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { name, description, price, stock, images, category_id } = parsed.data;

    const [product] = await query<Product>(
      `INSERT INTO products (name, description, price, stock, images, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, price, stock, JSON.stringify(images), category_id ?? null]
    );

    return res.status(201).json(product);
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
