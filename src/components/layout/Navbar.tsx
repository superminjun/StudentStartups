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
    <header className={`fixed inset-x-0 top-0 z-[60] transition-[background-color,border-color] duration-500 ${scrolled || open ? 'border-b border-black/10 bg-[var(--ss-canvas)]/90 backdrop-blur-xl' : 'border-b border-transparent bg-transparent'}`}>
      <div className="mx-auto flex h-[4.75rem] max-w-[90rem] items-center gap-6 px-5 sm:px-8">
        <Link to="/" className="group mr-auto inline-flex items-center gap-3 text-sm font-bold tracking-[-0.03em] text-[var(--ss-ink)]">
          <span className="relative grid size-7 place-items-center rounded-full border border-black/20 text-[8px] tracking-[-0.08em] transition-transform duration-500 group-hover:rotate-[20deg]">SS</span>
          <span>Student Startups</span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink key={link.path} to={link.path} className="relative rounded-full px-3 py-2 text-xs font-semibold text-black/55 transition-colors hover:text-black">
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-state" className="absolute inset-0 rounded-full bg-black/[0.07]" transition={motionSpring.state} />}
                  <span className="relative z-10">{t(link.key)}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <motion.button whileTap={{ scale: 0.94 }} transition={motionSpring.press} type="button" onClick={() => setLang(lang === 'en' ? 'ko' : 'en')} className="inline-flex min-h-10 items-center gap-1.5 px-2 text-xs font-semibold text-black/55 hover:text-black" aria-label={lang === 'en' ? '한국어로 보기' : 'View in English'}>
            <Globe className="size-4" />{lang === 'en' ? 'KO' : 'EN'}
          </motion.button>
          <motion.div whileTap={{ scale: 0.92 }} transition={motionSpring.press}>
            <Link to="/cart" className="relative grid size-10 place-items-center text-black" aria-label={t('nav.cart')}>
              <ShoppingBag className="size-[1.05rem]" />
              {cartCount > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[var(--ss-coral)] text-[9px] font-bold text-white">{cartCount}</span>}
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97, y: 1 }} transition={motionSpring.press} className="hidden sm:block">
            <Link to={accountPath} className="inline-flex min-h-10 items-center rounded-full bg-[var(--ss-ink)] px-4 text-xs font-bold text-white">{accountLabel}</Link>
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
            className="fixed inset-0 top-[4.75rem] flex flex-col bg-[var(--ss-canvas)] px-5 pb-8 pt-8 sm:px-8 xl:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col">
              {links.map((link, index) => (
                <motion.div key={link.path} initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ ...motionSpring.reveal, delay: index * STAGGER }}>
                  <NavLink to={link.path} className={({ isActive }) => `flex items-center justify-between border-b border-black/15 py-4 text-[clamp(2rem,9vw,4rem)] font-semibold leading-none tracking-[-0.06em] ${isActive ? 'text-[var(--ss-coral)]' : 'text-[var(--ss-ink)]'}`}>
                    {t(link.key)}<span className="text-base font-normal">0{index + 1}</span>
                  </NavLink>
                </motion.div>
              ))}
              <Link to={accountPath} className="mt-auto inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--ss-ink)] px-5 text-sm font-bold text-white sm:hidden">{accountLabel}</Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
