import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { TeamProfile } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { useTeamStore, useTeamSync } from '@/stores/teamStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const initialsFor = (name: string) => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'SS';

const formatJoinedDate = (date: string, lang: 'en' | 'ko') => {
  if (!date) return lang === 'ko' ? '합류일 미정' : 'Joined date coming soon';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return lang === 'ko'
    ? `${parsed.getFullYear()}년 ${parsed.getMonth() + 1}월 합류`
    : `Joined ${parsed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
};

function TeamPhoto({ profile, className }: { profile: TeamProfile; className?: string }) {
  if (profile.photoUrl) {
    return (
      <img
        src={profile.photoUrl}
        alt={`${profile.fullName} profile`}
        loading="lazy"
        decoding="async"
        className={cn('size-full object-cover transition-transform duration-700 ease-out', className)}
      />
    );
  }
  return <div className="grid size-full place-items-center bg-muted text-3xl font-semibold text-muted-foreground">{initialsFor(profile.fullName)}</div>;
}

function TeamCard({ profile, onSelect }: { profile: TeamProfile; onSelect: () => void }) {
  const { lang, t } = useLanguage();
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      className="group w-full text-left"
    >
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        <TeamPhoto profile={profile} className="group-hover:scale-[1.025]" />
      </div>
      <div className="border-b border-border py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{profile.fullName}</h2>
              {profile.isFounder && <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">{t('teamPage.founderBadge')}</span>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{profile.roleTitle}</p>
          </div>
          <span className="text-sm text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden>↗</span>
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">{profile.shortBio}</p>
        <p className="mt-4 text-xs text-muted-foreground">{formatJoinedDate(profile.joinedDate, lang)}</p>
      </div>
    </motion.button>
  );
}

function ProfileModal({ profile, onClose }: { profile: TeamProfile | null; onClose: () => void }) {
  const { lang, t } = useLanguage();
  if (!profile) return null;
  const sections = [
    [t('teamPage.currentWork'), profile.currentWork],
    [t('teamPage.contribution'), profile.contribution],
    [t('teamPage.focus'), profile.focus],
  ].filter(([, body]) => body?.trim());

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-4xl">
        <div className="grid bg-card lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-h-[360px] bg-muted lg:min-h-[620px]">
            <TeamPhoto profile={profile} />
          </div>
          <div className="p-6 sm:p-9">
            <DialogHeader className="text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{formatJoinedDate(profile.joinedDate, lang)}</p>
              <DialogTitle className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">{profile.fullName}</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">{profile.roleTitle}</p>
            </DialogHeader>
            <p className="mt-7 text-base leading-7 text-muted-foreground">{profile.shortBio}</p>
            {(profile.tags ?? []).length > 0 && (
              <p className="mt-5 text-xs leading-6 text-muted-foreground">{profile.tags.join(' · ')}</p>
            )}
            <div className="mt-9 border-t border-foreground">
              {sections.map(([title, body]) => (
                <section key={title} className="border-b border-border py-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground/80">{body}</p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Team() {
  const { t } = useLanguage();
  const [selectedProfile, setSelectedProfile] = useState<TeamProfile | null>(null);
  const profiles = useTeamStore((state) => state.profiles);
  const status = useTeamStore((state) => state.status);
  const error = useTeamStore((state) => state.error);
  useTeamSync();

  const sortedProfiles = useMemo(() => [...profiles].sort((a, b) => {
    if (a.isFounder !== b.isFounder) return a.isFounder ? -1 : 1;
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return a.sortOrder - b.sortOrder || a.fullName.localeCompare(b.fullName);
  }), [profiles]);

  return (
    <div className="pt-[4.5rem]">
      <section className="border-b border-border bg-background py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end"
          >
            <div>
              <p className="section-kicker">{t('teamPage.kicker')}</p>
              <h1 className="mt-6 max-w-5xl font-heading text-[clamp(3.4rem,8vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-foreground">{t('teamPage.title')}</h1>
            </div>
            <p className="max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">{t('teamPage.subtitle')}</p>
          </motion.div>

          <div className="mt-14 grid border-t border-foreground sm:grid-cols-3">
            {[
              [t('teamPage.statOneLabel'), t('teamPage.statOneValue')],
              [t('teamPage.statTwoLabel'), t('teamPage.statTwoValue')],
              [t('teamPage.statThreeLabel'), t('teamPage.statThreeValue')],
            ].map(([label, value], index) => (
              <div key={label} className={`border-b border-border py-5 sm:border-r sm:px-6 ${index === 0 ? 'sm:pl-0' : ''} ${index === 2 ? 'sm:border-r-0' : ''}`}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {status === 'loading' && sortedProfiles.length === 0 ? (
            <p className="py-20 text-center text-sm text-muted-foreground">{t('teamPage.loading')}</p>
          ) : sortedProfiles.length === 0 ? (
            <div className="border border-dashed border-border p-10 text-center">
              <p className="text-lg font-semibold text-foreground">{t('teamPage.emptyTitle')}</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{t('teamPage.emptyBody')}</p>
              {error && <p className="mt-4 text-xs text-muted-foreground">{error}</p>}
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {sortedProfiles.map((profile) => (
                <TeamCard key={profile.id} profile={profile} onSelect={() => setSelectedProfile(profile)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
    </div>
  );
}
