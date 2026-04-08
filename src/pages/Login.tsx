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

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get('mode') === 'admin' ? 'admin' : 'member';
  const [mode, setMode] = useState<LoginMode>(queryMode);
  const [memberMode, setMemberMode] = useState<MemberAuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupPending, setSignupPending] = useState(false);
  const [signupCode, setSignupCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendingCode, setResendingCode] = useState(false);
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

  const resetSignupVerification = () => {
    setSignupPending(false);
    setSignupCode('');
    setPendingEmail('');
    setNotice('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const isMemberSignup = mode === 'member' && memberMode === 'signup';
    const isMemberSignin = mode === 'member' && memberMode === 'signin';

    if (!email) {
      setError(t('login.errorRequired'));
      return;
    }

    if (isMemberSignup && !signupPending && (!name || !password)) {
      setError(t('login.errorRequired'));
      return;
    }

    if ((mode === 'admin' || isMemberSignin) && !password) {
      setError(t('login.errorRequired'));
      return;
    }

    if (isMemberSignup && signupPending && signupCode.trim().length < 6) {
      setError(t('login.errorCodeRequired'));
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setError(t('login.errorSupabase'));
      return;
    }

    setLoading(true);
    const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

    const isInvalidCredentials = (message?: string) =>
      message?.toLowerCase().includes('invalid login credentials');

    try {
      const emailRedirectTo = `${window.location.origin}/login?mode=member`;

      if (mode === 'admin') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError || !data.user) {
          if (isInvalidCredentials(signInError?.message)) {
            setError(t('login.errorInvalid'));
          } else {
            setError(t('login.errorAdmin'));
          }
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

      if (isMemberSignup) {
        if (!signupPending) {
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
          setSignupPending(true);
          setPendingEmail(email);
          setSignupCode('');
          setNotice(t('login.codeSent'));
          return;
        }

        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          email: pendingEmail || email,
          token: signupCode.trim(),
          type: 'email',
        });

        if (verifyError) {
          setError(verifyError.message);
          return;
        }

        const verifiedUser = verifyData?.user ?? (await supabase.auth.getUser()).data.user;
        if (verifiedUser) {
          await supabase.from('members').upsert({
            user_id: verifiedUser.id,
            name: name || verifiedUser.user_metadata?.full_name || verifiedUser.email?.split('@')[0] || 'Member',
            email: verifiedUser.email ?? email,
            role: 'Member',
            team: 'Unassigned',
            contributions: 0,
            is_verified: true,
          }, { onConflict: 'user_id' });
        }

        navigate(redirectTo || '/portal', { replace: true });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        if (isInvalidCredentials(signInError.message)) {
          setError(t('login.errorInvalid'));
        } else {
          setError(signInError.message);
        }
        return;
      }
      navigate(redirectTo || '/portal', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!supabase || !pendingEmail) return;
    setResendingCode(true);
    setError('');
    setNotice('');
    const emailRedirectTo = `${window.location.origin}/login?mode=member`;
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: pendingEmail,
      options: { emailRedirectTo },
    });
    if (resendError) {
      setError(resendError.message);
    } else {
      setNotice(t('login.codeSent'));
    }
    setResendingCode(false);
  };

  const modeLabel = mode === 'admin' ? t('login.adminTab') : t('login.memberTab');
  const isMemberSignup = mode === 'member' && memberMode === 'signup';
  const showSignupVerify = isMemberSignup && signupPending;
  const submitLabel = () => {
    if (loading) {
      if (isMemberSignup && showSignupVerify) return t('login.verifyingCode');
      if (isMemberSignup && !showSignupVerify) return t('login.sendingCode');
      return t('login.signingIn');
    }
    if (isMemberSignup && showSignupVerify) return t('login.verifyCode');
    if (isMemberSignup && !showSignupVerify) return t('login.signUpTab');
    return t('login.signIn');
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
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground">
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6 lg:p-8"
          >
            {!isSupabaseConfigured && (
              <div className="mb-5 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-xs text-accent">
                {t('login.errorSupabase')}
              </div>
            )}
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground">
                  <LogIn className="size-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('login.signInAs')}</p>
                  <p className="text-lg font-semibold text-foreground">{modeLabel}</p>
                </div>
              </div>
              <div className="mt-5 flex rounded-full border border-border bg-card p-1">
                {(['member', 'admin'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setMode(value);
                      setError('');
                      setNotice('');
                      resetSignupVerification();
                      if (value === 'admin') setMemberMode('signin');
                    }}
                    className={cn(
                      'flex-1 rounded-full px-4 py-2 text-xs font-semibold transition-all',
                      mode === value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {value === 'member' ? t('login.memberTab') : t('login.adminTab')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {mode === 'member' && memberMode === 'signup' && !showSignupVerify && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">{t('login.name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-base"
                    placeholder="Your name"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t('login.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (signupPending) resetSignupVerification();
                  }}
                  disabled={showSignupVerify}
                  className="input-base disabled:bg-muted disabled:text-muted-foreground"
                  placeholder="you@school.edu"
                />
              </div>
              {!showSignupVerify && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">{t('login.password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-base"
                    placeholder="••••••••"
                  />
                </div>
              )}
              {showSignupVerify && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">{t('login.oneTimeCode')}</label>
                  <InputOTP
                    value={signupCode}
                    onChange={setSignupCode}
                    maxLength={6}
                    containerClassName="justify-start"
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="h-11 w-11 rounded-lg border border-border bg-card text-sm text-foreground"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="mt-2 text-xs text-muted-foreground">{t('login.codeHint')}</p>
                </div>
              )}
            </div>

            {mode === 'member' && (
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMemberMode(memberMode === 'signin' ? 'signup' : 'signin');
                      setError('');
                      setNotice('');
                      resetSignupVerification();
                    }}
                    className="text-xs font-semibold text-foreground hover:text-[hsl(24,80%,50%)]"
                  >
                    {memberMode === 'signin' ? t('login.signUpTab') : t('login.signInTab')}
                  </button>
                  <span>{memberMode === 'signin' ? t('login.memberHint') : t('login.memberHintAlt')}</span>
                </div>
                {memberMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="w-fit text-xs font-semibold text-foreground hover:text-[hsl(24,80%,50%)]"
                  >
                    {t('login.forgotPassword')}
                  </button>
                )}
                {showSignupVerify && (
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendingCode}
                      className="text-xs font-semibold text-foreground hover:text-[hsl(24,80%,50%)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resendingCode ? t('login.sendingCode') : t('login.resendCode')}
                    </button>
                    <button
                      type="button"
                      onClick={resetSignupVerification}
                      className="text-xs font-semibold text-foreground hover:text-[hsl(24,80%,50%)]"
                    >
                      {t('login.changeEmail')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {mode === 'admin' && (
              <p className="mt-4 text-xs text-muted-foreground">{t('login.adminHint')}</p>
            )}

            {notice && <p className="mt-4 text-xs text-[hsl(140,35%,35%)]">{notice}</p>}
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitLabel()}
            </button>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
