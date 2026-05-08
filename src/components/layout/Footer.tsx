import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { SITE_CONFIG } from '@/constants/config';

export default function Footer() {
  const { lang, t } = useLanguage();

  const primaryLinks = [
    { to: '/story', label: t('nav.story') },
    { to: '/projects', label: t('nav.projects') },
    { to: '/team', label: t('nav.team') },
    { to: '/journal', label: t('nav.journal') },
  ];

  const secondaryLinks = [
    { to: '/impact', label: t('nav.impact') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/about', label: t('nav.about') },
  ];

  const accessLinks = [
    { to: '/portal', label: t('nav.portal') },
    { to: '/login', label: t('nav.login') },
  ];

  const legalLinks = [
    { to: '/privacy', label: lang === 'ko' ? '개인정보 처리방침' : 'Privacy Policy' },
    { to: '/terms', label: lang === 'ko' ? '서비스 이용약관' : 'Terms of Service' },
  ];

  return (
    <footer className="overflow-x-clip border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.4fr),repeat(3,minmax(0,0.7fr))]">
        <div className="min-w-0">
          <Link to="/" className="text-lg font-semibold text-foreground">
            Student Startups
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
            {t('footer.description')}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/projects" className="btn btn-primary">
              {t('footer.viewWork')}
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              {t('footer.cta')}
            </Link>
          </div>
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{lang === 'ko' ? '주요 페이지' : 'Overview'}</h4>
          <ul className="mt-4 space-y-2.5">
            {primaryLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{lang === 'ko' ? '더 보기' : 'More'}</h4>
          <ul className="mt-4 space-y-2.5">
            {secondaryLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{lang === 'ko' ? '연결' : 'Access'}</h4>
          <ul className="mt-4 space-y-2.5">
            {accessLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex gap-3">
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
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="text-xs text-muted-foreground">{t('footer.rights')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
            {legalLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
