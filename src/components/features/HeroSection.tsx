import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSiteContentStore } from '@/stores/siteContentStore';

export default function HeroSection() {
  const { t } = useLanguage();
  const { content } = useSiteContentStore();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const defaultHeroUrl = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&h=900&fit=crop';
  const heroBackgroundUrl = content.heroBackgroundUrl?.trim();
  const hasHeroImage = Boolean(heroBackgroundUrl && heroBackgroundUrl !== defaultHeroUrl);

  return (
    <section ref={ref} id="intro" className="relative h-[92vh] min-h-[560px] overflow-hidden scroll-mt-24 sm:min-h-[640px]">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {hasHeroImage ? (
          <div className="relative size-full">
            <img src={heroBackgroundUrl} alt="" loading="eager" decoding="async" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-warm-white))] via-[hsl(var(--color-beige))] to-[hsl(var(--color-beige-dark))] opacity-85" />
          </div>
        ) : (
          <div className="size-full bg-gradient-to-br from-[hsl(var(--color-warm-white))] via-[hsl(var(--color-beige))] to-[hsl(var(--color-beige-dark))]" />
        )}
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-accent-soft blur-3xl opacity-45 animate-drift" />
        <div className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-72 w-72 rounded-full bg-beige-dark blur-3xl opacity-60 animate-drift-slow" />
        <div className="pointer-events-none absolute left-[20%] top-[30%] h-56 w-56 rounded-full bg-accent/15 blur-3xl opacity-60 animate-drift-slow" />
      </motion.div>

      <motion.div className="relative z-10 flex h-full flex-col items-start justify-center px-4 sm:px-6" style={{ opacity }}>
        <div className="mx-auto w-full max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xs font-semibold tracking-[0.3em] text-mid uppercase"
          >
            {content.heroTagline || t('hero.tagline')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl whitespace-pre-line"
          >
            {content.heroTitle || t('hero.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {content.heroSubtitle || t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/projects"
              className="btn btn-primary group"
            >
              {content.heroCta || t('hero.cta')}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/about" className="btn btn-secondary">
              {t('hero.secondaryCta')}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
