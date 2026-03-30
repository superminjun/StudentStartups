import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCounter } from '@/hooks/useCounter';
import { useCMSStore } from '@/stores/cmsStore';
import ScrollReveal from './ScrollReveal';

type Metric = {
  labelEn: string;
  labelKo: string;
  value: number;
  prefix?: string;
  suffix?: string;
};

function CounterCard({ metric, index }: { metric: Metric; index: number }) {
  const { lang } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const count = useCounter(metric.value, isInView, 2000);

  return (
    <ScrollReveal delay={index * 0.1} direction="up">
      <div ref={ref} className="text-center">
        <p className="text-3xl font-bold tracking-tight text-white tabular-nums sm:text-4xl lg:text-5xl">
          {metric.prefix}{count.toLocaleString()}{metric.suffix}
        </p>
        <p className="mt-2 text-sm text-white/50">
          {lang === 'en' ? metric.labelEn : metric.labelKo}
        </p>
      </div>
    </ScrollReveal>
  );
}

export default function ImpactCounters() {
  const { t } = useLanguage();
  const metrics = useCMSStore((s) => s.impactMetrics);

  return (
    <section className="bg-charcoal py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t('impactPreview.title')}
          </h2>
          <p className="mt-3 text-base text-white/40">{t('impactPreview.subtitle')}</p>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <CounterCard
              key={`${metric.labelEn}-${i}`}
              metric={{
                labelEn: metric.labelEn,
                labelKo: metric.labelKo,
                value: metric.value,
                prefix: metric.prefix,
                suffix: metric.suffix,
              }}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
