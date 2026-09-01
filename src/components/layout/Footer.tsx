import { ArrowUpRight, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import MotionMark from '@/components/features/MotionMark';
import { useLanguage } from '@/hooks/useLanguage';
import { SITE_CONFIG } from '@/constants/config';

export default function Footer() {
  const { t } = useLanguage();
  const links = [
    ['/about', t('nav.about')], ['/team', t('nav.team')], ['/projects', t('nav.projects')],
    ['/impact', t('nav.impact')], ['/shop', t('nav.shop')], ['/contact', t('nav.contact')],
  ];

  return (
    <footer className="overflow-hidden bg-[var(--ss-night)] text-white">
      <div className="ss-marquee border-y border-white/15 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-white/55">
        <div>Build the thing · Test it outside · Keep the record · Build the thing · Test it outside · Keep the record ·</div>
      </div>
      <div className="mx-auto max-w-[90rem] px-5 pb-7 pt-16 sm:px-8 lg:pt-24">
        <div className="grid gap-14 border-b border-white/15 pb-16 lg:grid-cols-[1.3fr_.75fr_.75fr]">
          <div>
            <MotionMark dark className="mb-8 size-24" />
            <h2 className="ss-heading max-w-2xl">Make it real.<br /><span className="text-white/35">Then make it better.</span></h2>
          </div>
          <nav className="grid content-start gap-1" aria-label="Footer navigation">
            {links.map(([to, label]) => (
              <Link key={to} to={to} className="group flex items-center justify-between border-b border-white/15 py-3 text-sm text-white/65 transition-colors hover:text-white">
                {label}<ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </nav>
          <div className="text-sm leading-7 text-white/55">
            <a href={`mailto:${SITE_CONFIG.email}`} className="break-all text-white transition-colors hover:text-[var(--ss-lime)]">{SITE_CONFIG.email}</a>
            <p className="mt-3">{SITE_CONFIG.address}</p>
            <div className="mt-6 flex gap-4">
              <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="size-5" /></a>
              <a href={`mailto:${SITE_CONFIG.email}`} aria-label="Email"><Mail className="size-5" /></a>
            </div>
          </div>
        </div>
        <p className="ss-display select-none whitespace-nowrap pt-8 text-white">STUDENT STARTUPS</p>
        <div className="flex flex-col gap-3 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-5"><Link to="/privacy">{t('footer.privacy')}</Link><Link to="/terms">{t('footer.terms')}</Link></div>
        </div>
      </div>
    </footer>
  );
}
