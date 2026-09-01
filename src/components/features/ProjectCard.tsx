import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/lib/utils';
import { motionSpring } from '@/lib/motion';
import { STAGE_LABELS_EN, STAGE_LABELS_KO } from '@/constants/config';

export default function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean; index?: number }) {
  const { lang, t } = useLanguage();
  const stageLabel = (lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_KO)[project.stage] || project.stageName;
  return (
    <motion.article layout whileHover={{ y: -3 }} whileTap={{ y: 1 }} transition={motionSpring.press} className="group h-full">
      <Link to={`/projects/${project.id}`} className="block h-full border-t border-[var(--ss-rule)] pt-4">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--ss-panel)]">
          {project.image ? (
            <img src={project.image} alt={project.name} loading={priority ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]" />
          ) : (
            <div className="grid size-full place-items-center text-xs font-bold uppercase tracking-[0.18em] text-black/40">{t('common.comingSoon')}</div>
          )}
          <span className="absolute bottom-0 right-0 grid size-11 place-items-center bg-[var(--ss-navy)] text-white"><ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
        </div>
        <div className="pt-5">
          <div className="flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--ss-muted)]"><span>{project.category}</span><span>{stageLabel}</span></div>
          <h3 className="mt-3 font-heading text-xl font-medium tracking-[-.02em] text-[var(--ss-ink)]">{project.name}</h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--ss-muted)]">{project.description}</p>
          <div className="mt-5 flex gap-8 border-t border-[var(--ss-rule)] pt-4 text-xs">
            <p><span className="block text-[var(--ss-muted)]">{t('projects.revenue')}</span><b className="mt-1 block font-medium tabular-nums text-[var(--ss-ink)]">{formatCurrency(project.revenue)}</b></p>
            <p><span className="block text-[var(--ss-muted)]">{t('projects.donation')}</span><b className="mt-1 block font-medium tabular-nums text-[var(--ss-ink)]">{formatCurrency(project.donation)}</b></p>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
