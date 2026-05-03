import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="bg-beige pt-24 pb-16 lg:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-[hsl(30,12%,90%)] bg-white">
              <div className="aspect-square animate-pulse bg-[hsl(30,15%,92%)]" />
            </div>
            <div className="space-y-4">
              <div className="h-4 w-32 animate-pulse rounded bg-[hsl(30,12%,88%)]" />
              <div className="h-10 w-2/3 animate-pulse rounded bg-[hsl(30,12%,92%)]" />
              <div className="h-4 w-full animate-pulse rounded bg-[hsl(30,12%,92%)]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[hsl(30,12%,88%)]" />
              <div className="h-12 w-full animate-pulse rounded-full bg-[hsl(30,12%,90%)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-base text-light">Product not found.</p>
          <Link to="/shop" className="mt-4 inline-block text-sm font-medium text-charcoal underline">Back to Shop</Link>
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

  const statusColor = isSoldOut ? 'text-red-500'
    : product.status === 'in-production' ? 'text-amber-600'
    : 'text-emerald-600';

  return (
    <div>
      <section className="bg-beige pt-24 pb-16 lg:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link to="/shop" className="mb-6 inline-flex items-center gap-1.5 text-sm text-mid hover:text-charcoal transition-colors">
            <ArrowLeft className="size-4" />
            Back to Shop
          </Link>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Images */}
            <div>
              <ProductImageFrame
                fit="contain"
                containerClassName="rounded-2xl border border-[hsl(30,12%,90%)] bg-white p-2 sm:p-3"
                imageClassName="rounded-xl bg-white"
                src={allImages[activeImg]}
                alt={product.name}
                priority
                width={1400}
                height={1400}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {allImages.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        activeImg === i ? 'border-charcoal' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <ProductImageFrame
                        src={img}
                        alt=""
                        priority={false}
                        width={160}
                        height={160}
                        sizes="64px"
                        containerClassName="size-full rounded-md"
                        imageClassName="rounded-md"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-light">{product.category} · <span className="break-words">{product.term}</span></p>
              <h1 className="mt-2 text-2xl font-bold text-charcoal sm:text-3xl">{product.name}</h1>
              <p className="mt-4 whitespace-pre-line break-words text-base leading-relaxed text-mid">{product.description}</p>

              <div className="mt-6 flex flex-wrap items-baseline gap-4">
                <span className="text-3xl font-bold text-charcoal tabular-nums">${product.price.toFixed(2)}</span>
                <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
                <div className="rounded-full bg-[hsl(30,15%,94%)] px-3 py-1 text-xs font-semibold text-charcoal">
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
              </div>

              <button
                onClick={handleAdd}
                disabled={isSoldOut}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[hsl(20,8%,28%)] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
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
                className="mt-3 block text-center text-sm text-mid hover:text-charcoal transition-colors"
              >
                {t('shop.checkout')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ScrollReveal>
              <h2 className="text-xl font-bold text-charcoal">{t('shop.relatedProducts')}</h2>
            </ScrollReveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
