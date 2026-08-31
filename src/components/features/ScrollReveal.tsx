import { useRef, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface Props {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  delay?: number;
  className?: string;
  duration?: number;
  amount?: number;
  margin?: string;
}

const offsets = {
  up: { y: 16 },
  down: { y: -16 },
  left: { x: -16 },
  right: { x: 16 },
  scale: { y: 10, scale: 0.985 },
  fade: {},
};

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className,
  duration = 0.48,
  amount = 0.15,
  margin = '-48px',
}: Props) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin, amount });

  if (reduceMotion) return <div ref={ref} className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1 } : undefined}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
