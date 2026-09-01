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
    <div className="bg-[var(--ss-paper)] pt-[4.5rem]">
      <section className="border-b border-[var(--ss-rule)] py-16 lg:py-20">
        <div className="ss-wrap grid gap-10 lg:grid-cols-[.38fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.depth}>
            <p className="ss-label text-[var(--ss-accent)]">{t('nav.projects')} · {projects.length}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .18 }}>
            <h1 className="ss-display">{t('projects.title')}</h1>
            <p className="mt-7 max-w-xl text-[15px] leading-7 text-[var(--ss-muted)]">{t('projects.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="ss-section bg-[var(--ss-surface)] pt-0">
        <div className="ss-wrap">
          <div className="sticky top-[4.5rem] z-20 -mx-5 overflow-x-auto border-b border-[var(--ss-rule)] bg-[var(--ss-surface)] px-5 sm:-mx-8 sm:px-8">
            <div className="mx-auto flex min-w-max max-w-[78rem] gap-6">
              {stages.map((value) => {
                const count = value === 0 ? projects.length : projects.filter((project) => project.stage === value).length;
                return (
                  <button key={value} type="button" onClick={() => setStage(value)} className={`relative border-b-2 px-1 py-4 text-[11px] font-semibold uppercase tracking-[.08em] transition-colors ${stage === value ? 'border-[var(--ss-accent)] text-[var(--ss-ink)]' : 'border-transparent text-[var(--ss-muted)] hover:text-[var(--ss-ink)]'}`}>
                    <span>{value === 0 ? t('projects.allStages') : labels[value]} <span className="ml-1 opacity-55">{count}</span></span>
                  </button>
                );
              })}
            </div>
          </div>

          {status === 'loading' && projects.length === 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[4/3] animate-pulse bg-[var(--ss-panel)]" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="py-28 text-center text-sm text-[var(--ss-muted)]">{t('projects.noProjects')}</p>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div key={stage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={motionSpring.state} className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project, index) => <ScrollReveal key={project.id} delay={Math.min(index * STAGGER, .3)}><ProjectCard project={project} index={index} priority={index < 6} /></ScrollReveal>)}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}
