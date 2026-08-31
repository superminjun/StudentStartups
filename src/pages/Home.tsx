import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import { useSiteContentStore } from '@/stores/siteContentStore';
import ProjectCard from '@/components/features/ProjectCard';
import ScrollReveal from '@/components/features/ScrollReveal';

const numberFrom = (value: string) => Number(value.replace(/[^0-9.]/g, '')) || 0;
const compact = (value: number, currency = false) => new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
  ...(currency ? { style: 'currency', currency: 'USD' } : {}),
}).format(value);

export default function Home() {
  const { t } = useLanguage();
  const { content } = useSiteContentStore();
  const projects = useCMSStore((state) => state.projects);
  const visibleProjects = useMemo(
    () => projects.filter((project) => (project.status ?? 'active').toLowerCase() !== 'archived'),
    [projects]
  );
  const featuredProjects = useMemo(
    () => [...visibleProjects]
      .sort((a, b) => (b.revenue + (b.fundraise ?? 0)) - (a.revenue + (a.fundraise ?? 0)))
      .slice(0, 3),
    [visibleProjects]
  );
  const imageProjects = useMemo(
    () => [...visibleProjects].filter((project) => project.image).slice(0, 3),
    [visibleProjects]
  );

  const stats = [
    [compact(visibleProjects.filter((project) => (project.status ?? 'active').toLowerCase() === 'active').length), t('mission.stat1Label')],
    [compact(numberFrom(content.totalRevenue), true), t('mission.stat2Label')],
    [compact(numberFrom(content.activeMembers)), t('mission.stat3Label')],
    [compact(numberFrom(content.totalDonated), true), t('mission.stat4Label')],
  ];

  const phases = [
    ['01', t('workflow.steps.step1Title'), t('workflow.steps.step1Desc')],
    ['02', t('workflow.steps.step3Title'), t('workflow.steps.step3Desc')],
    ['03', t('workflow.steps.step6Title'), t('workflow.steps.step6Desc')],
    ['04', t('workflow.steps.step7Title'), t('workflow.steps.step7Desc')],
  ];

  return (
    <div>
      <section className="border-b border-border bg-background pb-16 pt-32 sm:pb-24 sm:pt-40">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="section-kicker">{t('hero.tagline')}</p>
            <h1 className="mt-6 max-w-4xl font-heading text-[clamp(3.25rem,7vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-foreground">
              {t('hero.title')}
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">{t('hero.subtitle')}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/projects" className="btn btn-primary group">
                {t('hero.cta')}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/about" className="btn btn-secondary">{t('hero.secondaryCta')}</Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16, duration: 0.65 }}
            className="grid h-[32rem] grid-cols-5 grid-rows-5 gap-2 sm:h-[38rem]"
          >
            {imageProjects.map((project, index) => {
              const positions = [
                'col-span-5 row-span-5 sm:col-span-3',
                'hidden sm:col-span-2 sm:row-span-3 sm:block',
                'hidden sm:col-span-2 sm:row-span-2 sm:block',
              ];
              return (
                <Link key={project.id} to={`/projects/${project.id}`} className={`group relative overflow-hidden bg-muted ${positions[index]}`}>
                  <img
                    src={project.image}
                    alt={project.name}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
                    <p className="text-sm font-semibold sm:text-base">{project.name}</p>
                    <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
            {imageProjects.length === 0 && <div className="col-span-5 row-span-5 bg-muted" />}
          </motion.div>
        </div>
      </section>

      <section className="bg-foreground py-16 text-background sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ScrollReveal>
            <p className="max-w-5xl font-heading text-2xl font-medium leading-tight tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              {t('mission.p1')}
            </p>
          </ScrollReveal>
          <div className="mt-14 grid grid-cols-2 border-t border-background/25 sm:grid-cols-4">
            {stats.map(([value, label], index) => (
              <div key={label} className={`border-background/25 py-6 ${index % 2 === 0 ? 'pr-4' : 'border-l pl-4'} sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0`}>
                <p className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{value}</p>
                <p className="mt-2 text-xs text-background/55 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <ScrollReveal>
              <p className="section-kicker">{t('workflow.kicker')}</p>
              <h2 className="section-title mt-5">{t('workflow.title')}</h2>
              <p className="section-lead">{t('workflow.subtitle')}</p>
            </ScrollReveal>
            <div className="border-t border-foreground">
              {phases.map(([number, title, description], index) => (
                <ScrollReveal key={number} delay={index * 0.04}>
                  <div className="grid gap-4 border-b border-border py-7 sm:grid-cols-[4rem_0.8fr_1.2fr] sm:items-start">
                    <p className="text-xs font-semibold text-muted-foreground">{number}</p>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ScrollReveal className="flex flex-col gap-6 border-b border-foreground pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">{t('proof.kicker')}</p>
              <h2 className="section-title mt-5">{t('featured.title')}</h2>
              <p className="section-lead">{t('featured.subtitle')}</p>
            </div>
            <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent">
              {t('featured.viewAll')} <ArrowRight className="size-4" />
            </Link>
          </ScrollReveal>

          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <ScrollReveal key={project.id} delay={index * 0.06}>
                <ProjectCard project={project} priority={index < 3} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-accent py-16 text-[#211d1a] sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#211d1a]/65">Student Startups</p>
            <h2 className="mt-4 max-w-4xl font-heading text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">{t('cta.title')}</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#211d1a]/75 sm:text-base">{t('cta.subtitle')}</p>
          </div>
          <Link to="/contact" className="btn shrink-0 bg-[#211d1a] text-white hover:bg-[#211d1a]/85">{t('cta.button')}</Link>
        </div>
      </section>
    </div>
  );
}
