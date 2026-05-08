import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import { STAGE_LABELS_EN, STAGE_LABELS_KO, STAGE_COLORS } from '@/constants/config';
import { formatCurrency } from '@/lib/utils';
import ScrollReveal from '@/components/features/ScrollReveal';
import type { Project } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Calendar, Tag } from 'lucide-react';

const COLORS = ['hsl(20,10%,15%)', 'hsl(24,80%,50%)', 'hsl(160,50%,40%)', 'hsl(210,50%,50%)'];
const FINANCE_FACTORS = [0.18, 0.42, 0.68, 1];

function buildProjectFinanceData(project: Project, locale: string) {
  const startDate = new Date(`${project.startDate}T00:00:00`);
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });

  return FINANCE_FACTORS.map((factor, index) => {
    const pointDate = Number.isNaN(startDate.getTime())
      ? null
      : new Date(startDate.getFullYear(), startDate.getMonth() + index, 1);

    return {
      label: pointDate ? formatter.format(pointDate) : `${index + 1}`,
      revenue: Math.round(project.revenue * factor),
      expenses: Math.round(project.expenses * factor),
      fundraise: Math.round((project.fundraise ?? 0) * factor),
    };
  });
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const projects = useCMSStore((s) => s.projects);
  const status = useCMSStore((s) => s.status);
  const project = projects.find((p) => p.id === id && p.published !== false);
  const stageLabels = lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_KO;
  const bannerImage = project?.bannerImage || project?.image;
  const hasBanner = Boolean(bannerImage);
  const titleText = hasBanner ? 'text-white' : 'text-charcoal';
  const metaText = hasBanner ? 'text-white/40' : 'text-mid';
  const backText = hasBanner ? 'text-white/50 hover:text-white' : 'text-mid hover:text-charcoal';

  if (status === 'loading' && !project) {
    return (
      <div className="bg-beige pt-24 pb-16 lg:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="h-[32vh] min-h-[240px] animate-pulse bg-muted" />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-base text-light">{t('projectDetail.notFound')}</p>
          <Link to="/projects" className="mt-4 inline-block text-sm font-medium text-charcoal underline">
            {t('projectDetail.back')}
          </Link>
        </div>
      </div>
    );
  }

  const financeTimeline = buildProjectFinanceData(project, lang === 'ko' ? 'ko-KR' : 'en-US');
  const uniqueMembers = Array.from(new Set(project.team.flatMap((assignment) => assignment.members))).length;
  const marginPercent = project.revenue > 0 ? Math.round((project.profit / project.revenue) * 100) : 0;
  const totalCapital = project.revenue + (project.fundraise ?? 0);
  const lifecycleLabel = lang === 'ko' ? (STAGE_LABELS_KO[project.stage] || project.stageName) : (STAGE_LABELS_EN[project.stage] || project.stageName);
  const projectTimeline = project.timeline ?? [];
  const projectUpdates = project.updates ?? [];
  const projectSkills = project.skillsUsed ?? [];
  const projectContributors = project.contributors?.length
    ? project.contributors
    : Array.from(new Set(project.team.flatMap((assignment) => assignment.members)));
  const galleryImages = (project.gallery ?? []).filter(Boolean);

  const donationData = [
    { name: t('projects.donation'), value: project.donation },
    { name: t('projects.profit'), value: Math.max(project.profit - project.donation, 0) },
  ];

  return (
    <div>
      <section className="relative h-[40vh] min-h-[320px] overflow-hidden">
        {hasBanner ? (
          <>
            <img
              src={bannerImage}
              alt={project.name}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </>
        ) : (
          <div className="flex size-full items-center justify-center bg-muted/60 px-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('common.comingSoon')}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12">
          <div className="mx-auto max-w-6xl">
            <Link to="/projects" className={`mb-3 inline-flex items-center text-sm transition-colors ${backText}`}>
              {t('projectDetail.back')}
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-2xl font-bold sm:text-3xl lg:text-4xl ${titleText}`}
            >
              {project.name}
            </motion.h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STAGE_COLORS[project.stage]}`}>
                {stageLabels[project.stage]}
              </span>
              <span className={`flex items-center gap-1 text-sm ${metaText}`}>
                <Calendar className="size-3.5" /> {project.startDate}
              </span>
              <span className={`flex items-center gap-1 text-sm ${metaText}`}>
                <Tag className="size-3.5" /> {project.category}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-beige py-10 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <ScrollReveal>
                <p className="whitespace-pre-line break-words text-base leading-relaxed text-mid">{project.description}</p>
              </ScrollReveal>

              <div className="grid gap-5 lg:grid-cols-2">
                <ScrollReveal>
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {lang === 'ko' ? '문제' : 'Problem'}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-foreground/82">
                      {project.problem || (lang === 'ko'
                        ? '이 프로젝트가 다루는 문제를 정리 중입니다.'
                        : 'The team is still documenting the problem this project is addressing.')}
                    </p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.06}>
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {lang === 'ko' ? '해결 방식' : 'Solution'}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-foreground/82">
                      {project.solution || (lang === 'ko'
                        ? '현재 제안한 해결 방식을 정리 중입니다.'
                        : 'The public explanation of the solution is still being refined.')}
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              <ScrollReveal>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: t('projectDetail.margin'), value: `${marginPercent}%`, tone: 'text-emerald-600' },
                    { label: t('projectDetail.teamMembers'), value: uniqueMembers.toString(), tone: 'text-charcoal' },
                    { label: t('projectDetail.fundraise'), value: formatCurrency(project.fundraise ?? 0), tone: 'text-teal-600' },
                    { label: t('projectDetail.totalCapital'), value: formatCurrency(totalCapital), tone: 'text-[hsl(24,80%,50%)]' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-border bg-card p-4">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-light">{item.label}</p>
                      <p className={`mt-2 text-xl font-bold tabular-nums ${item.tone}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              {(project.lead || projectContributors.length > 0 || projectSkills.length > 0) && (
                <ScrollReveal>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {lang === 'ko' ? '프로젝트 리드' : 'Project lead'}
                        </p>
                        <p className="mt-3 text-sm font-semibold text-foreground">
                          {project.lead || (lang === 'ko' ? '지정 중' : 'Being assigned')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {lang === 'ko' ? '기여자' : 'Contributors'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {projectContributors.length ? projectContributors.map((name) => (
                            <span key={name} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground/78">
                              {name}
                            </span>
                          )) : (
                            <span className="text-sm text-muted-foreground">{lang === 'ko' ? '기록 준비 중' : 'Record in progress'}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {lang === 'ko' ? '사용한 역량' : 'Skills used'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {projectSkills.length ? projectSkills.map((skill) => (
                            <span key={skill} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/78">
                              {skill}
                            </span>
                          )) : (
                            <span className="text-sm text-muted-foreground">{lang === 'ko' ? '기록 준비 중' : 'Record in progress'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {galleryImages.length > 0 && (
                <ScrollReveal>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold text-charcoal">{lang === 'ko' ? '프로젝트 갤러리' : 'Project gallery'}</h3>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {galleryImages.map((image, index) => (
                        <div key={`${image}-${index}`} className="overflow-hidden rounded-2xl border border-border bg-muted/30">
                          <img src={image} alt={`${project.name} ${index + 1}`} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Progress stages */}
              <ScrollReveal>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-charcoal">{t('projectDetail.progress')}</h3>
                  <div className="mt-5 flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((stage) => (
                      <motion.div
                        key={stage}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: stage * 0.08, duration: 0.4 }}
                        className={`h-2.5 flex-1 origin-left rounded-full ${stage <= project.stage ? 'bg-charcoal' : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                    {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                      <span key={s} className={`text-[9px] sm:text-[10px] ${s <= project.stage ? 'font-semibold text-charcoal' : 'text-light'}`}>
                        {stageLabels[s]}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Revenue chart */}
              <ScrollReveal>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-charcoal">{t('projectDetail.revenueChart')}</h3>
                  <div className="mt-5 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financeTimeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '13px', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                        <Bar dataKey="revenue" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} name={t('projects.revenue')} />
                        <Bar dataKey="expenses" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name={t('projectDetail.expenses')} />
                        <Bar dataKey="fundraise" fill="hsl(160 55% 40%)" radius={[4, 4, 0, 0]} name={t('projectDetail.fundraise')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ScrollReveal>

              {/* Donation */}
              {project.donation > 0 && (
                <ScrollReveal>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold text-charcoal">{t('projectDetail.donationImpact')}</h3>
                    <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                      <div className="h-44 w-full max-w-[11rem] shrink-0 self-center sm:self-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={donationData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                              {donationData.map((_, i) => (
                                <Cell key={i} fill={COLORS[i]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
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

              {(projectTimeline.length > 0 || projectUpdates.length > 0) && (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr),minmax(0,1.08fr)]">
                  <ScrollReveal>
                    <div className="rounded-xl border border-border bg-card p-6">
                      <h3 className="text-lg font-semibold text-charcoal">{lang === 'ko' ? '프로젝트 타임라인' : 'Project timeline'}</h3>
                      <div className="mt-5 space-y-4">
                        {projectTimeline.length ? projectTimeline.map((entry) => (
                          <div key={`${entry.date}-${entry.titleEn}`} className="rounded-2xl border border-border bg-muted/20 px-4 py-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {lang === 'ko' ? entry.titleKo : entry.titleEn}
                                </p>
                                {(lang === 'ko' ? entry.detailKo : entry.detailEn) && (
                                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                    {lang === 'ko' ? entry.detailKo : entry.detailEn}
                                  </p>
                                )}
                              </div>
                              <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                {new Date(`${entry.date}T00:00:00`).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">{lang === 'ko' ? '타임라인이 곧 추가됩니다.' : 'Timeline entries will appear here.'}</p>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={0.06}>
                    <div className="rounded-xl border border-border bg-card p-6">
                      <h3 className="text-lg font-semibold text-charcoal">{lang === 'ko' ? '최근 업데이트' : 'Recent updates'}</h3>
                      <div className="mt-5 space-y-4">
                        {projectUpdates.length ? projectUpdates.map((entry) => (
                          <div key={entry.id} className="rounded-2xl border border-border bg-muted/20 px-4 py-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {lang === 'ko' ? entry.titleKo : entry.titleEn}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                  {lang === 'ko' ? entry.summaryKo : entry.summaryEn}
                                </p>
                                {(lang === 'ko' ? entry.learningKo : entry.learningEn) && (
                                  <p className="mt-3 text-sm leading-7 text-foreground/80">
                                    <span className="font-medium">{lang === 'ko' ? '배운 점:' : 'What we learned:'}</span>{' '}
                                    {lang === 'ko' ? entry.learningKo : entry.learningEn}
                                  </p>
                                )}
                              </div>
                              <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                {new Date(`${entry.date}T00:00:00`).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            {entry.tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {entry.tags.map((tag) => (
                                  <span key={tag} className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-foreground/76">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">{lang === 'ko' ? '업데이트가 곧 추가됩니다.' : 'Updates will appear here.'}</p>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              )}

              {(project.impactSummary || project.nextSteps || project.lessons) && (
                <div className="grid gap-6 lg:grid-cols-3">
                  {project.impactSummary && (
                    <ScrollReveal>
                      <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="text-lg font-semibold text-charcoal">{lang === 'ko' ? '영향' : 'Impact'}</h3>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground">{project.impactSummary}</p>
                      </div>
                    </ScrollReveal>
                  )}
                  {project.nextSteps && (
                    <ScrollReveal delay={0.04}>
                      <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="text-lg font-semibold text-charcoal">{lang === 'ko' ? '다음 단계' : 'Next steps'}</h3>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground">{project.nextSteps}</p>
                      </div>
                    </ScrollReveal>
                  )}
                  {project.lessons && (
                    <ScrollReveal delay={0.08}>
                      <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="text-lg font-semibold text-charcoal">{lang === 'ko' ? '배운 점' : 'What we learned'}</h3>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground">{project.lessons}</p>
                      </div>
                    </ScrollReveal>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-4">
              <ScrollReveal direction="right">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-charcoal">{t('projectDetail.financial')}</h3>
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    {[
                      { label: lang === 'ko' ? '현재 상태' : 'Current status', value: lifecycleLabel, color: 'text-charcoal' },
                      { label: lang === 'ko' ? '프로젝트 리드' : 'Project lead', value: project.lead || '—', color: 'text-charcoal' },
                      { label: t('projects.revenue'), value: formatCurrency(project.revenue), color: 'text-charcoal' },
                      { label: t('projectDetail.expenses'), value: formatCurrency(project.expenses), color: 'text-red-500' },
                      { label: t('projectDetail.fundraise'), value: formatCurrency(project.fundraise ?? 0), color: 'text-teal-600' },
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
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-charcoal">{t('projectDetail.team')}</h3>
                  {project.team.length === 0 ? (
                    <p className="mt-4 text-sm text-light">{t('projectDetail.teamPending')}</p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {project.team.map((ta) => (
                        <div key={ta.role}>
                          <p className="text-xs font-semibold text-[hsl(24,80%,50%)]">{ta.role}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {ta.members.map((m) => (
                              <span key={m} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-mid">{m}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
