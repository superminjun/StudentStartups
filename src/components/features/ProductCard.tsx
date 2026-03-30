import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const { t } = useLanguage();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);
  const cartQty = cartItems.find((i) => i.productId === product.id)?.quantity ?? 0;
  const availableStock = Math.max(product.inventory - cartQty, 0);
  const isSoldOut = availableStock <= 0 || product.status === 'sold-out';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    addItem(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const statusLabel = isSoldOut ? t('shop.soldOut')
    : product.status === 'in-production' ? t('shop.inProduction')
    : null;

  return (
    <Link to={`/shop/${product.id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="group overflow-hidden rounded-xl border border-[hsl(30,12%,90%)] bg-white"
      >
        <div className="relative aspect-square overflow-hidden bg-[hsl(30,15%,94%)]">
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {statusLabel && (
            <span className="absolute left-3 top-3 rounded-full bg-charcoal px-2.5 py-1 text-[10px] font-semibold text-white">
              {statusLabel}
            </span>
          )}
          <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-charcoal shadow-sm">
            {t('shop.stocks')}:{' '}
            <AnimatePresence mode="popLayout">
              <motion.span
                key={availableStock}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-block tabular-nums"
              >
                {availableStock}
              </motion.span>
            </AnimatePresence>
          </div>
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/30" />
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-charcoal line-clamp-1">{product.name}</h3>
          <p className="mt-1 text-xs text-mid line-clamp-2 leading-relaxed">{product.description}</p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-base font-bold text-charcoal tabular-nums">${product.price.toFixed(2)}</span>
            <button
              onClick={handleAdd}
              disabled={isSoldOut}
              className="flex items-center gap-1.5 rounded-full bg-charcoal px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[hsl(20,8%,28%)] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              {added ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                  <Check className="size-3" />
                  {t('shop.added')}
                </motion.span>
              ) : (
                <>
                  <ShoppingBag className="size-3" />
                  {t('shop.addToCart')}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
