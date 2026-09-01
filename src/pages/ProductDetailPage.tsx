import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import { useCMSStore } from '@/stores/cmsStore';
import ProductCard from '@/components/features/ProductCard';
import ProductImageFrame from '@/components/features/ProductImageFrame';
import ScrollReveal from '@/components/features/ScrollReveal';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const products = useCMSStore((s) => s.products);
  const status = useCMSStore((s) => s.status);
  const product = products.find((p) => p.id === id);

  if (status === 'loading' && !product) {
    return (
      <div className="bg-[var(--ss-paper)] pb-16 pt-28">
        <div className="ss-wrap">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="overflow-hidden bg-[var(--ss-surface)]">
              <div className="aspect-square animate-pulse bg-[var(--ss-panel)]" />
            </div>
            <div className="space-y-4">
              <div className="h-4 w-32 animate-pulse rounded bg-[hsl(30,12%,88%)]" />
              <div className="h-10 w-2/3 animate-pulse rounded bg-[hsl(30,12%,92%)]" />
              <div className="h-4 w-full animate-pulse rounded bg-[hsl(30,12%,92%)]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[hsl(30,12%,88%)]" />
              <div className="h-12 w-full animate-pulse bg-[var(--ss-panel)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ss-paper)] pt-16">
        <div className="text-center">
          <p className="text-sm text-[var(--ss-muted)]">{t('shop.productNotFound')}</p>
          <Link to="/shop" className="ss-link mt-4">{t('shop.backToShop')}</Link>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    if (isSoldOut) return;
    addItem(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const allImages = product.images.length > 0 ? product.images : [product.image];
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const cartQty = cartItems.find((i) => i.productId === product.id)?.quantity ?? 0;
  const availableStock = Math.max(product.inventory - cartQty, 0);
  const isSoldOut = availableStock <= 0 || product.status === 'sold-out';

  const statusLabel = isSoldOut ? t('shop.soldOut')
    : product.status === 'in-production' ? t('shop.inProduction')
    : t('shop.available');

  return (
    <div className="bg-[var(--ss-paper)] pt-[4.5rem]">
      <section className="ss-section">
        <div className="ss-wrap">
          <Link to="/shop" className="ss-link mb-8">
            <ArrowLeft className="size-4" />
            {t('shop.backToShop')}
          </Link>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* Images */}
            <div className="min-w-0">
              <motion.div initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0)' }} transition={{ duration: .9, ease: [.23, 1, .32, 1] }}><ProductImageFrame
                variant="detail"
                fit="cover"
                containerClassName="bg-[var(--ss-surface)]"
                src={allImages[activeImg]}
                alt={product.name}
                priority
                width={1400}
                height={1400}
                sizes="(max-width: 1024px) 100vw, 50vw"
              /></motion.div>
              {allImages.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`size-16 shrink-0 overflow-hidden border-b-2 transition-all ${
                        activeImg === i ? 'border-[var(--ss-accent)]' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <ProductImageFrame
                        src={img}
                        alt=""
                        fit="cover"
                        priority={false}
                        width={160}
                        height={160}
                        sizes="64px"
                        containerClassName="size-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="min-w-0">
              <p className="ss-label text-[var(--ss-accent)]">
                {product.category} · <span className="break-words [overflow-wrap:anywhere]">{product.term}</span>
              </p>
              <h1 className="ss-heading mt-4 break-words [overflow-wrap:anywhere]">{product.name}</h1>
              <p className="mt-6 whitespace-pre-line break-words text-[15px] leading-7 text-[var(--ss-muted)] [overflow-wrap:anywhere]">
                {product.description}
              </p>

              <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y border-[var(--ss-rule)] py-5">
                <span className="font-heading text-2xl font-medium tabular-nums">${product.price.toFixed(2)}</span>
                <span className="text-xs font-semibold uppercase tracking-[.08em] text-[var(--ss-muted)]">{statusLabel}</span>
                <span className="text-xs text-[var(--ss-muted)]">{t('shop.stocks')} <b className="font-semibold tabular-nums text-[var(--ss-ink)]">{availableStock}</b></span>
              </div>

              <button
                onClick={handleAdd}
                disabled={isSoldOut}
                className="btn btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-30"
              >
                {added ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <Check className="size-4" /> {t('shop.added')}
                  </motion.span>
                ) : (
                  <>
                    <ShoppingBag className="size-4" />
                    {product.status === 'in-production' ? t('shop.preOrder') : t('shop.addToCart')}
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="mt-4 block text-center text-xs font-semibold uppercase tracking-[.08em] text-[var(--ss-muted)] transition-colors hover:text-[var(--ss-ink)]"
              >
                {t('shop.checkout')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="ss-section border-t border-[var(--ss-rule)] bg-[var(--ss-surface)]">
          <div className="ss-wrap">
            <ScrollReveal>
              <h2 className="ss-title">{t('shop.relatedProducts')}</h2>
            </ScrollReveal>
            <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.06}>
                  <ProductCard product={p} priority={i < 2} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
