// Shared TypeScript interfaces for the ShopFlow client

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  product_count?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category_id: number | null;
  category_name?: string;
  category_slug?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_images: string[];
  product_stock: number;
  quantity: number;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  updated_at: string;
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

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_images: string[];
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total: number;
  shipping_address: ShippingAddress;
  stripe_payment_id: string | null;
  created_at: string;
  items?: OrderItem[];
  user_name?: string;
  user_email?: string;
}

export interface DashboardMetrics {
  todaySales: { total: number; count: number };
  pendingOrders: number;
  processingOrders: number;
  lowStockProducts: { id: number; name: string; stock: number }[];
  totalProducts: number;
  totalUsers: number;
  recentOrders: {
    id: number;
    status: string;
    total: number;
    created_at: string;
    user_name: string;
  }[];
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
  created_at: string;
}

export interface SalesChartDay {
  date: string;
  total: number;
  orders: number;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest';
  available?: boolean;
  page?: number;
}
