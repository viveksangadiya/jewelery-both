import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, CartItem, Product } from '@/types';
import { wishlistApi } from '@/lib/api';

// ── Auth Store ────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user: User, token: string) => {
        set({ user, token });
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
      },
      setUser: (user: User) => {
        set({ user });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
      },
      logout: () => {
        set({ user: null, token: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      },
    }),
    { name: 'auth-storage' }
  )
);

// ── Cart Store ────────────────────────────────────────────
// NOTE: Cart is fully server-driven when logged in.
// setItems() accepts the raw API response shape:
//   { items: [...], subtotal: N }  OR  just an array directly
// Each item from API has: id, product_id, name, image, effective_price, quantity, slug

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setItems: (data: any) => void;        // accepts API response or plain array
  addItem: (product: any, quantity?: number) => void; // optimistic add for ProductCard
  removeItem: (id: number) => void;     // removes by cart_item id
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getCount: () => number;
  getTotal: () => number;
}

// Helper: extract items array from any response shape
const toItemsArray = (data: any): CartItem[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
};

// Helper: get price from item (handles both field names)
export const itemPrice = (item: any): number =>
  parseFloat(String(item.effective_price ?? item.price ?? 0));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setItems: (data: any) => set({ items: toItemsArray(data) }),

      // Optimistic add — used by ProductCard "Add to Cart" button
      // CartDrawer re-fetches from server on open to get real server state
      addItem: (product: any, quantity = 1) => {
        const items = Array.isArray(get().items) ? get().items : [];
        const existing = items.find((i) => i.product_id === product.id || i.id === product.id);
        if (existing) {
          set({ items: items.map((i) =>
            (i.product_id === product.id || i.id === product.id)
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )});
        } else {
          set({ items: [...items, {
            id: Date.now(),
            product_id: product.id,
            name: product.name,
            image: product.primary_image,
            effective_price: parseFloat(String(product.sale_price || product.base_price)),
            price: parseFloat(String(product.sale_price || product.base_price)),
            quantity,
            slug: product.slug,
          }]});
        }
      },

      removeItem: (id: number) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id: number, quantity: number) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
        } else {
          set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)) });
        }
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getCount: () => {
        const items = get().items;
        if (!Array.isArray(items)) return 0;
        return items.reduce((sum, i) => sum + (i.quantity || 0), 0);
      },

      getTotal: () => {
        const items = get().items;
        if (!Array.isArray(items)) return 0;
        return items.reduce((sum, i) => sum + itemPrice(i) * (i.quantity || 0), 0);
      },
    }),
    {
      name: 'cart-storage',
      // Sanitize on rehydration — in case old bad data was persisted
      onRehydrateStorage: () => (state) => {
        if (state && !Array.isArray(state.items)) {
          state.items = [];
        }
      },
    }
  )
);

// ── Wishlist Store ────────────────────────────────────────
interface WishlistState {
  items: number[];
  synced: boolean;
  syncFromDB: () => Promise<void>;
  toggle: (productId: number) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
  clear: () => void;
  getCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      synced: false,

      syncFromDB: async () => {
        try {
          const res = await wishlistApi.getIds();
          set({ items: res.data.data, synced: true });
        } catch {
          set({ synced: false });
        }
      },

      toggle: async (productId: number) => {
        const items = get().items;
        const isIn = items.includes(productId);
        set({ items: isIn ? items.filter((id) => id !== productId) : [...items, productId] });
        try {
          await wishlistApi.toggle(productId);
        } catch {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (token) set({ items });
        }
      },

      isWishlisted: (productId: number) => get().items.includes(productId),
      clear: () => set({ items: [], synced: false }),
      getCount: () => get().items.length,
    }),
    { name: 'wishlist-storage' }
  )
);
