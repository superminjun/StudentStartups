import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Props {
  value: number;
  max: number;
  label: string;
  color?: string;
}

export default function AnimatedProgress({ value, max, label, color = 'bg-[hsl(24,80%,50%)]' }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const percent = max > 0 ? (value / max) * 100 : 0;

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-charcoal">{label}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[hsl(30,15%,92%)]">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${Math.min(percent, 100)}%` } : { width: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}
