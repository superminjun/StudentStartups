import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MemberPortrait from '@/components/features/MemberPortrait';
import type { TeamMemberShowcase } from '@/types';
import { teamPageCopy } from '@/constants/teamPageCopy';

type TeamProfileModalProps = {
  member: TeamMemberShowcase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: 'en' | 'ko';
};

const skillMap: Record<string, { en: string[]; ko: string[] }> = {
  platform: {
    en: ['Systems design', 'Product strategy', 'Cross-functional coordination'],
    ko: ['시스템 설계', '프로덕트 전략', '크로스펑셔널 조정'],
  },
  marketing: {
    en: ['Positioning', 'Launch communication', 'Audience research'],
    ko: ['포지셔닝', '출시 커뮤니케이션', '오디언스 리서치'],
  },
  production: {
    en: ['Operational planning', 'Production workflows', 'Execution management'],
    ko: ['운영 설계', '생산 워크플로', '실행 관리'],
  },
  finance: {
    en: ['Budget control', 'Financial reporting', 'Decision support'],
    ko: ['예산 관리', '재무 리포팅', '의사결정 지원'],
  },
  design: {
    en: ['Brand systems', 'Presentation design', 'Product judgment'],
    ko: ['브랜드 시스템', '프레젠테이션 디자인', '제품 판단'],
  },
};

function formatJoinDate(joinDate: string, lang: 'en' | 'ko') {
  const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
  return new Date(`${joinDate}T00:00:00`).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
  });
}

function getTeamKey(team: string) {
  return team.trim().toLowerCase();
}

function getDefaultBio(member: TeamMemberShowcase, lang: 'en' | 'ko') {
  if (lang === 'ko') {
    if (member.founder) {
      return `${member.name}은 Student Startups의 구조, 방향, 공개 시스템 전반을 설계하고 이끌고 있습니다.`;
    }
    return `${member.name}은 ${member.team !== 'Unassigned' ? member.team : 'Student Startups'} 영역에서 실제 운영과 결과를 함께 만들어가고 있습니다.`;
  }

  if (member.founder) {
    return `${member.name} leads the structure, direction, and public systems behind Student Startups.`;
  }

  return `${member.name} contributes across ${member.team !== 'Unassigned' ? member.team : 'Student Startups'} with a focus on dependable execution and visible results.`;
}

function getContributionSummary(member: TeamMemberShowcase, lang: 'en' | 'ko') {
  const explicit = lang === 'ko' ? member.contributionSummaryKo : member.contributionSummaryEn;
  if (explicit?.trim()) return explicit;

  if (lang === 'ko') {
    return `${member.stats.projects}개 프로젝트, ${member.stats.events}회 기록, ${member.stats.contributions} 포인트를 중심으로 역할과 결과를 꾸준히 쌓아가고 있습니다.`;
  }

  return `${member.stats.projects} project contributions, ${member.stats.events} recorded events, and ${member.stats.contributions} contribution points form the current record.`;
}

function getLeadership(member: TeamMemberShowcase, lang: 'en' | 'ko') {
  const values = lang === 'ko' ? member.leadershipKo : member.leadershipEn;
  if (values.length) return values;

  if (lang === 'ko') {
    return member.founder
      ? ['플랫폼의 기준과 구조를 설계합니다.', '팀 간 우선순위와 방향을 조정합니다.']
      : ['담당 영역에서 실행 기준을 높입니다.', '협업 과정에서 역할과 책임을 분명히 만듭니다.'];
  }

  return member.founder
    ? ['Defines the operating standards and public structure of the platform.', 'Coordinates direction across teams and priorities.']
    : ['Raises execution standards inside the assigned function.', 'Helps make ownership and collaboration clearer across teams.'];
}

function getCurrentGoals(member: TeamMemberShowcase, lang: 'en' | 'ko') {
  const values = lang === 'ko' ? member.currentGoalsKo : member.currentGoalsEn;
  if (values.length) return values;

  if (lang === 'ko') {
    return [
      '현재 맡은 역할에서 더 강한 운영 기준을 만드는 것.',
      '프로젝트 실행 기록을 더 분명하게 남기는 것.',
    ];
  }

  return [
    'Tighten standards inside the current operating role.',
    'Leave a clearer record of project execution over time.',
  ];
}

