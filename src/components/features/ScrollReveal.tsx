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
  up: { y: 32, rotateX: 1.2 },
  down: { y: -32, rotateX: -1.2 },
  left: { x: -36, rotateY: -.8 },
  right: { x: 36, rotateY: .8 },
  scale: { y: 18, scale: .975 },
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
      initial={reduceMotion ? false : { opacity: 0, filter: 'blur(10px)', scale: .985, ...offsets[direction] }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0 }}
      viewport={{ once: true, amount, margin }}
      transition={{ ...motionSpring.reveal, delay }}
      className={className}
      style={{ transformPerspective: 1200 }}
    >
      {children}
    </motion.div>
  );
}
