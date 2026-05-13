import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import InteractionLayer from '@/components/features/InteractionLayer';

function PremiumLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="relative text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-muted-foreground">Student Startups</p>
        <div className="mt-5 h-px w-56 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full bg-foreground"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [showTop, setShowTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), reduceMotion ? 0 : 900);
    return () => window.clearTimeout(timeout);
  }, [reduceMotion]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip">
      <InteractionLayer />
      <AnimatePresence>{loading && <PremiumLoader />}</AnimatePresence>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="min-w-0 overflow-x-clip"
          initial={reduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -12, filter: 'blur(8px)' }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-cursor="top"
            data-magnetic="true"
            className="fixed bottom-8 right-8 z-dropdown flex size-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-shadow hover:shadow-xl"
            aria-label="Back to top"
          >
            <ArrowUp className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
