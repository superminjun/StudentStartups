import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { STAGE_LABELS_EN, STAGE_LABELS_KO } from '@/constants/config';
import type { Project } from '@/types';

export default function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const { lang, t } = useLanguage();
  const stageLabel = lang === 'en' ? (STAGE_LABELS_EN[project.stage] || project.stageName) : (STAGE_LABELS_KO[project.stage] || project.stageName);
  const hasImage = Boolean(project.image);
  const summary = project.shortDescription || project.description;

  return (
    <Link to={`/projects/${project.id}`}>
      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.25 }}
        className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {hasImage ? (
            <img
              src={project.image}
              alt={project.name}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={priority ? 'high' : 'auto'}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted/60 px-6 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t('common.comingSoon')}
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="inline-flex border-b border-accent/30 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {stageLabel}
          </p>
          <h3 className="mt-4 text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-accent">
            {project.name}
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground line-clamp-3">{summary}</p>
          <p className="mt-5 text-sm font-medium text-foreground">{t('projects.viewDetails')}</p>
        </div>
      </motion.article>
    </Link>
  );
}
