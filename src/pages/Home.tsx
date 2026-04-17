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
      <section id="value" className="section bg-beige scroll-mt-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <ScrollReveal>
                <p className="section-kicker">{t('valueProp.kicker')}</p>
                <h2 className="section-title mt-3">
                  {t('valueProp.title')}
                </h2>
                <p className="section-lead">{t('valueProp.subtitle')}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <Link to="/about" className="btn btn-secondary mt-6">
                  {t('common.learnMore')} <ArrowRight className="size-4" />
                </Link>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {valueProps.map((item, i) => (
                  <ScrollReveal key={item.titleKey} delay={i * 0.08} direction="scale">
                    <motion.div whileHover={{ y: -4 }} className="card card-hover p-5">
                      <div className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <item.icon className="size-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-foreground">
                        {t(item.titleKey)}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t(item.descKey)}
                      </p>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                  <ScrollReveal key={stat.key} delay={i * 0.06} direction="scale">
                    <motion.div whileHover={{ y: -2 }} className="card card-hover p-4">
                      <stat.icon className="size-4 text-accent" />
                      <p className="mt-2 text-lg font-semibold text-foreground tabular-nums">{stat.value}</p>
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
      <section id="proof" className="section bg-beige scroll-mt-24">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <p className="section-kicker">{t('proof.kicker')}</p>
            <h2 className="section-title mt-3">{t('impactPreview.title')}</h2>
            <p className="section-lead">{t('impactPreview.subtitle')}</p>
          </ScrollReveal>

          <div className="mt-10">
            <ImpactCounters />
          </div>

          <ScrollReveal className="mt-14">
            <h3 className="text-xl font-semibold text-foreground">{t('featured.title')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('featured.subtitle')}</p>
          </ScrollReveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <ScrollReveal key={project.id} delay={i * 0.08}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-10">
            <Link to="/projects" className="btn btn-secondary">
              {t('featured.viewAll')} <ArrowRight className="size-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="section bg-charcoal scroll-mt-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t('cta.title')}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-base text-white/50">{t('cta.subtitle')}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              to="/contact"
              className="btn btn-primary mt-8"
            >
              {t('cta.button')}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
