import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import ScrollReveal from '@/components/features/ScrollReveal';
import { STAGE_LABELS_EN, STAGE_LABELS_KO } from '@/constants/config';
import { useCounter } from '@/hooks/useCounter';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore, type ImpactMetricRecord } from '@/stores/cmsStore';

const axis = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' };
const tooltip = {
  border: '1px solid hsl(var(--border))',
  borderRadius: 0,
  boxShadow: 'none',
  background: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
  fontSize: 12,
};

function Metric({ metric }: { metric: ImpactMetricRecord }) {
  const { lang } = useLanguage();
  const ref = useRef(null);
  const count = useCounter(metric.value, useInView(ref, { once: true }), 1400);
  return (
    <div ref={ref} className="border-b border-border py-6 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
      <p className="text-3xl font-semibold tracking-[-0.045em] text-foreground tabular-nums sm:text-4xl">
        {metric.prefix}{count.toLocaleString()}{metric.suffix}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{lang === 'en' ? metric.labelEn : metric.labelKo}</p>
    </div>
  );
}

function ChartFrame({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <article className="border-t border-foreground pt-6">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{body}</p>
      <div className="mt-7 h-72 min-w-0">{children}</div>
    </article>
  );
}

export default function Impact() {
  const { lang, t } = useLanguage();
  const metrics = useCMSStore((state) => state.impactMetrics);
  const revenue = useCMSStore((state) => state.revenueData);
  const donations = useCMSStore((state) => state.donationData);
  const growth = useCMSStore((state) => state.memberGrowthData);
  const projects = useCMSStore((state) => state.projects);
  const stageLabels = lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_KO;

  const donationData = donations.some((item) => item.value > 0)
    ? donations
    : projects.filter((project) => project.donation > 0).map((project) => ({ name: project.name, value: project.donation }));
  const stageData = [1, 2, 3, 4, 5, 6, 7].map((stage) => ({
    stage: stageLabels[stage],
    count: projects.filter((project) => project.stage === stage).length,
  }));

  return (
    <div className="pt-[4.5rem]">
      <section className="border-b border-border bg-background py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end"
          >
            <div>
              <p className="section-kicker">{t('nav.impact')}</p>
              <h1 className="mt-6 font-heading text-[clamp(3.4rem,8vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-foreground">{t('impact.title')}</h1>
            </div>
            <p className="max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">{t('impact.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="bg-card py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid border-t border-foreground sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => <Metric key={metric.id} metric={metric} />)}
          </div>
        </div>
      </section>

      <section className="bg-card pb-20 pt-10 sm:pb-28 sm:pt-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ScrollReveal>
            <ChartFrame title={t('impact.revenueTitle')} body={t('impact.revenueBody')}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="impactRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={axis} tickLine={false} axisLine={false} />
                  <YAxis tick={axis} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltip} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" fill="url(#impactRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="hsl(var(--foreground))" fill="none" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartFrame>
          </ScrollReveal>

          <div className="mt-16 grid gap-16 lg:grid-cols-2">
            <ScrollReveal>
              <ChartFrame title={t('impact.memberTitle')} body={t('impact.memberBody')}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growth} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={axis} tickLine={false} axisLine={false} />
                    <YAxis tick={axis} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltip} />
                    <Line type="monotone" dataKey="members" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartFrame>
            </ScrollReveal>

            <ScrollReveal delay={0.06}>
              <ChartFrame title={t('impact.stageTitle')} body={t('impact.stageBody')}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="stage" tick={axis} tickLine={false} axisLine={false} interval={0} />
                    <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltip} />
                    <Bar dataKey="count" fill="hsl(var(--foreground))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartFrame>
            </ScrollReveal>
          </div>

          <ScrollReveal className="mt-16">
            <ChartFrame title={t('impact.donationTitle')} body={t('impact.donationBody')}>
              {donationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={donationData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={axis} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" width={100} tick={axis} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltip} />
                    <Bar dataKey="value" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="grid h-full place-items-center text-sm text-muted-foreground">{t('impact.noDonations')}</p>
              )}
            </ChartFrame>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
