import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { SITE_CONFIG } from '@/constants/config';
import ScrollReveal from '@/components/features/ScrollReveal';
import { Mail, Send, AlertCircle, MapPin, Instagram } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const CONTACT_COOLDOWN_MS = 30_000;
const CONTACT_COOLDOWN_KEY = 'bnss-contact-last-sent';

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, boolean> = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = true;
    if (!form.subject.trim()) e.subject = true;
    if (!form.message.trim() || form.message.trim().length < 10) e.message = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    if (!validate()) {
      setStatus('error');
      setStatusMessage(t('contact.error'));
      return;
    }

    if (typeof window !== 'undefined') {
      const lastSent = Number(window.localStorage.getItem(CONTACT_COOLDOWN_KEY) || 0);
      if (lastSent && Date.now() - lastSent < CONTACT_COOLDOWN_MS) {
        setStatus('error');
        setStatusMessage(t('contact.cooldown'));
        return;
      }
    }

    setStatus('sending');
    if (isSupabaseConfigured && supabase) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setStatusMessage(data?.error || t('contact.errorServer'));
          setStatus('error');
          return;
        }
      } catch {
        setStatusMessage(t('contact.errorServer'));
        setStatus('error');
        return;
      }
    } else {
      const messages = JSON.parse(localStorage.getItem('bnss-messages') || '[]');
      const localId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;
      messages.push({
        id: localId,
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        created_at: new Date().toISOString(),
        is_read: false,
        is_resolved: false,
      });
      localStorage.setItem('bnss-messages', JSON.stringify(messages));
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CONTACT_COOLDOWN_KEY, String(Date.now()));
    }
    setStatus('success');
    setShowSuccess(true);
    setForm({ name: '', email: '', subject: '', message: '', website: '' });
    window.setTimeout(() => {
      setShowSuccess(false);
      setStatus('idle');
      setStatusMessage('');
    }, 1800);
  };

  const inputClass = (field: string) =>
    `input-base ${errors[field] ? 'border-red-400 bg-red-50/30' : 'border-border'}`;

  return (
    <div className="bg-[var(--ss-paper)] pt-[4.5rem]">
      <header className="border-b border-[var(--ss-rule)] py-16 lg:py-20">
        <div className="ss-wrap grid gap-10 lg:grid-cols-[.38fr_1fr]">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ss-label text-[var(--ss-accent)]">{t('nav.contact')}</motion.p>
          <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="ss-display"
          >
            {t('contact.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-7 max-w-xl text-[15px] leading-7 text-[var(--ss-muted)]"
          >
            {t('contact.subtitle')}
          </motion.p>
          </div>
        </div>
      </header>

      <section className="ss-section bg-[var(--ss-surface)]">
        <div className="ss-wrap">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ScrollReveal>
                <form onSubmit={handleSubmit} className="border-t border-[var(--ss-rule)] pt-6">
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      type="text"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      autoComplete="off"
                      tabIndex={-1}
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">{t('contact.name')}</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: false }); }}
                        className={inputClass('name')}
                        placeholder={t('contact.namePlaceholder')}
                        maxLength={120}
                      />
                      {errors.name && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="size-3" /> {t('contact.errorRequired')}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">{t('contact.email')}</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: false }); }}
                        className={inputClass('email')}
                        placeholder={t('contact.emailPlaceholder')}
                        maxLength={160}
                      />
                      {errors.email && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="size-3" /> {t('contact.errorValidEmail')}</p>}
                    </div>
                  </div>
                  <div className="mt-5">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{t('contact.subject')}</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => { setForm({ ...form, subject: e.target.value }); setErrors({ ...errors, subject: false }); }}
                      className={inputClass('subject')}
                      placeholder={t('contact.subjectPlaceholder')}
                      maxLength={160}
                    />
                    {errors.subject && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="size-3" /> {t('contact.errorRequired')}</p>}
                  </div>
                  <div className="mt-5">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{t('contact.message')}</label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: false }); }}
                      className={`${inputClass('message')} resize-none`}
                      placeholder={t('contact.messagePlaceholder')}
                      maxLength={2000}
                    />
                    {errors.message && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="size-3" /> {t('contact.errorRequired')}</p>}
                  </div>

                  {status === 'error' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 flex items-center gap-2 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <AlertCircle className="size-4 shrink-0" /> {statusMessage || t('contact.error')}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="btn btn-primary mt-6 disabled:opacity-50"
                  >
                    <Send className="size-4" />
                    {status === 'sending' ? t('contact.sending') : t('contact.send')}
                  </button>
                </form>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-5">
              <ScrollReveal>
                <div className="border-t border-[var(--ss-rule)] pt-6">
                  <h3 className="font-heading text-lg font-medium">{t('contact.infoTitle')}</h3>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="flex items-center gap-2 transition-colors hover:text-foreground"
                    >
                      <Mail className="size-4 text-[var(--ss-accent)]" />
                      <span className="break-all">{SITE_CONFIG.email}</span>
                    </a>
                    <a
                      href={SITE_CONFIG.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 transition-colors hover:text-foreground"
                    >
                      <Instagram className="size-4 text-[var(--ss-accent)]" />
                      Instagram
                    </a>
                    <a
                      href={SITE_CONFIG.maps.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 transition-colors hover:text-foreground"
                    >
                      <MapPin className="mt-0.5 size-4 text-[var(--ss-accent)]" />
                      <span className="break-words">{SITE_CONFIG.address}</span>
                    </a>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div className="mt-8 border-t border-[var(--ss-rule)] pt-4">
                  <div className="overflow-hidden border border-[var(--ss-rule)]">
                    <iframe
                      title="Student Startups location"
                      src={SITE_CONFIG.maps.embed}
                      className="h-64 w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ss-navy)]/45"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="mx-6 w-full max-w-sm border border-[var(--ss-rule)] bg-[var(--ss-surface)] p-7 text-center"
            >
              <div className="mx-auto flex size-12 items-center justify-center bg-[var(--ss-navy)] text-white">
                <Send className="size-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">{t('contact.sent')}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('contact.success')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
