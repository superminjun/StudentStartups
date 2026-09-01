import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Menu, ShoppingBag, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/hooks/useLanguage';
import { motionSpring, STAGGER } from '@/lib/motion';
import { useCartStore } from '@/stores/cartStore';

const links = [
  { path: '/about', key: 'nav.about' },
  { path: '/team', key: 'nav.team' },
  { path: '/projects', key: 'nav.projects' },
  { path: '/impact', key: 'nav.impact' },
  { path: '/shop', key: 'nav.shop' },
  { path: '/contact', key: 'nav.contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const accountPath = isAdmin ? '/admin' : user ? '/portal' : '/login';
  const accountLabel = isAdmin ? t('nav.admin') : user ? t('nav.portal') : t('nav.login');

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-[60] border-b border-[var(--ss-ink)]/15 bg-[var(--ss-paper)] transition-shadow duration-200 ${scrolled ? 'shadow-[0_8px_24px_rgba(23,36,59,.06)]' : ''}`}>
      <div className="mx-auto flex h-[4.5rem] max-w-[80rem] items-center gap-5 px-5 sm:px-8">
        <Link to="/" aria-label="Student Startups home" className="mr-auto inline-flex items-center gap-3 text-[var(--ss-ink)]">
          <span className="brand-wordmark"><img src="/brand/student-startups-logo.png" alt="" /></span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink key={link.path} to={link.path} className={({ isActive }) => `border-b pb-1 text-[11px] font-semibold uppercase tracking-[.07em] transition-colors duration-150 ${isActive ? 'border-[var(--ss-accent)] text-[var(--ss-ink)]' : 'border-transparent text-[var(--ss-muted)] hover:text-[var(--ss-ink)]'}`}>{t(link.key)}</NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <motion.button whileTap={{ y: 1 }} transition={motionSpring.press} type="button" onClick={() => setLang(lang === 'en' ? 'ko' : 'en')} className="inline-flex min-h-10 items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--ss-muted)] hover:text-[var(--ss-ink)]" aria-label={lang === 'en' ? '한국어로 보기' : 'View in English'}>
            <Globe className="size-4" />{lang === 'en' ? 'KO' : 'EN'}
          </motion.button>
          <motion.div whileTap={{ scale: 0.92 }} transition={motionSpring.press}>
            <Link to="/cart" className="relative grid size-10 place-items-center text-[var(--ss-ink)]" aria-label={t('nav.cart')}>
              <ShoppingBag className="size-[1.05rem]" />
              {cartCount > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[var(--ss-accent)] text-[9px] font-bold text-white">{cartCount}</span>}
            </Link>
          </motion.div>
          <motion.div whileTap={{ y: 1 }} transition={motionSpring.press} className="hidden sm:block">
            <Link to={accountPath} className="inline-flex min-h-10 items-center rounded-sm bg-[var(--ss-accent)] px-4 text-[10px] font-semibold uppercase tracking-[.08em] text-white transition-colors hover:bg-[var(--ss-ink)]">{accountLabel}</Link>
          </motion.div>
          <button type="button" onClick={() => setOpen((value) => !value)} className="grid size-10 place-items-center xl:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={motionSpring.depth}
            className="fixed inset-0 top-[4.5rem] flex flex-col bg-[var(--ss-navy)] px-5 pb-8 pt-8 text-[var(--ss-paper)] sm:px-8 xl:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col">
              {links.map((link, index) => (
                <motion.div key={link.path} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: index * STAGGER }}>
                  <NavLink to={link.path} className={({ isActive }) => `flex items-center justify-between border-b border-white/15 py-4 font-heading text-[clamp(1.4rem,5vw,1.8rem)] font-medium leading-tight ${isActive ? 'text-white' : 'text-white/65'}`}>
                    {t(link.key)}<span className="text-sm font-normal text-white/35">↗</span>
                  </NavLink>
                </motion.div>
              ))}
              <Link to={accountPath} className="mt-auto inline-flex min-h-12 items-center justify-center rounded-sm bg-[var(--ss-accent)] px-5 text-xs font-semibold uppercase tracking-[.08em] text-white sm:hidden">{accountLabel}</Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
