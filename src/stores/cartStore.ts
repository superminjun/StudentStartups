import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { useCMSStore } from '@/stores/cmsStore';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => Promise<boolean>;
  decreaseItem: (product: Product) => Promise<void>;
  removeItem: (product: Product) => Promise<void>;
  clearCart: (options?: { release?: boolean }) => Promise<void>;
  getTotal: () => number;
}

const reservationQueue = new Map<string, Promise<boolean>>();

const getSessionId = () => {
  if (typeof window === 'undefined') return 'server';
  const key = 'bnss-reservation-session';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(key, next);
  return next;
};

const enqueueReservation = async (productId: string, task: () => Promise<boolean>) => {
  const prev = reservationQueue.get(productId) ?? Promise.resolve(true);
  const next = prev.then(task, task);
  reservationQueue.set(productId, next);
  try {
    return await next;
  } finally {
    if (reservationQueue.get(productId) === next) {
      reservationQueue.delete(productId);
    }
  }
};

const reserveInventory = async (productId: string, qty: number) => {
  const sessionId = getSessionId();
  const response = await fetch('/api/reserve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, qty, sessionId }),
  });
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.includes('application/json')) {
    return false;
  }
  const data = await response.json().catch(() => ({}));
  return data?.ok === true;
};

const releaseInventory = async (productId: string, qty: number) => {
  const sessionId = getSessionId();
  const response = await fetch('/api/release', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, qty, sessionId }),
  });
  return response.ok;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (product) => {
        return enqueueReservation(product.id, async () => {
          const items = get().items;
          const existing = items.find((i) => i.productId === product.id);
          const nextQty = (existing?.quantity ?? 0) + 1;
          const isPreOrderOpen = product.status === 'in-production' && product.isPreOrder;

          if (!isSupabaseConfigured) {
            const isSoldOut = product.status === 'sold-out' || product.inventory <= 0;
            if (isSoldOut) return false;
            if (product.status === 'in-production' && !isPreOrderOpen) return false;
            if (nextQty > product.inventory) return false;
          } else {
            const ok = await reserveInventory(product.id, 1);
            if (!ok) return false;
            useCMSStore.setState((state) => ({
              products: state.products.map((p) => {
                if (p.id !== product.id) return p;
                const nextInventory = Math.max(p.inventory - 1, 0);
                return {
                  ...p,
                  inventory: nextInventory,
                  status: nextInventory <= 0 ? 'sold-out' : p.status,
                };
              }),
            }));
            void useCMSStore.getState().hydrate();
          }

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
        });
      },
      decreaseItem: async (product) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);
        if (!existing) return;
        if (isSupabaseConfigured) {
          await releaseInventory(product.id, 1);
          useCMSStore.setState((state) => ({
            products: state.products.map((p) => {
              if (p.id !== product.id) return p;
              const nextInventory = p.inventory + 1;
              return {
                ...p,
                inventory: nextInventory,
                status: p.status === 'sold-out' && nextInventory > 0 ? 'available' : p.status,
              };
            }),
          }));
          void useCMSStore.getState().hydrate();
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
        if (isSupabaseConfigured) {
          await releaseInventory(product.id, existing.quantity);
          useCMSStore.setState((state) => ({
            products: state.products.map((p) => {
              if (p.id !== product.id) return p;
              const nextInventory = p.inventory + existing.quantity;
              return {
                ...p,
                inventory: nextInventory,
                status: p.status === 'sold-out' && nextInventory > 0 ? 'available' : p.status,
              };
            }),
          }));
          void useCMSStore.getState().hydrate();
        }
        set({ items: items.filter((i) => i.productId !== product.id) });
      },
      clearCart: async (options) => {
        const { release = true } = options ?? {};
        if (release && isSupabaseConfigured) {
          const items = get().items;
          await Promise.all(items.map((item) => releaseInventory(item.productId, item.quantity)));
          void useCMSStore.getState().hydrate();
        }
        set({ items: [] });
      },
      getTotal: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'bnss-cart' }
  )
);
