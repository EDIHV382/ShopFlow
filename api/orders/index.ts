// GET /api/orders — authenticated user's order history
// POST /api/orders — create new order
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne } from '../_lib/db.js';
import { setCorsHeaders, handleOptions, requireAuth } from '../_lib/middleware.js';
import { z } from 'zod';
import type { Order, OrderItem, Cart } from '../_lib/types.js';

const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  phone: z.string().min(7),
});

const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  stripePaymentId: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  const payload = requireAuth(req, res);
  if (!payload) return;

  if (req.method === 'GET') {
    const orders = await query<Order>(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [payload.userId]
    );

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await query<OrderItem>(
          'SELECT * FROM order_items WHERE order_id = $1',
          [order.id]
        );
        return { ...order, items };
      })
    );

    return res.status(200).json(ordersWithItems);
  }

  if (req.method === 'POST') {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const { shippingAddress, stripePaymentId } = parsed.data;

    // Get user's cart
    const cart = await queryOne<Cart>('SELECT * FROM carts WHERE user_id = $1', [payload.userId]);
    if (!cart) return res.status(400).json({ error: 'Carrito vacío' });

    const cartItems = await query<{
      id: number; product_id: number; quantity: number;
      product_name: string; product_price: number; product_images: string[]; stock: number;
    }>(
      `SELECT ci.id, ci.product_id, ci.quantity,
              p.name as product_name, p.price as product_price,
              p.images as product_images, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );

    if (cartItems.length === 0) return res.status(400).json({ error: 'Carrito vacío' });

    // Validate stock for all items
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para "${item.product_name}" (disponible: ${item.stock})`
        });
      }
    }

    const total = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);

    // Create order and items atomically
    const [order] = await query<Order>(
      `INSERT INTO orders (user_id, status, total, shipping_address, stripe_payment_id)
       VALUES ($1, 'pending', $2, $3, $4)
       RETURNING *`,
      [payload.userId, total, JSON.stringify(shippingAddress), stripePaymentId]
    );

    // Insert order items and reduce stock
    for (const item of cartItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_images, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.product_name, JSON.stringify(item.product_images), item.quantity, item.product_price]
      );

      await query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear the cart after order creation
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
    await query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cart.id]);

    return res.status(201).json(order);
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
