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
  const heroBackgroundUrl = content.heroBackgroundUrl?.trim();

  return (
    <section ref={ref} className="relative h-screen min-h-[640px] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {heroBackgroundUrl ? (
          <div className="relative size-full">
            <img src={heroBackgroundUrl} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(30,30%,98%)] via-[hsl(30,25%,95%)] to-[hsl(28,20%,90%)] opacity-80" />
          </div>
        ) : (
          <div className="size-full bg-gradient-to-br from-[hsl(30,30%,98%)] via-[hsl(30,25%,95%)] to-[hsl(28,20%,90%)]" />
        )}
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-[hsl(24,80%,90%)] blur-3xl opacity-45" />
        <div className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-72 w-72 rounded-full bg-[hsl(30,18%,88%)] blur-3xl opacity-60" />
      </motion.div>

      <motion.div className="relative z-10 flex h-full flex-col items-start justify-center px-6" style={{ opacity }}>
        <div className="mx-auto w-full max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm font-medium tracking-widest text-mid uppercase"
          >
            {content.heroTagline || t('hero.tagline')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-charcoal sm:text-5xl lg:text-6xl whitespace-pre-line"
          >
            {content.heroTitle || t('hero.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-mid sm:text-lg"
          >
            {content.heroSubtitle || t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-10"
          >
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 hover:bg-[hsl(20,8%,28%)] active:scale-[0.98]"
            >
              {content.heroCta || t('hero.cta')}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
