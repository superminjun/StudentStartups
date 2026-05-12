import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, CalendarDays, Sparkles } from 'lucide-react';
import type { TeamProfile } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { useTeamStore, useTeamSync } from '@/stores/teamStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const initialsFor = (name: string) =>
  name
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

  return (
    <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted via-card to-background text-3xl font-semibold text-muted-foreground">
      {initialsFor(profile.fullName)}
    </div>
  );
}

function TeamCard({ profile, onSelect }: { profile: TeamProfile; onSelect: () => void }) {
  const { lang } = useLanguage();
  const visibleTags = (profile.tags ?? []).slice(0, 3);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group w-full text-left"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/10">
        <div className="relative aspect-[4/5] overflow-hidden">
          <TeamPhoto profile={profile} className="group-hover:scale-[1.055]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/8 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />
          <div className="absolute inset-x-4 bottom-4 rounded-3xl border border-white/20 bg-white/12 p-4 text-white shadow-xl backdrop-blur-2xl transition-all duration-500 group-hover:translate-y-[-2px] group-hover:bg-white/18">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-lg font-semibold tracking-tight">{profile.fullName}</p>
                  {profile.isFounder && (
                    <span className="rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]">
                      Founder
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-white/78">{profile.roleTitle}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-white/68">
                  <CalendarDays className="size-3.5" />
                  {formatJoinedDate(profile.joinedDate, lang)}
                </p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 opacity-70 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{profile.shortBio}</p>
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function ProfileModal({ profile, onClose }: { profile: TeamProfile | null; onClose: () => void }) {
  const { lang } = useLanguage();
  if (!profile) return null;

  const sections = [
    {
      title: lang === 'ko' ? '현재 맡은 일' : 'Current Work',
      body: profile.currentWork,
    },
    {
      title: lang === 'ko' ? '기여' : 'Contribution',
      body: profile.contribution,
    },
    {
      title: lang === 'ko' ? '집중 분야' : 'Focus',
      body: profile.focus,
    },
  ].filter((section) => section.body?.trim());

  return (
    <Dialog open={Boolean(profile)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-4xl">
        <div className="grid overflow-hidden rounded-[inherit] bg-card lg:grid-cols-[0.95fr,1.05fr]">
          <div className="relative min-h-[360px] overflow-hidden bg-muted lg:min-h-[620px]">
            <div className="absolute inset-0">
              <TeamPhoto profile={profile} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 rounded-3xl border border-white/20 bg-white/12 p-5 text-white shadow-2xl backdrop-blur-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-white/62">
                {formatJoinedDate(profile.joinedDate, lang)}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{profile.fullName}</h2>
              <p className="mt-2 text-sm text-white/78">{profile.roleTitle}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <DialogHeader className="text-left">
              <div className="flex flex-wrap items-center gap-2">
                {profile.isFounder && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
                    <BadgeCheck className="size-3.5" />
                    Founder
                  </span>
                )}
                {profile.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    <Sparkles className="size-3.5" />
                    Featured
                  </span>
                )}
              </div>
              <DialogTitle className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
                {lang === 'ko' ? '프로필' : 'Profile'}
              </DialogTitle>
            </DialogHeader>

            <p className="mt-5 text-base leading-7 text-muted-foreground">{profile.shortBio}</p>

            {(profile.tags ?? []).length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 grid gap-4">
              {sections.map((section) => (
                <div key={section.title} className="rounded-2xl border border-border bg-background p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {section.title}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground/82">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Team() {
  const { lang } = useLanguage();
  const [selectedProfile, setSelectedProfile] = useState<TeamProfile | null>(null);
  const profiles = useTeamStore((state) => state.profiles);
  const status = useTeamStore((state) => state.status);
  const error = useTeamStore((state) => state.error);
  useTeamSync();

  const sortedProfiles = useMemo(
    () => [...profiles].sort((a, b) => {
      if (a.isFounder !== b.isFounder) return a.isFounder ? -1 : 1;
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.sortOrder - b.sortOrder || a.fullName.localeCompare(b.fullName);
    }),
    [profiles]
  );

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="section-kicker">{lang === 'ko' ? '팀' : 'Team'}</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {lang === 'ko' ? '작업을 실제로 맡는 사람들.' : 'The people behind the work.'}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {lang === 'ko'
              ? 'Student Startups는 역할이 분명한 멤버들이 제품, 운영, 디자인, 커뮤니케이션을 나누어 맡으며 만들어갑니다.'
              : 'Student Startups is built by members with defined responsibilities across product, operations, design, and communication.'}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            [lang === 'ko' ? '역할' : 'Roles', lang === 'ko' ? '기여가 보이는 구조' : 'Defined ownership'],
            [lang === 'ko' ? '기록' : 'Record', lang === 'ko' ? '프로젝트와 연결된 작업' : 'Work tied to projects'],
            [lang === 'ko' ? '기준' : 'Standard', lang === 'ko' ? '보여줄 수 있는 결과' : 'Output that can be reviewed'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
              <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {status === 'loading' && sortedProfiles.length === 0 ? (
          <div className="rounded-[2rem] border border-border bg-card p-10 text-center text-muted-foreground">
            {lang === 'ko' ? '팀 프로필을 불러오는 중입니다.' : 'Loading team profiles.'}
          </div>
        ) : sortedProfiles.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border bg-card p-10 text-center">
            <p className="text-lg font-semibold text-foreground">
              {lang === 'ko' ? '아직 공개된 팀 프로필이 없습니다.' : 'No public team profiles yet.'}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              {lang === 'ko'
                ? '관리자 페이지의 Team 탭에서 멤버 사진과 소개를 저장하면 이곳에 표시됩니다.'
                : 'Once profiles are saved in the Admin Team tab, they will appear here.'}
            </p>
            {error && <p className="mt-4 text-xs text-muted-foreground">{error}</p>}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProfiles.map((profile) => (
              <TeamCard
                key={profile.id}
                profile={profile}
                onSelect={() => setSelectedProfile(profile)}
              />
            ))}
          </div>
        )}
      </section>

      <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
    </main>
  );
}
