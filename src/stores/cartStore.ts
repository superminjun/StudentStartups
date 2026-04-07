import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => Promise<boolean>;
  decreaseItem: (product: Product) => Promise<void>;
  removeItem: (product: Product) => Promise<void>;
  clearCart: (options?: { release?: boolean }) => Promise<void>;
  getTotal: () => number;
}

const shouldReserveInventory = (product: Product) => product.status === 'available' && !product.isPreOrder;

const reserveInventory = async (productId: string, qty: number) => {
  if (!isSupabaseConfigured || !supabase) return true;
  const { data, error } = await supabase.rpc('reserve_product_inventory', {
    p_product_id: productId,
    p_qty: qty,
  });
  if (error) {
    console.error('Failed to reserve inventory', error);
    return false;
  }
  return data === true;
};

const releaseInventory = async (productId: string, qty: number) => {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.rpc('release_product_inventory', {
    p_product_id: productId,
    p_qty: qty,
  });
  if (error) {
    console.error('Failed to release inventory', error);
  }
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (product) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);
        const shouldReserve = shouldReserveInventory(product);

        if (shouldReserve) {
          const ok = await reserveInventory(product.id, 1);
          if (!ok) return false;
        }

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + 1, reserved: i.reserved ?? shouldReserve }
                : i
            ),
          });
        } else {
          set({ items: [...items, { productId: product.id, quantity: 1, reserved: shouldReserve }] });
        }
        return true;
      },
      decreaseItem: async (product) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);
        if (!existing) return;
        if (existing.reserved) {
          await releaseInventory(product.id, 1);
        }
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
        if (existing.reserved) {
          await releaseInventory(product.id, existing.quantity);
        }
        set({ items: items.filter((i) => i.productId !== product.id) });
      },
      clearCart: async (options) => {
        const { release = true } = options ?? {};
        if (release) {
          const items = get().items;
          await Promise.all(
            items.filter((item) => item.reserved).map((item) => releaseInventory(item.productId, item.quantity))
          );
        }
        set({ items: [] });
      },
      getTotal: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'bnss-cart' }
  )
);
