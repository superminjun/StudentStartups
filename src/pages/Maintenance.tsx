import { MAINTENANCE_MODE, SITE_CONFIG } from '@/constants/config';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function Maintenance() {
  const { lang } = useLanguage();
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async () => {
    if (!supabase) {
      setError(lang === 'ko' ? '인증 시스템이 연결되어 있지 않습니다.' : 'Authentication is not configured.');
      return;
    }

    setSubmitting(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(
        lang === 'ko'
          ? '로그인에 실패했습니다. 관리자 계정을 다시 확인해주세요.'
          : 'Sign-in failed. Please check the admin credentials and try again.'
      );
    }

    setSubmitting(false);
  };

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
  };

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

        <div className="mt-8 rounded-[24px] border border-border bg-white/80 p-5 shadow-[0_24px_72px_-48px_rgba(15,23,42,0.35)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-light">
            {lang === 'ko' ? '관리자 접근' : 'Admin access'}
          </p>

          {loading ? (
            <p className="mt-4 text-sm text-mid">
              {lang === 'ko' ? '세션을 확인하는 중입니다...' : 'Checking session...'}
            </p>
          ) : isAdmin ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-mid">
                {lang === 'ko'
                  ? '관리자 계정이 확인되었습니다. 이제 전체 사이트를 볼 수 있습니다.'
                  : 'Admin access confirmed. You can now view the full site.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-full bg-charcoal px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[hsl(20,8%,28%)]"
                >
                  {lang === 'ko' ? '사이트 열기' : 'Open site'}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-charcoal transition-colors hover:bg-stone-50"
                >
                  {lang === 'ko' ? '로그아웃' : 'Sign out'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {user && !isAdmin && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {lang === 'ko'
                    ? '이 계정은 관리자 권한이 없습니다. 관리자 계정으로 다시 로그인해주세요.'
                    : 'This account does not have admin access. Please sign in with an admin account.'}
                </div>
              )}

              <div className="grid gap-3">
                <div>
                  <label className="text-xs font-semibold text-mid">
                    {lang === 'ko' ? '관리자 이메일' : 'Admin email'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-charcoal"
                    placeholder="admin@studentstartups.ca"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">
                    {lang === 'ko' ? '비밀번호' : 'Password'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-charcoal"
                    placeholder={lang === 'ko' ? '관리자 비밀번호' : 'Admin password'}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="button"
                onClick={handleAdminLogin}
                disabled={submitting}
                className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[hsl(20,8%,28%)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting
                  ? (lang === 'ko' ? '로그인 중...' : 'Signing in...')
                  : (lang === 'ko' ? '관리자 로그인' : 'Admin sign in')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
