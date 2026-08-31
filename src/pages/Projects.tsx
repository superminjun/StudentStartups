import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from '@/components/features/ProjectCard';
import ScrollReveal from '@/components/features/ScrollReveal';
import { STAGE_LABELS_EN, STAGE_LABELS_KO } from '@/constants/config';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';

export default function Projects() {
  const { lang, t } = useLanguage();
  const [stage, setStage] = useState(0);
  const projects = useCMSStore((state) => state.projects);
  const status = useCMSStore((state) => state.status);
  const stageLabels = lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_KO;
  const filtered = useMemo(
    () => (stage === 0 ? projects : projects.filter((project) => project.stage === stage)),
    [projects, stage]
  );

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
              <p className="section-kicker">{t('nav.projects')}</p>
              <h1 className="mt-6 font-heading text-[clamp(3.4rem,8vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-foreground">
                {t('projects.title')}
              </h1>
            </div>
            <div>
              <p className="max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">{t('projects.subtitle')}</p>
              <p className="mt-5 text-sm font-semibold text-foreground">{projects.length} {t('nav.projects').toLowerCase()}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-5 border-b border-foreground pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label htmlFor="project-stage" className="section-kicker">{t('projects.stage')}</label>
              <p className="mt-2 text-sm text-muted-foreground">{filtered.length} / {projects.length}</p>
            </div>
            <select
              id="project-stage"
              value={stage}
              onChange={(event) => setStage(Number(event.target.value))}
              className="min-h-11 min-w-56 border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
            >
              <option value={0}>{t('projects.allStages')} ({projects.length})</option>
              {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <option key={value} value={value}>
                  {stageLabels[value]} ({projects.filter((project) => project.stage === value).length})
                </option>
              ))}
            </select>
          </div>

          {status === 'loading' && projects.length === 0 ? (
            <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index}>
                  <div className="aspect-[4/3] animate-pulse bg-muted" />
                  <div className="mt-5 h-5 w-2/3 animate-pulse bg-muted" />
                  <div className="mt-3 h-3 w-full animate-pulse bg-muted" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-24 text-center text-sm text-muted-foreground">{t('projects.noProjects')}</p>
          ) : (
            <motion.div
              key={stage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((project, index) => (
                <ScrollReveal key={project.id} delay={Math.min(index * 0.04, 0.2)}>
                  <ProjectCard project={project} priority={index < 6} />
                </ScrollReveal>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
