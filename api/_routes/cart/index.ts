// GET /api/cart — get authenticated user's cart with items
// DELETE /api/cart — clear the entire cart
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../../../_lib/db';
import { setCorsHeaders, handleOptions, requireAuth } from '../../../_lib/middleware';
import type { Cart, CartItem } from '../../../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) {
    return;
  }
  setCorsHeaders(res);

  const payload = requireAuth(req, res);
  if (!payload) {
    return;
  }

  if (req.method === 'GET') {
    // Get or create cart for user
    let cart = await queryOne<Cart>('SELECT * FROM carts WHERE user_id = $1', [payload.userId]);
    if (!cart) {
      const [newCart] = await query<Cart>('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [
        payload.userId,
      ]);
      cart = newCart;
    }

    // Get cart items with product details
    const items = await query<CartItem>(
      `SELECT ci.*, p.name as product_name, p.price as product_price,
              p.images as product_images, p.stock as product_stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cart.id],
    );

    return res.status(200).json({ ...cart, items });
  }

  if (req.method === 'DELETE') {
    const cart = await queryOne<Cart>('SELECT id FROM carts WHERE user_id = $1', [payload.userId]);
    if (cart) {
      await query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
    }
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
