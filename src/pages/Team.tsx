import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Filter } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { teamPageCopy } from '@/constants/teamPageCopy';
import { useTeamStore, useTeamSync } from '@/stores/teamStore';
import TeamMemberCard from '@/components/features/TeamMemberCard';
import TeamProfileModal from '@/components/features/TeamProfileModal';
import type { TeamMemberShowcase } from '@/types';
import { cn } from '@/lib/utils';

type ActivityFilter = 'all' | 'recent';

function TeamCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)]">
      <div className="aspect-[4/5] animate-pulse bg-muted/70" />
    </div>
  );
}

export default function Team() {
  useTeamSync();

  const { lang } = useLanguage();
  const copy = teamPageCopy[lang];
  const members = useTeamStore((state) => state.members);
  const status = useTeamStore((state) => state.status);
  const [selectedMember, setSelectedMember] = useState<TeamMemberShowcase | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');

  const orderedMembers = useMemo(
    () => [...members].sort((a, b) => {
      if (a.founder !== b.founder) return a.founder ? -1 : 1;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.stats.projects !== b.stats.projects) return b.stats.projects - a.stats.projects;
      if (a.stats.contributions !== b.stats.contributions) return b.stats.contributions - a.stats.contributions;
      return a.name.localeCompare(b.name);
    }),
    [members]
  );

  const featuredMembers = useMemo(
    () => orderedMembers.filter((member) => member.featured).slice(0, 4),
    [orderedMembers]
  );

  const roleOptions = useMemo(
    () => Array.from(new Set(orderedMembers.map((member) => member.role).filter(Boolean))),
    [orderedMembers]
  );

  const teamOptions = useMemo(
    () => Array.from(new Set(orderedMembers.map((member) => member.team).filter(Boolean))),
    [orderedMembers]
  );

  const filteredMembers = useMemo(
    () => orderedMembers.filter((member) => {
      if (roleFilter !== 'all' && member.role !== roleFilter) return false;
      if (teamFilter !== 'all' && member.team !== teamFilter) return false;
      if (activityFilter === 'recent' && !member.recentlyActive) return false;
      return true;
    }),
    [activityFilter, orderedMembers, roleFilter, teamFilter]
  );

  const aggregateStats = useMemo(() => {
    const projects = new Set(orderedMembers.flatMap((member) => member.projects.map((project) => project.id)));
    return {
      projects: projects.size,
      collaborations: Math.max(
        0,
        Math.round(orderedMembers.reduce((sum, member) => sum + member.stats.collaborations, 0) / 2)
      ),
      events: orderedMembers.reduce((sum, member) => sum + member.stats.events, 0),
      contributions: orderedMembers.reduce((sum, member) => sum + member.stats.contributions, 0),
    };
  }, [orderedMembers]);

  const loading = status === 'idle' || status === 'loading';

  return (
    <>
      <div className="bg-beige">
        <section className="section border-b border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(107,154,255,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,245,240,0.92))]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr),360px] lg:items-end">
              <div className="max-w-3xl">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="section-kicker"
                >
                  {copy.pageKicker}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.52, delay: 0.04 }}
                  className="section-title mt-4"
                >
                  {copy.pageTitle}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.52, delay: 0.08 }}
                  className="section-lead max-w-2xl"
                >
                  {copy.pageSubtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.52, delay: 0.12 }}
                  className="mt-8 flex flex-wrap gap-3"
                >
                  <Link to="/projects" className="btn btn-secondary">
                    {lang === 'ko' ? '프로젝트 보기' : 'Review Projects'} <ArrowRight className="size-4" />
                  </Link>
                  <Link to="/contact" className="btn btn-primary">
                    {lang === 'ko' ? '문의하기' : 'Contact'}
                  </Link>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.52, delay: 0.16 }}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { label: copy.projectsStat, value: aggregateStats.projects },
                  { label: copy.collaborationsStat, value: aggregateStats.collaborations },
                  { label: copy.eventsStat, value: aggregateStats.events },
                  { label: copy.contributionsStat, value: aggregateStats.contributions },
                ].map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-border/80 bg-card/85 p-4 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section border-b border-border/60 bg-card/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">{copy.pageKicker}</p>
                <h2 className="section-title mt-3 text-3xl sm:text-4xl">{copy.featuredTitle}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {copy.featuredSubtitle}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {(loading ? Array.from({ length: 4 }) : featuredMembers).map((member, index) =>
                loading ? (
                  <TeamCardSkeleton key={`featured-skeleton-${index}`} />
                ) : (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    lang={lang}
                    joinedLabel={copy.joinedPrefix}
                    founderLabel={copy.founderLabel}
                    recentlyActiveLabel={copy.recentlyActive}
                    viewProfileLabel={copy.viewProfile}
                    onSelect={setSelectedMember}
                    priority={index < 2}
                  />
                )
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="section-kicker">{copy.pageKicker}</p>
                <h2 className="section-title mt-3 text-3xl sm:text-4xl">{copy.directoryTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                  {copy.directorySubtitle}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    <Filter className="size-3.5" />
                    {copy.allRoles}
                  </span>
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-accent"
                  >
                    <option value="all">{copy.allRoles}</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {copy.allTeams}
                  </span>
                  <select
                    value={teamFilter}
                    onChange={(event) => setTeamFilter(event.target.value)}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-accent"
                  >
                    <option value="all">{copy.allTeams}</option>
                    {teamOptions.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {copy.allActivity}
                  </span>
                  <div className="flex rounded-2xl border border-border bg-card p-1 shadow-sm">
                    {([
                      { value: 'all', label: copy.allFilter },
                      { value: 'recent', label: copy.recentlyActive },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setActivityFilter(option.value)}
                        className={cn(
                          'flex-1 rounded-[14px] px-3 py-2 text-sm font-medium transition-colors',
                          activityFilter === option.value
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => <TeamCardSkeleton key={`directory-skeleton-${index}`} />)
              ) : filteredMembers.length ? (
                filteredMembers.map((member, index) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    lang={lang}
                    joinedLabel={copy.joinedPrefix}
                    founderLabel={copy.founderLabel}
                    recentlyActiveLabel={copy.recentlyActive}
                    viewProfileLabel={copy.viewProfile}
                    onSelect={setSelectedMember}
                    priority={index < 3}
                  />
                ))
              ) : (
                <div className="col-span-full rounded-[28px] border border-dashed border-border bg-card/70 px-6 py-12 text-center shadow-sm">
                  <p className="text-lg font-semibold text-foreground">{copy.noMembersTitle}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{copy.noMembersBody}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <TeamProfileModal
        member={selectedMember}
        open={Boolean(selectedMember)}
        onOpenChange={(open) => {
          if (!open) setSelectedMember(null);
        }}
        lang={lang}
      />
    </>
  );
}
