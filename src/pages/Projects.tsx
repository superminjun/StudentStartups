import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProjectCard from '@/components/features/ProjectCard';
import ScrollReveal from '@/components/features/ScrollReveal';
import { STAGE_LABELS_EN, STAGE_LABELS_KO } from '@/constants/config';
import { useLanguage } from '@/hooks/useLanguage';
import { motionSpring, STAGGER } from '@/lib/motion';
import { useCMSStore } from '@/stores/cmsStore';

export default function Projects() {
  const { lang, t } = useLanguage();
  const [stage, setStage] = useState(0);
  const projects = useCMSStore((state) => state.projects);
  const status = useCMSStore((state) => state.status);
  const labels = lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_KO;
  const filtered = useMemo(() => stage === 0 ? projects : projects.filter((project) => project.stage === stage), [projects, stage]);
  const stages = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="bg-[var(--ss-canvas)] pt-[4.75rem]">
      <section className="relative overflow-hidden border-b border-black/10 px-5 py-20 sm:px-8 lg:py-28">
        <div className="relative mx-auto grid max-w-[90rem] gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.depth}>
            <p className="ss-label text-black/45">Index / 2024—26</p>
            <h1 className="ss-display mt-7">{t('projects.title')}</h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .18 }}>
            <p className="max-w-lg text-lg leading-8 text-black/55">{t('projects.subtitle')}</p>
            <div className="mt-8 flex items-center gap-4 border-t border-black/20 pt-5 text-xs font-bold uppercase tracking-[.14em]"><span className="size-2 rounded-full bg-[var(--ss-coral)]" />{projects.length} {t('nav.projects')}</div>
          </motion.div>
        </div>
      </section>

      <section className="px-5 pb-28 pt-10 sm:px-8 lg:pb-36">
        <div className="mx-auto max-w-[90rem]">
          <div className="sticky top-[4.75rem] z-20 -mx-5 overflow-x-auto border-b border-black/10 bg-[var(--ss-canvas)]/90 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8">
            <div className="mx-auto flex min-w-max max-w-[90rem] gap-2">
              {stages.map((value) => {
                const count = value === 0 ? projects.length : projects.filter((project) => project.stage === value).length;
                return (
                  <button key={value} type="button" onClick={() => setStage(value)} className={`relative rounded-full px-4 py-2 text-xs font-bold transition-colors ${stage === value ? 'text-white' : 'text-black/50 hover:text-black'}`}>
                    {stage === value && <motion.span layoutId="project-stage" className="absolute inset-0 rounded-full bg-black" transition={motionSpring.state} />}
                    <span className="relative z-10">{value === 0 ? t('projects.allStages') : labels[value]} <span className="ml-1 opacity-55">{count}</span></span>
                  </button>
                );
              })}
            </div>
          </div>

          {status === 'loading' && projects.length === 0 ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-[1.6rem] bg-black/5" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="py-28 text-center text-sm text-black/45">{t('projects.noProjects')}</p>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div key={stage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={motionSpring.state} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project, index) => <ScrollReveal key={project.id} delay={Math.min(index * STAGGER, .3)}><ProjectCard project={project} index={index} priority={index < 6} /></ScrollReveal>)}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}
