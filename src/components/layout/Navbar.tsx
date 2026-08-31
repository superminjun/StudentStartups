import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Menu, ShoppingBag, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';

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
  const { pathname } = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const accountPath = isAdmin ? '/admin' : user ? '/portal' : '/login';
  const accountLabel = isAdmin ? t('nav.admin') : user ? t('nav.portal') : t('nav.login');

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-nav border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-6 px-5 sm:px-8">
        <Link to="/" className="mr-auto inline-flex items-center gap-3 font-heading text-sm font-semibold tracking-[-0.02em] text-foreground sm:text-base">
          <span className="size-2.5 bg-accent" aria-hidden />
          Student Startups
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                'relative py-6 text-sm transition-colors after:absolute after:inset-x-0 after:bottom-4 after:h-px after:origin-left after:bg-foreground after:transition-transform',
                isActive ? 'text-foreground after:scale-x-100' : 'text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100'
              )}
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
            className="inline-flex min-h-10 items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label={lang === 'en' ? '한국어로 보기' : 'View in English'}
          >
            <Globe className="size-4" />
            {lang === 'en' ? 'KO' : 'EN'}
          </button>

          <Link to="/cart" className="relative grid size-10 place-items-center text-foreground" aria-label={t('nav.cart')}>
            <ShoppingBag className="size-[1.1rem]" />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-accent text-[9px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to={accountPath} className="btn btn-primary hidden min-h-10 px-4 py-2 text-xs sm:inline-flex">
            {accountLabel}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid size-10 place-items-center xl:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-x-0 top-full border-b border-border bg-background px-5 py-4 shadow-lg sm:px-8 xl:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto max-w-7xl">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => cn(
                    'flex items-center justify-between border-b border-border py-3.5 text-base',
                    isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {t(link.key)}
                  <span aria-hidden>↗</span>
                </NavLink>
              ))}
              <Link to={accountPath} className="btn btn-primary mt-5 w-full sm:hidden">
                {accountLabel}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
