import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/types';
import ProductImageFrame from './ProductImageFrame';

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
    <motion.article whileHover={{ y: -3 }} transition={{ duration: .2 }} className="group flex h-full min-w-0 flex-col border-t border-[var(--ss-rule)] pt-4">
        <Link to={`/shop/${product.id}`} className="relative block overflow-hidden bg-[var(--ss-panel)]">
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductImageFrame
              src={product.image}
              alt={product.name}
              priority={priority}
              width={900}
              height={900}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              imageClassName="transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </motion.div>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ y: 0 }}
            whileInView={{ y: '101%' }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.62, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          />
          {isSoldOut && (
            <div className="absolute inset-0 bg-[var(--ss-navy)]/35" />
          )}
        </Link>

        <div className="flex flex-1 flex-col pt-4">
          <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[.1em] text-[var(--ss-muted)]"><span>{statusLabel ?? t('shop.available')}</span><span>{t('shop.stocks')} {availableStock}</span></div>
          <Link to={`/shop/${product.id}`} className="mt-3 block"><h3 className="line-clamp-2 break-words font-heading text-base font-medium text-[var(--ss-ink)] [overflow-wrap:anywhere] sm:text-lg">{product.name}</h3></Link>
          <p className="mt-2 hidden text-xs leading-relaxed text-[var(--ss-muted)] [overflow-wrap:anywhere] sm:line-clamp-2 sm:block">{product.description}</p>

          <div className="mt-auto pt-3">
            <div className="flex flex-col gap-3 border-t border-[var(--ss-rule)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-[var(--ss-ink)] tabular-nums sm:text-base">${product.price.toFixed(2)}</span>
            <button
              onClick={handleAdd}
              disabled={isSoldOut}
              data-cursor={isSoldOut ? undefined : 'add'}
              data-magnetic="true"
              className="flex min-h-9 w-full items-center justify-center gap-1 bg-[var(--ss-navy)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[.06em] text-white transition-colors hover:bg-[var(--ss-accent)] disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
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
    </motion.article>
  );
}
