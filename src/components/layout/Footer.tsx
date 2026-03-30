import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { SITE_CONFIG } from '@/constants/config';
import { Instagram, Mail } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  const links = [
    { to: '/about', label: t('nav.about') },
    { to: '/projects', label: t('nav.projects') },
    { to: '/impact', label: t('nav.impact') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/login', label: t('nav.login') },
    { to: '/portal', label: t('nav.portal') },
  ];

  return (
    <footer className="border-t border-[hsl(30,12%,90%)] bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Link to="/" className="text-lg font-semibold text-charcoal">
            Student Startups
          </Link>
          <p className="mt-1 text-xs text-light">BNSS</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mid">
            {t('footer.description')}
          </p>
        </div>
        <div className="lg:col-span-3">
          <h4 className="text-sm font-semibold text-charcoal">{t('footer.quickLinks')}</h4>
          <ul className="mt-4 space-y-2.5">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-mid transition-colors hover:text-charcoal">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-4">
          <h4 className="text-sm font-semibold text-charcoal">{t('footer.connect')}</h4>
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
                className="flex size-10 items-center justify-center rounded-full bg-[hsl(30,15%,92%)] text-mid transition-all hover:bg-charcoal hover:text-white"
                aria-label={label}
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
          <p className="mt-5 text-sm text-mid">{SITE_CONFIG.email}</p>
        </div>
      </div>
      <div className="border-t border-[hsl(30,12%,92%)] py-6 text-center">
        <p className="text-xs text-light">{t('footer.rights')}</p>
      </div>
    </footer>
  );
}
