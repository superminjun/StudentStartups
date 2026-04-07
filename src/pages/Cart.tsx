import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import { useCMSStore } from '@/stores/cmsStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function Cart() {
  const { t } = useLanguage();
  const { items, removeItem, addItem, decreaseItem, clearCart } = useCartStore();
  const [orderPlaced, setOrderPlaced] = useState(false);
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

  const handlePlaceOrder = async () => {
    if (!buyerName.trim() || !buyerEmail.trim()) return;
    setOrderError('');
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
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('orders').insert({
        id: order.id,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        total,
        delivery_note: deliveryNote,
        items: order.items,
        status: order.status,
      });
      if (error) {
        setOrderError(error.message);
        return;
      }
      await useCMSStore.getState().hydrate();
    } else {
      const orders = JSON.parse(localStorage.getItem('bnss-orders') || '[]');
      orders.push(order);
      localStorage.setItem('bnss-orders', JSON.stringify(orders));
      await useCMSStore.getState().hydrate();
    }
    await clearCart({ release: false });
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-beige pt-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle className="mx-auto size-12 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-semibold text-foreground">{t('shop.orderPlaced')}</h2>
          <Link to="/shop" className="btn btn-primary mt-6">
            {t('shop.continueShopping')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <Link to="/shop" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Back to Shop
        </Link>

        <h1 className="text-2xl font-semibold text-foreground">{t('shop.cart')}</h1>

        {cartProducts.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-base text-muted-foreground">{t('shop.emptyCart')}</p>
            <Link to="/shop" className="mt-4 inline-block text-sm font-medium text-foreground underline">
              {t('shop.continueShopping')}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-5">
            {/* Items */}
            <div className="lg:col-span-3 space-y-3">
              {cartProducts.map((product) => {
                const isPreOrderOpen = product.status === 'in-production' && product.isPreOrder;
                const isSoldOut = product.status === 'sold-out' || product.inventory <= 0;
                const canIncrease = !isSoldOut && product.inventory > 0 && (
                  product.status === 'available' || isPreOrderOpen
                );

                return (
                  <div key={product.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="size-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
                      <p className="mt-1 text-sm font-medium text-muted-foreground tabular-nums">${product.price.toFixed(2)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => decreaseItem(product)}
                          className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium tabular-nums text-foreground">{product.qty}</span>
                        <button
                          onClick={() => addItem(product)}
                          disabled={!canIncrease || isSoldOut}
                          className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          onClick={() => removeItem(product)}
                          className="ml-auto text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Checkout */}
            <div className="lg:col-span-2">
              <div className="card p-6 sticky top-24">
                <div className="flex justify-between text-base font-semibold text-foreground mb-6">
                  <span>{t('shop.total')}</span>
                  <span className="tabular-nums">${total.toFixed(2)}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">{t('shop.buyerName')}</label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">{t('shop.buyerEmail')}</label>
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">{t('shop.deliveryNote')}</label>
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
                  disabled={!buyerName.trim() || !buyerEmail.trim()}
                  className="btn btn-primary mt-6 w-full disabled:opacity-40"
                >
                  {t('shop.placeOrder')}
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
