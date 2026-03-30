import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import { STAGE_LABELS_EN, STAGE_LABELS_KO, STAGE_COLORS } from '@/constants/config';
import { formatCurrency } from '@/lib/utils';
import ScrollReveal from '@/components/features/ScrollReveal';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Calendar, Tag } from 'lucide-react';

const COLORS = ['hsl(20,10%,15%)', 'hsl(24,80%,50%)', 'hsl(160,50%,40%)', 'hsl(210,50%,50%)'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const projects = useCMSStore((s) => s.projects);
  const revenueChartData = useCMSStore((s) => s.revenueData);
  const project = projects.find((p) => p.id === id);
  const stageLabels = lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_KO;

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-base text-light">Project not found.</p>
          <Link to="/projects" className="mt-4 inline-block text-sm font-medium text-charcoal underline">
            {t('projectDetail.back')}
          </Link>
        </div>
      </div>
    );
  }

  const donationData = [
    { name: t('projects.donation'), value: project.donation },
    { name: t('projects.profit'), value: Math.max(project.profit - project.donation, 0) },
  ];

  return (
    <div>
      <section className="relative h-[40vh] min-h-[320px] overflow-hidden">
        <img src={project.image} alt={project.name} className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
          <div className="mx-auto max-w-6xl">
            <Link to="/projects" className="mb-3 inline-flex items-center text-sm text-white/50 hover:text-white transition-colors">
              {t('projectDetail.back')}
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl"
            >
              {project.name}
            </motion.h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STAGE_COLORS[project.stage]}`}>
                {stageLabels[project.stage]}
              </span>
              <span className="flex items-center gap-1 text-sm text-white/40">
                <Calendar className="size-3.5" /> {project.startDate}
              </span>
              <span className="flex items-center gap-1 text-sm text-white/40">
                <Tag className="size-3.5" /> {project.category}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-beige py-10 lg:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-8">
              <ScrollReveal>
                <p className="text-base leading-relaxed text-mid">{project.description}</p>
              </ScrollReveal>

              {/* Progress stages */}
              <ScrollReveal>
                <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
                  <h3 className="text-lg font-semibold text-charcoal">{t('projectDetail.progress')}</h3>
                  <div className="mt-5 flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((stage) => (
                      <motion.div
                        key={stage}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: stage * 0.08, duration: 0.4 }}
                        className={`h-2.5 flex-1 origin-left rounded-full ${stage <= project.stage ? 'bg-charcoal' : 'bg-[hsl(30,15%,90%)]'}`}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between">
                    {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                      <span key={s} className={`text-[10px] ${s <= project.stage ? 'font-semibold text-charcoal' : 'text-light'}`}>
                        {stageLabels[s]}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Revenue chart */}
              <ScrollReveal>
                <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
                  <h3 className="text-lg font-semibold text-charcoal">{t('projectDetail.revenueChart')}</h3>
                  <div className="mt-5 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData.slice(0, project.stage + 2)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,12%,92%)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(20,5%,55%)' }} />
                        <YAxis tick={{ fontSize: 12, fill: 'hsl(20,5%,55%)' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(30,12%,90%)', fontSize: '13px' }} />
                        <Bar dataKey="revenue" fill="hsl(20,10%,15%)" radius={[4, 4, 0, 0]} name={t('projects.revenue')} />
                        <Bar dataKey="expenses" fill="hsl(30,15%,82%)" radius={[4, 4, 0, 0]} name={t('projectDetail.expenses')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ScrollReveal>

              {/* Donation */}
              {project.donation > 0 && (
                <ScrollReveal>
                  <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
                    <h3 className="text-lg font-semibold text-charcoal">{t('projectDetail.donationImpact')}</h3>
                    <div className="mt-5 flex items-center gap-8">
                      <div className="h-44 w-44 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={donationData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                              {donationData.map((_, i) => (
                                <Cell key={i} fill={COLORS[i]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-light">{t('projectDetail.donationPercent')}</p>
                          <p className="text-2xl font-bold text-[hsl(24,80%,50%)]">{project.donationPercent}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-light">{t('projects.donation')}</p>
                          <p className="text-2xl font-bold text-charcoal">{formatCurrency(project.donation)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <ScrollReveal direction="right">
                <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
                  <h3 className="text-lg font-semibold text-charcoal">{t('projectDetail.financial')}</h3>
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    {[
                      { label: t('projects.revenue'), value: formatCurrency(project.revenue), color: 'text-charcoal' },
                      { label: t('projectDetail.expenses'), value: formatCurrency(project.expenses), color: 'text-red-500' },
                      { label: t('projects.profit'), value: formatCurrency(project.profit), color: 'text-emerald-600' },
                      { label: t('projects.donation'), value: formatCurrency(project.donation), color: 'text-[hsl(24,80%,50%)]' },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-light">{item.label}</p>
                        <p className={`mt-1 text-lg font-bold tabular-nums ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.1}>
                <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
                  <h3 className="text-lg font-semibold text-charcoal">{t('projectDetail.team')}</h3>
                  <div className="mt-4 space-y-4">
                    {project.team.map((ta) => (
                      <div key={ta.role}>
                        <p className="text-xs font-semibold text-[hsl(24,80%,50%)]">{ta.role}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {ta.members.map((m) => (
                            <span key={m} className="rounded-full bg-[hsl(30,15%,92%)] px-2.5 py-0.5 text-xs text-mid">{m}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
