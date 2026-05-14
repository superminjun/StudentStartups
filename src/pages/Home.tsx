import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import HeroSection from '@/components/features/HeroSection';
import WorkflowSteps from '@/components/features/WorkflowSteps';
import ImpactCounters from '@/components/features/ImpactCounters';
import ProjectCard from '@/components/features/ProjectCard';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useSiteContentStore } from '@/stores/siteContentStore';
import { FolderOpen, DollarSign, Users, Heart, ArrowRight, Sparkles, Rocket, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();
  const { content } = useSiteContentStore();
  const projects = useCMSStore((s) => s.projects);
  const featuredProjects = useMemo(() => {
    const visibleProjects = projects.filter((project) => (project.status ?? 'active').toLowerCase() !== 'archived');
    const launchReady = visibleProjects.filter((project) => project.stage >= 6).slice(0, 3);
    if (launchReady.length) return launchReady;

    return [...visibleProjects]
      .sort((a, b) => (b.revenue + (b.fundraise ?? 0)) - (a.revenue + (a.fundraise ?? 0)))
      .slice(0, 3);
  }, [projects]);
  const activeProjectCount = projects.filter((project) => (project.status ?? 'active').toLowerCase() === 'active').length;

  const formatCurrencyValue = (value: string) => {
    const numeric = Number(value.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(numeric) || numeric === 0) return value;
    return `$${numeric.toLocaleString()}`;
  };

  const formatCountValue = (value: string) => {
    const hasPlus = value.trim().endsWith('+');
    const numeric = Number(value.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(numeric) || numeric === 0) return value;
    return `${numeric.toLocaleString()}${hasPlus ? '+' : ''}`;
  };

  const stats = [
    { icon: FolderOpen, key: 'stat1Label', value: formatCountValue(String(activeProjectCount)) },
    { icon: DollarSign, key: 'stat2Label', value: formatCurrencyValue(content.totalRevenue) },
    { icon: Users, key: 'stat3Label', value: formatCountValue(content.activeMembers) },
    { icon: Heart, key: 'stat4Label', value: formatCurrencyValue(content.totalDonated) },
  ];

  const valueProps = [
    { icon: Rocket, titleKey: 'valueProp.oneTitle', descKey: 'valueProp.oneDesc' },
    { icon: ShieldCheck, titleKey: 'valueProp.twoTitle', descKey: 'valueProp.twoDesc' },
    { icon: Sparkles, titleKey: 'valueProp.threeTitle', descKey: 'valueProp.threeDesc' },
  ];

  return (
    <div>
      <HeroSection />

      {/* Value */}
      <section id="value" className="section relative overflow-hidden bg-background scroll-mt-24">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-foreground/[0.12] to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-16 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ScrollReveal>
                <p className="section-kicker">{t('valueProp.kicker')}</p>
                <h2 className="section-title mt-3">
                  {t('valueProp.title')}
                </h2>
                <p className="section-lead">{t('valueProp.subtitle')}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <Link to="/about" data-magnetic="true" className="btn btn-secondary mt-8">
                  {t('common.learnMore')} <ArrowRight className="size-4" />
                </Link>
              </ScrollReveal>
            </div>

            <div>
              <div className="grid gap-5">
                {valueProps.map((item, i) => (
                  <ScrollReveal key={item.titleKey} delay={i * 0.08} direction={i % 2 === 0 ? 'left' : 'right'}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                      className="group grid gap-6 rounded-[2rem] border border-border bg-card/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-500 hover:border-foreground/15 hover:bg-card hover:shadow-2xl hover:shadow-foreground/5 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                    >
                      <div className="flex size-12 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105">
                        <item.icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight text-foreground">
                          {t(item.titleKey)}
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                          {t(item.descKey)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                        0{i + 1}
                      </span>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-border bg-border lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <ScrollReveal key={stat.key} delay={i * 0.05} direction="fade">
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-card/[0.85] p-5 backdrop-blur-xl transition-colors duration-300 hover:bg-card"
                    >
                      <stat.icon className="size-4 text-accent" />
                      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{stat.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t(`mission.${stat.key}`)}</p>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WorkflowSteps />

      {/* Proof */}
      <section id="proof" className="section relative overflow-hidden bg-beige scroll-mt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        <div className="pointer-events-none absolute right-[-12rem] top-24 h-[32rem] w-[32rem] rounded-full bg-card/70 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <ScrollReveal>
              <p className="section-kicker">{t('proof.kicker')}</p>
              <h2 className="section-title mt-3 max-w-3xl">{t('impactPreview.title')}</h2>
              <p className="section-lead">{t('impactPreview.subtitle')}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Link to="/projects" data-cursor="view" data-cursor-variant="image" data-magnetic="true" className="btn btn-secondary">
                {t('featured.viewAll')} <ArrowRight className="size-4" />
              </Link>
            </ScrollReveal>
          </div>

          <div className="mt-12">
            <ImpactCounters />
          </div>

          <ScrollReveal className="mt-20">
            <h3 className="text-xl font-semibold text-foreground">{t('featured.title')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('featured.subtitle')}</p>
          </ScrollReveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
              {featuredProjects.map((project, i) => (
                <ScrollReveal
                  key={project.id}
                  delay={i * 0.08}
                  className={i === 0 ? 'lg:col-span-6' : 'lg:col-span-3'}
                >
                  <ProjectCard project={project} priority={i < 3} />
                </ScrollReveal>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="section relative overflow-hidden bg-charcoal scroll-mt-24">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),transparent_36%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-x-6 top-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              {t('cta.title')}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/[0.55]">{t('cta.subtitle')}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              to="/contact"
              data-cursor="join"
              data-magnetic="true"
              className="btn btn-primary mt-8 shadow-2xl shadow-white/10"
            >
              {t('cta.button')}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
