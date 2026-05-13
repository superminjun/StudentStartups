import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/lib/utils';
import { STAGE_LABELS_EN, STAGE_LABELS_KO, STAGE_COLORS } from '@/constants/config';
import type { Project } from '@/types';

export default function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const { lang, t } = useLanguage();
  const stageLabel = lang === 'en' ? (STAGE_LABELS_EN[project.stage] || project.stageName) : (STAGE_LABELS_KO[project.stage] || project.stageName);
  const hasImage = Boolean(project.image);

  return (
    <Link to={`/projects/${project.id}`}>
      <motion.article
        data-cursor="open"
        whileHover={{ y: -6 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="group card card-hover overflow-hidden will-change-transform"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {hasImage ? (
            <>
              <motion.img
                src={project.image}
                alt={project.name}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                initial={{ scale: 1.08, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <motion.div
                aria-hidden
                className="absolute inset-0 bg-card"
                initial={{ y: 0 }}
                whileInView={{ y: '101%' }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.75, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              />
            </>
          ) : (
            <div className="flex size-full items-center justify-center bg-muted/60 px-6 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t('common.comingSoon')}
            </div>
          )}
          <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-xs font-medium ${STAGE_COLORS[project.stage] || ''}`}>
            {stageLabel}
          </span>
        </div>

        <div className="p-5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
          <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
            {project.name}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">{project.description}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t('projects.revenue')}</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">{formatCurrency(project.revenue)}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t('projects.profit')}</p>
              <p className="mt-0.5 text-sm font-semibold text-emerald-500 tabular-nums">{formatCurrency(project.profit)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t('projects.donation')}</p>
              <p className="mt-0.5 text-sm font-semibold text-accent tabular-nums">{formatCurrency(project.donation)}</p>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
