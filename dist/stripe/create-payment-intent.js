"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const stripe_1 = require("../_lib/stripe");
const db_1 = require("../_lib/db");
const middleware_1 = require("../_lib/middleware");
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const payload = (0, middleware_1.requireAuth)(req, res);
    if (!payload)
        return;
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Método no permitido' });
    // Get cart and calculate total
    const cart = await (0, db_1.queryOne)('SELECT * FROM carts WHERE user_id = $1', [payload.userId]);
    if (!cart)
        return res.status(400).json({ error: 'Carrito vacío' });
    const cartItems = await (0, db_1.query)(`SELECT ci.quantity, p.price, p.stock, p.name
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`, [cart.id]);
    if (cartItems.length === 0)
        return res.status(400).json({ error: 'Carrito vacío' });
    // Validate stock
    for (const item of cartItems) {
        if (item.stock < item.quantity) {
            return res.status(400).json({ error: `Stock insuficiente para "${item.name}"` });
        }
    }
    // Total in cents (Stripe requires integer cents)
    const totalCents = Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100);
    const paymentIntent = await stripe_1.stripe.paymentIntents.create({
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
