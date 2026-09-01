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
  up: { y: 24 },
  down: { y: -24 },
  left: { x: -28 },
  right: { x: 28 },
  scale: { y: 14, scale: .985 },
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
      initial={reduceMotion ? false : { opacity: 0, filter: 'blur(6px)', scale: .995, ...offsets[direction] }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount, margin }}
      transition={{ ...motionSpring.reveal, delay }}
      className={className}
      style={{ transformPerspective: 1200 }}
    >
      {children}
    </motion.div>
  );
}
