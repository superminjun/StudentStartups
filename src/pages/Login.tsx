import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, LogIn } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useAuth } from '@/components/auth/AuthProvider';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type LoginMode = 'member' | 'admin';
type MemberAuthMode = 'signin' | 'signup';
type MemberAuthMethod = 'password' | 'otp';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get('mode') === 'admin' ? 'admin' : 'member';
  const [mode, setMode] = useState<LoginMode>(queryMode);
  const [memberMode, setMemberMode] = useState<MemberAuthMode>('signin');
  const [memberMethod, setMemberMethod] = useState<MemberAuthMethod>('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      if (isAdmin || mode === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/portal', { replace: true });
      }
    }
  }, [user, isAdmin, mode, navigate]);

  const resetOtp = () => {
    setOtpSent(false);
    setOtpCode('');
    setOtpTargetEmail('');
    setNotice('');
  };

  const sendOtpCode = async (emailRedirectTo: string) => {
    if (!supabase) return;

    const { error: sendError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        shouldCreateUser: memberMode === 'signup',
        ...(memberMode === 'signup' && name ? { data: { full_name: name } } : {}),
      },
    });

    if (sendError) {
      setError(sendError.message);
      return;
    }

    setOtpSent(true);
    setOtpCode('');
    setOtpTargetEmail(email);
    setNotice(t('login.codeSent'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const isMemberOtp = mode === 'member' && memberMethod === 'otp';

    if (!email || (mode === 'member' && memberMode === 'signup' && !name)) {
      setError(t('login.errorRequired'));
      return;
    }

    if (!isMemberOtp && !password) {
      setError(t('login.errorRequired'));
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setError(t('login.errorSupabase'));
      return;
    }

    setLoading(true);
    const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

    try {
      const emailRedirectTo = `${window.location.origin}/login?mode=member`;

      if (isMemberOtp) {
        if (!otpSent) {
          await sendOtpCode(emailRedirectTo);
          return;
        }

        if (otpCode.trim().length < 6) {
          setError(t('login.errorCodeRequired'));
          return;
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: otpTargetEmail || email,
          token: otpCode.trim(),
          type: 'email',
        });

        if (verifyError) {
          setError(verifyError.message);
          return;
        }

        navigate(redirectTo || '/portal', { replace: true });
        return;
      }

      if (mode === 'admin') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError || !data.user) {
          setError(t('login.errorAdmin'));
          return;
        }
        const { data: adminRow } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
        if (!adminRow) {
          await supabase.auth.signOut();
          setError(t('login.errorNotAdmin'));
          return;
        }
        navigate(redirectTo || '/admin', { replace: true });
        return;
      }

      if (memberMode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo,
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        setNotice(t('login.emailSent'));
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      navigate(redirectTo || '/portal', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const modeLabel = mode === 'admin' ? t('login.adminTab') : t('login.memberTab');
  const isMemberOtp = mode === 'member' && memberMethod === 'otp';
  const submitLabel = () => {
    if (loading) {
      if (isMemberOtp && !otpSent) return t('login.sendingCode');
      if (isMemberOtp && otpSent) return t('login.verifyingCode');
      return t('login.signingIn');
    }
    if (isMemberOtp && !otpSent) return t('login.sendCode');
    if (isMemberOtp && otpSent) return t('login.verifyCode');
    return t('login.signIn');
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
            {t('login.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-3 max-w-2xl text-base text-white/55"
          >
            {t('login.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="bg-beige py-12 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            {[
              { icon: User, title: t('login.memberTitle'), description: t('login.memberDesc') },
              { icon: Shield, title: t('login.adminTitle'), description: t('login.adminDesc') },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index }}
                className="rounded-2xl border border-[hsl(30,12%,90%)] bg-white p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[hsl(30,15%,92%)] text-charcoal">
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-charcoal">{item.title}</p>
                    <p className="mt-1 text-sm text-mid leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

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
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-[hsl(30,15%,92%)] text-charcoal">
                  <LogIn className="size-4" />
                </div>
                <div>
                  <p className="text-sm text-light">{t('login.signInAs')}</p>
                  <p className="text-lg font-semibold text-charcoal">{modeLabel}</p>
                </div>
              </div>
              <div className="mt-5 flex rounded-full border border-[hsl(30,12%,90%)] bg-[hsl(30,30%,98%)] p-1">
                {(['member', 'admin'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setMode(value);
                      setError('');
                      setNotice('');
                      resetOtp();
                      if (value === 'admin') setMemberMode('signin');
                    }}
                    className={cn(
                      'flex-1 rounded-full px-4 py-2 text-xs font-semibold transition-all',
                      mode === value ? 'bg-charcoal text-white' : 'text-mid hover:text-charcoal'
                    )}
                  >
                    {value === 'member' ? t('login.memberTab') : t('login.adminTab')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {mode === 'member' && memberMode === 'signup' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">{t('login.name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-[hsl(30,12%,87%)] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-charcoal focus:ring-1 focus:ring-charcoal/10"
                    placeholder="Your name"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal">{t('login.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (otpSent) resetOtp();
                  }}
                  className="w-full rounded-lg border border-[hsl(30,12%,87%)] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-charcoal focus:ring-1 focus:ring-charcoal/10"
                  placeholder="you@school.edu"
                />
              </div>
              {!isMemberOtp && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">{t('login.password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-[hsl(30,12%,87%)] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-charcoal focus:ring-1 focus:ring-charcoal/10"
                    placeholder="••••••••"
                  />
                </div>
              )}
              {isMemberOtp && otpSent && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">{t('login.oneTimeCode')}</label>
                  <InputOTP
                    value={otpCode}
                    onChange={setOtpCode}
                    maxLength={6}
                    containerClassName="justify-start"
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="h-11 w-11 rounded-lg border border-[hsl(30,12%,87%)] bg-white text-sm text-charcoal"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="mt-2 text-xs text-light">{t('login.codeHint')}</p>
                </div>
              )}
            </div>

            {mode === 'member' && (
              <div className="mt-4 space-y-2 text-xs text-light">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMemberMode(memberMode === 'signin' ? 'signup' : 'signin');
                      setError('');
                      setNotice('');
                      resetOtp();
                    }}
                    className="text-xs font-semibold text-charcoal hover:text-[hsl(24,80%,50%)]"
                  >
                    {memberMode === 'signin' ? t('login.signUpTab') : t('login.signInTab')}
                  </button>
                  <span>{memberMode === 'signin' ? t('login.memberHint') : t('login.memberHintAlt')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMemberMethod(memberMethod === 'otp' ? 'password' : 'otp');
                      setError('');
                      setNotice('');
                      resetOtp();
                    }}
                    className="text-xs font-semibold text-charcoal hover:text-[hsl(24,80%,50%)]"
                  >
                    {memberMethod === 'otp' ? t('login.usePassword') : t('login.useCode')}
                  </button>
                  <span>{memberMethod === 'otp' ? t('login.codeHintShort') : t('login.passwordHint')}</span>
                </div>
                {isMemberOtp && otpSent && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      setError('');
                      setNotice('');
                      sendOtpCode(`${window.location.origin}/login?mode=member`).finally(() => setLoading(false));
                    }}
                    className="w-fit text-xs font-semibold text-charcoal hover:text-[hsl(24,80%,50%)]"
                  >
                    {t('login.resendCode')}
                  </button>
                )}
              </div>
            )}

            {mode === 'admin' && (
              <p className="mt-4 text-xs text-light">{t('login.adminHint')}</p>
            )}

            {notice && <p className="mt-4 text-xs text-[hsl(140,35%,35%)]">{notice}</p>}
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-charcoal py-3 text-sm font-semibold text-white transition-all hover:bg-[hsl(20,8%,28%)] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
            >
              {submitLabel()}
            </button>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
