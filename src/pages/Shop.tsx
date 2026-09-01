import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import { useSiteContentStore } from '@/stores/siteContentStore';
import { TERMS } from '@/constants/config';
import ProductCard from '@/components/features/ProductCard';
import ScrollReveal from '@/components/features/ScrollReveal';

const parseTermOptions = (value: string) => {
  const parsed = value
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean);
  return parsed.length ? parsed : TERMS;
};

export default function Shop() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTerm, setActiveTerm] = useState('All');
  const products = useCMSStore((s) => s.products);
  const status = useCMSStore((s) => s.status);
  const shopTerms = useSiteContentStore((s) => s.content.shopTerms);
  const termOptions = useMemo(() => parseTermOptions(shopTerms), [shopTerms]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))].sort();
    return ['All', ...cats];
  }, [products]);

  useEffect(() => {
    if (activeTerm !== 'All' && !termOptions.includes(activeTerm)) {
      setActiveTerm('All');
    }
  }, [activeTerm, termOptions]);

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== 'All') result = result.filter((p) => p.category === activeCategory);
    if (activeTerm !== 'All') result = result.filter((p) => p.term === activeTerm);
    return result;
  }, [products, activeCategory, activeTerm]);

  const showSkeleton = status === 'loading' && products.length === 0;

  return (
    <div className="bg-[var(--ss-paper)] pt-[4.5rem]">
      <header className="border-b border-[var(--ss-rule)] py-16 lg:py-20">
        <div className="ss-wrap grid gap-10 lg:grid-cols-[.38fr_1fr]">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ss-label text-[var(--ss-accent)]">{t('nav.shop')}</motion.p>
          <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="ss-display"
          >
            {t('shop.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-7 max-w-xl text-[15px] leading-7 text-[var(--ss-muted)]"
          >
            {t('shop.subtitle')}
          </motion.p>
          </div>
        </div>
      </header>

      <section className="ss-section bg-[var(--ss-surface)] pt-8">
        <div className="ss-wrap">
          <ScrollReveal>
            <div className="border-y border-[var(--ss-rule)] py-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--ss-muted)]">{t('shop.termFilter')}</p>
              <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0 scrollbar-thin">
                <div className="flex min-w-max gap-5">
                <button
                  onClick={() => setActiveTerm('All')}
                  className={`shrink-0 border-b px-0 py-1 text-xs font-semibold transition-colors ${
                    activeTerm === 'All' ? 'border-[var(--ss-accent)] text-[var(--ss-ink)]' : 'border-transparent text-[var(--ss-muted)] hover:text-[var(--ss-ink)]'
                  }`}
                >
                  {t('shop.allTerms')}
                </button>
                {termOptions.map((term) => (
                  <button
                    key={term}
                    onClick={() => setActiveTerm(term)}
                    className={`shrink-0 border-b px-0 py-1 text-xs font-semibold transition-colors ${
                      activeTerm === term ? 'border-[var(--ss-accent)] text-[var(--ss-ink)]' : 'border-transparent text-[var(--ss-muted)] hover:text-[var(--ss-ink)]'
                    }`}
                  >
                    {term}
                  </button>
                ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="-mx-5 overflow-x-auto border-b border-[var(--ss-rule)] px-5 py-5 sm:mx-0 sm:px-0 scrollbar-thin">
              <div className="flex min-w-max gap-5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 border-b px-0 py-1 text-xs font-semibold transition-colors ${
                      activeCategory === cat ? 'border-[var(--ss-accent)] text-[var(--ss-ink)]' : 'border-transparent text-[var(--ss-muted)] hover:text-[var(--ss-ink)]'
                    }`}
                  >
                    {cat === 'All' ? t('shop.allCategories') : cat}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {showSkeleton ? (
            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden border-t border-[var(--ss-rule)] pt-4"
                >
                  <div className="aspect-square animate-pulse bg-[var(--ss-panel)]" />
                  <div className="space-y-2 p-3 sm:p-4">
                    <div className="h-3 w-2/3 animate-pulse bg-[var(--ss-panel)]" />
                    <div className="h-3 w-full animate-pulse bg-[var(--ss-panel)]" />
                    <div className="h-3 w-1/2 animate-pulse bg-[var(--ss-panel)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-[var(--ss-muted)]">{t('shop.noProducts')}</p>
            </div>
          ) : (
            <motion.div
              key={`${activeCategory}-${activeTerm}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4"
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
