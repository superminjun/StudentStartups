import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/types';

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
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
        className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[hsl(30,12%,90%)] bg-white"
      >
        <div className="relative aspect-square overflow-hidden bg-[hsl(30,15%,94%)]">
          <img
            src={product.image}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {statusLabel && (
            <span className="absolute left-2 top-2 rounded-full bg-charcoal px-2 py-0.5 text-[9px] font-semibold text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
              {statusLabel}
            </span>
          )}
          <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-charcoal shadow-sm sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
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

        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <h3 className="line-clamp-2 text-xs font-semibold text-charcoal sm:text-sm">{product.name}</h3>
          <p className="mt-1 hidden text-xs leading-relaxed text-mid sm:line-clamp-2 sm:block">{product.description}</p>

          <div className="mt-auto pt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-bold text-charcoal tabular-nums sm:text-base">${product.price.toFixed(2)}</span>
            <button
              onClick={handleAdd}
              disabled={isSoldOut}
              className="flex w-full items-center justify-center gap-1 rounded-full bg-charcoal px-2.5 py-1.5 text-[11px] font-medium text-white transition-all hover:bg-[hsl(20,8%,28%)] disabled:cursor-not-allowed disabled:opacity-30 active:scale-95 sm:w-auto sm:gap-1.5 sm:px-3 sm:text-xs"
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
        </div>
      </motion.div>
    </Link>
  );
}
