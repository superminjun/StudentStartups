import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import { useCMSStore } from '@/stores/cmsStore';
import ProductCard from '@/components/features/ProductCard';
import ScrollReveal from '@/components/features/ScrollReveal';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const products = useCMSStore((s) => s.products);
  const product = products.find((p) => p.id === id);

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

  const cartQty = cartItems.find((i) => i.productId === product.id)?.quantity ?? 0;
  const availableStock = Math.max(product.inventory, 0);
  const isPreOrderOpen = product.status === 'in-production' && product.isPreOrder;
  const isSoldOut = product.status === 'sold-out' || availableStock <= 0;
  const canAddToCart = !isSoldOut && (product.status === 'available' || isPreOrderOpen);

  const handleAdd = async () => {
    if (!canAddToCart) return;
    const ok = await addItem(product);
    if (!ok) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const allImages = Array.from(new Set([product.image, ...(product.images ?? [])].filter(Boolean)));
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const statusLabel = isSoldOut ? t('shop.soldOut')
    : isPreOrderOpen ? t('shop.preOrder')
    : product.status === 'in-production' ? t('shop.inProduction')
    : t('shop.available');

  const statusColor = isSoldOut ? 'text-red-500'
    : isPreOrderOpen ? 'text-amber-600'
    : product.status === 'in-production' ? 'text-amber-600'
    : 'text-emerald-600';

  return (
    <div>
      <section className="bg-beige pt-24 pb-16 lg:pt-28">
        <div className="mx-auto max-w-6xl px-6">
          <Link to="/shop" className="mb-6 inline-flex items-center gap-1.5 text-sm text-mid hover:text-charcoal transition-colors">
            <ArrowLeft className="size-4" />
            Back to Shop
          </Link>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Images */}
            <div>
              <div className="overflow-hidden rounded-xl bg-card border border-border">
                <img
                  src={allImages[activeImg]}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full object-cover"
                />
              </div>
              {allImages.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`size-16 overflow-hidden rounded-lg border-2 transition-all ${
                        activeImg === i ? 'border-charcoal' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-light">{product.category} · {product.term}</p>
              <h1 className="mt-2 text-2xl font-bold text-charcoal sm:text-3xl">{product.name}</h1>
              <p className="mt-4 text-base leading-relaxed text-mid">{product.description}</p>

              <div className="mt-6 flex flex-wrap items-baseline gap-4">
                <span className="text-3xl font-bold text-charcoal tabular-nums">${product.price.toFixed(2)}</span>
                <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
                <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-charcoal">
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
                disabled={!canAddToCart}
                className="btn btn-primary btn-lg mt-8 w-full disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {added ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <Check className="size-4" /> {t('shop.added')}
                  </motion.span>
                ) : (
                  <>
                    <ShoppingBag className="size-4" />
                    {isSoldOut
                      ? t('shop.soldOut')
                      : isPreOrderOpen
                        ? t('shop.preOrder')
                        : product.status === 'in-production'
                          ? t('shop.inProduction')
                          : t('shop.addToCart')}
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('shop.checkout')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-card py-14">
          <div className="mx-auto max-w-6xl px-6">
            <ScrollReveal>
              <h2 className="text-xl font-bold text-charcoal">{t('shop.relatedProducts')}</h2>
            </ScrollReveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.06}>
                  <ProductCard product={p} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
