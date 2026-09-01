import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CircleDollarSign, Megaphone, PackageOpen, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useLanguage } from '@/hooks/useLanguage';
import { motionSpring, STAGGER } from '@/lib/motion';

export default function About() {
  const { lang, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const teams = [
    { title: t('about.teamCards.marketingName'), body: t('about.teamCards.marketingDesc'), icon: Megaphone },
    { title: t('about.teamCards.productionName'), body: t('about.teamCards.productionDesc'), icon: PackageOpen },
    { title: t('about.teamCards.financeName'), body: t('about.teamCards.financeDesc'), icon: CircleDollarSign },
    { title: t('about.teamCards.designName'), body: t('about.teamCards.designDesc'), icon: PenTool },
  ];
  const model = [
    [t('about.howRotation'), t('about.howRotationDesc')],
    [t('about.howVoting'), t('about.howVotingDesc')],
    [t('about.howRewards'), t('about.howRewardsDesc')],
  ];

  return (
    <div className="bg-[var(--ss-canvas)] pt-[4.75rem]">
      <section className="relative min-h-[74svh] overflow-hidden border-b border-black/10 px-5 py-16 sm:px-8 lg:py-24">
        <div className="relative mx-auto flex min-h-[54svh] max-w-[90rem] flex-col justify-between">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.reveal} className="ss-label text-black/45">About / What holds the work together</motion.p>
          <div className="relative z-10 mt-24">
            <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 32, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={motionSpring.depth} className="ss-display max-w-[16ch]">{t('about.title')}</motion.h1>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .25 }} className="mt-12 grid gap-8 border-t border-black/20 pt-7 lg:grid-cols-[1fr_.65fr]">
              <p className="ss-lead max-w-3xl">{t('about.subtitle')}</p>
              <p className="max-w-lg text-base leading-7 text-black/55">{t('mission.p2')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-[90rem]">
          <ScrollReveal className="grid gap-10 lg:grid-cols-[.55fr_1.45fr]"><p className="ss-label text-black/42">01 / Responsibility</p><h2 className="ss-heading max-w-4xl">{t('about.teamsTitle')}</h2></ScrollReveal>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {teams.map(({ title, body, icon: Icon }, index) => (
              <ScrollReveal key={title} delay={index * STAGGER}>
                <article className="flex min-h-72 flex-col justify-between border-t border-black/30 py-6">
                  <div className="flex items-start justify-between"><Icon className="size-5 text-[var(--ss-bronze)]" /><span className="text-xs font-medium text-black/35">0{index + 1}</span></div>
                  <div><h3 className="text-3xl font-semibold tracking-[-.055em]">{title}</h3><p className="mt-4 text-sm leading-6 text-black/58">{body}</p></div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--ss-night)] px-5 py-24 text-white sm:px-8 lg:py-36">
        <div className="mx-auto grid max-w-[90rem] gap-16 lg:grid-cols-[.8fr_1.2fr]">
          <ScrollReveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="ss-label text-white/40">02 / Operating model</p>
            <h2 className="ss-heading mt-7 max-w-xl">{t('about.teamWheelTitle')}</h2>
            <p className="mt-7 max-w-md text-base leading-7 text-white/52">{t('about.teamWheelDesc')}</p>
            <div className="relative mt-12 hidden h-56 overflow-hidden lg:block"><MotionMark dark className="absolute left-4 top-2 size-48" /></div>
          </ScrollReveal>
          <div className="border-t border-white/25">
            {model.map(([title, body], index) => (
              <ScrollReveal key={title} delay={index * STAGGER} amount={.25}>
                <article className="grid min-h-[18rem] gap-8 border-b border-white/15 py-10 sm:grid-cols-[4rem_1fr]">
                  <p className="text-xs font-black text-white/35">0{index + 1}</p>
                  <div><h3 className="ss-title">{title}</h3><p className="mt-6 max-w-2xl text-base leading-7 text-white/52">{body}</p><div className="mt-10 h-px w-full overflow-hidden bg-white/10"><motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ ...motionSpring.depth, delay: .12 }} className="h-full origin-left bg-[var(--ss-bronze)]" /></div></div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--ss-sand)] px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-[90rem]">
          <ScrollReveal><p className="ss-label text-black/45">03 / People</p><h2 className="ss-display mt-5 max-w-4xl">{lang === 'ko' ? '결국, 사람이 일을 움직입니다.' : 'In the end, people move the work.'}</h2></ScrollReveal>
          <ScrollReveal delay={.1} className="mt-12 flex justify-end"><motion.div whileTap={{ scale: .97, y: 1 }} transition={motionSpring.press}><Link to="/team" className="group inline-flex items-center gap-3 rounded-full bg-black px-6 py-4 text-sm font-bold text-white">{t('nav.team')}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></motion.div></ScrollReveal>
        </div>
      </section>
    </div>
  );
}
