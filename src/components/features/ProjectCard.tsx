import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/lib/utils';
import { motionSpring } from '@/lib/motion';
import { STAGE_LABELS_EN, STAGE_LABELS_KO } from '@/constants/config';

export default function ProjectCard({ project, priority = false, index = 0 }: { project: Project; priority?: boolean; index?: number }) {
  const { lang, t } = useLanguage();
  const stageLabel = (lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_KO)[project.stage] || project.stageName;
  const colors = ['var(--ss-panel)', 'var(--ss-sky)', 'var(--ss-sand)', 'var(--ss-violet)'];

  return (
    <motion.article layout whileHover={{ y: -5 }} whileTap={{ scale: .985, y: 1 }} transition={motionSpring.press} className="group h-full">
      <Link to={`/projects/${project.id}`} className="block h-full rounded-[1.65rem] border border-black/10 bg-white p-2 shadow-[0_18px_55px_rgba(18,18,18,.07)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-black/5">
          {project.image ? (
            <img src={project.image} alt={project.name} loading={priority ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055]" />
          ) : (
            <div className="grid size-full place-items-center text-xs font-bold uppercase tracking-[0.18em] text-black/40">{t('common.comingSoon')}</div>
          )}
          <span className="absolute left-3 top-3 rounded-full border border-black/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-black" style={{ background: colors[index % colors.length] }}>{stageLabel}</span>
          <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white/90 text-black backdrop-blur"><ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" /></span>
        </div>
        <div className="px-3 pb-3 pt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/42">{project.category}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--ss-ink)]">{project.name}</h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-black/55">{project.description}</p>
          <div className="mt-5 flex gap-7 border-t border-black/10 pt-4 text-xs">
            <p><span className="block text-black/38">{t('projects.revenue')}</span><b className="mt-1 block tabular-nums text-black">{formatCurrency(project.revenue)}</b></p>
            <p><span className="block text-black/38">{t('projects.donation')}</span><b className="mt-1 block tabular-nums text-black">{formatCurrency(project.donation)}</b></p>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
