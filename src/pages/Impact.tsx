import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ScrollReveal from '@/components/features/ScrollReveal';
import { STAGE_LABELS_EN, STAGE_LABELS_KO } from '@/constants/config';
import { useCounter } from '@/hooks/useCounter';
import { useLanguage } from '@/hooks/useLanguage';
import { motionSpring, STAGGER } from '@/lib/motion';
import { useCMSStore, type ImpactMetricRecord } from '@/stores/cmsStore';

const axis = { fontSize: 10, fill: 'rgba(0,0,0,.48)' };
const tooltip = { border: '1px solid #d8d4ca', borderRadius: 2, boxShadow: 'none', background: '#fffdf8', color: '#2b1c20', fontSize: 12 };

function Metric({ metric, index }: { metric: ImpactMetricRecord; index: number }) {
  const { lang } = useLanguage();
  const ref = useRef(null);
  const count = useCounter(metric.value, useInView(ref, { once: true }), 1400);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...motionSpring.reveal, delay: index * STAGGER }} className="flex min-h-44 flex-col justify-between border-b border-[var(--ss-rule)] py-6 sm:px-6 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0">
      <p className="text-[10px] font-semibold tracking-[.12em] text-[var(--ss-muted)]">0{index + 1}</p>
      <div><p className="ss-stat break-words tabular-nums">{metric.prefix}{count.toLocaleString()}{metric.suffix}</p><p className="mt-3 text-xs text-[var(--ss-muted)]">{lang === 'en' ? metric.labelEn : metric.labelKo}</p></div>
    </motion.div>
  );
}

function ChartCard({ no, title, body, children, wide = false }: { no: string; title: string; body: string; children: ReactNode; wide?: boolean }) {
  return (
    <ScrollReveal className={wide ? 'lg:col-span-2' : ''} amount={.18}>
      <article className="border-t border-white/20 pt-6">
        <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/38">{no}</p><h2 className="mt-3 font-heading text-xl font-medium text-white sm:text-2xl">{title}</h2></div><p className="max-w-sm text-sm leading-6 text-white/52">{body}</p></div>
        <div className="h-[20rem] min-w-0 bg-[var(--ss-surface)] p-3 sm:h-[24rem]">{children}</div>
      </article>
    </ScrollReveal>
  );
}

export default function Impact() {
  const { lang, t } = useLanguage();
  const metrics = useCMSStore((state) => state.impactMetrics);
  const revenue = useCMSStore((state) => state.revenueData);
  const donations = useCMSStore((state) => state.donationData);
  const growth = useCMSStore((state) => state.memberGrowthData);
  const projects = useCMSStore((state) => state.projects);
  const labels = lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_KO;
  const donationData = donations.some((item) => item.value > 0) ? donations : projects.filter((project) => project.donation > 0).map((project) => ({ name: project.name, value: project.donation }));
  const stageData = [1, 2, 3, 4, 5, 6, 7].map((stage) => ({ stage: labels[stage], count: projects.filter((project) => project.stage === stage).length }));

  return (
    <div className="bg-[var(--ss-paper)] pt-[4.5rem]">
      <section className="border-b border-[var(--ss-rule)] py-16 lg:py-20">
        <div className="ss-wrap grid gap-10 lg:grid-cols-[.38fr_1fr]">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.reveal} className="ss-label text-[var(--ss-accent)]">{t('nav.impact')}</motion.p>
          <div><motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.depth} className="ss-display">{t('impact.title')}</motion.h1><motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .1 }} className="mt-7 max-w-xl text-[15px] leading-7 text-[var(--ss-muted)]">{t('impact.subtitle')}</motion.p></div>
        </div>
      </section>

      <section className="ss-section bg-[var(--ss-surface)]"><div className="ss-wrap grid border-y border-[var(--ss-rule)] sm:grid-cols-2 lg:grid-cols-4">{metrics.map((metric, index) => <Metric key={metric.id} metric={metric} index={index} />)}</div></section>

      <section className="ss-section bg-[var(--ss-navy)] text-white">
        <div className="ss-wrap grid gap-14 lg:grid-cols-[.38fr_1fr]">
          <div className="lg:sticky lg:top-28 lg:h-fit"><ScrollReveal><p className="ss-label text-white/40">{lang === 'ko' ? '기록 읽기' : 'Reading the record'}</p><h2 className="ss-heading mt-6">{lang === 'ko' ? '활동을 비교할 수 있는 자료로.' : 'From activity to evidence.'}</h2><p className="mt-7 max-w-sm text-sm leading-7 text-white/50">{lang === 'ko' ? '같은 기준으로 기록하면 학기와 프로젝트 사이의 변화를 비교할 수 있습니다.' : 'A consistent record makes change visible across projects and terms.'}</p></ScrollReveal></div>
          <div className="grid gap-7 lg:grid-cols-2">
            <ChartCard no="01" title={t('impact.revenueTitle')} body={t('impact.revenueBody')} wide>
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={revenue} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="impactRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#121212" stopOpacity={.22} /><stop offset="100%" stopColor="#121212" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(0,0,0,.1)" /><XAxis dataKey="month" tick={axis} tickLine={false} axisLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltip} /><Area type="monotone" dataKey="revenue" stroke="#121212" fill="url(#impactRevenue)" strokeWidth={3} animationDuration={1200} /><Area type="monotone" dataKey="expenses" stroke="#9a7654" fill="none" strokeWidth={2} animationDuration={1400} /></AreaChart></ResponsiveContainer>
            </ChartCard>
            <ChartCard no="02" title={t('impact.memberTitle')} body={t('impact.memberBody')}>
              <ResponsiveContainer width="100%" height="100%"><LineChart data={growth} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="rgba(0,0,0,.1)" /><XAxis dataKey="month" tick={axis} tickLine={false} axisLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltip} /><Line type="monotone" dataKey="members" stroke="#121212" strokeWidth={3} dot={false} activeDot={{ r: 5 }} animationDuration={1400} /></LineChart></ResponsiveContainer>
            </ChartCard>
            <ChartCard no="03" title={t('impact.stageTitle')} body={t('impact.stageBody')}>
              <ResponsiveContainer width="100%" height="100%"><BarChart data={stageData} margin={{ top: 12, right: 8, left: -20, bottom: 8 }}><CartesianGrid vertical={false} stroke="rgba(0,0,0,.1)" /><XAxis dataKey="stage" tick={axis} tickLine={false} axisLine={false} interval={0} /><YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip contentStyle={tooltip} /><Bar dataKey="count" fill="#121212" radius={[8, 8, 0, 0]} animationDuration={1200} /></BarChart></ResponsiveContainer>
            </ChartCard>
            <ChartCard no="04" title={t('impact.donationTitle')} body={t('impact.donationBody')} wide>
              {donationData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><BarChart data={donationData} layout="vertical" margin={{ top: 0, right: 18, left: 20, bottom: 0 }}><CartesianGrid horizontal={false} stroke="rgba(0,0,0,.1)" /><XAxis type="number" tick={axis} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="name" width={100} tick={axis} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltip} /><Bar dataKey="value" fill="#121212" radius={[0, 8, 8, 0]} animationDuration={1400} /></BarChart></ResponsiveContainer> : <p className="grid h-full place-items-center text-sm text-black/45">{t('impact.noDonations')}</p>}
            </ChartCard>
          </div>
        </div>
      </section>
    </div>
  );
}
