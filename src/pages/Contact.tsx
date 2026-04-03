import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { SITE_CONFIG } from '@/constants/config';
import ScrollReveal from '@/components/features/ScrollReveal';
import { Mail, Send, AlertCircle, MapPin, Instagram } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, boolean> = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = true;
    if (!form.subject.trim()) e.subject = true;
    if (!form.message.trim()) e.message = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { setStatus('error'); return; }
    setStatus('sending');
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('messages').insert({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      if (error) {
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
        ...form,
        created_at: new Date().toISOString(),
        is_read: false,
        is_resolved: false,
      });
      localStorage.setItem('bnss-messages', JSON.stringify(messages));
    }
    setStatus('success');
    setShowSuccess(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    window.setTimeout(() => {
      setShowSuccess(false);
      setStatus('idle');
    }, 1800);
  };

  const inputClass = (field: string) =>
    `w-full rounded-lg border bg-card px-4 py-3 text-sm text-charcoal outline-none transition-all focus:border-charcoal focus:ring-1 focus:ring-charcoal/10 ${
      errors[field] ? 'border-red-400 bg-red-50/30' : 'border-border'
    }`;

  return (
    <div>
      <section className="bg-charcoal pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {t('contact.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3 max-w-xl text-base text-white/50"
          >
            {t('contact.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="bg-beige py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ScrollReveal>
                <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 lg:p-8">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-charcoal">{t('contact.name')}</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: false }); }}
                        className={inputClass('name')}
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="size-3" /> Required</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-charcoal">{t('contact.email')}</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: false }); }}
                        className={inputClass('email')}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="size-3" /> Valid email required</p>}
                    </div>
                  </div>
                  <div className="mt-5">
                    <label className="mb-1.5 block text-sm font-medium text-charcoal">{t('contact.subject')}</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => { setForm({ ...form, subject: e.target.value }); setErrors({ ...errors, subject: false }); }}
                      className={inputClass('subject')}
                      placeholder="How can we help?"
                    />
                    {errors.subject && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="size-3" /> Required</p>}
                  </div>
                  <div className="mt-5">
                    <label className="mb-1.5 block text-sm font-medium text-charcoal">{t('contact.message')}</label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: false }); }}
                      className={`${inputClass('message')} resize-none`}
                      placeholder="Tell us more..."
                    />
                    {errors.message && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="size-3" /> Required</p>}
                  </div>

                  {status === 'error' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                      <AlertCircle className="size-4 shrink-0" /> {t('contact.error')}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="mt-6 flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[hsl(20,8%,28%)] active:scale-[0.98] disabled:opacity-50"
                  >
                    <Send className="size-4" />
                    {status === 'sending' ? t('contact.sending') : t('contact.send')}
                  </button>
                </form>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-5">
              <ScrollReveal direction="right">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-base font-semibold text-charcoal">Contact</h3>
                  <div className="mt-4 space-y-3 text-sm text-mid">
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="flex items-center gap-2 transition-colors hover:text-charcoal"
                    >
                      <Mail className="size-4 text-[hsl(24,80%,50%)]" />
                      {SITE_CONFIG.email}
                    </a>
                    <a
                      href={SITE_CONFIG.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 transition-colors hover:text-charcoal"
                    >
                      <Instagram className="size-4 text-[hsl(24,80%,50%)]" />
                      Instagram
                    </a>
                    <a
                      href={SITE_CONFIG.maps.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 transition-colors hover:text-charcoal"
                    >
                      <MapPin className="mt-0.5 size-4 text-[hsl(24,80%,50%)]" />
                      <span>{SITE_CONFIG.address}</span>
                    </a>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.1}>
                <div className="mt-4 rounded-xl border border-border bg-card p-4">
                  <div className="overflow-hidden rounded-lg border border-border">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="mx-6 w-full max-w-sm rounded-2xl border border-emerald-100 bg-card p-6 text-center shadow-lg"
            >
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Send className="size-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-charcoal">{t('contact.sent')}</p>
              <p className="mt-1 text-xs text-light">{t('contact.success')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
