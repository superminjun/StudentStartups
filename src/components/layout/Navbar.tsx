import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Globe, Menu, ShoppingBag, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

const primaryLinks = [
  { path: '/story', key: 'nav.story' },
  { path: '/projects', key: 'nav.projects' },
  { path: '/team', key: 'nav.team' },
  { path: '/journal', key: 'nav.journal' },
];

const secondaryLinks = [
  { path: '/impact', key: 'nav.impact' },
  { path: '/shop', key: 'nav.shop' },
  { path: '/contact', key: 'nav.contact' },
  { path: '/about', key: 'nav.about' },
];

const mobileLinks = [{ path: '/', label: 'Home' }, ...primaryLinks.map((link) => ({ path: link.path, key: link.key }))];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    setMobileMoreOpen(false);
  }, [location.pathname]);

  const authTarget = isAdmin ? '/admin' : user ? '/portal' : '/login';
  const authLabel = isAdmin ? t('nav.admin') : user ? t('nav.portal') : t('nav.login');

  const secondaryActive = useMemo(
    () => secondaryLinks.some((link) => location.pathname === link.path),
    [location.pathname]
  );

  return (
    <>
      <nav className={cn(
        'fixed inset-x-0 top-0 z-nav border-b border-border bg-card/92 backdrop-blur-xl transition-all duration-300',
        scrolled ? 'shadow-[0_16px_42px_-34px_rgba(15,23,42,0.28)]' : 'shadow-none'
      )}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="min-w-0 max-w-[12rem] truncate text-left text-base font-semibold tracking-tight text-foreground sm:max-w-none sm:text-lg"
            aria-label="Go to homepage"
          >
            Student Startups
          </button>

          <div className="hidden items-center gap-1 lg:flex">
            {primaryLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'relative rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t(link.key)}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-foreground"
                      transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}

            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                type="button"
                onClick={() => setMoreOpen((prev) => !prev)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                  secondaryActive || moreOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                {lang === 'ko' ? '더 보기' : 'More'}
                <ChevronDown className={cn('size-4 transition-transform', moreOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full mt-2 min-w-[210px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_26px_60px_-38px_rgba(15,23,42,0.28)]"
                  >
                    <div className="p-2">
                      {secondaryLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={cn(
                            'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors',
                            location.pathname === link.path
                              ? 'bg-muted text-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {t(link.key)}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle language"
            >
              <Globe className="size-3.5" />
              {lang === 'en' ? 'KO' : 'EN'}
            </button>

            <Link
              to="/cart"
              className="relative p-2 text-foreground transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-background"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            <Link
              to={authTarget}
              className="hidden rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-all hover:bg-foreground/90 lg:inline-flex"
            >
              {authLabel}
            </Link>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="p-2 text-foreground lg:hidden"
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
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 top-16 z-dropdown border-b border-border bg-card/98 backdrop-blur-xl lg:hidden"
          >
            <div className="px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-1">
                {mobileLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link
                      to={link.path}
                      className={cn(
                        'block rounded-xl px-3 py-3 text-base font-medium transition-colors',
                        location.pathname === link.path ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      'label' in link ? link.label : t(link.key)
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-3 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setMobileMoreOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {lang === 'ko' ? '더 보기' : 'More'}
                  <ChevronDown className={cn('size-4 transition-transform', mobileMoreOpen && 'rotate-180')} />
                </button>
                <AnimatePresence initial={false}>
                  {mobileMoreOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 flex flex-col gap-1 px-1 pb-1">
                        {secondaryLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                              'rounded-xl px-3 py-2.5 text-sm transition-colors',
                              location.pathname === link.path
                                ? 'bg-muted text-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            {t(link.key)}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to={authTarget}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-2.5 text-center text-sm font-medium text-background"
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
