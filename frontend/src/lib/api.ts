import axios, { AxiosResponse } from 'axios';
import type { ApiResponse, Product, Category, Order, CartItem, Pagination } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────
interface LoginPayload { email: string; password: string; }
interface RegisterPayload { name: string; email: string; password: string; phone?: string; }
interface AuthData { user: import('@/types').User; token: string; is_new_user?: boolean; }

export const authApi = {
  register: (data: RegisterPayload): Promise<AxiosResponse<ApiResponse<AuthData>>> =>
    api.post('/auth/register', data),
  login: (data: LoginPayload): Promise<AxiosResponse<ApiResponse<AuthData>>> =>
    api.post('/auth/login', data),
  googleAuth: (id_token: string): Promise<AxiosResponse<ApiResponse<AuthData>>> =>
    api.post('/auth/google', { id_token }),
  getProfile: (): Promise<AxiosResponse<ApiResponse<import('@/types').User>>> =>
    api.get('/auth/profile'),
  updateProfile: (data: Partial<import('@/types').User>): Promise<AxiosResponse<ApiResponse<import('@/types').User>>> =>
    api.put('/auth/profile', data),
};

// ── Products ──────────────────────────────────────────────
interface ProductsQuery {
  category?: string;
  featured?: string;
  search?: string;
  min_price?: string | number;
  max_price?: string | number;
  sort?: string;
  page?: number;
  limit?: number;
  sale?: string;
}

interface ProductsListResponse {
  data: Product[];
  pagination: Pagination;
}

export const productsApi = {
  getAll: (params?: ProductsQuery): Promise<AxiosResponse<ApiResponse<Product[]> & { pagination: Pagination }>> =>
    api.get('/products', { params }),
  getBySlug: (slug: string): Promise<AxiosResponse<ApiResponse<Product>>> =>
    api.get(`/products/${slug}`),
  getSimilar: (id: number, limit = 8): Promise<AxiosResponse<ApiResponse<Product[]>>> =>
    api.get(`/products/${id}/similar?limit=${limit}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPresignedUrl: (filename: string) =>
    api.post('/products/upload-image-presign', { filename }),
  create: (data: Partial<Product> & { images?: string[] }): Promise<AxiosResponse<ApiResponse<Product>>> =>
    api.post('/products', data),
  update: (id: number, data: Partial<Product>): Promise<AxiosResponse<ApiResponse<Product>>> =>
    api.put(`/products/${id}`, data),
};

// ── Categories ────────────────────────────────────────────
export const categoriesApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Category[]>>> =>
    api.get('/categories'),
  create: (data: Partial<Category>): Promise<AxiosResponse<ApiResponse<Category>>> =>
    api.post('/categories', data),
  update: (id: number, data: Partial<Category>): Promise<AxiosResponse<ApiResponse<Category>>> =>
    api.put(`/categories/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/categories/${id}`),
};

// ── Cart ──────────────────────────────────────────────────
interface CartResponse { items: CartItem[]; subtotal: number; }
interface AddToCartPayload { product_id: number; variant_id?: number; quantity?: number; }

export const cartApi = {
  get: (): Promise<AxiosResponse<ApiResponse<CartResponse>>> =>
    api.get('/cart'),
  add: (data: AddToCartPayload): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post('/cart/add', data),
  update: (id: number, quantity: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.put(`/cart/${id}`, { quantity }),
  remove: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/cart/${id}`),
  clear: (): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete('/cart'),
};

// ── Orders ────────────────────────────────────────────────
interface CreateOrderPayload {
  shipping_address: import('@/types').Address;
  payment_method: string;
  coupon_code?: string;
  notes?: string;
}

export const ordersApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Order[]>>> =>
    api.get('/orders'),
  getById: (id: number): Promise<AxiosResponse<ApiResponse<Order>>> =>
    api.get(`/orders/${id}`),
  create: (data: CreateOrderPayload): Promise<AxiosResponse<ApiResponse<Order>>> =>
    api.post('/orders', data),
  adminGetAll: (params?: { status?: string; page?: number; limit?: number }): Promise<AxiosResponse<ApiResponse<Order[]>>> =>
    api.get('/orders/admin/all', { params }),
  updateStatus: (id: number, status: string): Promise<AxiosResponse<ApiResponse<Order>>> =>
    api.put(`/orders/admin/${id}/status`, { status }),
  validateCoupon: (code: string, subtotal: number) =>
    api.post('/orders/validate-coupon', { code, subtotal }),
  cancel: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post(`/orders/${id}/cancel`),
};

// ── Coupons (Admin) ───────────────────────────────────────
export const couponsApi = {
  getAll: () => api.get('/coupons'),
  create: (data: {
    code: string; type: 'percentage' | 'fixed'; value: number;
    min_order_value?: number; max_discount?: number;
    expires_at?: string; usage_limit?: number;
  }) => api.post('/coupons', data),
  update: (id: number, data: any) => api.put(`/coupons/${id}`, data),
  delete: (id: number) => api.delete(`/coupons/${id}`),
};

// ── Wishlist ──────────────────────────────────────────────
export const wishlistApi = {
  get: (): Promise<AxiosResponse<ApiResponse<Product[]>>> =>
    api.get('/wishlist'),
  getIds: (): Promise<AxiosResponse<ApiResponse<number[]>>> =>
    api.get('/wishlist/ids'),
  toggle: (product_id: number): Promise<AxiosResponse<ApiResponse<{ wishlisted: boolean }>>> =>
    api.post('/wishlist/toggle', { product_id }),
  clear: (): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete('/wishlist'),
};

// ── Contact ───────────────────────────────────────────────
export const contactApi = {
  send: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    api.post('/contact', data),
};

export default api;

// ── Reviews ───────────────────────────────────────────────
export const reviewsApi = {
  getByProduct: (productId: number, page = 1) =>
    api.get(`/reviews/${productId}?page=${page}&limit=10`),
  getMyReview: (productId: number) =>
    api.get(`/reviews/${productId}/my`),
  submit: (productId: number, data: { rating: number; title?: string; comment?: string }) =>
    api.post(`/reviews/${productId}`, data),
  delete: (productId: number) =>
    api.delete(`/reviews/${productId}`),
  checkPurchased: (productId: number) =>
    api.get(`/reviews/${productId}/can-review`),
};

// ── Returns ───────────────────────────────────────────────
export const returnsApi = {
  getAll: () => api.get('/returns'),
  getById: (id: number) => api.get(`/returns/${id}`),
  create: (data: {
    order_id: number;
    type: 'return' | 'exchange';
    reason: string;
    description?: string;
    refund_method?: string;
    items: { order_item_id: number; quantity: number; reason?: string }[];
  }) => api.post('/returns', data),
  cancel: (id: number) => api.delete(`/returns/${id}`),
  track: (id: number) => api.get(`/returns/${id}/track`),
};
