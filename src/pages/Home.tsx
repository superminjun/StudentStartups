import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  CalendarDays,
  Code2,
  Megaphone,
  Palette,
  Rocket,
  Sparkles,
  Trophy,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import HeroSection from '@/components/features/HeroSection';
import ImpactCounters from '@/components/features/ImpactCounters';
import ScrollReveal from '@/components/features/ScrollReveal';
import { formatCurrency } from '@/lib/utils';
import type { Project } from '@/types';

const schoolName = 'Student Startups Canada';

const getFounderLabel = (project: Project) => {
  const member = project.team.flatMap((group) => group.members ?? [])[0];
  return member || 'Student founder team';
};

const getProjectMetric = (project: Project) => {
  if (project.revenue > 0) return { label: 'Revenue', value: formatCurrency(project.revenue) };
  if ((project.fundraise ?? 0) > 0) return { label: 'Raised', value: formatCurrency(project.fundraise ?? 0) };
  if (project.stage >= 5) return { label: 'Stage', value: project.stageName || 'Production' };
  return { label: 'Progress', value: `${project.stage}/7` };
};

export default function Home() {
  const { lang } = useLanguage();
  const projects = useCMSStore((s) => s.projects);
  const visibleProjects = useMemo(
    () => projects.filter((project) => (project.status ?? 'active').toLowerCase() !== 'archived'),
    [projects]
  );
  const showcaseProjects = useMemo(() => {
    const launchReady = visibleProjects.filter((project) => project.stage >= 5);
    const ranked = [...(launchReady.length ? launchReady : visibleProjects)]
      .sort((a, b) => (b.revenue + (b.fundraise ?? 0) + b.stage * 100) - (a.revenue + (a.fundraise ?? 0) + a.stage * 100));
    return ranked.slice(0, 4);
  }, [visibleProjects]);

  const copy = lang === 'ko'
    ? {
        valueKicker: 'Why it exists',
        valueTitle: '학생 창업을 “동아리 활동”이 아니라 실제 실행으로 다룹니다.',
        valueBody: '팀을 만들고, 시장을 확인하고, 첫 제품을 출시하고, 숫자로 결과를 남깁니다. 작게 시작하더라도 기준은 실제 스타트업처럼 가져갑니다.',
        showcaseKicker: 'Startup showcase',
        showcaseTitle: '학생들이 만든 실제 프로젝트.',
        showcaseBody: '프로젝트는 아이디어 카드가 아니라 진행 상황, 팀, 매출, 출시 기록까지 연결된 작업물로 보여줍니다.',
        acceleratorKicker: 'Founder accelerator',
        acceleratorTitle: '워크숍보다 더 실행적인 경험.',
        acceleratorBody: 'Student Startups Canada는 학생들이 실제로 만들고 발표하고 검토받는 흐름으로 운영됩니다.',
        storiesKicker: 'Founder stories',
        storiesTitle: '학생이 일찍 시작하면 남는 기록이 달라집니다.',
        matchingKicker: 'Community matching',
        matchingTitle: '혼자 시작하지 않도록, 필요한 사람을 찾게 합니다.',
        impactKicker: 'Proof',
        impactTitle: '작게 시작해도 기록은 분명하게.',
        finalTitle: '아이디어가 있다면, 실제로 만들 수 있는 환경으로 오세요.',
        finalBody: '팀, 피드백, 출시 경험, 기록까지. 학생 시절부터 진짜 기준으로 시작하세요.',
        explore: '스타트업 보기',
        join: '커뮤니티 참여',
      }
    : {
        valueKicker: 'Why it exists',
        valueTitle: 'Not a school club. A launchpad for student founders.',
        valueBody: 'Students find teammates, test demand, ship first versions, and build proof. The scale can start small. The standard stays real.',
        showcaseKicker: 'Startup showcase',
        showcaseTitle: 'Real projects, built by students.',
        showcaseBody: 'Every project is presented like an early-stage startup: founder context, traction, progress, and the next thing to prove.',
        acceleratorKicker: 'Founder accelerator',
        acceleratorTitle: 'The experience should feel like building, not attending.',
        acceleratorBody: 'Student Startups Canada runs around active sprints, launches, pitch reviews, and founder meetups designed to create visible output.',
        storiesKicker: 'Founder stories',
        storiesTitle: 'Starting early changes the record you can show.',
        matchingKicker: 'Community matching',
        matchingTitle: 'Find the people your idea is missing.',
        impactKicker: 'Proof',
        impactTitle: 'Early traction, tracked clearly.',
        finalTitle: 'If you are serious about building, this is where you start.',
        finalBody: 'Bring an idea, a skill, or just unreasonable curiosity. We will help you turn it into work people can see.',
        explore: 'Explore Startups',
        join: 'Join the Community',
      };

  const valueCards = [
    {
      title: lang === 'ko' ? '팀 찾기' : 'Find cofounders',
      body: lang === 'ko' ? '개발, 디자인, 마케팅, 영상, AI, 운영을 맡을 학생을 연결합니다.' : 'Match with students across engineering, design, marketing, AI, video, and operations.',
      icon: Users,
    },
    {
      title: lang === 'ko' ? '실제 출시' : 'Launch real work',
      body: lang === 'ko' ? '프로토타입, 판매, 피드백, 운영까지 실제 결과를 남깁니다.' : 'Move from prototype to users, sales, feedback, and operating decisions.',
      icon: Rocket,
    },
    {
      title: lang === 'ko' ? '기록 만들기' : 'Build a record',
      body: lang === 'ko' ? '지원서나 포트폴리오에 쓸 수 있는 프로젝트 기록을 쌓습니다.' : 'Create a portfolio of evidence: projects, metrics, decisions, and progress over time.',
      icon: BadgeCheck,
    },
  ];

  const acceleratorPrograms = [
    ['Build Week', lang === 'ko' ? '아이디어를 일주일 안에 검증 가능한 형태로 만듭니다.' : 'A focused sprint to turn an idea into something testable.'],
    ['Pitch Day', lang === 'ko' ? '명확한 문제, 고객, 숫자, 다음 단계로 발표합니다.' : 'Students present the problem, customer, numbers, and next milestone.'],
    ['Launch Challenge', lang === 'ko' ? '실제 사용자나 구매자를 앞에 두고 출시를 시도합니다.' : 'A challenge built around getting real users, buyers, or community traction.'],
    ['Demo Day', lang === 'ko' ? '완성도가 아니라 배운 것과 결과를 공개적으로 보여줍니다.' : 'A public review of what shipped, what worked, and what changed.'],
  ];

  const founderStories = [
    {
      title: lang === 'ko' ? '첫 아이디어에서 첫 판매까지' : 'From idea to first sale',
      detail: lang === 'ko' ? '팀 구성, 가격 테스트, 판매 페이지, 고객 피드백까지 하나의 기록으로 남깁니다.' : 'A student team moves through pricing, a sales page, customer feedback, and a clear launch record.',
      milestone: lang === 'ko' ? '출시 기록' : 'Launch evidence',
    },
    {
      title: lang === 'ko' ? '포트폴리오가 되는 프로젝트' : 'Projects that become portfolios',
      detail: lang === 'ko' ? '디자인, 코드, 운영, 매출, 회고가 연결되어 대학 지원에서도 설명 가능한 작업이 됩니다.' : 'Design, code, operations, metrics, and reflection become work students can explain beyond the classroom.',
      milestone: lang === 'ko' ? '대학 수준 기록' : 'University-ready record',
    },
    {
      title: lang === 'ko' ? '리더십을 말보다 시스템으로' : 'Leadership through systems',
      detail: lang === 'ko' ? '멤버 모집, 역할 분배, 회의, 출시 흐름을 만들며 리더십을 실제 운영으로 보여줍니다.' : 'Recruiting members, assigning roles, running meetings, and shipping work show leadership as execution.',
      milestone: lang === 'ko' ? '운영 경험' : 'Operating experience',
    },
  ];

  const skillCards = [
    { label: 'Developers', icon: Code2, tags: ['React', 'AI tools', 'Backend'] },
    { label: 'Designers', icon: Palette, tags: ['Brand', 'UI', 'Product'] },
    { label: 'Marketers', icon: Megaphone, tags: ['Growth', 'Content', 'Launch'] },
    { label: 'AI Builders', icon: Brain, tags: ['Agents', 'Automation', 'Data'] },
    { label: 'Creators', icon: Video, tags: ['Video', 'Social', 'Story'] },
    { label: 'Operators', icon: Zap, tags: ['Finance', 'Sales', 'Systems'] },
  ];

  return (
    <div className="overflow-hidden bg-background">
      <HeroSection />

      <section id="value" className="section scroll-mt-24 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <ScrollReveal>
              <p className="section-kicker">{copy.valueKicker}</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {copy.valueTitle}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {copy.valueBody}
              </p>
            </ScrollReveal>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {valueCards.map((item, index) => (
                <ScrollReveal key={item.title} delay={index * 0.08} direction="scale">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group rounded-[1.75rem] border border-border bg-card/85 p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl hover:shadow-foreground/5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
                        <item.icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight bg-card/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal className="max-w-2xl">
            <p className="section-kicker">{copy.showcaseKicker}</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {copy.showcaseTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.showcaseBody}</p>
          </ScrollReveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {showcaseProjects.map((project, index) => {
              const metric = getProjectMetric(project);
              const founder = getFounderLabel(project);
              return (
                <ScrollReveal key={project.id} delay={index * 0.08}>
                  <Link to={`/projects/${project.id}`} className="group block">
                    <motion.article
                      whileHover={{ y: -5 }}
                      className="grid min-h-full overflow-hidden rounded-[2rem] border border-border bg-background shadow-sm transition-all hover:shadow-2xl hover:shadow-foreground/10 sm:grid-cols-[0.9fr_1.1fr]"
                    >
                      <div className="relative min-h-[260px] overflow-hidden bg-muted">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.name}
                            loading={index < 2 ? 'eager' : 'lazy'}
                            decoding="async"
                            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center px-8 text-center text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            Startup image coming soon
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/16 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl">
                          {project.stageName}
                        </span>
                      </div>

                      <div className="flex flex-col p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                              {project.category || 'Student Startup'}
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                              {project.name}
                            </h3>
                          </div>
                          <ArrowRight className="mt-1 size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                        </div>
                        <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">{project.description}</p>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-border bg-card p-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Founder</p>
                            <p className="mt-1 truncate text-sm font-semibold text-foreground">{founder}</p>
                          </div>
                          <div className="rounded-2xl border border-border bg-card p-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">School</p>
                            <p className="mt-1 truncate text-sm font-semibold text-foreground">Canada student team</p>
                          </div>
                          <div className="rounded-2xl border border-border bg-card p-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
                            <p className="mt-1 truncate text-sm font-semibold text-foreground">{metric.value}</p>
                          </div>
                          <div className="rounded-2xl border border-border bg-card p-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Signal</p>
                            <p className="mt-1 truncate text-sm font-semibold text-foreground">
                              {project.donation > 0 ? `${formatCurrency(project.donation)} donated` : 'Testing demand'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>

          <ScrollReveal className="mt-10">
            <Link to="/projects" className="btn btn-secondary">
              {copy.explore} <ArrowRight className="size-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <section id="process" className="section scroll-mt-24 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <ScrollReveal>
              <p className="section-kicker">{copy.acceleratorKicker}</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {copy.acceleratorTitle}
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">{copy.acceleratorBody}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/about" className="btn btn-primary">
                  {lang === 'ko' ? '운영 방식 보기' : 'See How It Works'}
                </Link>
                <Link to="/contact" className="btn btn-secondary">
                  {lang === 'ko' ? '참여 문의' : 'Apply to Join'}
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {acceleratorPrograms.map(([title, body], index) => (
                <ScrollReveal key={title} delay={index * 0.06} direction="scale">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="absolute right-4 top-4 text-5xl font-semibold tracking-tight text-muted/70">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <CalendarDays className="size-5 text-accent" />
                    <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-background/50">{copy.storiesKicker}</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {copy.storiesTitle}
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {founderStories.map((story, index) => (
              <ScrollReveal key={story.title} delay={index * 0.08}>
                <div className="min-h-full rounded-[2rem] border border-background/12 bg-background/[0.06] p-6 backdrop-blur">
                  <Trophy className="size-5 text-accent" />
                  <p className="mt-6 rounded-full border border-background/15 bg-background/10 px-3 py-1 text-xs font-semibold text-background/70">
                    {story.milestone}
                  </p>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">{story.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-background/62">{story.detail}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <ScrollReveal>
              <p className="section-kicker">{copy.matchingKicker}</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {copy.matchingTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">
                {lang === 'ko'
                  ? '학생들은 자신이 가진 기술과 관심사를 태그로 보여주고, 프로젝트는 필요한 역할을 공개합니다. 협업이 더 빠르고 자연스럽게 시작됩니다.'
                  : 'Students show what they can do through skill tags. Projects show what they need. Collaboration becomes easier to start and easier to take seriously.'}
              </p>
              <Link to="/team" className="btn btn-secondary mt-8">
                {lang === 'ko' ? '팀 보기' : 'View the Team'} <ArrowRight className="size-4" />
              </Link>
            </ScrollReveal>

            <div className="grid gap-3 sm:grid-cols-2">
              {skillCards.map((skill, index) => (
                <ScrollReveal key={skill.label} delay={index * 0.045} direction="scale">
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-muted text-foreground">
                        <skill.icon className="size-5" />
                      </div>
                      <p className="font-semibold text-foreground">{skill.label}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skill.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="proof" className="section-tight scroll-mt-24 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal className="max-w-2xl">
            <p className="section-kicker">{copy.impactKicker}</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {copy.impactTitle}
            </h2>
          </ScrollReveal>
          <div className="mt-10">
            <ImpactCounters />
          </div>
        </div>
      </section>

      <section id="cta" className="section scroll-mt-24 bg-background">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <ScrollReveal>
            <div className="rounded-[2.5rem] border border-border bg-[radial-gradient(circle_at_50%_0%,hsl(var(--accent)/0.16),transparent_34%),hsl(var(--card))] px-6 py-14 shadow-2xl shadow-foreground/5 sm:px-12">
              <Sparkles className="mx-auto size-6 text-accent" />
              <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {copy.finalTitle}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
                {copy.finalBody}
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link to="/contact" className="btn btn-primary">
                  {copy.join} <ArrowRight className="size-4" />
                </Link>
                <Link to="/projects" className="btn btn-secondary">
                  {copy.explore}
                </Link>
              </div>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {schoolName}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
