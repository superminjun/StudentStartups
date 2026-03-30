import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email.trim()) {
      setError(t('forgotPassword.errorRequired'));
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setError(t('login.errorSupabase'));
      return;
    }

    setLoading(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (resetError) {
      setError(resetError.message);
    } else {
      setNotice(t('forgotPassword.sent'));
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
            {t('forgotPassword.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-3 max-w-2xl text-base text-white/55"
          >
            {t('forgotPassword.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="bg-beige py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-6">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[hsl(30,12%,90%)] bg-white p-6 lg:p-8"
          >
            {!isSupabaseConfigured && (
              <div className="mb-5 rounded-xl border border-[hsl(24,80%,80%)] bg-[hsl(24,80%,95%)] px-4 py-3 text-xs text-[hsl(24,60%,30%)]">
                {t('login.errorSupabase')}
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal">{t('forgotPassword.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[hsl(30,12%,87%)] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-charcoal focus:ring-1 focus:ring-charcoal/10"
                placeholder="you@school.edu"
              />
            </div>

            {notice && <p className="mt-4 text-xs text-[hsl(140,35%,35%)]">{notice}</p>}
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-charcoal py-3 text-sm font-semibold text-white transition-all hover:bg-[hsl(20,8%,28%)] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? t('forgotPassword.sending') : t('forgotPassword.send')}
            </button>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-xs font-semibold text-charcoal hover:text-[hsl(24,80%,50%)]">
                {t('forgotPassword.back')}
              </Link>
            </div>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
