import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CircleDot, Layers3, Sparkles } from 'lucide-react';
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
        eyebrow: '운영 현황',
        cycle: '진행 중인 사이클',
        title: '아이디어에서 출시까지',
        body: '프로젝트는 역할, 피드백, 판매, 검토를 거쳐 움직입니다.',
        stages: '단계',
        teams: '팀',
        review: '검토',
      }
    : {
        eyebrow: 'Live operating view',
        cycle: 'active cycle',
        title: 'Idea to launch',
        body: 'Projects move through roles, feedback, sales, and review.',
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
      className="relative min-h-[92vh] overflow-hidden scroll-mt-24 pt-20 sm:min-h-[680px] lg:pt-16"
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
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-warm-white))] via-[hsl(var(--color-beige))]/95 to-[hsl(var(--color-beige-dark))] opacity-90" />
          </div>
        ) : (
          <div className="size-full bg-[radial-gradient(circle_at_12%_18%,hsl(var(--color-accent)/0.16),transparent_28%),radial-gradient(circle_at_84%_18%,hsl(var(--color-charcoal)/0.08),transparent_30%),linear-gradient(135deg,hsl(var(--color-warm-white)),hsl(var(--color-beige))_45%,hsl(var(--color-beige-dark)))]" />
        )}
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-accent-soft blur-3xl opacity-45 animate-drift" />
        <div className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-72 w-72 rounded-full bg-beige-dark blur-3xl opacity-60 animate-drift-slow" />
        <div className="pointer-events-none absolute left-[20%] top-[30%] h-56 w-56 rounded-full bg-accent/15 blur-3xl opacity-60 animate-drift-slow" />
        <motion.div
          className="pointer-events-none absolute h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.045] blur-3xl"
          style={{ left: glowX, top: glowY }}
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-background/80 to-transparent" />

      <motion.div className="relative z-10 mx-auto grid min-h-[calc(92vh-5rem)] w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr]" style={{ opacity }}>
        <motion.div style={{ y: textY }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground shadow-sm backdrop-blur-xl"
          >
            <Sparkles className="size-3.5 text-accent" />
            {content.heroTagline || t('hero.tagline')}
          </motion.p>

          <TextReveal
            as="h1"
            text={heroTitle}
            delay={0.26}
            className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-7xl whitespace-pre-line"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg"
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
              data-cursor="view"
              data-magnetic="true"
              className="btn btn-primary group"
            >
              {content.heroCta || t('hero.cta')}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/about" data-cursor="open" data-magnetic="true" className="btn btn-secondary">
              {t('hero.secondaryCta')}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative hidden lg:block"
          data-cursor="live"
          style={{ y: visualY, rotateX, rotateY }}
        >
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-accent/15 via-card/20 to-transparent blur-3xl" />
          <motion.div
            className="relative overflow-hidden rounded-[2rem] border border-border bg-card/70 p-4 shadow-2xl shadow-foreground/10 backdrop-blur-2xl"
            initial={{ opacity: 0, y: 38, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{visualCopy.eyebrow}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">Student Startups</p>
              </div>
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-400" />
                <span className="size-2.5 rounded-full bg-yellow-400" />
                <span className="size-2.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              <motion.div
                className="rounded-3xl border border-border bg-background/80 p-5"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                      <CircleDot className="size-3.5" />
                      {visualCopy.cycle}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{visualCopy.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{visualCopy.body}</p>
                  </div>
                  <Layers3 className="size-5 text-muted-foreground" />
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-foreground"
                    initial={{ width: '12%' }}
                    animate={{ width: '72%' }}
                    transition={{ delay: 0.9, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </motion.div>

              <div className="grid grid-cols-3 gap-3">
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
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
