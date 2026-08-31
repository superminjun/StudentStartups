import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CircleDollarSign, Megaphone, PackageOpen, PenTool } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import MotionMark from '@/components/features/MotionMark';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useLanguage } from '@/hooks/useLanguage';
import { motionSpring, STAGGER } from '@/lib/motion';

export default function About() {
  const { lang, t } = useLanguage();
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const markRotate = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const markY = useTransform(scrollYProgress, [0, 1], ['0%', '45%']);
  const teams = [
    { title: t('about.teamCards.marketingName'), body: t('about.teamCards.marketingDesc'), icon: Megaphone, color: 'var(--ss-coral)', rotate: '-2deg' },
    { title: t('about.teamCards.productionName'), body: t('about.teamCards.productionDesc'), icon: PackageOpen, color: 'var(--ss-lime)', rotate: '1.5deg' },
    { title: t('about.teamCards.financeName'), body: t('about.teamCards.financeDesc'), icon: CircleDollarSign, color: 'var(--ss-sky)', rotate: '-1deg' },
    { title: t('about.teamCards.designName'), body: t('about.teamCards.designDesc'), icon: PenTool, color: 'var(--ss-violet)', rotate: '2deg' },
  ];
  const model = [
    [t('about.howRotation'), t('about.howRotationDesc')],
    [t('about.howVoting'), t('about.howVotingDesc')],
    [t('about.howRewards'), t('about.howRewardsDesc')],
  ];

  return (
    <div className="bg-[var(--ss-canvas)] pt-[4.75rem]">
      <section ref={heroRef} className="relative min-h-[92svh] overflow-hidden border-b border-black/10 px-5 py-16 sm:px-8 lg:py-24">
        <motion.div style={{ y: markY, rotate: markRotate }} className="absolute -right-24 top-14"><MotionMark className="size-[clamp(22rem,45vw,42rem)] opacity-55" /></motion.div>
        <div className="relative mx-auto flex min-h-[70svh] max-w-[90rem] flex-col justify-between">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.reveal} className="text-[10px] font-black uppercase tracking-[.28em] text-black/45">About / What holds the work together</motion.p>
          <div className="relative z-10 mt-24">
            <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 50, rotateX: 6, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }} transition={motionSpring.depth} className="max-w-[11ch] text-[clamp(4rem,10vw,10.5rem)] font-semibold leading-[.78] tracking-[-.095em]">{t('about.title')}</motion.h1>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .25 }} className="mt-12 grid gap-8 border-t border-black/20 pt-7 lg:grid-cols-[1fr_.65fr]">
              <p className="max-w-3xl text-[clamp(1.45rem,2.8vw,3rem)] font-medium leading-[1.08] tracking-[-.045em]">{t('about.subtitle')}</p>
              <p className="max-w-lg text-base leading-7 text-black/55">{t('mission.p2')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-[90rem]">
          <ScrollReveal className="grid gap-10 lg:grid-cols-[.55fr_1.45fr]"><p className="text-[10px] font-black uppercase tracking-[.28em] text-black/42">01 / Responsibility</p><h2 className="max-w-5xl text-[clamp(3.2rem,6.2vw,7rem)] font-semibold leading-[.88] tracking-[-.075em]">{t('about.teamsTitle')}</h2></ScrollReveal>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {teams.map(({ title, body, icon: Icon, color, rotate }, index) => (
              <ScrollReveal key={title} delay={index * STAGGER}>
                <motion.article whileHover={{ y: -13, rotate: 0 }} whileTap={{ scale: .97, y: 1 }} transition={motionSpring.press} className="flex min-h-[23rem] flex-col justify-between rounded-[1.8rem] border border-black/10 p-6 shadow-[0_22px_55px_rgba(18,18,18,.08)]" style={{ background: color, rotate }}>
                  <div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-full bg-white/65"><Icon className="size-5" /></span><span className="text-xs font-black">0{index + 1}</span></div>
                  <div><h3 className="text-3xl font-semibold tracking-[-.055em]">{title}</h3><p className="mt-4 text-sm leading-6 text-black/58">{body}</p></div>
                </motion.article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--ss-night)] px-5 py-24 text-white sm:px-8 lg:py-36">
        <div className="mx-auto grid max-w-[90rem] gap-16 lg:grid-cols-[.8fr_1.2fr]">
          <ScrollReveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[10px] font-black uppercase tracking-[.28em] text-white/40">02 / Operating model</p>
            <h2 className="mt-7 max-w-xl text-[clamp(3.2rem,5vw,6.2rem)] font-semibold leading-[.86] tracking-[-.075em]">{t('about.teamWheelTitle')}</h2>
            <p className="mt-7 max-w-md text-base leading-7 text-white/52">{t('about.teamWheelDesc')}</p>
            <div className="relative mt-12 hidden h-56 overflow-hidden lg:block"><MotionMark dark className="absolute left-4 top-2 size-48" /></div>
          </ScrollReveal>
          <div className="border-t border-white/25">
            {model.map(([title, body], index) => (
              <ScrollReveal key={title} delay={index * STAGGER} amount={.25}>
                <motion.article whileHover={{ x: 10 }} transition={motionSpring.state} className="grid min-h-[18rem] gap-8 border-b border-white/15 py-10 sm:grid-cols-[4rem_1fr]">
                  <p className="text-xs font-black text-white/35">0{index + 1}</p>
                  <div><h3 className="text-[clamp(2rem,4vw,4.5rem)] font-semibold leading-none tracking-[-.065em]">{title}</h3><p className="mt-6 max-w-2xl text-base leading-7 text-white/52">{body}</p><div className="mt-10 h-1 w-full overflow-hidden rounded-full bg-white/10"><motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ ...motionSpring.depth, delay: .12 }} className="h-full origin-left" style={{ background: ['var(--ss-coral)', 'var(--ss-lime)', 'var(--ss-sky)'][index] }} /></div></div>
                </motion.article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--ss-sand)] px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-[90rem]">
          <ScrollReveal><p className="text-[10px] font-black uppercase tracking-[.28em] text-black/45">03 / People</p><h2 className="mt-5 max-w-5xl text-[clamp(3.4rem,7vw,8rem)] font-semibold leading-[.84] tracking-[-.08em]">{lang === 'ko' ? '결국, 사람이 일을 움직입니다.' : 'In the end, people move the work.'}</h2></ScrollReveal>
          <ScrollReveal delay={.1} className="mt-12 flex justify-end"><motion.div whileTap={{ scale: .97, y: 1 }} transition={motionSpring.press}><Link to="/team" className="group inline-flex items-center gap-3 rounded-full bg-black px-6 py-4 text-sm font-bold text-white">{t('nav.team')}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></motion.div></ScrollReveal>
        </div>
      </section>
    </div>
  );
}
