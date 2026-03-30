import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function ResetPassword() {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [verifyingLink, setVerifyingLink] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!supabase) {
      setLoadingSession(false);
      setVerifyingLink(false);
      return;
    }

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setLoadingSession(false);
    };

    const tryHandleUrlTokens = async () => {
      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.replace('#', ''));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const tokenHash = url.searchParams.get('token_hash') ?? hashParams.get('token_hash');
      const token = url.searchParams.get('token') ?? hashParams.get('token');
      const type = url.searchParams.get('type') ?? hashParams.get('type');
      const email = url.searchParams.get('email') ?? hashParams.get('email');

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      } else if (tokenHash && type) {
        await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as 'recovery' });
      } else if (token && email && type) {
        await supabase.auth.verifyOtp({ email, token, type: type as 'recovery' });
      }
    };

    tryHandleUrlTokens()
      .catch((err) => {
        setError(err?.message ?? t('resetPassword.errorInvalid'));
      })
      .finally(async () => {
        await syncSession();
        setVerifyingLink(false);
      });

    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSession(newSession ?? null);
        setLoadingSession(false);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!password || !confirm) {
      setError(t('resetPassword.errorMismatch'));
      return;
    }

    if (password !== confirm) {
      setError(t('resetPassword.errorMismatch'));
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setError(t('login.errorSupabase'));
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
    } else {
      setNotice(t('resetPassword.success'));
      await supabase.auth.signOut();
      setPassword('');
      setConfirm('');
    }
    setLoading(false);
  };

  return (
    <div>
      <section className="bg-charcoal pb-16 pt-28 lg:pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {t('resetPassword.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-3 max-w-2xl text-base text-white/55"
          >
            {t('resetPassword.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="bg-beige py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[hsl(30,12%,90%)] bg-white p-6 lg:p-8"
          >
            {!isSupabaseConfigured && (
              <div className="mb-5 rounded-xl border border-[hsl(24,80%,80%)] bg-[hsl(24,80%,95%)] px-4 py-3 text-xs text-[hsl(24,60%,30%)]">
                {t('login.errorSupabase')}
              </div>
            )}

            {loadingSession || verifyingLink ? (
              <p className="text-sm text-light">Loading...</p>
            ) : !session ? (
              <div className="space-y-3">
                <p className="text-sm text-red-500">{t('resetPassword.errorInvalid')}</p>
                <Link to="/forgot-password" className="text-xs font-semibold text-charcoal hover:text-[hsl(24,80%,50%)]">
                  {t('resetPassword.back')}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">{t('resetPassword.newPassword')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-[hsl(30,12%,87%)] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-charcoal focus:ring-1 focus:ring-charcoal/10"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">{t('resetPassword.confirmPassword')}</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-lg border border-[hsl(30,12%,87%)] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-charcoal focus:ring-1 focus:ring-charcoal/10"
                    placeholder="••••••••"
                  />
                </div>

                {notice && (
                  <div className="space-y-2 text-xs text-[hsl(140,35%,35%)]">
                    <p>{notice}</p>
                    <Link to="/login" className="font-semibold text-charcoal hover:text-[hsl(24,80%,50%)]">
                      {t('forgotPassword.back')}
                    </Link>
                  </div>
                )}
                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-full bg-charcoal py-3 text-sm font-semibold text-white transition-all hover:bg-[hsl(20,8%,28%)] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
                >
                  {loading ? t('resetPassword.updating') : t('resetPassword.update')}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
