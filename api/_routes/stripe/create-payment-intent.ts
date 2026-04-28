// POST /api/stripe/create-payment-intent
// Creates a Stripe PaymentIntent for the current cart total
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from '../../../_lib/stripe';
import { queryOne, query } from '../../../_lib/db';
import { setCorsHeaders, handleOptions, requireAuth } from '../../../_lib/middleware';
import type { Cart } from '../../../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) {
    return;
  }
  setCorsHeaders(res);

  const payload = requireAuth(req, res);
  if (!payload) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Get cart and calculate total
  const cart = await queryOne<Cart>('SELECT * FROM carts WHERE user_id = $1', [payload.userId]);
  if (!cart) {
    return res.status(400).json({ error: 'Carrito vacío' });
  }

  const cartItems = await query<{ quantity: number; price: number; stock: number; name: string }>(
    `SELECT ci.quantity, p.price, p.stock, p.name
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`,
    [cart.id],
  );

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Carrito vacío' });
  }

  // Validate stock
  for (const item of cartItems) {
    if (item.stock < item.quantity) {
      return res.status(400).json({ error: `Stock insuficiente para "${item.name}"` });
    }
  }

  // Total in cents (Stripe requires integer cents)
  const totalCents = Math.round(
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100,
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'usd',
    metadata: {
      userId: String(payload.userId),
      cartId: String(cart.id),
    },
  });

  return res.status(200).json({
    clientSecret: paymentIntent.client_secret,
    amount: totalCents,
  });
}
