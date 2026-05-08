import { MAINTENANCE_MODE, SITE_CONFIG } from '@/constants/config';
import { useLanguage } from '@/hooks/useLanguage';

export default function Maintenance() {
  const { lang } = useLanguage();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-beige px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(80,128,255,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.7),rgba(245,241,235,0.95))]" />

      <div className="relative z-10 w-full max-w-2xl rounded-[32px] border border-border bg-white/75 p-8 shadow-[0_40px_120px_-48px_rgba(15,23,42,0.32)] backdrop-blur-xl sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-light">
          {SITE_CONFIG.name}
        </p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          {lang === 'ko' ? MAINTENANCE_MODE.titleKo : MAINTENANCE_MODE.titleEn}
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-mid sm:text-[15px]">
          {lang === 'ko' ? MAINTENANCE_MODE.bodyKo : MAINTENANCE_MODE.bodyEn}
        </p>
        <div className="mt-8 inline-flex rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-charcoal">
          {lang === 'ko' ? '사이트 점검 중' : 'Maintenance in progress'}
        </div>
        <p className="mt-6 text-xs leading-6 text-light">
          {lang === 'ko' ? MAINTENANCE_MODE.footnoteKo : MAINTENANCE_MODE.footnoteEn}
        </p>
      </div>
    </div>
  );
}
