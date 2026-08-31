import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import ScrollReveal from '@/components/features/ScrollReveal';

export default function About() {
  const { t } = useLanguage();
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
    <div className="pt-[4.5rem]">
      <section className="border-b border-border bg-background py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end"
          >
            <div>
              <p className="section-kicker">{t('nav.about')}</p>
              <h1 className="mt-6 max-w-5xl font-heading text-[clamp(3.2rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-foreground">
                {t('about.title')}
              </h1>
            </div>
            <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">{t('about.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="bg-card py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.6fr_1.4fr] lg:gap-24">
          <ScrollReveal>
            <p className="section-kicker">{t('mission.title')}</p>
          </ScrollReveal>
          <div>
            <ScrollReveal>
              <p className="max-w-5xl font-heading text-3xl font-medium leading-[1.18] tracking-[-0.04em] text-foreground sm:text-5xl">
                {t('mission.p1')}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <p className="mt-10 max-w-2xl text-base leading-8 text-muted-foreground">{t('mission.p2')}</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ScrollReveal className="border-b border-foreground pb-7">
            <p className="section-kicker">{t('about.teamsTitle')}</p>
            <h2 className="section-title mt-5 max-w-4xl">{t('valueProp.twoTitle')}</h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {teams.map(([title, description], index) => (
              <ScrollReveal key={title} delay={index * 0.05}>
                <article className={`border-b border-border py-8 sm:min-h-64 sm:border-r ${index === 0 ? 'sm:pr-6' : 'sm:px-6'} ${index === teams.length - 1 ? 'lg:border-r-0' : ''}`}>
                  <p className="text-xs font-semibold text-muted-foreground">0{index + 1}</p>
                  <h3 className="mt-10 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
                  <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">{description}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground py-20 text-background sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-background/50">{t('about.howTitle')}</p>
              <h2 className="mt-5 max-w-lg font-heading text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                {t('about.teamWheelTitle')}
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-background/60">{t('about.teamWheelDesc')}</p>
            </ScrollReveal>

            <div className="border-t border-background/35">
              {model.map(([title, description], index) => (
                <ScrollReveal key={title} delay={index * 0.05}>
                  <div className="grid gap-4 border-b border-background/20 py-8 sm:grid-cols-[3rem_0.8fr_1.2fr]">
                    <p className="text-xs text-background/45">0{index + 1}</p>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm leading-7 text-background/60">{description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="section-kicker">{t('nav.team')}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t('teamPage.title')}</h2>
          </div>
          <Link to="/team" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent">
            {t('nav.team')} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
