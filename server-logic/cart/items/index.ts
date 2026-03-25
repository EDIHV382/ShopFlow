// POST /api/cart/items — add item to cart
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_lib/db';
import { setCorsHeaders, handleOptions, requireAuth } from '../_lib/middleware';
import { z } from 'zod';
import type { Cart, CartItem } from '../_lib/types';

const addItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99).default(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  const payload = requireAuth(req, res);
  if (!payload) return;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { product_id, quantity } = parsed.data;

  // Validate product exists and has stock
  const product = await queryOne<{ id: number; stock: number }>(
    'SELECT id, stock FROM products WHERE id = $1',
    [product_id]
  );
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  if (product.stock < quantity) return res.status(400).json({ error: 'Stock insuficiente' });

  // Get or create cart
  let cart = await queryOne<Cart>('SELECT * FROM carts WHERE user_id = $1', [payload.userId]);
  if (!cart) {
    const [newCart] = await query<Cart>('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [payload.userId]);
    cart = newCart;
  }

  // Upsert cart item (add or increment quantity)
  const [item] = await query<CartItem>(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`,
    [cart.id, product_id, quantity]
  );

  // Update cart timestamp
  await query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cart.id]);

  return res.status(201).json(item);
}
