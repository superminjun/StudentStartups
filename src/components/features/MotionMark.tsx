import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function MotionMark({ className, dark = false }: { className?: string; dark?: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('ss-mark', dark && 'ss-mark--dark', className)} aria-hidden>
      <motion.span
        className="ss-mark__orbit ss-mark__orbit--wide"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
      <motion.span
        className="ss-mark__orbit ss-mark__orbit--tall"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      />
      <span className="ss-mark__core">SS</span>
    </div>
  );
}
