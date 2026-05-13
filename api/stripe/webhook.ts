import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { pool } from '../_lib/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    // req.body debe ser el raw body (Buffer). Vercel lo provee automáticamente.
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));

    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error('Webhook signature verification failed:', message);
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;

        if (orderId) {
          await pool.query(`UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1`, [orderId]);
          console.log(`Order ${orderId} marked as paid`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;

        if (orderId) {
          await pool.query(`UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = $1`, [orderId]);
          console.log(`Order ${orderId} marked as failed`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error processing webhook:', message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
