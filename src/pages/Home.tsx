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
import { FolderOpen, DollarSign, Users, Heart, ArrowRight } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();
  const { content } = useSiteContentStore();
  const projects = useCMSStore((s) => s.projects);
  const featuredProjects = projects.filter((p) => p.stage >= 6).slice(0, 3);

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
    { icon: FolderOpen, key: 'stat1Label', value: '22' },
    { icon: DollarSign, key: 'stat2Label', value: formatCurrencyValue(content.totalRevenue) },
    { icon: Users, key: 'stat3Label', value: formatCountValue(content.activeMembers) },
    { icon: Heart, key: 'stat4Label', value: formatCurrencyValue(content.totalDonated) },
  ];

  return (
    <div>
      <HeroSection />

      {/* Mission */}
      <section className="bg-beige py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <ScrollReveal>
                <h2 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
                  {t('mission.title')}
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="mt-5 text-base leading-relaxed text-mid">{t('mission.p1')}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="mt-3 text-base leading-relaxed text-mid">{t('mission.p2')}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <Link
                  to="/about"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal hover:text-[hsl(24,80%,50%)] transition-colors"
                >
                  {t('common.learnMore')} <ArrowRight className="size-4" />
                </Link>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                  <ScrollReveal key={stat.key} delay={i * 0.08} direction="scale">
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="rounded-xl border border-border bg-card p-5"
                    >
                      <stat.icon className="size-5 text-[hsl(24,80%,50%)]" />
                      <p className="mt-3 text-xl font-bold text-charcoal tabular-nums">{stat.value}</p>
                      <p className="mt-1 text-xs text-light">{t(`mission.${stat.key}`)}</p>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WorkflowSteps />
      <ImpactCounters />

      {/* Featured Projects */}
      <section className="bg-beige py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <h2 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
              {t('featured.title')}
            </h2>
            <p className="mt-3 text-base text-mid">{t('featured.subtitle')}</p>
          </ScrollReveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <ScrollReveal key={project.id} delay={i * 0.08}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-10">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-charcoal px-6 py-2.5 text-sm font-semibold text-charcoal transition-all hover:bg-charcoal hover:text-white"
            >
              {t('featured.viewAll')} <ArrowRight className="size-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {t('cta.title')}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-base text-white/50">{t('cta.subtitle')}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-semibold text-charcoal transition-all hover:shadow-lg active:scale-[0.98]"
            >
              {t('cta.button')}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
