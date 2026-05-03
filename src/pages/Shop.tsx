import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import { TERMS } from '@/constants/config';
import ProductCard from '@/components/features/ProductCard';
import ScrollReveal from '@/components/features/ScrollReveal';

export default function Shop() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTerm, setActiveTerm] = useState('All');
  const products = useCMSStore((s) => s.products);
  const status = useCMSStore((s) => s.status);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))].sort();
    return ['All', ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== 'All') result = result.filter((p) => p.category === activeCategory);
    if (activeTerm !== 'All') result = result.filter((p) => p.term === activeTerm);
    return result;
  }, [products, activeCategory, activeTerm]);

  const showSkeleton = status === 'loading' && products.length === 0;

  return (
    <div>
      <section className="bg-charcoal pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {t('shop.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3 max-w-xl text-base text-white/50"
          >
            {t('shop.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="bg-beige py-10 lg:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Term filter */}
          <ScrollReveal>
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-light sm:text-xs">Term / Rotation</p>
              <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 scrollbar-thin">
                <div className="flex min-w-max gap-2">
                <button
                  onClick={() => setActiveTerm('All')}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 sm:text-sm ${
                    activeTerm === 'All' ? 'bg-charcoal text-white' : 'bg-white text-mid hover:text-charcoal border border-[hsl(30,12%,90%)]'
                  }`}
                >
                  {t('shop.allTerms')}
                </button>
                {TERMS.map((term) => (
                  <button
                    key={term}
                    onClick={() => setActiveTerm(term)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 sm:text-sm ${
                      activeTerm === term ? 'bg-charcoal text-white' : 'bg-white text-mid hover:text-charcoal border border-[hsl(30,12%,90%)]'
                    }`}
                  >
                    {term}
                  </button>
                ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Category filter */}
          <ScrollReveal>
            <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 scrollbar-thin">
              <div className="flex min-w-max gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 sm:text-sm ${
                      activeCategory === cat ? 'bg-charcoal text-white' : 'bg-white text-mid hover:text-charcoal border border-[hsl(30,12%,90%)]'
                    }`}
                  >
                    {cat === 'All' ? t('shop.allCategories') : cat}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {showSkeleton ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-[hsl(30,12%,90%)] bg-white"
                >
                  <div className="aspect-square animate-pulse bg-[hsl(30,15%,92%)]" />
                  <div className="space-y-2 p-3 sm:p-4">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-[hsl(30,12%,88%)]" />
                    <div className="h-3 w-full animate-pulse rounded bg-[hsl(30,12%,92%)]" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-[hsl(30,12%,88%)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-base text-light">No products found.</p>
            </div>
          ) : (
            <motion.div
              key={`${activeCategory}-${activeTerm}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
            >
              {filtered.map((product, i) => (
                <ScrollReveal key={product.id} delay={Math.min(i * 0.04, 0.25)}>
                  <ProductCard product={product} priority={i < 6} />
                </ScrollReveal>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
