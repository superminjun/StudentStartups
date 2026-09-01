import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useLanguage } from '@/hooks/useLanguage';
import { motionSpring, STAGGER } from '@/lib/motion';

export default function About() {
  const { lang, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const teams = [
    [t('about.teamCards.marketingName'), t('about.teamCards.marketingDesc')],
    [t('about.teamCards.productionName'), t('about.teamCards.productionDesc')],
    [t('about.teamCards.financeName'), t('about.teamCards.financeDesc')],
    [t('about.teamCards.designName'), t('about.teamCards.designDesc')],
  ];
  const model = [
    [t('about.howRotation'), t('about.howRotationDesc')],
    [t('about.howVoting'), t('about.howVotingDesc')],
    [t('about.howRewards'), t('about.howRewardsDesc')],
  ];

  return (
    <div className="bg-[var(--ss-paper)] pt-[4.5rem]">
      <header className="border-b border-[var(--ss-rule)]">
        <div className="ss-wrap grid min-h-[66svh] items-end gap-10 py-16 lg:grid-cols-[.38fr_1fr] lg:py-20">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.reveal} className="ss-label self-start text-[var(--ss-accent)]">{t('nav.about')} · BNSS</motion.p>
          <div>
            <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.depth} className="ss-display max-w-[17ch]">{t('about.title')}</motion.h1>
            <motion.div initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .1 }} className="mt-9 grid gap-6 border-t border-[var(--ss-rule)] pt-6 md:grid-cols-2">
              <p className="text-[15px] leading-7 text-[var(--ss-ink)]">{t('about.subtitle')}</p>
              <p className="text-sm leading-7 text-[var(--ss-muted)]">{t('mission.p2')}</p>
            </motion.div>
          </div>
        </div>
      </header>

      <section className="ss-section bg-[var(--ss-surface)]">
        <div className="ss-wrap">
          <ScrollReveal className="grid gap-7 lg:grid-cols-[.38fr_1fr]"><p className="ss-label text-[var(--ss-accent)]">{t('about.teamsTitle')}</p><h2 className="ss-heading max-w-3xl">{t('about.teamWheelTitle')}</h2></ScrollReveal>
          <div className="mt-12 grid border-y border-[var(--ss-rule)] sm:grid-cols-2 lg:grid-cols-4">
            {teams.map(([title, body], index) => (
              <ScrollReveal key={title} delay={index * STAGGER}>
                <article className="min-h-60 border-b border-[var(--ss-rule)] py-6 sm:px-6 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0">
                  <p className="text-[10px] font-semibold tabular-nums tracking-[.12em] text-[var(--ss-muted)]">0{index + 1}</p>
                  <h3 className="mt-16 font-heading text-xl font-medium">{title}</h3>
                  <p className="mt-4 text-sm leading-6 text-[var(--ss-muted)]">{body}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ss-section bg-[var(--ss-navy)] text-white">
        <div className="ss-wrap grid gap-12 lg:grid-cols-[.38fr_1fr]">
          <ScrollReveal><p className="ss-label text-white/45">{t('about.howTitle')}</p><p className="mt-5 max-w-sm text-sm leading-7 text-white/55">{t('about.teamWheelDesc')}</p></ScrollReveal>
          <div className="border-t border-white/20">
            {model.map(([title, body], index) => (
              <ScrollReveal key={title} delay={index * STAGGER} amount={.2}>
                <article className="grid gap-5 border-b border-white/15 py-9 sm:grid-cols-[3rem_1fr]">
                  <p className="text-[10px] tabular-nums text-white/35">0{index + 1}</p>
                  <div><h3 className="font-heading text-xl font-medium">{title}</h3><p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">{body}</p></div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--ss-rule)] bg-[var(--ss-paper)] py-16 lg:py-20">
        <div className="ss-wrap flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <ScrollReveal><p className="ss-label text-[var(--ss-accent)]">{t('nav.team')}</p><h2 className="ss-heading mt-4 max-w-2xl">{lang === 'ko' ? '프로젝트는 학생들의 판단과 협업으로 완성됩니다.' : 'Projects are shaped by student judgment and collaboration.'}</h2></ScrollReveal>
          <Link to="/team" className="btn btn-primary shrink-0">{t('nav.team')}<ArrowRight className="size-4" /></Link>
        </div>
      </section>
    </div>
  );
}
