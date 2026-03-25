"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRIPE_WEBHOOK_SECRET = exports.stripe = void 0;
// Stripe singleton instance
const stripe_1 = __importDefault(require("stripe"));
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_demo_fake_key_1234567890";
if (!STRIPE_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
exports.stripe = new stripe_1.default(STRIPE_KEY, {
    apiVersion: '2023-10-16',
});
exports.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
