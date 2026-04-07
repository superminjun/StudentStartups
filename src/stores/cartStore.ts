import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => Promise<boolean>;
  decreaseItem: (product: Product) => Promise<void>;
  removeItem: (product: Product) => Promise<void>;
  clearCart: (options?: { release?: boolean }) => Promise<void>;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (product) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);
        const nextQty = (existing?.quantity ?? 0) + 1;
        const isSoldOut = product.status === 'sold-out' || product.inventory <= 0;
        const isPreOrderOpen = product.status === 'in-production' && product.isPreOrder;

        if (isSoldOut) return false;
        if (product.status === 'in-production' && !isPreOrderOpen) return false;
        if (nextQty > product.inventory) return false;

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { productId: product.id, quantity: 1 }] });
        }
        return true;
      },
      decreaseItem: async (product) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);
        if (!existing) return;
        if (existing.quantity <= 1) {
          set({ items: items.filter((i) => i.productId !== product.id) });
          return;
        }
        set({
          items: items.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity - 1 } : i
          ),
        });
      },
      removeItem: async (product) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);
        if (!existing) return;
        set({ items: items.filter((i) => i.productId !== product.id) });
      },
      clearCart: async (options) => {
        void options;
        set({ items: [] });
      },
      getTotal: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'bnss-cart' }
  )
);
