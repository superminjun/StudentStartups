import { useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCounter } from '@/hooks/useCounter';
import { useCMSStore } from '@/stores/cmsStore';
import { STAGE_LABELS_EN, STAGE_LABELS_KO } from '@/constants/config';
import ScrollReveal from '@/components/features/ScrollReveal';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line,
} from 'recharts';

type ImpactMetricView = {
  labelEn: string;
  labelKo: string;
  value: number;
  prefix?: string;
  suffix?: string;
};

function BigCounter({ metric, index }: { metric: ImpactMetricView; index: number }) {
  const { lang } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useCounter(metric.value, isInView, 2200);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -3 }}
      className="card card-hover p-6 text-center"
    >
      <p className="text-3xl font-semibold text-foreground tabular-nums sm:text-4xl">
        {metric.prefix}{count.toLocaleString()}{metric.suffix}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{lang === 'en' ? metric.labelEn : metric.labelKo}</p>
    </motion.div>
  );
}

function DonationBarChart({ data, emptyLabel }: { data: { name: string; value: number }[]; emptyLabel: string }) {
  const hasData = data.length > 0;
  const hasValues = data.some((d) => d.value > 0);

  if (!hasData || !hasValues) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 6, left: -12, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            interval={0}
            tickFormatter={(value) => (value.length > 10 ? `${value.slice(0, 10)}…` : value)}
          />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              fontSize: '13px',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Impact() {
  const { lang, t } = useLanguage();
  const [activePanel, setActivePanel] = useState<'revenue' | 'donations' | 'members' | 'stages'>('revenue');
  const impactMetricsRaw = useCMSStore((s) => s.impactMetrics);
  const revenueChartData = useCMSStore((s) => s.revenueData);
  const donationByProject = useCMSStore((s) => s.donationData);
  const memberGrowth = useCMSStore((s) => s.memberGrowthData);
  const projects = useCMSStore((s) => s.projects);

  const getChartWidth = (count: number, base = 560, per = 90) => Math.max(base, count * per);
  const stageLabels = lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_KO;

  const fallbackDonations = projects
    .map((project) => ({ name: project.name, value: project.donation }))
    .filter((row) => row.name);

  const donationChartData = donationByProject.some((row) => row.value > 0)
    ? donationByProject
    : fallbackDonations;

  const impactMetrics: ImpactMetricView[] = impactMetricsRaw.map((metric) => ({
    labelEn: metric.labelEn,
    labelKo: metric.labelKo,
    value: metric.value,
    prefix: metric.prefix,
    suffix: metric.suffix,
  }));

  const stageCounts = projects.reduce<Record<number, number>>((acc, project) => {
    const key = Number(project.stage) || 1;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const stageData = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7].map((stage) => ({
        stage: stageLabels[stage],
        count: stageCounts[stage] ?? 0,
      })),
    [stageCounts, stageLabels]
  );

  const panelTabs = [
    { key: 'revenue' as const, label: t('impact.revenueTitle') },
    { key: 'donations' as const, label: t('impact.donationTitle') },
    { key: 'members' as const, label: t('impact.memberTitle') },
    { key: 'stages' as const, label: t('impact.stageTitle') },
  ];

  return (
    <div>
      <section className="section bg-charcoal pt-32 lg:pt-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            {t('impact.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 max-w-2xl text-base text-white/55"
          >
            {t('impact.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Counters */}
      <section className="section-tight bg-beige">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impactMetrics.map((m, i) => (
              <BigCounter key={m.labelEn} metric={m} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="bg-card py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              <div className="flex min-w-max gap-2">
                {panelTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActivePanel(tab.key)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activePanel === tab.key
                        ? 'bg-charcoal text-white'
                        : 'border border-border bg-white text-mid hover:text-charcoal'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-6">
            {activePanel === 'revenue' && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-semibold text-charcoal">{t('impact.revenueTitle')}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mid">{t('impact.revenueBody')}</p>
                  </div>
                  <div className="mt-5 overflow-x-auto">
                    <div className="h-[18rem] min-w-[18rem] sm:h-80" style={{ minWidth: getChartWidth(revenueChartData.length, 320, 80) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueChartData}>
                          <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '13px', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                          <Area type="monotone" dataKey="revenue" stroke="hsl(var(--foreground))" fill="url(#revGrad)" strokeWidth={2} />
                          <Area type="monotone" dataKey="expenses" stroke="hsl(var(--accent))" fill="none" strokeWidth={1.5} strokeDasharray="5 5" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {activePanel === 'donations' && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-semibold text-charcoal">{t('impact.donationTitle')}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mid">{t('impact.donationBody')}</p>
                  </div>
                  <div className="mt-5 overflow-x-auto">
                    <div style={{ minWidth: getChartWidth(donationChartData.length, 320, 80) }}>
                      <DonationBarChart data={donationChartData} emptyLabel={t('impact.noDonations')} />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {activePanel === 'members' && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-semibold text-charcoal">{t('impact.memberTitle')}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mid">{t('impact.memberBody')}</p>
                  </div>
                  <div className="mt-5 overflow-x-auto">
                    <div className="h-[18rem] min-w-[18rem] sm:h-80" style={{ minWidth: getChartWidth(memberGrowth.length, 320, 80) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={memberGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                          <Line type="monotone" dataKey="members" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(var(--accent))' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {activePanel === 'stages' && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-semibold text-charcoal">{t('impact.stageTitle')}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mid">{t('impact.stageBody')}</p>
                  </div>
                  <div className="mt-5 overflow-x-auto">
                    <div className="h-[19rem] min-w-[18rem] sm:h-[24rem]" style={{ minWidth: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stageData} margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="stage" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} interval={0} angle={stageData.length > 4 ? -12 : 0} textAnchor={stageData.length > 4 ? 'end' : 'middle'} height={stageData.length > 4 ? 52 : 36} />
                          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="hsl(var(--foreground))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
