import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import { TERMS } from '@/constants/config';
import { useSiteContentStore } from '@/stores/siteContentStore';
import ProductCard from '@/components/features/ProductCard';
import ScrollReveal from '@/components/features/ScrollReveal';

export default function Shop() {
  const { t } = useLanguage();
  const { content } = useSiteContentStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTerm, setActiveTerm] = useState('All');
  const products = useCMSStore((s) => s.products);

  const parseTerms = (value: string) =>
    value
      .split(',')
      .map((term) => term.trim())
      .filter(Boolean);

  const termOptions = useMemo(() => {
    const parsed = parseTerms(content.shopTerms ?? '');
    return parsed.length ? parsed : TERMS;
  }, [content.shopTerms]);

  useEffect(() => {
    if (activeTerm !== 'All' && !termOptions.includes(activeTerm)) {
      setActiveTerm('All');
    }
  }, [activeTerm, termOptions]);

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

  return (
    <div>
      <section className="section bg-charcoal pt-32 lg:pt-40">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            {t('shop.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3 max-w-xl text-base text-white/55"
          >
            {t('shop.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="section-tight bg-beige">
        <div className="mx-auto max-w-6xl px-6">
          {/* Term filter */}
          <ScrollReveal>
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('shop.termFilter')}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTerm('All')}
                  className={`btn btn-sm ${activeTerm === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {t('shop.allTerms')}
                </button>
                {termOptions.map((term) => (
                  <button
                    key={term}
                    onClick={() => setActiveTerm(term)}
                    className={`btn btn-sm ${activeTerm === term ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Category filter */}
          <ScrollReveal>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {cat === 'All' ? t('shop.allCategories') : cat}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-base text-muted-foreground">{t('shop.noProducts')}</p>
            </div>
          ) : (
            <motion.div
              key={`${activeCategory}-${activeTerm}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {filtered.map((product, i) => (
                <ScrollReveal key={product.id} delay={Math.min(i * 0.04, 0.25)}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
