// PUT /api/cart/items/:id — update item quantity
// DELETE /api/cart/items/:id — remove item from cart
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../../_lib/db';
import { applyMiddleware, handleOptions, requireAuth } from '../../_lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) {
    return;
  }
  applyMiddleware(req, res);

  const payload = requireAuth(req, res);
  if (!payload) {
    return;
  }

  const itemId = parseInt(String(req.query.id), 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Validate that the cart item belongs to the authenticated user
  const item = await queryOne<CartItem & { user_id: number }>(
    `SELECT ci.*, ca.user_id
     FROM cart_items ci
     JOIN carts ca ON ci.cart_id = ca.id
     WHERE ci.id = $1`,
    [itemId],
  );

  if (!item) {
    return res.status(404).json({ error: 'Item no encontrado' });
  }
  if (item.user_id !== payload.userId) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  if (req.method === 'PUT') {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    // Check stock
    const product = await queryOne<{ stock: number }>('SELECT stock FROM products WHERE id = $1', [
      item.product_id,
    ]);
    if (product && product.stock < parsed.data.quantity) {
      return res.status(400).json({ error: `Stock insuficiente (disponible: ${product.stock})` });
    }

    const [updated] = await query<CartItem>(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [parsed.data.quantity, itemId],
    );
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    await query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
