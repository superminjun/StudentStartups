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
  up: { y: 18, rotateX: 2.4 },
  down: { y: -18, rotateX: -2.4 },
  left: { x: -24, rotateY: -2 },
  right: { x: 24, rotateY: 2 },
  scale: { y: 10, scale: 0.95 },
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
      initial={reduceMotion ? false : { opacity: 0, filter: 'blur(5px)', scale: 0.965, ...offsets[direction] }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0 }}
      viewport={{ once: true, amount, margin }}
      transition={{ ...motionSpring.reveal, delay }}
      className={className}
      style={{ transformPerspective: 900 }}
    >
      {children}
    </motion.div>
  );
}
