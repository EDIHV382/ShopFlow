"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = handler;
const stripe_1 = require("../_lib/stripe");
const db_1 = require("../_lib/db");
/**
 * Stripe webhook handler.
 * Important: Vercel automatically parses JSON bodies. To access the raw body
 * for signature verification, we use the buffer assembled from the readable stream.
 */
exports.config = {
    api: {
        bodyParser: false, // Disable body parser to get raw bytes for signature verification
    },
};
function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}
async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Método no permitido' });
    const signature = req.headers['stripe-signature'];
    if (!signature || !stripe_1.STRIPE_WEBHOOK_SECRET) {
        return res.status(400).json({ error: 'Missing stripe-signature header or webhook secret' });
    }
    let event;
    try {
        const rawBody = await getRawBody(req);
        event = stripe_1.stripe.webhooks.constructEvent(rawBody, signature, stripe_1.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.error('Stripe webhook signature verification failed:', err);
        return res.status(400).json({ error: 'Webhook signature invalid' });
    }
    // Handle payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        // Update pending orders with this payment intent ID to 'processing'
        // (Order was already created by POST /api/orders with the payment intent ID)
        await (0, db_1.query)(`UPDATE orders SET status = 'processing'
       WHERE stripe_payment_id = $1 AND status = 'pending'`, [paymentIntent.id]);
        console.log(`✅ Payment succeeded for intent ${paymentIntent.id}`);
    }
    // Handle payment_intent.payment_failed
    if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        console.warn(`❌ Payment failed for intent ${paymentIntent.id}`);
        // Restore stock for cancelled order items
        const orders = await (0, db_1.query)(`UPDATE orders SET status = 'cancelled'
       WHERE stripe_payment_id = $1 AND status = 'pending'
       RETURNING id`, [paymentIntent.id]);
        for (const order of orders) {
            // Restore stock
            await (0, db_1.query)(`UPDATE products p
         SET stock = p.stock + oi.quantity
         FROM order_items oi
         WHERE oi.order_id = $1 AND oi.product_id = p.id`, [order.id]);
        }
    }
    return res.status(200).json({ received: true });
}
