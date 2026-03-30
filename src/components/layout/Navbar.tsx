import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

const navLinks = [
  { path: '/', key: 'nav.home' },
  { path: '/about', key: 'nav.about' },
  { path: '/projects', key: 'nav.projects' },
  { path: '/impact', key: 'nav.impact' },
  { path: '/shop', key: 'nav.shop' },
  { path: '/contact', key: 'nav.contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const authTarget = isAdmin ? '/admin' : user ? '/portal' : '/login';
  const authLabel = isAdmin ? t('nav.admin') : user ? t('nav.portal') : t('nav.login');

  const solid = true;
  const elevated = scrolled;

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-nav transition-all duration-400',
        'bg-white/90 backdrop-blur-xl border-b border-[hsl(30,12%,90%)]',
        elevated ? 'shadow-sm' : 'shadow-none'
      )}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className={cn('text-lg font-semibold tracking-tight transition-colors', solid ? 'text-charcoal' : 'text-white')}>
            Student Startups
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium transition-colors duration-200',
                    solid
                      ? active ? 'text-charcoal' : 'text-mid hover:text-charcoal'
                      : active ? 'text-white' : 'text-white/70 hover:text-white'
                  )}
                >
                  {t(link.key)}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className={cn('absolute bottom-0 left-3 right-3 h-[1.5px]', solid ? 'bg-charcoal' : 'bg-white')}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all',
                solid ? 'text-mid hover:text-charcoal hover:bg-[hsl(30,15%,92%)]' : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
              aria-label="Toggle language"
            >
              <Globe className="size-3.5" />
              {lang === 'en' ? 'KO' : 'EN'}
            </button>

            <Link
              to="/cart"
              className={cn('relative p-2 transition-colors', solid ? 'text-charcoal' : 'text-white')}
              aria-label="Shopping cart"
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[hsl(24,80%,50%)] text-[10px] font-bold text-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            <Link
              to={authTarget}
              className={cn(
                'hidden rounded-full px-4 py-1.5 text-sm font-medium transition-all lg:inline-flex',
                solid
                  ? 'bg-charcoal text-white hover:bg-[hsl(20,8%,28%)]'
                  : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
              )}
            >
              {authLabel}
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn('p-2 lg:hidden', solid ? 'text-charcoal' : 'text-white')}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-dropdown bg-white/98 backdrop-blur-xl border-b border-[hsl(30,12%,90%)] lg:hidden"
          >
            <div className="flex flex-col p-6 gap-1">
              {navLinks.map((link, i) => (
                <motion.div key={link.path} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link
                    to={link.path}
                    className={cn(
                      'block py-3 text-base font-medium border-b border-[hsl(30,15%,92%)]',
                      location.pathname === link.path ? 'text-charcoal' : 'text-mid'
                    )}
                  >
                    {t(link.key)}
                  </Link>
                </motion.div>
              ))}
              <Link
                to={authTarget}
                className="mt-4 inline-block rounded-full bg-charcoal px-6 py-2.5 text-center text-sm font-medium text-white"
              >
                {authLabel}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
