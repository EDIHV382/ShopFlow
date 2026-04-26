import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '../../stores/cart';
import type { Product } from '../../types';

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({ public: { apiBase: 'http://localhost:3000' } }),
}));

const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 5,
  images: ['test.jpg'],
  category_id: 1,
  category_name: 'Test Category',
  category_slug: 'test-category',
  created_at: '',
};

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    mockFetch.mockReset();
  });

  it('initializes with default state', () => {
    const store = useCartStore();
    expect(store.items).toEqual([]);
    expect(store.itemCount).toBe(0);
    expect(store.subtotal).toBe(0);
    expect(store.isEmpty).toBe(true);
  });

  it('adds an item to the cart', () => {
    const store = useCartStore();
    store.addItem(mockProduct, 2);

    expect(store.items).toHaveLength(1);
    expect(store.items[0].product_id).toBe(1);
    expect(store.items[0].quantity).toBe(2);
    expect(store.itemCount).toBe(2);
    expect(store.subtotal).toBe(200);
    expect(store.isEmpty).toBe(false);
  });

  it('does not add more than available stock', () => {
    const store = useCartStore();
    store.addItem(mockProduct, 10);

    expect(store.items[0].quantity).toBe(5); // Max stock is 5
  });

  it('updates item quantity', () => {
    const store = useCartStore();
    store.addItem(mockProduct, 1);
    store.updateQuantity(1, 3);

    expect(store.items[0].quantity).toBe(3);
  });

  it('removes item when quantity updated to 0', () => {
    const store = useCartStore();
    store.addItem(mockProduct, 1);
    store.updateQuantity(1, 0);

    expect(store.items).toHaveLength(0);
  });

  it('removes item by ID', () => {
    const store = useCartStore();
    store.addItem(mockProduct, 1);
    store.removeItem(1);

    expect(store.items).toHaveLength(0);
  });

  it('clears the cart', () => {
    const store = useCartStore();
    store.addItem(mockProduct, 1);
    store.clearCart();

    expect(store.items).toHaveLength(0);
  });

  it('persists and loads from localStorage', () => {
    const store1 = useCartStore();
    store1.addItem(mockProduct, 2);

    // Simulate page reload
    const store2 = useCartStore();
    store2.init();

    expect(store2.items).toHaveLength(1);
    expect(store2.items[0].quantity).toBe(2);
  });

  it('syncs from backend successfully', async () => {
    const store = useCartStore();

    const backendItems = [
      {
        id: 100,
        cart_id: 1,
        product_id: 2,
        quantity: 3,
        product_name: 'Backend Product',
        product_price: 50,
        product_images: [],
        product_stock: 10,
      },
    ];

    mockFetch.mockResolvedValueOnce({ items: backendItems });

    await store.syncFromBackend('fake-token');

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/cart', expect.any(Object));
    expect(store.items).toHaveLength(1);
    expect(store.items[0].product_id).toBe(2);
    expect(store.items[0].quantity).toBe(3);
  });
});
