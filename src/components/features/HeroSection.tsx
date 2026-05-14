import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSiteContentStore } from '@/stores/siteContentStore';
import TextReveal from './TextReveal';

export default function HeroSection() {
  const { lang, t } = useLanguage();
  const { content } = useSiteContentStore();
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const visualY = useTransform(scrollYProgress, [0, 1], ['0%', '32%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const opacity = useTransform(scrollYProgress, [0, 0.78], [1, 0]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-1, 1], [4, -4]), { stiffness: 120, damping: 24 });
  const rotateY = useSpring(useTransform(pointerX, [-1, 1], [-5, 5]), { stiffness: 120, damping: 24 });
  const glowX = useSpring(useTransform(pointerX, [-1, 1], ['35%', '65%']), { stiffness: 100, damping: 24 });
  const glowY = useSpring(useTransform(pointerY, [-1, 1], ['25%', '65%']), { stiffness: 100, damping: 24 });
  const defaultHeroUrl = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&h=900&fit=crop';
  const heroBackgroundUrl = content.heroBackgroundUrl?.trim();
  const hasHeroImage = Boolean(heroBackgroundUrl && heroBackgroundUrl !== defaultHeroUrl);
  const visualCopy = lang === 'ko'
    ? {
        eyebrow: '스튜디오 시그널',
        cycle: '현재 빌드 사이클',
        title: 'Build / Test / Launch',
        body: '아이디어는 회의록이 아니라 제품, 피드백, 숫자로 검증됩니다.',
        stages: '단계',
        teams: '팀',
        review: '검토',
      }
    : {
        eyebrow: 'Studio signal',
        cycle: 'current build cycle',
        title: 'Build / Test / Launch',
        body: 'Ideas are judged by products, feedback, and numbers — not pitch decks.',
        stages: 'stages',
        teams: 'teams',
        review: 'review',
      };

  const heroTitle = content.heroTitle || t('hero.title');

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section
      ref={ref}
      id="intro"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-[100svh] overflow-hidden scroll-mt-24 pt-20 sm:min-h-[760px] lg:pt-16"
    >
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {hasHeroImage ? (
          <div className="relative size-full">
            <motion.img
              src={heroBackgroundUrl}
              alt=""
              loading="eager"
              decoding="async"
              className="size-full object-cover"
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-warm-white))] via-[hsl(var(--color-beige))]/95 to-[hsl(var(--color-beige-dark))] opacity-[0.92]" />
          </div>
        ) : (
          <div className="size-full bg-[linear-gradient(115deg,hsl(var(--color-warm-white))_0%,hsl(var(--color-beige))_46%,hsl(var(--color-beige-dark))_100%)]" />
        )}
        <div className="pointer-events-none absolute inset-y-0 left-[7%] hidden w-px bg-gradient-to-b from-transparent via-foreground/10 to-transparent lg:block" />
        <div className="pointer-events-none absolute bottom-[12%] right-[8%] hidden h-px w-[34rem] bg-gradient-to-r from-transparent via-foreground/10 to-transparent lg:block" />
        <motion.div
          className="pointer-events-none absolute h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.035] blur-3xl"
          style={{ left: glowX, top: glowY }}
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-background/90 to-transparent" />

      <motion.div className="relative z-10 mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20" style={{ opacity }}>
        <motion.div className="max-w-4xl" style={{ y: textY }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground"
          >
            <span className="h-px w-9 bg-foreground/30" />
            {content.heroTagline || t('hero.tagline')}
          </motion.p>

          <TextReveal
            as="h1"
            text={heroTitle}
            delay={0.26}
            className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-foreground sm:text-6xl lg:text-8xl whitespace-pre-line"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg"
          >
            {content.heroSubtitle || t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.74, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/projects"
              data-cursor="start"
              data-magnetic="true"
              className="btn btn-primary group px-7"
            >
              {content.heroCta || t('hero.cta')}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/about" data-magnetic="true" className="btn btn-secondary">
              {t('hero.secondaryCta')}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative hidden lg:block"
          data-cursor="view"
          data-cursor-variant="image"
          style={{ y: visualY, rotateX, rotateY }}
        >
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-foreground/[0.08] via-card/30 to-transparent blur-3xl" />
          <motion.div
            className="relative overflow-hidden rounded-[2.4rem] border border-white/80 bg-card/[0.72] p-4 shadow-[0_40px_120px_rgba(40,34,30,0.14)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 38, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.9rem] bg-[linear-gradient(145deg,hsl(var(--color-charcoal)),hsl(var(--color-dark))_48%,hsl(var(--color-beige-dark)))] p-6 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.24),transparent_24%),radial-gradient(circle_at_78%_70%,rgba(244,119,46,0.26),transparent_28%)]" />
              <div className="absolute left-6 right-6 top-20 h-px bg-white/[0.18]" />
              <div className="absolute bottom-6 left-6 top-6 w-px bg-white/[0.18]" />
              <motion.div
                className="absolute right-8 top-10 h-40 w-28 rounded-full border border-white/[0.18]"
                animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute bottom-12 right-10 h-32 w-48 rounded-[2rem] border border-white/[0.18] bg-white/10 backdrop-blur-xl"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/[0.54]">{visualCopy.eyebrow}</p>
                  <h3 className="mt-8 max-w-sm text-5xl font-semibold leading-[0.95] tracking-[-0.055em]">
                    {visualCopy.title}
                  </h3>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-8">
                  <p className="max-w-xs text-sm leading-6 text-white/[0.64]">{visualCopy.body}</p>
                  <div className="text-right">
                    <p className="text-6xl font-semibold leading-none tracking-[-0.08em]">01</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.26em] text-white/[0.46]">{visualCopy.cycle}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  ['7', visualCopy.stages],
                  ['4', visualCopy.teams],
                  [lang === 'ko' ? '진행' : 'live', visualCopy.review],
                ].map(([value, label], index) => (
                  <motion.div
                    key={label}
                    className="rounded-2xl border border-border bg-background/70 p-4"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.08, duration: 0.55 }}
                  >
                    <p className="text-xl font-semibold text-foreground">{value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
