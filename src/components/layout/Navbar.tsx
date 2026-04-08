import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ShoppingBag, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

const siteLinks = [
  { path: '/about', key: 'nav.about' },
  { path: '/projects', key: 'nav.projects' },
  { path: '/impact', key: 'nav.impact' },
  { path: '/shop', key: 'nav.shop' },
  { path: '/contact', key: 'nav.contact' },
];

const homeSections = [
  { id: 'intro', key: 'nav.intro' },
  { id: 'value', key: 'nav.value' },
  { id: 'process', key: 'nav.process' },
  { id: 'proof', key: 'nav.proof' },
  { id: 'cta', key: 'nav.cta' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileExploreOpen(false);
  }, [location.pathname]);

  const handleSectionClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (location.pathname !== '/') return;

    const getSections = () =>
      homeSections
        .map((section) => document.getElementById(section.id))
        .filter(Boolean) as HTMLElement[];

    let sections = getSections();
    let rafId: number | null = null;

    const updateActive = () => {
      if (!sections.length) sections = getSections();
      if (!sections.length) return;

      const focusLine = window.innerHeight * 0.35;
      let currentId = sections[0].id;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= focusLine && rect.bottom > focusLine) {
          currentId = section.id;
          break;
        }
        if (rect.top <= focusLine) currentId = section.id;
      }
      setActiveSection(currentId);
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActive);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateActive();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/') return;
    const shouldScrollIntro = sessionStorage.getItem('scrollToIntro');
    if (!shouldScrollIntro) return;
    sessionStorage.removeItem('scrollToIntro');
    requestAnimationFrame(() => handleSectionClick('intro'));
  }, [location.pathname]);

  const authTarget = isAdmin ? '/admin' : user ? '/portal' : '/login';
  const authLabel = isAdmin ? t('nav.admin') : user ? t('nav.portal') : t('nav.login');

  const solid = true;
  const elevated = scrolled;
  const isHome = location.pathname === '/';
  const navLinks = isHome ? homeSections : siteLinks;

  const handleBrandClick = () => {
    if (isHome) {
      handleSectionClick('intro');
      return;
    }
    sessionStorage.setItem('scrollToIntro', '1');
    navigate('/');
  };

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-nav transition-all duration-400',
        'bg-card/90 backdrop-blur-xl border-b border-border',
        elevated ? 'shadow-sm' : 'shadow-none'
      )}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button
            type="button"
            onClick={handleBrandClick}
            className={cn('text-lg font-semibold tracking-tight transition-colors', solid ? 'text-foreground' : 'text-white')}
            aria-label="Go to overview"
          >
            Student Startups
          </button>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = isHome
                ? activeSection === (link as { id: string }).id
                : location.pathname === (link as { path: string }).path;
              return (
                isHome ? (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleSectionClick(link.id)}
                    className={cn(
                      'relative px-3 py-2 text-sm font-medium transition-colors duration-200',
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
                  </button>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'relative px-3 py-2 text-sm font-medium transition-colors duration-200',
                      solid
                        ? active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                        : active ? 'text-white' : 'text-white/70 hover:text-white'
                    )}
                  >
                    {t(link.key)}
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        className={cn('absolute bottom-0 left-3 right-3 h-[1.5px]', solid ? 'bg-foreground' : 'bg-card')}
                        transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.6 }}
                      />
                    )}
                  </Link>
                )
              );
            })}

            {isHome && (
              <div
                className="relative"
                onMouseEnter={() => setExploreOpen(true)}
                onMouseLeave={() => setExploreOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setExploreOpen((prev) => !prev)}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium transition-colors',
                    exploreOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-expanded={exploreOpen}
                  aria-haspopup="menu"
                >
                  {t('nav.explore')}
                </button>
                <AnimatePresence>
                  {exploreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-full mt-2 min-w-[190px] overflow-hidden rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur-xl"
                    >
                      <div className="p-2">
                        {siteLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            {t(link.key)}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all',
                solid ? 'text-muted-foreground hover:text-foreground hover:bg-muted' : 'text-white/70 hover:text-white hover:bg-card/10'
              )}
              aria-label="Toggle language"
            >
              <Globe className="size-3.5" />
              {lang === 'en' ? 'KO' : 'EN'}
            </button>

            <Link
              to="/cart"
              className={cn('relative p-2 transition-colors', solid ? 'text-foreground' : 'text-white')}
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
              className={cn(
                'hidden rounded-full px-4 py-1.5 text-sm font-medium transition-all lg:inline-flex',
                solid
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'bg-card/15 text-white hover:bg-card/25 backdrop-blur-sm'
              )}
            >
              {authLabel}
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn('p-2 lg:hidden', solid ? 'text-foreground' : 'text-white')}
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
            className="fixed inset-x-0 top-16 z-dropdown bg-card/98 backdrop-blur-xl border-b border-border lg:hidden"
          >
            <div className="flex flex-col p-6 gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={isHome ? (link as { id: string }).id : (link as { path: string }).path}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {isHome ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleSectionClick((link as { id: string }).id);
                        setMobileOpen(false);
                      }}
                      className={cn(
                        'block w-full py-3 text-left text-base font-medium border-b border-border',
                        activeSection === (link as { id: string }).id ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {t(link.key)}
                    </button>
                  ) : (
                    <Link
                      to={(link as { path: string }).path}
                      className={cn(
                        'block py-3 text-base font-medium border-b border-border',
                        location.pathname === (link as { path: string }).path ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {t(link.key)}
                    </Link>
                  )}
                </motion.div>
              ))}

              {isHome && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setMobileExploreOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between py-3 text-left text-base font-medium text-foreground border-b border-border"
                  >
                    {t('nav.explore')}
                    <ChevronDown className={cn('size-4 transition-transform', mobileExploreOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileExploreOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-1 py-2">
                          {siteLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                              {t(link.key)}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <Link
                to={authTarget}
                className="mt-4 inline-block rounded-full bg-foreground px-6 py-2.5 text-center text-sm font-medium text-background"
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
