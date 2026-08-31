import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { motionSpring } from '@/lib/motion';
import Footer from './Footer';
import Navbar from './Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.5 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="ss-shell min-h-screen overflow-x-clip bg-background">
      <motion.div className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-[var(--ss-coral)]" style={{ scaleX: progress }} />
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={reduceMotion ? false : { opacity: 0, filter: 'blur(7px)', scale: 0.94, y: 16 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, filter: 'blur(5px)', scale: 0.975, y: -8 }}
          transition={motionSpring.depth}
          className="min-h-[70vh] min-w-0 overflow-x-clip"
          style={{ transformOrigin: '50% 10%', transformPerspective: 1200 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
