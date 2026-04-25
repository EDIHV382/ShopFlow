// Cart store — manages local cart state with localStorage persistence
// When authenticated, syncs with backend on mount
import { defineStore } from 'pinia';
import type { CartItem, Product } from '~/types';

interface LocalCartItem {
  product_id: number;
  product_name: string;
  product_price: number;
  product_images: string[];
  product_stock: number;
  quantity: number;
}

interface CartState {
  items: LocalCartItem[];
  loading: boolean;
  syncing: boolean;
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    loading: false,
    syncing: false,
  }),

  getters: {
    itemCount: (state): number => state.items.reduce((total, item) => total + item.quantity, 0),

    subtotal: (state): number =>
      state.items.reduce((total, item) => total + item.product_price * item.quantity, 0),

    isEmpty: (state): boolean => state.items.length === 0,

    getItemQuantity:
      (state) =>
      (productId: number): number =>
        state.items.find((i) => i.product_id === productId)?.quantity ?? 0,
  },

  actions: {
    /** Load cart from localStorage */
    init() {
      if (process.client) {
        const stored = localStorage.getItem('shopflow_cart');
        if (stored) {
          try {
            this.items = JSON.parse(stored);
          } catch {
            this.items = [];
          }
        }
      }
    },

    /** Persist cart to localStorage */
    persist() {
      if (process.client) {
        localStorage.setItem('shopflow_cart', JSON.stringify(this.items));
      }
    },

    /** Add product to cart (local first) */
    addItem(product: Product, quantity = 1) {
      const existing = this.items.find((i) => i.product_id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        existing.quantity = Math.min(newQty, product.stock);
      } else {
        this.items.push({
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_images: product.images,
          product_stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        });
      }
      this.persist();
    },

    /** Update item quantity */
    updateQuantity(productId: number, quantity: number) {
      const item = this.items.find((i) => i.product_id === productId);
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId);
        } else {
          item.quantity = Math.min(quantity, item.product_stock);
          this.persist();
        }
      }
    },

    /** Remove item from cart */
    removeItem(productId: number) {
      this.items = this.items.filter((i) => i.product_id !== productId);
      this.persist();
    },

    /** Clear entire cart */
    clearCart() {
      this.items = [];
      this.persist();
    },

    /**
     * Sync backend cart to local state when user logs in.
     * Backend cart takes precedence over localStorage.
     */
    async syncFromBackend(token: string) {
      const config = useRuntimeConfig();
      this.syncing = true;
      try {
        const backendCart = await $fetch<{ items: CartItem[] }>(
          `${config.public.apiBase}/api/cart`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (backendCart.items.length > 0) {
          // Merge: backend items win
          this.items = backendCart.items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            product_price: item.product_price,
            product_images: item.product_images,
            product_stock: item.product_stock,
            quantity: item.quantity,
          }));
          this.persist();
        }
      } catch {
        // If sync fails, keep local cart
      } finally {
        this.syncing = false;
      }
    },
  },
});
