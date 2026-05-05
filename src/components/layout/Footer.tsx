import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { SITE_CONFIG } from '@/constants/config';
import { Instagram, Mail } from 'lucide-react';

export default function Footer() {
  const { lang, t } = useLanguage();

  const navLinks = [
    { to: '/about', label: t('nav.about') },
    { to: '/projects', label: t('nav.projects') },
    { to: '/impact', label: t('nav.impact') },
    { to: '/shop', label: t('nav.shop') },
  ];

  const programLinks = [
    { to: '/portal', label: t('nav.portal') },
    { to: '/login', label: t('nav.login') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const legalLinks = [
    { to: '/privacy', label: lang === 'ko' ? '개인정보 처리방침' : 'Privacy Policy' },
    { to: '/terms', label: lang === 'ko' ? '서비스 이용약관' : 'Terms of Service' },
  ];

  return (
    <footer className="overflow-x-clip border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <Link to="/" className="text-lg font-semibold text-foreground">
            Student Startups
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">BNSS</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t('footer.description')}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/contact" className="btn btn-primary">
              {t('footer.cta')}
            </Link>
            <Link to="/projects" className="btn btn-secondary">
              {t('footer.viewWork')}
            </Link>
          </div>
        </div>
        <div className="min-w-0 lg:col-span-3">
          <h4 className="text-sm font-semibold text-foreground">{t('footer.quickLinks')}</h4>
          <ul className="mt-4 space-y-2.5">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 lg:col-span-2">
          <h4 className="text-sm font-semibold text-foreground">{t('footer.programs')}</h4>
          <ul className="mt-4 space-y-2.5">
            {programLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 lg:col-span-2">
          <h4 className="text-sm font-semibold text-foreground">{t('footer.connect')}</h4>
          <div className="mt-4 flex gap-3">
            {[
              { href: SITE_CONFIG.social.instagram, icon: Instagram, label: 'Instagram' },
              { href: `mailto:${SITE_CONFIG.email}`, icon: Mail, label: 'Email' },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target={label !== 'Email' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-foreground hover:text-background"
                aria-label={label}
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
          <p className="mt-5 break-all text-sm text-muted-foreground">{SITE_CONFIG.email}</p>
          <a
            href={SITE_CONFIG.maps.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block break-words text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {SITE_CONFIG.address}
          </a>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">{t('footer.rights')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
            {legalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
