"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../../_lib/db");
const middleware_1 = require("../../_lib/middleware");
const zod_1 = require("zod");
const addItemSchema = zod_1.z.object({
    product_id: zod_1.z.number().int().positive(),
    quantity: zod_1.z.number().int().min(1).max(99).default(1),
});
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const payload = (0, middleware_1.requireAuth)(req, res);
    if (!payload)
        return;
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Método no permitido' });
    const parsed = addItemSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.errors[0].message });
    const { product_id, quantity } = parsed.data;
    // Validate product exists and has stock
    const product = await (0, db_1.queryOne)('SELECT id, stock FROM products WHERE id = $1', [product_id]);
    if (!product)
        return res.status(404).json({ error: 'Producto no encontrado' });
    if (product.stock < quantity)
        return res.status(400).json({ error: 'Stock insuficiente' });
    // Get or create cart
    let cart = await (0, db_1.queryOne)('SELECT * FROM carts WHERE user_id = $1', [payload.userId]);
    if (!cart) {
        const [newCart] = await (0, db_1.query)('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [payload.userId]);
        cart = newCart;
    }
    // Upsert cart item (add or increment quantity)
    const [item] = await (0, db_1.query)(`INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`, [cart.id, product_id, quantity]);
    // Update cart timestamp
    await (0, db_1.query)('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cart.id]);
    return res.status(201).json(item);
}
