import { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.5 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="ss-shell min-h-screen overflow-x-clip bg-background">
      <motion.div className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-[var(--ss-accent)]" style={{ scaleX: progress }} />
      <Navbar />
      <main key={pathname} className="min-h-[70vh] min-w-0 overflow-x-clip">{children}</main>
      <Footer />
    </div>
  );
}
