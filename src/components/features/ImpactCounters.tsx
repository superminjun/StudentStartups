import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCounter } from '@/hooks/useCounter';
import { useCMSStore } from '@/stores/cmsStore';
import ScrollReveal from './ScrollReveal';
import { cn } from '@/lib/utils';

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
      <div ref={ref} className="card card-hover p-6">
        <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl">
          {metric.prefix}{count.toLocaleString()}{metric.suffix}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === 'en' ? metric.labelEn : metric.labelKo}
        </p>
      </div>
    </ScrollReveal>
  );
}

export default function ImpactCounters({ className }: { className?: string }) {
  const metrics = useCMSStore((s) => s.impactMetrics);

  return (
    <div className={cn('grid grid-cols-2 gap-6 lg:grid-cols-4', className)}>
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
  );
}
