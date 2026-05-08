import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, DollarSign, FolderOpen, Heart, NotebookTabs, PenTool, Users, Waypoints } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import HeroSection from '@/components/features/HeroSection';
import ImpactCounters from '@/components/features/ImpactCounters';
import ProjectCard from '@/components/features/ProjectCard';
import TeamMemberCard from '@/components/features/TeamMemberCard';
import TeamProfileModal from '@/components/features/TeamProfileModal';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useSiteContentStore } from '@/stores/siteContentStore';
import { useTeamStore, useTeamSync } from '@/stores/teamStore';
import { useJournalStore, useJournalSync } from '@/stores/journalStore';
import { teamPageCopy } from '@/constants/teamPageCopy';
import type { TeamMemberShowcase } from '@/types';

export default function Home() {
  const { t, lang } = useLanguage();
  const { content } = useSiteContentStore();
  const projects = useCMSStore((s) => s.projects).filter((project) => project.published !== false);
  const teamMembers = useTeamStore((s) => s.members);
  const journalPosts = useJournalStore((s) => s.posts);

  useTeamSync();
  useJournalSync();

  const [selectedMember, setSelectedMember] = useState<TeamMemberShowcase | null>(null);
  const teamCopy = teamPageCopy[lang];

  const featuredProjects = useMemo(() => {
    const visibleProjects = projects.filter((project) => (project.status ?? 'active').toLowerCase() !== 'archived');
    const featured = visibleProjects.filter((project) => project.featured).slice(0, 2);
    if (featured.length) return featured;

    return [...visibleProjects]
      .sort((a, b) => (b.revenue + (b.fundraise ?? 0)) - (a.revenue + (a.fundraise ?? 0)))
      .slice(0, 2);
  }, [projects]);

  const featuredMembers = useMemo(
    () => [...teamMembers]
      .filter((member) => member.featured)
      .sort((a, b) => {
        if (a.founder !== b.founder) return a.founder ? -1 : 1;
        return b.stats.projects - a.stats.projects;
      })
      .slice(0, 2),
    [teamMembers]
  );

  const featuredJournalPosts = useMemo(
    () => [...journalPosts]
      .filter((post) => post.published)
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.date.localeCompare(a.date);
      })
      .slice(0, 2),
    [journalPosts]
  );

  const activeProjectCount = projects.filter((project) => (project.status ?? 'active').toLowerCase() === 'active').length;

  const formatCurrencyValue = (value: string) => {
    const numeric = Number(value.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(numeric) || numeric === 0) return value;
    return `$${numeric.toLocaleString()}`;
  };

  const formatCountValue = (value: string) => {
    const hasPlus = value.trim().endsWith('+');
    const numeric = Number(value.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(numeric) || numeric === 0) return value;
    return `${numeric.toLocaleString()}${hasPlus ? '+' : ''}`;
  };

  const stats = [
    { icon: FolderOpen, label: lang === 'ko' ? '진행 중인 프로젝트' : 'Active projects', value: formatCountValue(String(activeProjectCount)) },
    { icon: DollarSign, label: lang === 'ko' ? '누적 매출' : 'Recorded revenue', value: formatCurrencyValue(content.totalRevenue) },
    { icon: Users, label: lang === 'ko' ? '참여 멤버' : 'Members involved', value: formatCountValue(content.activeMembers) },
    { icon: Heart, label: lang === 'ko' ? '환원 금액' : 'Given back', value: formatCurrencyValue(content.totalDonated) },
  ];

  const processSteps = lang === 'ko'
    ? [
        { title: '문제부터 정의합니다', body: '좋아 보이는 아이디어보다 실제로 남는 문제를 먼저 봅니다.' },
        { title: '작게 만들고 바로 검증합니다', body: '완성도를 과장하지 않고, 작더라도 시장에 내놓을 수 있는 형태로 만듭니다.' },
        { title: '기록을 남깁니다', body: '미팅, 시행착오, 수정 과정까지 남겨서 결과만 보이지 않게 합니다.' },
        { title: '사람과 시스템을 함께 키웁니다', body: '한 번의 프로젝트가 아니라 다음 팀이 이어받을 수 있는 구조를 만듭니다.' },
      ]
    : [
        { title: 'Start with a real problem', body: 'The work begins with something worth solving, not with a pitch deck.' },
        { title: 'Build in small, testable steps', body: 'Projects move forward through prototypes, reviews, and visible iteration.' },
        { title: 'Document the work', body: 'Meetings, revisions, failures, and decisions are part of the record.' },
        { title: 'Build systems, not one-offs', body: 'The goal is not a single launch. It is an ecosystem other students can continue.' },
      ];

  const ecosystemIntro = lang === 'ko'
    ? 'Student Startups는 프로젝트만 모아두는 곳이 아니라, 사람과 기록이 함께 남는 운영 구조를 만드는 중입니다.'
    : 'Student Startups is not only a project archive. It is a working system for people, projects, and documented progress.';

  const emptyProjectCopy = lang === 'ko'
    ? '공개된 프로젝트가 아직 없습니다. 다음 업데이트에서 실제 작업을 먼저 정리해둘 예정입니다.'
    : 'There are no published projects yet. The next update will surface active work as it becomes ready to share.';

  const emptyPeopleCopy = lang === 'ko'
    ? '공개된 멤버 프로필이 아직 없습니다. 프로필이 준비되면 여기부터 정리됩니다.'
    : 'There are no public member profiles yet. This section will open up as profiles are prepared.';

  const emptyJournalCopy = lang === 'ko'
    ? '빌드 로그가 아직 공개되지 않았습니다. 운영 기록이 준비되면 여기서 볼 수 있습니다.'
    : 'The build log is not public yet. Process notes and updates will appear here once they are ready.';

  return (
    <div>
      <HeroSection />

      <section className="section border-b border-border/60 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)] lg:items-start">
            <div>
              <ScrollReveal>
                <p className="section-kicker">{content.introKicker}</p>
                <h2 className="section-title mt-3">{content.introTitle}</h2>
                <p className="section-lead">{content.introBody}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <Link to="/story" className="btn btn-secondary mt-6">
                  {lang === 'ko' ? '스토리 보기' : 'Read the story'} <ArrowRight className="size-4" />
                </Link>
              </ScrollReveal>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat, index) => (
                <ScrollReveal key={stat.label} delay={index * 0.05}>
                  <div className="card p-5">
                    <div className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <stat.icon className="size-5" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{stat.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-beige/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr),minmax(0,0.92fr)] lg:items-start">
            <div>
              <ScrollReveal>
                <p className="section-kicker">{lang === 'ko' ? '현재 작업' : 'Current work'}</p>
                <h2 className="section-title mt-3">{lang === 'ko' ? '무엇을 만들고 있는지 먼저 보여줍니다.' : 'The work should be visible before the claims are.'}</h2>
                <p className="section-lead">
                  {lang === 'ko'
                    ? '프로젝트는 아이디어 카드가 아니라 운영 중인 작업처럼 보여야 합니다. 문제, 진행 상태, 기여자, 다음 단계가 모두 연결됩니다.'
                    : 'Projects should read like active work, not like concept cards. The problem, current state, contributors, and next step should all be visible.'}
                </p>
              </ScrollReveal>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {featuredProjects.length ? featuredProjects.map((project, index) => (
                  <ScrollReveal key={project.id} delay={index * 0.08}>
                    <ProjectCard project={project} priority={index === 0} />
                  </ScrollReveal>
                )) : (
                  <ScrollReveal>
                    <div className="card p-6 md:col-span-2">
                      <p className="text-sm leading-7 text-muted-foreground">{emptyProjectCopy}</p>
                    </div>
                  </ScrollReveal>
                )}
              </div>

              <ScrollReveal delay={0.08} className="mt-8">
                <Link to="/projects" className="btn btn-secondary">
                  {lang === 'ko' ? '프로젝트 전체 보기' : 'View all projects'} <ArrowRight className="size-4" />
                </Link>
              </ScrollReveal>
            </div>

            <div>
              <ScrollReveal>
                <p className="section-kicker">{lang === 'ko' ? '운영 방식' : 'How it works'}</p>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                  {lang === 'ko' ? '복잡하게 보이지 않도록 구조를 단순하게 유지합니다.' : 'The system stays simple enough to read clearly.'}
                </h3>
              </ScrollReveal>
              <div className="mt-6 space-y-3">
                {processSteps.map((step, index) => (
                  <ScrollReveal key={step.title} delay={index * 0.05}>
                    <div className="card p-5">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-foreground">{step.title}</p>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.body}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section border-y border-border/60 bg-card/35">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="section-kicker">{lang === 'ko' ? '사람과 기록' : 'People and process'}</p>
              <h2 className="section-title mt-3">{lang === 'ko' ? '누가 만들고 있는지, 어떻게 쌓이고 있는지 함께 보입니다.' : 'The people and the record should be visible at the same time.'}</h2>
              <p className="section-lead">{ecosystemIntro}</p>
            </ScrollReveal>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{teamCopy.homeTitle}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{teamCopy.homeSubtitle}</p>
                </div>
                <Link to="/team" className="text-sm font-medium text-foreground transition-colors hover:text-accent">
                  {teamCopy.homeCta}
                </Link>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {featuredMembers.length ? featuredMembers.map((member, index) => (
                  <ScrollReveal key={member.id} delay={index * 0.06}>
                    <TeamMemberCard
                      member={member}
                      lang={lang}
                      joinedLabel={teamCopy.joinedPrefix}
                      founderLabel={teamCopy.founderLabel}
                      recentlyActiveLabel={teamCopy.recentlyActive}
                      viewProfileLabel={teamCopy.viewProfile}
                      onSelect={setSelectedMember}
                      priority={index === 0}
                    />
                  </ScrollReveal>
                )) : (
                  <ScrollReveal>
                    <div className="card p-6 md:col-span-2">
                      <p className="text-sm leading-7 text-muted-foreground">{emptyPeopleCopy}</p>
                    </div>
                  </ScrollReveal>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{content.journalTitle}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{content.journalBody}</p>
                </div>
                <Link to="/journal" className="text-sm font-medium text-foreground transition-colors hover:text-accent">
                  {lang === 'ko' ? '로그 보기' : 'View log'}
                </Link>
              </div>

              <div className="mt-5 grid gap-4">
                {featuredJournalPosts.length ? featuredJournalPosts.map((post, index) => (
                  <ScrollReveal key={post.id} delay={index * 0.06}>
                    <Link
                      to={`/journal/${post.slug}`}
                      className="group block rounded-[24px] border border-border bg-card p-5 shadow-[0_20px_52px_-36px_rgba(15,23,42,0.18)] transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        <span>{post.category}</span>
                        <NotebookTabs className="size-4" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground line-clamp-2">
                        {lang === 'ko' ? post.titleKo : post.titleEn}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground line-clamp-3">
                        {lang === 'ko' ? post.summaryKo : post.summaryEn}
                      </p>
                      <p className="mt-4 text-xs text-muted-foreground">
                        {new Date(`${post.date}T00:00:00`).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </Link>
                  </ScrollReveal>
                )) : (
                  <ScrollReveal>
                    <div className="card p-6">
                      <p className="text-sm leading-7 text-muted-foreground">{emptyJournalCopy}</p>
                    </div>
                  </ScrollReveal>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-beige">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] lg:items-end">
            <div>
              <ScrollReveal>
                <p className="section-kicker">{t('proof.kicker')}</p>
                <h2 className="section-title mt-3">{t('impactPreview.title')}</h2>
                <p className="section-lead">
                  {lang === 'ko'
                    ? '숫자를 과장하지 않고, 현재 어디까지 왔는지를 조용히 보여줍니다.'
                    : 'The numbers are there to show where the work stands, not to overstate it.'}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <div className="mt-6 space-y-3">
                  {[
                    { icon: Waypoints, title: lang === 'ko' ? '프로젝트와 사람이 함께 움직입니다.' : 'Projects and people move together.' },
                    { icon: PenTool, title: lang === 'ko' ? '진행 과정은 기록으로 남습니다.' : 'Progress is documented as it happens.' },
                    { icon: Users, title: lang === 'ko' ? '작은 수치도 초기 운영의 맥락 안에서 보여줍니다.' : 'Even early numbers are shown in context.' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex size-8 items-center justify-center rounded-full bg-card text-accent shadow-sm">
                        <item.icon className="size-4" />
                      </div>
                      <span>{item.title}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <Link to="/impact" className="btn btn-secondary mt-6">
                  {lang === 'ko' ? '임팩트 보기' : 'View impact'} <ArrowRight className="size-4" />
                </Link>
              </ScrollReveal>
            </div>

            <div>
              <ImpactCounters />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-charcoal">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {content.joinTitle || t('cta.title')}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-base leading-8 text-white/58">{content.joinBody || t('cta.subtitle')}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link to="/contact" className="btn btn-primary mt-8">
              {content.joinCta || t('cta.button')}
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <TeamProfileModal
        member={selectedMember}
        open={Boolean(selectedMember)}
        onOpenChange={(open) => {
          if (!open) setSelectedMember(null);
        }}
        lang={lang}
      />
    </div>
  );
}
