// Stripe singleton instance
import Stripe from 'stripe';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_demo_fake_key_1234567890";

if (!STRIPE_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2023-10-16',
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
