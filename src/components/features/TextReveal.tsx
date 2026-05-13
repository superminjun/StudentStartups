import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type TextRevealProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  stagger?: number;
};

export default function TextReveal({
  text,
  as = 'span',
  className,
  delay = 0,
  stagger = 0.035,
}: TextRevealProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];
  const words = text.split(/(\s+)/);

  if (reduceMotion) {
    const StaticComponent = as;
    return <StaticComponent className={className}>{text}</StaticComponent>;
  }

  return (
    <Component
      className={cn('whitespace-pre-line', className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {words.map((word, index) => {
        if (/^\s+$/.test(word)) return word;
        return (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: '105%', opacity: 0 },
                visible: {
                  y: '0%',
                  opacity: 1,
                  transition: { duration: 0.78, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </Component>
  );
}
