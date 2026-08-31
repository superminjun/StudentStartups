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
  const colors = ['var(--ss-sky)', 'var(--ss-lime)', 'var(--ss-sand)', 'var(--ss-violet)'];
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 28, scale: .96, rotateX: 3, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ ...motionSpring.reveal, delay: Math.min(index * STAGGER, .28) }}
      whileHover={{ y: -9, rotateZ: index % 2 ? .3 : -.3 }}
      whileTap={{ scale: .975, y: 1 }}
      className="group w-full text-left"
      style={{ transformPerspective: 900 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.7rem] bg-black/[.04]">
        <TeamPhoto profile={profile} className="transition-transform duration-700 ease-out group-hover:scale-[1.045]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute right-3 top-3 grid size-10 translate-y-2 place-items-center rounded-full bg-white/90 text-sm opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">↗</span>
        {profile.isFounder && <motion.span animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-3 left-3 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-black" style={{ background: colors[index % colors.length] }}>{t('teamPage.founderBadge')}</motion.span>}
      </div>
      <div className="px-1 pb-3 pt-5">
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-[-.05em]">{profile.fullName}</h2><p className="mt-1 text-sm text-black/45">{profile.roleTitle}</p></div><span className="text-[10px] font-bold text-black/35">0{index + 1}</span></div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-black/52">{profile.shortBio}</p>
        <p className="mt-4 border-t border-black/10 pt-3 text-[10px] font-semibold uppercase tracking-[.14em] text-black/35">{formatJoinedDate(profile.joinedDate, lang)}</p>
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
      <DialogContent className="max-h-[90vh] overflow-y-auto border-0 bg-[var(--ss-canvas)] p-0 sm:max-w-5xl">
        <div className="grid lg:grid-cols-[.92fr_1.08fr]">
          <div className="min-h-[360px] bg-black/5 lg:min-h-[640px]"><TeamPhoto profile={profile} /></div>
          <div className="p-7 sm:p-10">
            <DialogHeader className="text-left"><p className="text-[10px] font-black uppercase tracking-[.2em] text-black/40">{formatJoinedDate(profile.joinedDate, lang)}</p><DialogTitle className="mt-4 text-4xl font-semibold tracking-[-.065em] sm:text-6xl">{profile.fullName}</DialogTitle><p className="mt-1 text-sm text-black/45">{profile.roleTitle}</p></DialogHeader>
            <p className="mt-8 text-base leading-7 text-black/60">{profile.shortBio}</p>
            {(profile.tags ?? []).length > 0 && <div className="mt-5 flex flex-wrap gap-2">{profile.tags.map((tag) => <span key={tag} className="rounded-full bg-black/[.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em]">{tag}</span>)}</div>}
            <div className="mt-10 border-t border-black/30">{sections.map(([title, body], index) => <section key={title} className="border-b border-black/12 py-6"><p className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: ['#e84e35', '#4187d7', '#6d49b8'][index] }}>{title}</p><p className="mt-3 whitespace-pre-line text-sm leading-7 text-black/65">{body}</p></section>)}</div>
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
    <div className="bg-[var(--ss-canvas)] pt-[4.75rem]">
      <section className="relative overflow-hidden px-5 py-20 sm:px-8 lg:py-28">
        <div className="absolute right-[-8%] top-[-10%] size-[28rem] rounded-full bg-[var(--ss-violet)]/35 blur-[100px]" />
        <div className="relative mx-auto max-w-[90rem]">
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.reveal} className="text-[10px] font-black uppercase tracking-[.28em] text-black/45">People / {String(sortedProfiles.length).padStart(2, '0')}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 42, rotateX: 5, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }} transition={motionSpring.depth} className="mt-8 max-w-[12ch] text-[clamp(4rem,10vw,10rem)] font-semibold leading-[.79] tracking-[-.09em]">{t('teamPage.title')}</motion.h1>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .2 }} className="mt-12 grid gap-8 border-t border-black/20 pt-7 lg:grid-cols-[1.1fr_.9fr]"><p className="max-w-2xl text-[clamp(1.4rem,2.4vw,2.6rem)] font-medium leading-[1.1] tracking-[-.04em]">{lang === 'ko' ? '직함보다, 실제로 맡은 일로 소개합니다.' : 'Introduced by the work they actually own.'}</p><p className="max-w-lg text-base leading-7 text-black/55">{t('teamPage.subtitle')}</p></motion.div>
        </div>
      </section>
      <div className="ss-marquee overflow-hidden border-y border-black/15 bg-[var(--ss-sky)] py-3 text-[11px] font-black uppercase tracking-[.22em]"><div>PRODUCT · OPERATIONS · DESIGN · COMMUNICATION · PRODUCT · OPERATIONS · DESIGN · COMMUNICATION ·</div></div>
      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[90rem]">
          {status === 'loading' && sortedProfiles.length === 0 ? <p className="py-20 text-center text-sm text-black/45">{t('teamPage.loading')}</p> : sortedProfiles.length === 0 ? <div className="rounded-[1.5rem] border border-dashed border-black/20 p-12 text-center"><p className="text-xl font-semibold">{t('teamPage.emptyTitle')}</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50">{t('teamPage.emptyBody')}</p>{error && <p className="mt-4 text-xs text-black/35">{error}</p>}</div> : <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{sortedProfiles.map((profile, index) => <TeamCard key={profile.id} profile={profile} index={index} onSelect={() => setSelectedProfile(profile)} />)}</div>}
        </div>
      </section>
      <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
    </div>
  );
}
