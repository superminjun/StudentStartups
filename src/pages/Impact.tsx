import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCounter } from '@/hooks/useCounter';
import { useCMSStore } from '@/stores/cmsStore';
import ScrollReveal from '@/components/features/ScrollReveal';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Cell,
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
  const { t } = useLanguage();
  const impactMetricsRaw = useCMSStore((s) => s.impactMetrics);
  const revenueChartData = useCMSStore((s) => s.revenueData);
  const donationByProject = useCMSStore((s) => s.donationData);
  const memberGrowth = useCMSStore((s) => s.memberGrowthData);
  const projects = useCMSStore((s) => s.projects);

  const getChartWidth = (count: number, base = 560, per = 90) => Math.max(base, count * per);

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

  const categoryCounts = projects.reduce<Record<string, number>>((acc, project) => {
    const key = project.category?.trim() || 'General';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const categoryEntries = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const categoryData = categoryEntries.length > 6
    ? [
        ...categoryEntries.slice(0, 5),
        { category: 'Other', count: categoryEntries.slice(5).reduce((sum, item) => sum + item.count, 0) },
      ]
    : categoryEntries;

  return (
    <div>
      <section className="section bg-charcoal pt-32 lg:pt-40">
        <div className="mx-auto max-w-6xl px-6">
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
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impactMetrics.map((m, i) => (
              <BigCounter key={m.labelEn} metric={m} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="bg-card py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue */}
            <ScrollReveal>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-charcoal">{t('impact.revenueTitle')}</h3>
                <div className="mt-5 overflow-x-auto">
                  <div className="h-64" style={{ minWidth: getChartWidth(revenueChartData.length) }}>
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

            {/* Donations 3D bars */}
            <ScrollReveal delay={0.08}>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-charcoal">{t('impact.donationTitle')}</h3>
                <div className="mt-5 overflow-x-auto">
                  <div style={{ minWidth: getChartWidth(donationChartData.length) }}>
                    <DonationBarChart data={donationChartData} emptyLabel={t('impact.noDonations')} />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Member growth */}
            <ScrollReveal>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-charcoal">{t('impact.memberTitle')}</h3>
                <div className="mt-5 overflow-x-auto">
                  <div className="h-64" style={{ minWidth: getChartWidth(memberGrowth.length) }}>
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

            {/* Stage distribution */}
            <ScrollReveal delay={0.08}>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-charcoal">{t('impact.projectTitle')}</h3>
                <div className="mt-5 overflow-x-auto">
                  <div style={{ minWidth: 520, height: Math.max(220, categoryData.length * 38) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                        <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={120} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="hsl(var(--foreground))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
