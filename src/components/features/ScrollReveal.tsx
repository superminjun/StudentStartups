import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { motionSpring } from '@/lib/motion';

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
  up: { y: 18 },
  down: { y: -18 },
  left: { x: -20 },
  right: { x: 20 },
  scale: { y: 12 },
  fade: {},
};

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className,
  amount = 0.16,
  margin = '-48px',
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount, margin }}
      transition={{ ...motionSpring.reveal, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
