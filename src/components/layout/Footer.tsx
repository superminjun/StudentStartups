import { Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { SITE_CONFIG } from '@/constants/config';

export default function Footer() {
  const { t } = useLanguage();
  const links = [
    ['/about', t('nav.about')],
    ['/team', t('nav.team')],
    ['/projects', t('nav.projects')],
    ['/impact', t('nav.impact')],
    ['/shop', t('nav.shop')],
    ['/contact', t('nav.contact')],
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-12 border-b border-background/20 pb-14 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 font-heading text-lg font-semibold">
              <span className="size-2.5 bg-accent" aria-hidden />
              Student Startups
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-background/60">{t('footer.description')}</p>
          </div>

          <nav className="grid grid-cols-2 gap-x-6 gap-y-3" aria-label="Footer navigation">
            {links.map(([to, label]) => (
              <Link key={to} to={to} className="text-sm text-background/65 transition-colors hover:text-background">
                {label}
              </Link>
            ))}
          </nav>

          <div className="text-sm text-background/65">
            <a href={`mailto:${SITE_CONFIG.email}`} className="break-all transition-colors hover:text-background">{SITE_CONFIG.email}</a>
            <p className="mt-3 leading-6">{SITE_CONFIG.address}</p>
            <div className="mt-5 flex gap-4">
              <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-colors hover:text-background">
                <Instagram className="size-5" />
              </a>
              <a href={`mailto:${SITE_CONFIG.email}`} aria-label="Email" className="transition-colors hover:text-background">
                <Mail className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-background/45 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-background">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-background">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
