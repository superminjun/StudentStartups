import { ArrowUpRight, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { SITE_CONFIG } from '@/constants/config';

export default function Footer() {
  const { t } = useLanguage();
  const links = [
    ['/about', t('nav.about')], ['/team', t('nav.team')], ['/projects', t('nav.projects')],
    ['/impact', t('nav.impact')], ['/shop', t('nav.shop')], ['/contact', t('nav.contact')],
  ];

  return (
    <footer className="overflow-hidden bg-[var(--ss-navy)] text-[var(--ss-paper)]">
      <div className="mx-auto max-w-[80rem] px-5 pb-7 pt-14 sm:px-8 lg:pt-20">
        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-[1.35fr_.65fr_.8fr]">
          <div>
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center border border-white/55 text-[9px] font-semibold tracking-[.08em]">SS</span><p className="font-heading text-lg font-semibold">Student Startups</p></div>
            <p className="mt-7 max-w-md text-sm leading-7 text-white/58">{t('footer.description')}</p>
            <Link to="/projects" className="ss-link mt-8 text-white">{t('footer.viewWork')}<ArrowUpRight className="size-4" /></Link>
          </div>
          <nav className="grid content-start gap-1" aria-label="Footer navigation">
            {links.map(([to, label]) => (
              <Link key={to} to={to} className="group flex items-center justify-between border-b border-white/15 py-3 text-xs font-medium text-white/65 transition-colors hover:text-white">
                {label}<ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </nav>
          <div className="text-xs leading-6 text-white/58">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[.14em] text-white/35">{t('footer.connect')}</p>
            <a href={`mailto:${SITE_CONFIG.email}`} className="break-all text-white transition-colors hover:text-[var(--ss-lime)]">{SITE_CONFIG.email}</a>
            <p className="mt-3">{SITE_CONFIG.address}</p>
            <div className="mt-6 flex gap-4">
              <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="size-5" /></a>
              <a href={`mailto:${SITE_CONFIG.email}`} aria-label="Email"><Mail className="size-5" /></a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-[11px] text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-5"><Link to="/privacy">{t('footer.privacy')}</Link><Link to="/terms">{t('footer.terms')}</Link></div>
        </div>
      </div>
    </footer>
  );
}
