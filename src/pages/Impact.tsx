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
const tooltip = { border: '1px solid rgba(0,0,0,.12)', borderRadius: 14, boxShadow: '0 14px 40px rgba(0,0,0,.12)', background: 'rgba(255,255,255,.94)', color: '#121212', fontSize: 12 };

function Metric({ metric, index }: { metric: ImpactMetricRecord; index: number }) {
  const { lang } = useLanguage();
  const ref = useRef(null);
  const count = useCounter(metric.value, useInView(ref, { once: true }), 1400);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...motionSpring.reveal, delay: index * STAGGER }} className="flex min-h-56 flex-col justify-between border-b border-r border-black/10 bg-[var(--ss-panel)] p-6">
      <div className="flex items-center justify-between text-[10px] font-black tracking-[.16em]"><span>0{index + 1}</span><span className="size-2 rounded-full bg-black ss-pulse" /></div>
      <div><p className="ss-stat break-words tabular-nums">{metric.prefix}{count.toLocaleString()}{metric.suffix}</p><p className="mt-3 text-sm font-semibold text-black/55">{lang === 'en' ? metric.labelEn : metric.labelKo}</p></div>
    </motion.div>
  );
}

function ChartCard({ no, title, body, color, children, wide = false }: { no: string; title: string; body: string; color: string; children: ReactNode; wide?: boolean }) {
  return (
    <ScrollReveal className={wide ? 'lg:col-span-2' : ''} amount={.18}>
      <article className="overflow-hidden rounded-[1.5rem] border border-white/10 p-3 shadow-[0_30px_80px_rgba(0,0,0,.25)]" style={{ background: color }}>
        <div className="flex flex-col gap-4 px-4 pb-6 pt-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-black/40">{no} / Live record</p><h2 className="mt-3 text-2xl font-semibold tracking-[-.05em] text-black sm:text-3xl">{title}</h2></div><p className="max-w-sm text-sm leading-6 text-black/55">{body}</p></div>
        <div className="h-[20rem] min-w-0 rounded-[1.35rem] bg-white/65 p-3 backdrop-blur sm:h-[24rem]">{children}</div>
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
    <div className="bg-[var(--ss-canvas)] pt-[4.75rem]">
      <section className="relative overflow-hidden px-5 py-20 sm:px-8 lg:py-28">
        <div className="relative mx-auto max-w-[90rem]">
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.reveal} className="ss-label text-black/45">Record / Numbers with consequences</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 32, filter: 'blur(9px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={motionSpring.depth} className="ss-display mt-8">{t('impact.title')}</motion.h1>
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .2 }} className="mt-14 grid gap-8 border-t border-black/20 pt-7 lg:grid-cols-[1fr_.65fr]"><p className="ss-lead max-w-3xl">{lang === 'ko' ? '의도는 좋을 수 있습니다. 결과는 기록되어야 합니다.' : 'Intent can be good. Outcomes still need a record.'}</p><p className="max-w-lg text-base leading-7 text-black/55">{t('impact.subtitle')}</p></motion.div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 lg:pb-32"><div className="mx-auto grid max-w-[90rem] overflow-hidden rounded-[2rem] border border-black/10 sm:grid-cols-2 lg:grid-cols-4">{metrics.map((metric, index) => <Metric key={metric.id} metric={metric} index={index} />)}</div></section>

      <section className="bg-[var(--ss-night)] px-5 py-24 text-white sm:px-8 lg:py-36">
        <div className="mx-auto grid max-w-[90rem] gap-14 lg:grid-cols-[.44fr_1.56fr]">
          <div className="lg:sticky lg:top-28 lg:h-fit"><ScrollReveal><p className="ss-label text-white/40">Read the record</p><h2 className="ss-heading mt-6">From activity<br /><span className="text-white/30">to evidence.</span></h2><p className="mt-7 max-w-sm text-sm leading-7 text-white/50">{lang === 'ko' ? '그래프 하나마다 같은 질문을 합니다. 무엇이 실제로 움직였고, 다음 결정은 무엇이어야 하는가.' : 'Every chart asks the same question: what actually moved, and what should the next decision be?'}</p></ScrollReveal></div>
          <div className="grid gap-7 lg:grid-cols-2">
            <ChartCard no="01" title={t('impact.revenueTitle')} body={t('impact.revenueBody')} color="var(--ss-lime)" wide>
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={revenue} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="impactRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#121212" stopOpacity={.22} /><stop offset="100%" stopColor="#121212" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(0,0,0,.1)" /><XAxis dataKey="month" tick={axis} tickLine={false} axisLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltip} /><Area type="monotone" dataKey="revenue" stroke="#121212" fill="url(#impactRevenue)" strokeWidth={3} animationDuration={1200} /><Area type="monotone" dataKey="expenses" stroke="#9a7654" fill="none" strokeWidth={2} animationDuration={1400} /></AreaChart></ResponsiveContainer>
            </ChartCard>
            <ChartCard no="02" title={t('impact.memberTitle')} body={t('impact.memberBody')} color="var(--ss-sky)">
              <ResponsiveContainer width="100%" height="100%"><LineChart data={growth} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="rgba(0,0,0,.1)" /><XAxis dataKey="month" tick={axis} tickLine={false} axisLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltip} /><Line type="monotone" dataKey="members" stroke="#121212" strokeWidth={3} dot={false} activeDot={{ r: 5 }} animationDuration={1400} /></LineChart></ResponsiveContainer>
            </ChartCard>
            <ChartCard no="03" title={t('impact.stageTitle')} body={t('impact.stageBody')} color="var(--ss-sand)">
              <ResponsiveContainer width="100%" height="100%"><BarChart data={stageData} margin={{ top: 12, right: 8, left: -20, bottom: 8 }}><CartesianGrid vertical={false} stroke="rgba(0,0,0,.1)" /><XAxis dataKey="stage" tick={axis} tickLine={false} axisLine={false} interval={0} /><YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip contentStyle={tooltip} /><Bar dataKey="count" fill="#121212" radius={[8, 8, 0, 0]} animationDuration={1200} /></BarChart></ResponsiveContainer>
            </ChartCard>
            <ChartCard no="04" title={t('impact.donationTitle')} body={t('impact.donationBody')} color="var(--ss-violet)" wide>
              {donationData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><BarChart data={donationData} layout="vertical" margin={{ top: 0, right: 18, left: 20, bottom: 0 }}><CartesianGrid horizontal={false} stroke="rgba(0,0,0,.1)" /><XAxis type="number" tick={axis} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="name" width={100} tick={axis} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltip} /><Bar dataKey="value" fill="#121212" radius={[0, 8, 8, 0]} animationDuration={1400} /></BarChart></ResponsiveContainer> : <p className="grid h-full place-items-center text-sm text-black/45">{t('impact.noDonations')}</p>}
            </ChartCard>
          </div>
        </div>
      </section>
    </div>
  );
}
