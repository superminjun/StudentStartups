import { useRef, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface Props {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  delay?: number;
  className?: string;
  duration?: number;
}

const offsets = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: -24 },
  right: { x: 24 },
  scale: { scale: 0.96 },
  fade: {},
};

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className,
  duration = 0.5,
}: Props) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1 } : undefined}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: 'transform, opacity' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
