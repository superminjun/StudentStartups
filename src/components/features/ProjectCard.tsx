import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/lib/utils';
import { STAGE_LABELS_EN, STAGE_LABELS_KO, STAGE_COLORS } from '@/constants/config';
import type { Project } from '@/types';

export default function ProjectCard({ project }: { project: Project }) {
  const { lang, t } = useLanguage();
  const stageLabel = lang === 'en' ? (STAGE_LABELS_EN[project.stage] || project.stageName) : (STAGE_LABELS_KO[project.stage] || project.stageName);

  return (
    <Link to={`/projects/${project.id}`}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="group overflow-hidden rounded-xl bg-white border border-[hsl(30,12%,90%)] transition-shadow hover:shadow-lg"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={project.image}
            alt={project.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-xs font-medium ${STAGE_COLORS[project.stage] || ''}`}>
            {stageLabel}
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-base font-semibold text-charcoal group-hover:text-[hsl(24,80%,50%)] transition-colors">
            {project.name}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-mid line-clamp-2">{project.description}</p>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[hsl(30,12%,92%)] pt-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-light">{t('projects.revenue')}</p>
              <p className="mt-0.5 text-sm font-semibold text-charcoal tabular-nums">{formatCurrency(project.revenue)}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-light">{t('projects.profit')}</p>
              <p className="mt-0.5 text-sm font-semibold text-emerald-600 tabular-nums">{formatCurrency(project.profit)}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-light">{t('projects.donation')}</p>
              <p className="mt-0.5 text-sm font-semibold text-[hsl(24,80%,50%)] tabular-nums">{formatCurrency(project.donation)}</p>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
