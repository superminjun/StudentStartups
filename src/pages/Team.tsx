import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { TeamProfile } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { useTeamStore, useTeamSync } from '@/stores/teamStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motionSpring, STAGGER } from '@/lib/motion';
import { cn } from '@/lib/utils';

const initialsFor = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'SS';

const formatJoinedDate = (date: string, lang: 'en' | 'ko') => {
  if (!date) return lang === 'ko' ? '합류일 미정' : 'Joined date coming soon';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return lang === 'ko' ? `${parsed.getFullYear()}년 ${parsed.getMonth() + 1}월 합류` : `Joined ${parsed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
};

function TeamPhoto({ profile, className }: { profile: TeamProfile; className?: string }) {
  if (profile.photoUrl) return <img src={profile.photoUrl} alt={`${profile.fullName} profile`} loading="lazy" decoding="async" className={cn('size-full object-cover', className)} />;
  return <div className="grid size-full place-items-center bg-black/[.06] text-4xl font-semibold text-black/35">{initialsFor(profile.fullName)}</div>;
}

function TeamCard({ profile, onSelect, index }: { profile: TeamProfile; onSelect: () => void; index: number }) {
  const { lang, t } = useLanguage();
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ ...motionSpring.reveal, delay: Math.min(index * STAGGER, .28) }}
      whileHover={{ y: -3 }}
      whileTap={{ y: 1 }}
      className="group w-full border-t border-[var(--ss-rule)] pt-4 text-left"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--ss-panel)]">
        <TeamPhoto profile={profile} className="transition-transform duration-500 ease-out group-hover:scale-[1.025]" />
        <span className="absolute bottom-0 right-0 grid size-11 place-items-center bg-[var(--ss-navy)] text-sm text-white">↗</span>
      </div>
      <div className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-heading text-xl font-medium">{profile.fullName}</h2><p className="mt-1 text-sm text-[var(--ss-muted)]">{profile.roleTitle}</p></div><span className="text-[10px] font-semibold text-[var(--ss-muted)]">0{index + 1}</span></div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--ss-muted)]">{profile.shortBio}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--ss-rule)] pt-3 text-[10px] font-semibold uppercase tracking-[.1em] text-[var(--ss-muted)]"><span>{formatJoinedDate(profile.joinedDate, lang)}</span>{profile.isFounder && <span className="text-[var(--ss-accent)]">{t('teamPage.founderBadge')}</span>}</div>
      </div>
    </motion.button>
  );
}

function ProfileModal({ profile, onClose }: { profile: TeamProfile | null; onClose: () => void }) {
  const { lang, t } = useLanguage();
  if (!profile) return null;
  const sections = [[t('teamPage.currentWork'), profile.currentWork], [t('teamPage.contribution'), profile.contribution], [t('teamPage.focus'), profile.focus]].filter(([, body]) => body?.trim());
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-sm border border-[var(--ss-rule)] bg-[var(--ss-paper)] p-0 sm:max-w-5xl">
        <div className="grid lg:grid-cols-[.92fr_1.08fr]">
          <div className="min-h-[360px] bg-[var(--ss-panel)] lg:min-h-[640px]"><TeamPhoto profile={profile} /></div>
          <div className="p-7 sm:p-10">
            <DialogHeader className="text-left"><p className="ss-label text-[var(--ss-accent)]">{formatJoinedDate(profile.joinedDate, lang)}</p><DialogTitle className="ss-heading mt-4">{profile.fullName}</DialogTitle><p className="mt-1 text-sm text-[var(--ss-muted)]">{profile.roleTitle}</p></DialogHeader>
            <p className="mt-8 text-[15px] leading-7 text-[var(--ss-muted)]">{profile.shortBio}</p>
            {(profile.tags ?? []).length > 0 && <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--ss-muted)]">{profile.tags.join(' · ')}</p>}
            <div className="mt-10 border-t border-[var(--ss-rule)]">{sections.map(([title, body]) => <section key={title} className="border-b border-[var(--ss-rule)] py-6"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--ss-accent)]">{title}</p><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--ss-muted)]">{body}</p></section>)}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Team() {
  const { lang, t } = useLanguage();
  const [selectedProfile, setSelectedProfile] = useState<TeamProfile | null>(null);
  const profiles = useTeamStore((state) => state.profiles);
  const status = useTeamStore((state) => state.status);
  const error = useTeamStore((state) => state.error);
  useTeamSync();
  const sortedProfiles = useMemo(() => [...profiles].sort((a, b) => a.isFounder !== b.isFounder ? (a.isFounder ? -1 : 1) : a.isFeatured !== b.isFeatured ? (a.isFeatured ? -1 : 1) : a.sortOrder - b.sortOrder || a.fullName.localeCompare(b.fullName)), [profiles]);

  return (
    <div className="bg-[var(--ss-paper)] pt-[4.5rem]">
      <section className="border-b border-[var(--ss-rule)] py-16 lg:py-20">
        <div className="ss-wrap grid gap-10 lg:grid-cols-[.38fr_1fr]">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.reveal} className="ss-label text-[var(--ss-accent)]">{t('nav.team')} · {String(sortedProfiles.length).padStart(2, '0')}</motion.p>
          <div><motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.depth} className="ss-display max-w-[17ch]">{t('teamPage.title')}</motion.h1><motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .1 }} className="mt-7 max-w-xl text-[15px] leading-7 text-[var(--ss-muted)]">{t('teamPage.subtitle')}</motion.p></div>
        </div>
      </section>
      <section className="ss-section bg-[var(--ss-surface)]">
        <div className="ss-wrap">
          {status === 'loading' && sortedProfiles.length === 0 ? <p className="py-20 text-center text-sm text-[var(--ss-muted)]">{t('teamPage.loading')}</p> : sortedProfiles.length === 0 ? <div className="border border-[var(--ss-rule)] p-12 text-center"><p className="font-heading text-xl">{t('teamPage.emptyTitle')}</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ss-muted)]">{t('teamPage.emptyBody')}</p>{error && <p className="mt-4 text-xs text-[var(--ss-muted)]">{error}</p>}</div> : <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{sortedProfiles.map((profile, index) => <TeamCard key={profile.id} profile={profile} index={index} onSelect={() => setSelectedProfile(profile)} />)}</div>}
        </div>
      </section>
      <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
    </div>
  );
}
