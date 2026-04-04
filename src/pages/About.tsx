import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import TeamCard from '@/components/features/TeamCard';
import ScrollReveal from '@/components/features/ScrollReveal';

const howSteps = [
  { num: '01', titleKey: 'about.howRotation', descKey: 'about.howRotationDesc' },
  { num: '02', titleKey: 'about.howVoting', descKey: 'about.howVotingDesc' },
  { num: '03', titleKey: 'about.howRewards', descKey: 'about.howRewardsDesc' },
];

const teamInfos = [
  { nameKey: 'about.teamCards.marketingName', descKey: 'about.teamCards.marketingDesc', icon: 'megaphone', color: 'from-rose-500 to-orange-400' },
  { nameKey: 'about.teamCards.productionName', descKey: 'about.teamCards.productionDesc', icon: 'hammer', color: 'from-blue-500 to-cyan-400' },
  { nameKey: 'about.teamCards.financeName', descKey: 'about.teamCards.financeDesc', icon: 'piggybank', color: 'from-emerald-500 to-teal-400' },
  { nameKey: 'about.teamCards.designName', descKey: 'about.teamCards.designDesc', icon: 'palette', color: 'from-violet-500 to-purple-400' },
];

function ScrollTimeline() {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 0.8', 'end 0.3'] });

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-border lg:left-1/2 lg:-translate-x-px">
        <motion.div
          className="w-full bg-foreground origin-top"
          style={{ height: '100%', scaleY: scrollYProgress, transformOrigin: 'top' }}
        />
      </div>
      <div className="space-y-20 lg:space-y-24">
        {howSteps.map((step, i) => (
          <ScrollReveal key={step.num} delay={i * 0.1}>
            <div className={`relative flex items-start gap-8 pl-16 lg:pl-0 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
              <div className={`hidden lg:block lg:w-1/2 ${i % 2 === 0 ? 'lg:text-right lg:pr-16' : 'lg:pl-16'}`}>
                <span className="text-xs font-semibold text-muted-foreground tracking-widest">{step.num}</span>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{t(step.titleKey)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(step.descKey)}</p>
              </div>
              <div className="absolute left-3 lg:static lg:flex lg:w-0 lg:items-center lg:justify-center">
                <motion.div
                  whileInView={{ scale: [0.5, 1] }}
                  viewport={{ once: true }}
                  className="relative z-10 flex size-6 items-center justify-center rounded-full bg-foreground"
                >
                  <div className="size-2 rounded-full bg-card" />
                </motion.div>
              </div>
              <div className={`lg:w-1/2 ${i % 2 === 0 ? 'lg:pl-16' : 'lg:pr-16 lg:text-right'} lg:hidden`} />
              <div className="lg:hidden">
                <span className="text-xs font-semibold text-muted-foreground tracking-widest">{step.num}</span>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{t(step.titleKey)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(step.descKey)}</p>
              </div>
              <div className={`hidden lg:block lg:w-1/2 ${i % 2 === 0 ? '' : ''}`} />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

function TeamWheel() {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 0.7', 'end 0.3'] });
  const rotation = useTransform(scrollYProgress, [0, 1], [0, 360]);

  const colors = ['hsl(350,60%,55%)', 'hsl(210,70%,50%)', 'hsl(160,55%,45%)', 'hsl(270,50%,55%)'];

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
      <div className="relative size-64 shrink-0 lg:size-80">
        <motion.div style={{ rotate: rotation }} className="size-full">
          {teamInfos.map((team, i) => {
            const angle = (i * 360) / 4;
            const rad = (angle * Math.PI) / 180;
            const r = 42;
            const x = 50 + r * Math.cos(rad);
            const y = 50 + r * Math.sin(rad);
            return (
              <div
                key={team.nameKey}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <motion.div
                  style={{ rotate: useTransform(scrollYProgress, [0, 1], [0, -360]) }}
                  className="flex size-16 items-center justify-center rounded-full text-white text-xs font-bold shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="flex size-16 items-center justify-center rounded-full" style={{ backgroundColor: colors[i] }}>
                    <span className="text-center text-[11px] font-semibold leading-tight px-1">
                      {t(team.nameKey)}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex size-20 items-center justify-center rounded-full bg-foreground text-background">
            <span className="text-xs font-bold text-center leading-tight">
              {t('about.teamWheelCenterLine1')}<br />{t('about.teamWheelCenterLine2')}
            </span>
          </div>
        </div>
        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" />
        </svg>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-semibold text-foreground">
          {t('about.teamWheelTitle')}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t('about.teamWheelDesc')}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q, qi) => (
            <div key={q} className="card p-3">
              <p className="text-xs font-semibold text-muted-foreground">{q}</p>
              <div className="mt-2 space-y-1">
                {teamInfos.map((team, ti) => {
                  const rotated = teamInfos[(ti + qi) % 4];
                  return (
                    <div key={`${team.nameKey}-${q}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-2 rounded-full" style={{ backgroundColor: colors[(ti + qi) % 4] }} />
                      {t(rotated.nameKey)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="section bg-charcoal pt-32 lg:pt-40">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            {t('about.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 max-w-2xl text-base text-white/55"
          >
            {t('about.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="section bg-beige">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <h2 className="section-title">
              {t('about.teamsTitle')}
            </h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {teamInfos.map((team, i) => (
              <TeamCard key={team.nameKey} team={team} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-card">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <h2 className="section-title">
              {t('about.howTitle')}
            </h2>
          </ScrollReveal>
          <div className="mt-14">
            <ScrollTimeline />
          </div>
        </div>
      </section>

      <section className="section bg-beige">
        <div className="mx-auto max-w-6xl px-6">
          <TeamWheel />
        </div>
      </section>
    </div>
  );
}
