import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ScrollReveal from '@/components/features/ScrollReveal';
import { STAGE_LABELS_EN, STAGE_LABELS_KO } from '@/constants/config';
import { useLanguage } from '@/hooks/useLanguage';
import { motionSpring } from '@/lib/motion';
import { formatCurrency } from '@/lib/utils';
import { useCMSStore } from '@/stores/cmsStore';
import type { Project } from '@/types';

const FACTORS = [.18, .42, .68, 1];
const chartTooltip = { border: '1px solid #d8d4ca', borderRadius: 2, boxShadow: 'none', background: '#fffdf8', color: '#2b1c20', fontSize: 12 };

function buildFinanceData(project: Project, locale: string) {
  const start = new Date(`${project.startDate}T00:00:00`);
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });
  return FACTORS.map((factor, index) => ({
    label: Number.isNaN(start.getTime()) ? `${index + 1}` : formatter.format(new Date(start.getFullYear(), start.getMonth() + index, 1)),
    revenue: Math.round(project.revenue * factor),
    expenses: Math.round(project.expenses * factor),
    fundraise: Math.round((project.fundraise ?? 0) * factor),
  }));
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const projects = useCMSStore((state) => state.projects);
  const status = useCMSStore((state) => state.status);
  const project = projects.find((item) => item.id === id);
  const labels = lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_KO;

  if (status === 'loading' && !project) return <div className="min-h-screen bg-[var(--ss-paper)] pt-28"><div className="ss-wrap"><div className="h-12 w-2/3 animate-pulse bg-[var(--ss-panel)]" /><div className="mt-10 aspect-[16/7] animate-pulse bg-[var(--ss-panel)]" /></div></div>;
  if (!project) return <div className="grid min-h-screen place-items-center bg-[var(--ss-paper)] px-5 pt-20 text-center"><div><p className="text-sm text-[var(--ss-muted)]">{t('projectDetail.notFound')}</p><Link to="/projects" className="ss-link mt-5">{t('projectDetail.back')}</Link></div></div>;

  const image = project.bannerImage || project.image;
  const finance = buildFinanceData(project, lang === 'ko' ? 'ko-KR' : 'en-US');
  const members = Array.from(new Set(project.team.flatMap((assignment) => assignment.members))).length;
  const margin = project.revenue > 0 ? Math.round((project.profit / project.revenue) * 100) : 0;
  const metrics = [
    [t('projects.revenue'), formatCurrency(project.revenue)],
    [t('projects.profit'), formatCurrency(project.profit)],
    [t('projects.donation'), formatCurrency(project.donation)],
    [t('projectDetail.margin'), `${margin}%`],
    [t('projectDetail.teamMembers'), String(members)],
    [t('projectDetail.fundraise'), formatCurrency(project.fundraise ?? 0)],
  ];

  return (
    <div className="bg-[var(--ss-paper)] pt-[4.5rem]">
      <header className="border-b border-[var(--ss-rule)] py-12 lg:py-16">
        <div className="ss-wrap">
          <Link to="/projects" className="ss-link">{t('projectDetail.back')}</Link>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_.45fr] lg:items-end">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.depth}><p className="ss-label text-[var(--ss-accent)]">{project.category}</p><h1 className="ss-display mt-4 max-w-[18ch]">{project.name}</h1></motion.div>
            <motion.dl initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .1 }} className="grid grid-cols-2 border-t border-[var(--ss-rule)] text-xs"><div className="py-4"><dt className="text-[var(--ss-muted)]">{t('projects.stage')}</dt><dd className="mt-1 font-medium">{labels[project.stage]}</dd></div><div className="border-l border-[var(--ss-rule)] py-4 pl-5"><dt className="text-[var(--ss-muted)]">{t('common.startedOn')}</dt><dd className="mt-1 font-medium">{project.startDate}</dd></div></motion.dl>
          </div>
        </div>
      </header>

      <section className="ss-wrap py-8 lg:py-10">
        {image ? <motion.img initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0)' }} transition={{ duration: .9, ease: [.23, 1, .32, 1] }} src={image} alt={project.name} fetchPriority="high" className="aspect-[16/8] w-full bg-[var(--ss-panel)] object-cover" /> : <div className="grid aspect-[16/8] place-items-center bg-[var(--ss-panel)] text-xs text-[var(--ss-muted)]">{t('common.comingSoon')}</div>}
      </section>

      <section className="ss-section bg-[var(--ss-surface)]">
        <div className="ss-wrap grid gap-12 lg:grid-cols-[.62fr_1.38fr]">
          <ScrollReveal><p className="ss-label text-[var(--ss-accent)]">{lang === 'ko' ? '프로젝트 소개' : 'Project note'}</p></ScrollReveal>
          <div>
            <ScrollReveal><p className="whitespace-pre-line text-[15px] leading-8 text-[var(--ss-muted)]">{project.description}</p></ScrollReveal>
            <div className="mt-12 grid border-y border-[var(--ss-rule)] sm:grid-cols-3">
              {metrics.map(([label, value]) => <div key={label} className="border-b border-[var(--ss-rule)] py-5 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:nth-[3n]:border-r-0"><p className="text-[10px] uppercase tracking-[.1em] text-[var(--ss-muted)]">{label}</p><p className="mt-2 font-heading text-xl font-medium tabular-nums">{value}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="ss-section bg-[var(--ss-paper)]">
        <div className="ss-wrap grid gap-12 lg:grid-cols-[.62fr_1.38fr]">
          <ScrollReveal><p className="ss-label text-[var(--ss-accent)]">{t('projectDetail.progress')}</p><p className="mt-4 text-sm text-[var(--ss-muted)]">{labels[project.stage]}</p></ScrollReveal>
          <ScrollReveal>
            <div className="flex gap-1">{[1, 2, 3, 4, 5, 6, 7].map((stage) => <motion.div key={stage} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: stage * .04, duration: .35 }} className={`h-2 flex-1 origin-left ${stage <= project.stage ? 'bg-[var(--ss-accent)]' : 'bg-[var(--ss-rule)]'}`} />)}</div>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center">{[1, 2, 3, 4, 5, 6, 7].map((stage) => <span key={stage} className="text-[9px] text-[var(--ss-muted)]">{labels[stage]}</span>)}</div>
          </ScrollReveal>
        </div>
      </section>

      <section className="ss-section bg-[var(--ss-navy)] text-white">
        <div className="ss-wrap grid gap-12 lg:grid-cols-[.62fr_1.38fr]">
          <ScrollReveal><p className="ss-label text-white/42">{t('projectDetail.financial')}</p><h2 className="ss-title mt-4">{t('projectDetail.revenueChart')}</h2></ScrollReveal>
          <ScrollReveal className="h-80 bg-[var(--ss-surface)] p-3">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={finance}><CartesianGrid vertical={false} stroke="#e1ddd4" /><XAxis dataKey="label" tick={{ fontSize: 10, fill: '#716467' }} tickLine={false} axisLine={false} /><YAxis tick={{ fontSize: 10, fill: '#716467' }} tickLine={false} axisLine={false} /><Tooltip contentStyle={chartTooltip} /><Bar dataKey="revenue" fill="#2b1c20" name={t('projects.revenue')} /><Bar dataKey="expenses" fill="#b7adaf" name={t('projectDetail.expenses')} /><Bar dataKey="fundraise" fill="#772735" name={t('projectDetail.fundraise')} /></BarChart></ResponsiveContainer>
          </ScrollReveal>
        </div>
      </section>

      <section className="ss-section bg-[var(--ss-surface)]">
        <div className="ss-wrap grid gap-12 lg:grid-cols-[.62fr_1.38fr]">
          <ScrollReveal><p className="ss-label text-[var(--ss-accent)]">{t('projectDetail.team')}</p></ScrollReveal>
          <div className="border-t border-[var(--ss-rule)]">{project.team.length === 0 ? <p className="py-7 text-sm text-[var(--ss-muted)]">{t('projectDetail.teamPending')}</p> : project.team.map((assignment) => <ScrollReveal key={assignment.role}><div className="grid gap-3 border-b border-[var(--ss-rule)] py-6 sm:grid-cols-[.4fr_1fr]"><p className="font-heading text-lg">{assignment.role}</p><p className="text-sm leading-7 text-[var(--ss-muted)]">{assignment.members.join(' · ')}</p></div></ScrollReveal>)}</div>
        </div>
      </section>
    </div>
  );
}
