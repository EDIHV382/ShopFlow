import { z } from 'zod';

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category_id: z.number().int().positive(),
  images: z.array(z.string().url()).max(10).optional().default([]),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  category: z.coerce.number().int().positive().optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest']).optional().default('newest'),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
});

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

// ─── CART ─────────────────────────────────────────────────────────────────────

export const AddToCartSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99),
});

export const UpdateCartSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(99),
});

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed']),
});

// ─── STRIPE ───────────────────────────────────────────────────────────────────

export const CreatePaymentIntentSchema = z.object({
  order_id: z.number().int().positive(),
  amount: z.number().int().positive('Amount must be positive (in cents)'),
  currency: z.string().length(3).optional().default('usd'),
});

// ─── HELPER ───────────────────────────────────────────────────────────────────

/**
 * Valida un schema de Zod y retorna { success, data, error }.
 * Usa esto en cada handler para validar req.body o req.query.
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  return { success: false, error: message };
}
