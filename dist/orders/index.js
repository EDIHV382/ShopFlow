"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../_lib/db");
const middleware_1 = require("../_lib/middleware");
const zod_1 = require("zod");
const shippingAddressSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    address: zod_1.z.string().min(5),
    city: zod_1.z.string().min(2),
    state: zod_1.z.string().min(2),
    postalCode: zod_1.z.string().min(3),
    country: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(7),
});
const createOrderSchema = zod_1.z.object({
    shippingAddress: shippingAddressSchema,
    stripePaymentId: zod_1.z.string().min(1),
});
async function handler(req, res) {
    if ((0, middleware_1.handleOptions)(req, res))
        return;
    (0, middleware_1.setCorsHeaders)(res);
    const payload = (0, middleware_1.requireAuth)(req, res);
    if (!payload)
        return;
    if (req.method === 'GET') {
        const orders = await (0, db_1.query)('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [payload.userId]);
        // Fetch items for each order
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const items = await (0, db_1.query)('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
            return { ...order, items };
        }));
        return res.status(200).json(ordersWithItems);
    }
    if (req.method === 'POST') {
        const parsed = createOrderSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.errors[0].message });
        const { shippingAddress, stripePaymentId } = parsed.data;
        // DEMO MOCK: Vaciar el carrito sin alterar la tabla 'orders' ni 'products'
        const cart = await (0, db_1.queryOne)('SELECT id FROM carts WHERE user_id = $1', [payload.userId]);
        if (cart) {
            await (0, db_1.query)('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
        }
        return res.status(201).json({ id: 999999 });
    }
    return res.status(405).json({ error: 'Método no permitido' });
}
