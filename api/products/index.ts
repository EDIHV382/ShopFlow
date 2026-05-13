// GET /api/products — public product listing with filters, sorting, pagination
// POST /api/products — create product (ROLE_ADMIN)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_lib/db';
import { requireAdmin } from '../_lib/middleware';
import { applySecurityMiddleware } from '../_lib/security.js';
import { getPaginationParams, formatPaginatedResponse } from '../_lib/pagination';
import { ProductQuerySchema, CreateProductSchema, validate } from '../_lib/schemas.js';
import type { Product } from '../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Rate limit general: 60 requests por minuto
  const blocked = applySecurityMiddleware(req, res, { maxRequests: 60, windowMs: 60_000 });
  if (blocked) return;

  if (req.method === 'GET') {
    const queryValidation = validate(ProductQuerySchema, req.query);
    if (!queryValidation.success) {
      return res.status(400).json({ error: queryValidation.error });
    }
    const { page, limit, category, search, sort, min_price, max_price } = queryValidation.data;
    const { offset } = getPaginationParams(req.query);

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (category) {
      conditions.push(`c.id = $${paramIdx++}`);
      params.push(category);
    }
    if (min_price) {
      conditions.push(`p.price >= $${paramIdx++}`);
      params.push(min_price);
    }
    if (max_price) {
      conditions.push(`p.price <= $${paramIdx++}`);
      params.push(max_price);
    }
    if (search) {
      conditions.push(`p.name ILIKE $${paramIdx++}`);
      params.push(`%${search}%`);
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
    const orderBy = sortMap[sort as keyof typeof sortMap] || 'p.created_at DESC';

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

    return res.status(200).json(formatPaginatedResponse(products, total, page!, limit!));
  }

  if (req.method === 'POST') {
    const admin = requireAdmin(req, res);
    if (!admin) {
      return;
    }

    const bodyValidation = validate(CreateProductSchema, req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({ error: bodyValidation.error });
    }
    const productData = bodyValidation.data;

    const [product] = await query<Product>(
      `INSERT INTO products (name, description, price, stock, images, category_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        productData.name,
        productData.description ?? '',
        productData.price,
        productData.stock,
        JSON.stringify(productData.images),
        productData.category_id ?? null,
      ]
    );

    return res.status(201).json(product);
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
