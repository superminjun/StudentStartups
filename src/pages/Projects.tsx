import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import { STAGE_LABELS_EN, STAGE_LABELS_KO } from '@/constants/config';
import ProjectCard from '@/components/features/ProjectCard';
import ScrollReveal from '@/components/features/ScrollReveal';

export default function Projects() {
  const { lang, t } = useLanguage();
  const [activeStage, setActiveStage] = useState(0);
  const stageLabels = lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_KO;
  const projects = useCMSStore((s) => s.projects);

  const filtered = useMemo(
    () => (activeStage === 0 ? projects : projects.filter((p) => p.stage === activeStage)),
    [activeStage]
  );

  return (
    <div>
      <section className="bg-charcoal pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {t('projects.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3 max-w-xl text-base text-white/50"
          >
            {t('projects.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="bg-beige py-10 lg:py-14">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveStage(0)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeStage === 0 ? 'bg-charcoal text-white' : 'bg-card text-mid hover:text-charcoal border border-border'
                }`}
              >
                {t('projects.allStages')} ({projects.length})
              </button>
              {[1, 2, 3, 4, 5, 6, 7].map((stage) => {
                const count = projects.filter((p) => p.stage === stage).length;
                return (
                  <button
                    key={stage}
                    onClick={() => setActiveStage(stage)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      activeStage === stage ? 'bg-charcoal text-white' : 'bg-card text-mid hover:text-charcoal border border-border'
                    }`}
                  >
                    {stageLabels[stage]} ({count})
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-base text-light">{t('projects.noProjects')}</p>
            </div>
          ) : (
            <motion.div
              key={activeStage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((project, i) => (
                <ScrollReveal key={project.id} delay={Math.min(i * 0.05, 0.3)}>
                  <ProjectCard project={project} />
                </ScrollReveal>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
