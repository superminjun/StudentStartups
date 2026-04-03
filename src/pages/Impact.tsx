import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCounter } from '@/hooks/useCounter';
import { useCMSStore } from '@/stores/cmsStore';
import ScrollReveal from '@/components/features/ScrollReveal';
import { donationByProject as mockDonationByProject } from '@/constants/mockData';
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
      className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6 text-center transition-shadow hover:shadow-md"
    >
      <p className="text-3xl font-bold text-charcoal tabular-nums sm:text-4xl">
        {metric.prefix}{count.toLocaleString()}{metric.suffix}
      </p>
      <p className="mt-2 text-sm text-light">{lang === 'en' ? metric.labelEn : metric.labelKo}</p>
    </motion.div>
  );
}

export default function Impact() {
  const { t } = useLanguage();
  const impactMetricsRaw = useCMSStore((s) => s.impactMetrics) ?? [];
  const revenueChartData = useCMSStore((s) => s.revenueData) ?? [];
  const donationByProject = useCMSStore((s) => s.donationData) ?? [];
  const memberGrowth = useCMSStore((s) => s.memberGrowthData) ?? [];
  const projects = useCMSStore((s) => s.projects) ?? [];

  const projectDonations = projects
    .map((project) => ({ name: project.name, value: project.donation }))
    .filter((row) => row.name);

  const donationChartData = projectDonations.length
    ? projectDonations
    : donationByProject.length
      ? donationByProject
      : mockDonationByProject;

  const impactMetrics: ImpactMetricView[] = impactMetricsRaw.map((metric) => ({
    labelEn: metric.labelEn,
    labelKo: metric.labelKo,
    value: metric.value,
    prefix: metric.prefix,
    suffix: metric.suffix,
  }));

  const stageDistribution = [1, 2, 3, 4, 5, 6, 7].map((s) => ({
    stage: `Stage ${s}`,
    count: projects.filter((p) => p.stage === s).length,
  }));

  return (
    <div>
      <section className="bg-charcoal pb-20 pt-32 lg:pb-28 lg:pt-40">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {t('impact.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 max-w-2xl text-base text-white/50"
          >
            {t('impact.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Counters */}
      <section className="bg-beige py-14 lg:py-18">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impactMetrics.map((m, i) => (
              <BigCounter key={m.labelEn} metric={m} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue */}
            <ScrollReveal>
              <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
                <h3 className="text-lg font-semibold text-charcoal">{t('impact.revenueTitle')}</h3>
                <div className="mt-5 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-area))" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(var(--chart-area))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--chart-axis))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--chart-axis))' }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--card))',
                          color: 'hsl(var(--foreground))',
                          fontSize: '13px',
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-line))" fill="url(#revGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="expenses" stroke="hsl(var(--chart-expenses))" fill="none" strokeWidth={1.5} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollReveal>

            {/* Donations */}
            <ScrollReveal delay={0.08}>
              <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
                <h3 className="text-lg font-semibold text-charcoal">{t('impact.donationTitle')}</h3>
                <div className="mt-5 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={donationChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-12}
                        height={60}
                        textAnchor="end"
                        tick={{ fontSize: 10, fill: 'hsl(var(--chart-axis))' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--chart-axis))' }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--card))',
                          color: 'hsl(var(--foreground))',
                          fontSize: '13px',
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {donationChartData.map((_, i) => (
                          <Cell key={i} fill={i % 2 === 0 ? 'hsl(var(--chart-bar))' : 'hsl(var(--chart-bar-alt))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollReveal>

            {/* Member growth */}
            <ScrollReveal>
              <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
                <h3 className="text-lg font-semibold text-charcoal">{t('impact.memberTitle')}</h3>
                <div className="mt-5 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={memberGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--chart-axis))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--chart-axis))' }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          background: 'hsl(var(--card))',
                          color: 'hsl(var(--foreground))',
                          fontSize: '13px',
                        }}
                      />
                      <Line type="monotone" dataKey="members" stroke="hsl(var(--chart-accent))" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(var(--chart-accent))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollReveal>

            {/* Stage distribution */}
            <ScrollReveal delay={0.08}>
              <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
                <h3 className="text-lg font-semibold text-charcoal">{t('impact.projectTitle')}</h3>
                <div className="mt-5 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis dataKey="stage" tick={{ fontSize: 11, fill: 'hsl(var(--chart-axis))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--chart-axis))' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          background: 'hsl(var(--card))',
                          color: 'hsl(var(--foreground))',
                          fontSize: '13px',
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {stageDistribution.map((_, i) => (
                          <Cell key={i} fill={i % 2 === 0 ? 'hsl(var(--chart-bar))' : 'hsl(var(--chart-bar-alt))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
