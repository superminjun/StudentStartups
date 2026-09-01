import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import { useCMSStore } from '@/stores/cmsStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const isLocalDev = import.meta.env.DEV;

type OrderPayload = {
  id: string;
  items: { id: string; name: string; qty: number; price: number }[];
  total: number;
  buyerName: string;
  buyerEmail: string;
  deliveryNote: string;
  date: string;
  status: 'pending';
};

export default function Cart() {
  const { t } = useLanguage();
  const { items, removeItem, addItem, clearCart } = useCartStore();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [orderError, setOrderError] = useState('');

  const products = useCMSStore((s) => s.products);

  const cartProducts = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? { ...product, qty: item.quantity } : null;
  }).filter(Boolean) as (typeof products[0] & { qty: number })[];

  const total = cartProducts.reduce((sum, p) => sum + p.price * p.qty, 0);

  const saveOrderLocally = (orderPayload: OrderPayload) => {
    const orders = JSON.parse(localStorage.getItem('bnss-orders') || '[]');
    orders.push(orderPayload);
    localStorage.setItem('bnss-orders', JSON.stringify(orders));
  };

  const decreaseQty = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    if (item && item.quantity <= 1) {
      removeItem(productId);
    } else {
      useCartStore.setState((state) => ({
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
        ),
      }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!buyerName.trim() || !buyerEmail.trim() || isSubmitting) return;
    setOrderError('');
    setIsSubmitting(true);
    const localId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;
    const order = {
      id: localId,
      items: cartProducts.map((p) => ({ id: p.id, name: p.name, qty: p.qty, price: p.price })),
      total,
      buyerName,
      buyerEmail,
      deliveryNote,
      date: new Date().toISOString(),
      status: 'pending' as const,
    };

    try {
      if (isSupabaseConfigured && !isLocalDev) {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerName,
            buyerEmail,
            deliveryNote,
            items: cartProducts.map((p) => ({ id: p.id, qty: p.qty })),
          }),
        });

        const rawResponse = await response.text();
        let data: Record<string, unknown> = {};

        try {
          data = rawResponse ? JSON.parse(rawResponse) as Record<string, unknown> : {};
        } catch {
          if (!response.ok) {
            throw new Error('Checkout API returned an invalid response. Please redeploy the site and try again.');
          }
        }

        if (response.ok && !data?.orderId) {
          throw new Error('Checkout API returned an invalid response. Please redeploy the site and try again.');
        }

        if (!response.ok || !data?.orderId) {
          throw new Error(
            typeof data?.error === 'string' && data.error
              ? data.error
              : 'Checkout failed. Please try again.'
          );
        }
      } else {
        // Local preview mode keeps the old lightweight fallback so the UI is still testable
        // even when the Vercel checkout API is not running.
        saveOrderLocally(order);
      }

      await useCMSStore.getState().hydrate();
      clearCart();
      setOrderPlaced(true);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ss-paper)] pt-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle className="mx-auto size-10 text-[var(--ss-accent)]" />
          <h2 className="ss-title mt-4">{t('shop.orderPlaced')}</h2>
          <Link to="/shop" className="btn btn-primary mt-6">
            {t('shop.continueShopping')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ss-paper)] pb-16 pt-28">
      <div className="ss-wrap max-w-5xl">
        <Link to="/shop" className="ss-link mb-8">
          <ArrowLeft className="size-4" />
          {t('shop.backToShop')}
        </Link>

        <h1 className="ss-heading">{t('shop.cart')}</h1>

        {cartProducts.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-sm text-[var(--ss-muted)]">{t('shop.emptyCart')}</p>
            <Link to="/shop" className="ss-link mt-4">
              {t('shop.continueShopping')}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-5">
            {/* Items */}
            <div className="lg:col-span-3 space-y-3">
              {cartProducts.map((product) => (
                <div key={product.id} className="flex gap-4 border-t border-[var(--ss-rule)] py-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="size-20 object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-heading text-sm font-medium">{product.name}</h3>
                    <p className="mt-1 text-sm text-[var(--ss-muted)] tabular-nums">${product.price.toFixed(2)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => decreaseQty(product.id)} className="flex size-7 items-center justify-center border border-[var(--ss-rule)] text-[var(--ss-muted)] hover:bg-[var(--ss-panel)]">
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium tabular-nums">{product.qty}</span>
                      <button
                        onClick={() => addItem(product.id)}
                        disabled={product.qty >= product.inventory}
                        className="flex size-7 items-center justify-center border border-[var(--ss-rule)] text-[var(--ss-muted)] hover:bg-[var(--ss-panel)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="size-3" />
                      </button>
                      <button onClick={() => removeItem(product.id)} className="ml-auto text-[var(--ss-muted)] transition-colors hover:text-[var(--ss-accent)]">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 border border-[var(--ss-rule)] bg-[var(--ss-surface)] p-6">
                <div className="mb-6 flex justify-between font-heading text-base font-medium">
                  <span>{t('shop.total')}</span>
                  <span className="tabular-nums">${total.toFixed(2)}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">{t('shop.buyerName')}</label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">{t('shop.buyerEmail')}</label>
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">{t('shop.deliveryNote')}</label>
                    <textarea
                      rows={2}
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      className="input-base resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={!buyerName.trim() || !buyerEmail.trim() || isSubmitting}
                  className="btn btn-primary mt-6 w-full disabled:opacity-40"
                >
                  {isSubmitting ? t('shop.processing') : t('shop.placeOrder')}
                </button>
                {orderError && <p className="mt-3 text-xs text-red-500">{orderError}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