function getAchievements(member: TeamMemberShowcase, lang: 'en' | 'ko') {
  const values = lang === 'ko' ? member.achievementsKo : member.achievementsEn;
  if (values.length) return values;

  if (lang === 'ko') {
    return [
      `${member.stats.projects}개 프로젝트에 기여했습니다.`,
      `${member.stats.collaborations}회의 협업 흐름에 참여했습니다.`,
    ];
  }

  return [
    `Contributed to ${member.stats.projects} projects.`,
    `Worked across ${member.stats.collaborations} collaboration paths.`,
  ];
}

function getSkills(member: TeamMemberShowcase, lang: 'en' | 'ko') {
  if (member.skills.length) return member.skills;
  const mapped = skillMap[getTeamKey(member.team)];
  if (mapped) return lang === 'ko' ? mapped.ko : mapped.en;
  return lang === 'ko'
    ? ['실행 관리', '협업', '운영 판단']
    : ['Execution management', 'Collaboration', 'Operational judgment'];
}

function getTimeline(member: TeamMemberShowcase, lang: 'en' | 'ko') {
  if (member.timeline.length) return member.timeline;
  return [
    {
      date: member.joinDate,
      titleEn: 'Joined Student Startups',
      titleKo: 'Student Startups 합류',
      detailEn: `Began working inside the ${member.team !== 'Unassigned' ? member.team : 'core'} function.`,
      detailKo: `${member.team !== 'Unassigned' ? member.team : '핵심 운영'} 영역에서 활동을 시작했습니다.`,
      type: 'joined',
    },
    ...(member.projects[0]
      ? [{
          date: member.joinDate,
          titleEn: `Contributed to ${member.projects[0].name}`,
          titleKo: `${member.projects[0].name}에 참여`,
          detailEn: 'Contributed to public project execution and review.',
          detailKo: '공개 프로젝트의 실행과 검토에 참여했습니다.',
          type: 'project' as const,
        }]
      : []),
    {
      date: member.joinDate,
      titleEn: 'Recorded platform activity',
      titleKo: '플랫폼 활동 기록',
      detailEn: `${member.stats.events} events and reviews currently recorded.`,
      detailKo: `${member.stats.events}회의 미팅과 검토 기록이 남아 있습니다.`,
      type: 'review',
    },
  ];
}

