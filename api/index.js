"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Import all route handlers
const index_js_1 = __importDefault(require("./_routes/products/index.js"));
const _id__js_1 = __importDefault(require("./_routes/products/[id].js"));
const index_js_2 = __importDefault(require("./_routes/categories/index.js"));
const _id__js_2 = __importDefault(require("./_routes/categories/[id].js"));
const login_js_1 = __importDefault(require("./_routes/auth/login.js"));
const register_js_1 = __importDefault(require("./_routes/auth/register.js"));
const me_js_1 = __importDefault(require("./_routes/auth/me.js"));
const logout_js_1 = __importDefault(require("./_routes/auth/logout.js"));
const index_js_3 = __importDefault(require("./_routes/cart/index.js"));
const index_js_4 = __importDefault(require("./_routes/cart/items/index.js"));
const _id__js_3 = __importDefault(require("./_routes/cart/items/[id].js"));
const index_js_5 = __importDefault(require("./_routes/orders/index.js"));
const _id__js_4 = __importDefault(require("./_routes/orders/[id].js"));
const dashboard_js_1 = __importDefault(require("./_routes/admin/dashboard.js"));
const users_js_1 = __importDefault(require("./_routes/admin/users.js"));
const index_js_6 = __importDefault(require("./_routes/admin/orders/index.js"));
const status_js_1 = __importDefault(require("./_routes/admin/orders/[id]/status.js"));
const sales_chart_js_1 = __importDefault(require("./_routes/admin/sales-chart.js"));
const create_payment_intent_js_1 = __importDefault(require("./_routes/stripe/create-payment-intent.js"));
const webhook_js_1 = __importDefault(require("./_routes/stripe/webhook.js"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.all('/api/stripe/webhook', webhook_js_1.default);
app.use(express_1.default.json());
function adapt(handler, idParamName = 'id') {
    return async (req, res) => {
        if (req.params[idParamName]) {
            req.query[idParamName] = req.params[idParamName];
        }
        return handler(req, res);
    };
}
app.all('/api/products', adapt(index_js_1.default));
app.all('/api/products/:id', adapt(_id__js_1.default));
app.all('/api/categories', adapt(index_js_2.default));
app.all('/api/categories/:id', adapt(_id__js_2.default));
app.all('/api/auth/login', adapt(login_js_1.default));
app.all('/api/auth/register', adapt(register_js_1.default));
app.all('/api/auth/me', adapt(me_js_1.default));
app.all('/api/auth/logout', adapt(logout_js_1.default));
app.all('/api/cart', adapt(index_js_3.default));
app.all('/api/cart/items', adapt(index_js_4.default));
app.all('/api/cart/items/:id', adapt(_id__js_3.default));
app.all('/api/orders', adapt(index_js_5.default));
app.all('/api/orders/:id', adapt(_id__js_4.default));
app.all('/api/admin/dashboard', adapt(dashboard_js_1.default));
app.all('/api/admin/users', adapt(users_js_1.default));
app.all('/api/admin/orders', adapt(index_js_6.default));
app.all('/api/admin/orders/:id/status', adapt(status_js_1.default));
app.all('/api/admin/sales-chart', adapt(sales_chart_js_1.default));
app.all('/api/stripe/create-payment-intent', adapt(create_payment_intent_js_1.default));
app.all(/^.*$/, (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
exports.default = app;
