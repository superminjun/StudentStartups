import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/lib/utils';
import { STAGE_LABELS_EN, STAGE_LABELS_KO } from '@/constants/config';

export default function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const { lang, t } = useLanguage();
  const stageLabel = lang === 'en'
    ? STAGE_LABELS_EN[project.stage] || project.stageName
    : STAGE_LABELS_KO[project.stage] || project.stageName;

  return (
    <Link to={`/projects/${project.id}`} className="group block h-full">
      <article>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {project.image ? (
            <img
              src={project.image}
              alt={project.name}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            />
          ) : (
            <div className="grid size-full place-items-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t('common.comingSoon')}
            </div>
          )}
          <span className="absolute left-3 top-3 bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">
            {stageLabel}
          </span>
        </div>

        <div className="border-b border-border py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{project.category}</p>
              <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.025em] text-foreground transition-colors group-hover:text-accent">
                {project.name}
              </h3>
            </div>
            <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{project.description}</p>
          <div className="mt-5 flex gap-8 text-xs">
            <div>
              <p className="text-muted-foreground">{t('projects.revenue')}</p>
              <p className="mt-1 font-semibold tabular-nums text-foreground">{formatCurrency(project.revenue)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('projects.donation')}</p>
              <p className="mt-1 font-semibold tabular-nums text-foreground">{formatCurrency(project.donation)}</p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
