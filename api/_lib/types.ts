// Shared TypeScript types for the ShopFlow API
// Used across all serverless functions

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  roles: UserRole[];
  created_at: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category_id: number;
  category_name?: string;
  category_slug?: string;
  created_at: Date;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product_name?: string;
  product_price?: number;
  product_images?: string[];
  product_stock?: number;
  quantity: number;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  updated_at: Date;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name?: string;
  product_images?: string[];
  quantity: number;
  unit_price: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total: number;
  shipping_address: ShippingAddress;
  stripe_payment_id: string | null;
  created_at: Date;
  items?: OrderItem[];
}

export interface JwtPayload {
  userId: number;
  email: string;
  roles: UserRole[];
  iat?: number;
  exp?: number;
}
