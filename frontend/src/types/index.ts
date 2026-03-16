// ============================================================
// GLOBAL TYPES — src/types/index.ts
// ============================================================

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  is_verified?: boolean;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  product_count?: number;
  sort_order?: number;
  is_active?: boolean;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  value: string;
  price_modifier: number;
  stock: number;
  sku?: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified?: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  category_id?: number;
  category_name?: string;
  category_slug?: string;
  base_price: number;
  sale_price?: number;
  sku?: string;
  material?: string;
  weight_grams?: number;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  tags?: string[];
  primary_image?: string;
  avg_rating?: number;
  review_count?: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  slug: string;
  variant_id?: number;
  variant_name?: string;
  variant_value?: string;
}

export interface Address {
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  variant_info?: Record<string, string>;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping_charge: number;
  total: number;
  payment_method?: string;
  payment_status: PaymentStatus;
  payment_id?: string;
  shipping_address: Address | string;
  notes?: string;
  item_count?: number;
  customer_name?: string;
  customer_email?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}
