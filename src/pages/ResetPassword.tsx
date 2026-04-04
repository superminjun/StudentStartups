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
      <section className="section bg-charcoal pt-28 lg:pt-32">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
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

      <section className="section-tight bg-beige">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 lg:p-8"
          >
            {!isSupabaseConfigured && (
              <div className="mb-5 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-xs text-accent">
                {t('login.errorSupabase')}
              </div>
            )}

            {loadingSession || verifyingLink ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : !session ? (
              <div className="space-y-3">
                <p className="text-sm text-red-500">{t('resetPassword.errorInvalid')}</p>
                <Link to="/forgot-password" className="text-xs font-semibold text-foreground hover:text-accent">
                  {t('resetPassword.back')}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">{t('resetPassword.newPassword')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-base"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">{t('resetPassword.confirmPassword')}</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="input-base"
                    placeholder="••••••••"
                  />
                </div>

                {notice && (
                  <div className="space-y-2 text-xs text-emerald-500">
                    <p>{notice}</p>
                    <Link to="/login" className="font-semibold text-foreground hover:text-accent">
                      {t('forgotPassword.back')}
                    </Link>
                  </div>
                )}
                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-70"
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