export default function TeamProfileModal({
  member,
  open,
  onOpenChange,
  lang,
}: TeamProfileModalProps) {
  const copy = teamPageCopy[lang].modal;

  if (!member) return null;

  const bio = (lang === 'ko' ? member.bioKo : member.bioEn) || getDefaultBio(member, lang);
  const contributionSummary = getContributionSummary(member, lang);
  const leadership = getLeadership(member, lang);
  const currentGoals = getCurrentGoals(member, lang);
  const achievements = getAchievements(member, lang);
  const skills = getSkills(member, lang);
  const timeline = getTimeline(member, lang);
  const joined = formatJoinDate(member.joinDate, lang);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-hidden rounded-[28px] border border-border bg-card p-0">
        <div className="max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>{member.name}</DialogTitle>
          </DialogHeader>

          <div className="relative overflow-hidden border-b border-border">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(80,128,255,0.16),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.1),rgba(15,23,42,0.72))]" />
            <div className="absolute inset-0">
              <MemberPortrait
                name={member.name}
                src={member.bannerImage || member.photo}
                alt={member.name}
                className="h-full w-full"
              />
            </div>
            <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-6 pb-8 pt-8 sm:px-8 lg:grid-cols-[280px,minmax(0,1fr)] lg:items-end lg:gap-10 lg:pb-10 lg:pt-12">
              <MemberPortrait
                name={member.name}
                src={member.photo}
                alt={member.name}
                className="aspect-[4/5] w-full max-w-[240px] rounded-[28px] border border-white/20 shadow-2xl"
              />
              <div className="min-w-0 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  {member.founder && (
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur-md">
                      {teamPageCopy[lang].founderLabel}
                    </span>
                  )}
                  {member.recentlyActive && (
                    <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[11px] font-medium backdrop-blur-md">
                      {teamPageCopy[lang].recentlyActive}
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{member.name}</h2>
                <p className="mt-2 text-lg text-white/76">{member.role}</p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/72">
                  <span>{copy.roleLabel}: {member.role}</span>
                  <span>{copy.teamLabel}: {member.team}</span>
                  <span>{(lang === 'ko' ? '합류 ' : 'Joined ') + joined}</span>
                </div>
                <p className="mt-6 max-w-3xl text-sm leading-7 text-white/78 sm:text-[15px]">{bio}</p>
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.45fr),minmax(320px,0.9fr)]">
            <div className="space-y-8">
              <section className="rounded-[24px] border border-border bg-card p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.about}</h3>
                <p className="mt-4 text-sm leading-7 text-foreground/80">{bio}</p>
              </section>

              <section className="rounded-[24px] border border-border bg-muted/30 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.contributions}</h3>
                <p className="mt-4 text-sm leading-7 text-foreground/80">{contributionSummary}</p>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.projects}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {member.projects.length ? member.projects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="group overflow-hidden rounded-[24px] border border-border bg-card shadow-sm transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      <div className="relative aspect-[5/4] overflow-hidden">
                        <MemberPortrait
                          name={project.name}
                          src={project.image}
                          alt={project.name}
                          className="h-full w-full"
                          imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold text-foreground">{project.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{project.stageName}</p>
                      </div>
                    </Link>
                  )) : (
                    <div className="rounded-[24px] border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
                      {copy.noProjects}
                    </div>
                  )}
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.leadership}</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/80">
                    {leadership.map((item) => (
                      <li key={item} className="rounded-[20px] border border-border bg-card px-4 py-3">{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.goals}</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/80">
                    {currentGoals.map((item) => (
                      <li key={item} className="rounded-[20px] border border-border bg-card px-4 py-3">{item}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.timeline}</h3>
                <div className="mt-4 space-y-4">
                  {timeline.length ? timeline.map((milestone) => (
                    <div key={`${milestone.date}-${milestone.titleEn}`} className="relative rounded-[22px] border border-border bg-card px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {lang === 'ko' ? milestone.titleKo : milestone.titleEn}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(`${milestone.date}T00:00:00`).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {(lang === 'ko' ? milestone.detailKo : milestone.detailEn) && (
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {lang === 'ko' ? milestone.detailKo : milestone.detailEn}
                        </p>
                      )}
                    </div>
                  )) : (
                    <div className="rounded-[22px] border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
                      {copy.noTimeline}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="grid grid-cols-2 gap-3">
                {[
                  { label: teamPageCopy[lang].projectsStat, value: member.stats.projects },
                  { label: teamPageCopy[lang].collaborationsStat, value: member.stats.collaborations },
                  { label: teamPageCopy[lang].eventsStat, value: member.stats.events },
                  { label: teamPageCopy[lang].contributionsStat, value: member.stats.contributions },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-border bg-card p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
                  </div>
                ))}
              </section>

              <section className="rounded-[24px] border border-border bg-card p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.impact}</h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/80">
                  {achievements.map((item) => (
                    <li key={item} className="rounded-[18px] bg-muted/30 px-4 py-3">{item}</li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[24px] border border-border bg-card p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.built}</h3>
                <div className="mt-4 space-y-3">
                  {member.projects.length ? member.projects.map((project) => (
                    <div key={`built-${project.id}`} className="rounded-[18px] bg-muted/30 px-4 py-3">
                      <p className="text-sm font-semibold text-foreground">{project.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[project.stageName, project.category, project.term].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  )) : (
                    <p className="text-sm leading-7 text-muted-foreground">{copy.noProjects}</p>
                  )}
                </div>
              </section>

              <section className="rounded-[24px] border border-border bg-card p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.skills}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground/80">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {member.interests.length > 0 && (
                <section className="rounded-[24px] border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.interests}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.interests.map((interest) => (
                      <span key={interest} className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground/80">
                        {interest}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {member.links.length > 0 && (
                <section className="rounded-[24px] border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.contact}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.links.map((link) => (
                      <a
                        key={`${link.label}-${link.href}`}
                        href={link.href}
                        target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                        rel="noreferrer"
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
