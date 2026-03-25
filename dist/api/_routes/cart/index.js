"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../_lib/db");
const middleware_1 = require("../_lib/middleware");
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const payload = (0, middleware_1.requireAuth)(req, res);
    if (!payload)
        return;
    if (req.method === 'GET') {
        // Get or create cart for user
        let cart = await (0, db_1.queryOne)('SELECT * FROM carts WHERE user_id = $1', [payload.userId]);
        if (!cart) {
            const [newCart] = await (0, db_1.query)('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [payload.userId]);
            cart = newCart;
        }
        // Get cart items with product details
        const items = await (0, db_1.query)(`SELECT ci.*, p.name as product_name, p.price as product_price,
              p.images as product_images, p.stock as product_stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`, [cart.id]);
        return res.status(200).json({ ...cart, items });
    }
    if (req.method === 'DELETE') {
        const cart = await (0, db_1.queryOne)('SELECT id FROM carts WHERE user_id = $1', [payload.userId]);
        if (cart) {
            await (0, db_1.query)('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
        }
        return res.status(204).end();
    }
    return res.status(405).json({ error: 'Método no permitido' });
}
