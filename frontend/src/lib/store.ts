import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, CartItem, Product } from '@/types';
import { wishlistApi } from '@/lib/api';

// ── Auth Store ────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
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
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setItems: (items: CartItem[]) => set({ items }),
      addItem: (product: Product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.product_id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: Date.now(),
                product_id: product.id,
                name: product.name,
                image: product.primary_image,
                price: parseFloat(String(product.sale_price || product.base_price)),
                quantity,
                slug: product.slug,
              },
            ],
          });
        }
      },
      removeItem: (id: number) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id: number, quantity: number) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
        } else {
          set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)) });
        }
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);

// ── Wishlist Store  ───────────────────────────────────────
// Strategy:
//   • Logged in  → reads/writes from DB, keeps local copy in sync
//   • Logged out → falls back to localStorage only
//   • On login   → call syncFromDB() to hydrate from server
//   • On logout  → call clear() to wipe local state
interface WishlistState {
  items: number[];           // product IDs
  synced: boolean;           // has DB been loaded yet?
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

      // Call once after login to load wishlist from DB
      syncFromDB: async () => {
        try {
          const res = await wishlistApi.getIds();
          set({ items: res.data.data, synced: true });
        } catch {
          // Not logged in or network error — keep localStorage state
          set({ synced: false });
        }
      },

      // Toggle — updates DB if logged in, always updates local state immediately
      toggle: async (productId: number) => {
        const items = get().items;
        const isIn = items.includes(productId);

        // Optimistic update — instant UI response
        set({ items: isIn ? items.filter(id => id !== productId) : [...items, productId] });

        // Sync to DB (will fail silently if not logged in)
        try {
          await wishlistApi.toggle(productId);
        } catch {
          // If logged out or error, revert optimistic update
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (token) {
            // Was logged in but got an error — revert
            set({ items });
          }
          // If not logged in — keep the local-only toggle (localStorage persistence handles it)
        }
      },

      isWishlisted: (productId: number) => get().items.includes(productId),

      // Call on logout
      clear: () => set({ items: [], synced: false }),

      getCount: () => get().items.length,
    }),
    { name: 'wishlist-storage' }
  )
);
