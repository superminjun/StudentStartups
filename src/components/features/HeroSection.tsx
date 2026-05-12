import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  const { lang } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const visualY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.35]);
  const localCopy = lang === 'ko'
    ? {
        badge: 'Student Startups Canada',
        title: '학생들이 실제 회사를 만드는 곳.',
        subtitle: 'Student Startups Canada는 고등학생과 대학생이 팀을 찾고, 아이디어를 검증하고, 실제 프로젝트를 출시하는 학생 창업 플랫폼입니다.',
        primary: '스타트업 보기',
        secondary: '커뮤니티 참여',
        tertiary: '빌더 만나기',
      }
    : {
        badge: 'Student Startups Canada',
        title: 'Where Students Build Real Businesses.',
        subtitle: 'A student founder platform for building startups, finding ambitious collaborators, and launching projects that matter.',
        primary: 'Explore Startups',
        secondary: 'Join the Community',
        tertiary: 'Meet the Builders',
      };

  return (
    <section ref={ref} id="intro" className="relative min-h-[92vh] overflow-hidden bg-background pt-24 scroll-mt-24 sm:pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,hsl(var(--accent)/0.14),transparent_28%),radial-gradient(circle_at_82%_10%,hsl(var(--foreground)/0.08),transparent_24%),linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--background))_68%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[-8rem] top-28 h-[32rem] w-[32rem] rounded-full border border-foreground/5 bg-gradient-to-br from-accent/10 to-transparent blur-2xl"
        style={{ y: visualY }}
      />

      <motion.div className="relative z-10 mx-auto grid min-h-[calc(92vh-6rem)] w-full max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.03fr_0.97fr]" style={{ opacity }}>
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/75 px-3.5 py-2 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-xl"
          >
            <Sparkles className="size-3.5 text-accent" />
            {localCopy.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.065em] text-foreground sm:text-6xl lg:text-7xl xl:text-8xl whitespace-pre-line"
          >
            {localCopy.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.58 }}
            className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl"
          >
            {localCopy.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/projects"
              className="btn btn-primary group px-7"
            >
              {localCopy.primary}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/contact" className="btn btn-secondary px-7">
              {localCopy.secondary}
            </Link>
            <Link to="/team" className="btn btn-ghost px-4">
              {localCopy.tertiary}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 0.5 }}
            className="mt-12 grid max-w-2xl grid-cols-3 gap-3"
          >
            {[
              ['Build Week', lang === 'ko' ? '아이디어를 프로토타입으로' : 'Idea to prototype'],
              ['Pitch Day', lang === 'ko' ? '실제 피드백과 발표' : 'Real feedback'],
              ['Demo Day', lang === 'ko' ? '출시 기록 만들기' : 'Launch record'],
            ].map(([label, sub]) => (
              <div key={label} className="rounded-2xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 28, rotateX: 8 }}
          animate={{ opacity: 1, x: 0, rotateX: 0 }}
          transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
          style={{ y: visualY }}
        >
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-accent/15 via-foreground/5 to-transparent blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/80 p-4 shadow-2xl shadow-foreground/10 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Founder OS</p>
                <p className="mt-1 text-lg font-semibold text-foreground">Student Startups Canada</p>
              </div>
              <div className="flex gap-1.5">
                {['bg-red-400', 'bg-yellow-400', 'bg-emerald-400'].map((color) => (
                  <span key={color} className={cn('size-2.5 rounded-full', color)} />
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="rounded-3xl border border-border bg-background p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Live project</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Campus idea → launch</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Teams validate demand, ship a first version, and build a record of outcomes.</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-600">Active</span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    ['7', 'Stages'],
                    ['3', 'Launches'],
                    ['$24k', 'Tracked'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl bg-muted/70 p-3">
                      <p className="text-lg font-semibold text-foreground">{value}</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Design sprint', 'Prototype ready', '72%'],
                  ['Founder matching', '4 skills needed', 'Live'],
                ].map(([titleText, detail, value]) => (
                  <div key={titleText} className="rounded-3xl border border-border bg-background p-4">
                    <p className="text-sm font-semibold text-foreground">{titleText}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-3/4 rounded-full bg-foreground" />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-muted-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
