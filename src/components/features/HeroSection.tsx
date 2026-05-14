import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSiteContentStore } from '@/stores/siteContentStore';
import TextReveal from './TextReveal';
import heroHomeImage from '@/assets/hero-home.jpg';

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
  const visualImageUrl = hasHeroImage ? heroBackgroundUrl : heroHomeImage;
  const visualCopy = lang === 'ko'
    ? {
        eyebrow: '작업 현장',
        cycle: '현재 운영 기록',
        title: '실제 팀, 실제 제약.',
        body: '프로젝트는 역할, 회의, 제품 결정, 판매, 공개 검토를 거쳐 움직입니다.',
        stages: '프로젝트',
        teams: '팀',
        review: '기록',
      }
    : {
        eyebrow: 'Inside the work',
        cycle: 'current operating record',
        title: 'Real teams. Real constraints.',
        body: 'Projects move through staffing, meetings, product decisions, sales, and public review.',
        stages: 'projects',
        teams: 'teams',
        review: 'record',
      };

  const heroNotes = lang === 'ko'
    ? [
        ['01', '역할이 있는 팀'],
        ['02', '기록되는 결정'],
        ['03', '공개되는 결과물'],
      ]
    : [
        ['01', 'Teams with roles'],
        ['02', 'Decisions recorded'],
        ['03', 'Work made public'],
      ];

  const refinedHeroCopy = lang === 'ko'
    ? {
        title: '일찍 시작하는 빌더를 위한 진지한 플랫폼입니다.',
        subtitle: 'Student Startups는 학생들이 실제 제품을 만들고, 팀을 운영하며, 검토를 버틸 만한 기록을 남기는 플랫폼입니다.',
        cta: '작업 보기',
      }
    : {
        title: 'A serious place for early builders.',
        subtitle: 'Student Startups is a platform for students developing real products, operating disciplined teams, and building a record that can be examined.',
        cta: 'Review the Work',
      };
  const normalizedHeroTitle = content.heroTitle?.replace(/\s+/g, ' ').trim() ?? '';
  const normalizedHeroSubtitle = content.heroSubtitle?.replace(/\s+/g, ' ').trim() ?? '';
  const normalizedHeroCta = content.heroCta?.replace(/\s+/g, ' ').trim() ?? '';
  const legacyHeroTitles = new Set([
    'Build something real before graduation.',
    'Where Students Build Real Businesses',
  ]);
  const legacyHeroSubtitles = new Set([
    'Find teammates, test ideas, launch products, and learn how startups actually work.',
    'Find teammates, test ideas, launch products, and learn how startups actually work while you are still in school.',
  ]);
  const legacyHeroCtas = new Set(['Start Building', 'Launch Your Idea', 'Build Your First Startup']);
  const heroTitle = legacyHeroTitles.has(normalizedHeroTitle) || normalizedHeroTitle.startsWith('Where Students Build')
    ? refinedHeroCopy.title
    : content.heroTitle || refinedHeroCopy.title;
  const heroSubtitle = legacyHeroSubtitles.has(normalizedHeroSubtitle)
    || normalizedHeroSubtitle.includes('while you are still in school')
    || normalizedHeroSubtitle.toLowerCase().includes('student-led entrepreneurship club')
    ? refinedHeroCopy.subtitle
    : content.heroSubtitle || refinedHeroCopy.subtitle;
  const heroCta = legacyHeroCtas.has(normalizedHeroCta)
    ? refinedHeroCopy.cta
    : content.heroCta || refinedHeroCopy.cta;

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
            transition={{ delay: 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground"
          >
            <span className="h-px w-9 bg-foreground/30" />
            {content.heroTagline || t('hero.tagline')}
          </motion.p>

          <TextReveal
            as="h1"
            text={heroTitle}
            delay={0.12}
            stagger={0.018}
            className="mt-7 max-w-3xl whitespace-pre-line text-4xl font-semibold leading-[1] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg"
          >
            {heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/projects"
              data-cursor="start"
              data-magnetic="true"
              className="btn btn-primary group px-7"
            >
              {heroCta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/about" data-magnetic="true" className="btn btn-secondary">
              {t('hero.secondaryCta')}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14 grid max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3"
          >
            {heroNotes.map(([index, label]) => (
              <div key={index} className="bg-card/[0.62] px-4 py-3 backdrop-blur-xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">{index}</p>
                <p className="mt-1 text-sm font-medium tracking-tight text-foreground">{label}</p>
              </div>
            ))}
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
            transition={{ delay: 0.16, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.9rem] bg-charcoal text-white">
              <motion.img
                src={visualImageUrl}
                alt=""
                loading="eager"
                decoding="async"
                className="size-full object-cover"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1.01, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/18 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/[0.62]">{visualCopy.eyebrow}</p>
                <h3 className="mt-4 max-w-sm text-3xl font-semibold leading-[1] tracking-[-0.045em]">
                  {visualCopy.title}
                </h3>
                <div className="mt-6 flex items-end justify-between gap-8">
                  <p className="max-w-xs text-sm leading-6 text-white/[0.68]">{visualCopy.body}</p>
                  <p className="hidden max-w-[7rem] text-right text-[10px] font-semibold uppercase tracking-[0.24em] text-white/[0.48] xl:block">
                    {visualCopy.cycle}
                  </p>
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
                    transition={{ delay: 0.36 + index * 0.05, duration: 0.42 }}
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
