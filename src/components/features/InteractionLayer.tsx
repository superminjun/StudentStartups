import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

type CursorState = {
  visible: boolean;
  label: string;
  variant: 'pill' | 'image' | 'dot';
};

const supportsFinePointer = () =>
  typeof window !== 'undefined'
  && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export default function InteractionLayer() {
  const reduceMotion = useReducedMotion();
  const cursorX = useMotionValue(-80);
  const cursorY = useMotionValue(-80);
  const springX = useSpring(cursorX, { stiffness: 420, damping: 34, mass: 0.45 });
  const springY = useSpring(cursorY, { stiffness: 420, damping: 34, mass: 0.45 });
  const [cursor, setCursor] = useState<CursorState>({ visible: false, label: '', variant: 'pill' });
  const cursorKeyRef = useRef('false--pill');

  const setCursorIfChanged = (next: CursorState) => {
    const key = `${next.visible}-${next.label}-${next.variant}`;
    if (cursorKeyRef.current === key) return;
    cursorKeyRef.current = key;
    setCursor(next);
  };

  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;

    const updateProgress = () => {
      raf = 0;
      const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / max, 0), 1);
      root.style.setProperty('--page-scroll-progress', String(progress));
    };

    const requestUpdate = () => {
      if (!raf) raf = window.requestAnimationFrame(updateProgress);
    };

    root.classList.add('interaction-ready');
    updateProgress();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      root.classList.remove('interaction-ready');
      root.style.removeProperty('--page-scroll-progress');
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || !supportsFinePointer()) return;

    document.body.classList.add('has-custom-cursor');

    let magneticTarget: HTMLElement | null = null;

    const resetMagnetic = () => {
      if (!magneticTarget) return;
      magneticTarget.style.transform = '';
      magneticTarget = null;
    };

    const onPointerMove = (event: PointerEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);

      const target = event.target instanceof Element ? event.target : null;
      const cursorTarget = target?.closest<HTMLElement>('[data-cursor]');
      const variant = cursorTarget?.dataset.cursorVariant === 'image'
        ? 'image'
        : cursorTarget?.dataset.cursorVariant === 'dot'
          ? 'dot'
          : 'pill';
      setCursorIfChanged({
        visible: Boolean(cursorTarget),
        label: cursorTarget?.dataset.cursor ?? '',
        variant,
      });

      const nextMagnetic = target?.closest<HTMLElement>('[data-magnetic="true"]');
      if (nextMagnetic !== magneticTarget) {
        resetMagnetic();
        magneticTarget = nextMagnetic ?? null;
      }

      if (!magneticTarget) return;
      const rect = magneticTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.13;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
      magneticTarget.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onPointerLeave = () => {
      resetMagnetic();
      setCursorIfChanged({ visible: false, label: '', variant: 'pill' });
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-cursor]') : null;
      if (!target) return;
      const variant = target.dataset.cursorVariant === 'image'
        ? 'image'
        : target.dataset.cursorVariant === 'dot'
          ? 'dot'
          : 'pill';
      setCursorIfChanged({ visible: true, label: target.dataset.cursor ?? '', variant });
    };

    const onPointerOut = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-cursor]') : null;
      const related = event.relatedTarget instanceof Element ? event.relatedTarget.closest<HTMLElement>('[data-cursor]') : null;
      if (!target || related === target) return;
      setCursorIfChanged({ visible: false, label: '', variant: 'pill' });
      resetMagnetic();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointerover', onPointerOver, { passive: true });
    window.addEventListener('pointerout', onPointerOut, { passive: true });

    return () => {
      resetMagnetic();
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('pointerout', onPointerOut);
    };
  }, [cursorX, cursorY, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <>
      <div className="pointer-events-none fixed left-0 top-0 z-[80] h-[2px] w-full origin-left scale-x-[var(--page-scroll-progress,0)] bg-foreground/80 transition-transform duration-75" />
      <AnimatePresence>
        {cursor.visible && (
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[90] hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-foreground/25 bg-card/25 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground shadow-2xl shadow-foreground/10 backdrop-blur-md lg:flex"
            style={{ x: springX, y: springY }}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{
              opacity: 1,
              scale: cursor.variant === 'image' ? 1 : 0.96,
              width: cursor.variant === 'image' ? 96 : cursor.variant === 'dot' ? 18 : 74,
              height: cursor.variant === 'image' ? 44 : cursor.variant === 'dot' ? 18 : 34,
              borderRadius: cursor.variant === 'image' ? 16 : 999,
            }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.18 }}
          >
            {cursor.variant !== 'dot' ? cursor.label : null}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
