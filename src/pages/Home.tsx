import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import HeroSection from '@/components/features/HeroSection';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import { useSiteContentStore } from '@/stores/siteContentStore';
import { formatCurrency } from '@/lib/utils';

export default function Home() {
  const { lang } = useLanguage();
  const { content } = useSiteContentStore();
  const projects = useCMSStore((s) => s.projects).filter((project) => project.published !== false);

  const featuredProject = useMemo(() => {
    const visibleProjects = projects.filter((project) => (project.status ?? 'active').toLowerCase() !== 'archived');
    return visibleProjects.find((project) => project.featured) ?? visibleProjects[0] ?? null;
  }, [projects]);

  const activeProjectCount = projects.filter((project) => (project.status ?? 'active').toLowerCase() === 'active').length;
  const membersValue = Number(content.activeMembers.replace(/[^0-9]/g, '')) || 0;
  const revenueValue = Number(content.totalRevenue.replace(/[^0-9.]/g, '')) || 0;
  const donatedValue = Number(content.totalDonated.replace(/[^0-9.]/g, '')) || 0;

  const copy = lang === 'ko'
    ? {
        buildKicker: 'What We Build',
        buildTitle: '아이디어보다 실행을 먼저 보여줍니다.',
        buildBody: 'Student Startups는 학생들이 실제 문제를 고르고, 팀을 만들고, 프로젝트를 공개 가능한 결과물로 밀어내는 운영 구조입니다.',
        currentKicker: 'Current Project',
        currentTitle: '현재 가장 먼저 보여줄 작업.',
        currentEmpty: '공개할 준비가 된 프로젝트가 아직 없습니다. 점검이 끝나면 실제 작업부터 정리해 보여줄 예정입니다.',
        mattersKicker: 'Why It Matters',
        mattersTitle: '진지한 사람들은 보통 조금 일찍 시작합니다.',
        mattersBody: '좋은 포트폴리오는 꾸며낸 설명보다 실제 기록에서 나옵니다. 누가 참여했고, 무엇을 만들었고, 어떤 판단을 했는지가 남아야 합니다.',
        impactKicker: 'Impact / Numbers',
        impactTitle: '초기 단계의 숫자를 차분하게 기록합니다.',
        impactBody: '작은 수치라도 과장하지 않고 남깁니다. 이 플랫폼은 첫 단계부터 운영, 협업, 결과를 기록하는 방식으로 커집니다.',
        ctaTitle: '진지하게 만들고 싶은 학생을 기다립니다.',
        ctaBody: '프로젝트를 시작하거나 팀에 합류하고 싶다면 연락하세요. 완벽한 아이디어보다 꾸준히 실행할 태도가 더 중요합니다.',
        explore: '작업 보기',
        join: '팀 합류',
        noImage: '이미지 준비 중',
        status: '상태',
        lead: '리드',
        next: '다음 단계',
        metrics: [
          { label: '진행 프로젝트', value: String(activeProjectCount) },
          { label: '참여 멤버', value: membersValue ? String(membersValue) : content.activeMembers },
          { label: '기록된 매출', value: revenueValue ? formatCurrency(revenueValue) : content.totalRevenue },
          { label: '환원 금액', value: donatedValue ? formatCurrency(donatedValue) : content.totalDonated },
        ],
      }
    : {
        buildKicker: 'What We Build',
        buildTitle: 'Work that can stand outside the classroom.',
        buildBody: 'Student Startups is a student-led venture studio where teams choose real problems, build in public, and turn early work into credible project records.',
        currentKicker: 'Current Project',
        currentTitle: 'The work currently in focus.',
        currentEmpty: 'No public project is ready yet. When maintenance is complete, this section will show the work that is ready to share.',
        mattersKicker: 'Why It Matters',
        mattersTitle: 'Serious builders tend to start earlier than most.',
        mattersBody: 'A strong portfolio is not made from polished claims. It comes from visible decisions, collaborators, progress, and the discipline to keep improving the work.',
        impactKicker: 'Impact / Numbers',
        impactTitle: 'Early traction, recorded carefully.',
        impactBody: 'The numbers are intentionally simple. They show the first phase of a student-led system built around execution, collaboration, and public progress.',
        ctaTitle: 'For students ready to build with discipline.',
        ctaBody: 'Bring a project, join a team, or support the work. The standard is not hype. The standard is sustained execution.',
        explore: 'Explore Our Work',
        join: 'Join the Team',
        noImage: 'Image coming soon',
        status: 'Status',
        lead: 'Lead',
        next: 'Next step',
        metrics: [
          { label: 'Active projects', value: String(activeProjectCount) },
          { label: 'Members involved', value: membersValue ? String(membersValue) : content.activeMembers },
          { label: 'Recorded revenue', value: revenueValue ? formatCurrency(revenueValue) : content.totalRevenue },
          { label: 'Given back', value: donatedValue ? formatCurrency(donatedValue) : content.totalDonated },
        ],
      };

  const currentStatus = featuredProject?.status || featuredProject?.stageName || (lang === 'ko' ? '진행 중' : 'In progress');
  const currentLead = featuredProject?.lead || (lang === 'ko' ? '팀 지정 예정' : 'Team to be assigned');
  const nextStep = featuredProject?.nextSteps || (lang === 'ko' ? '다음 공개 업데이트 준비 중' : 'Preparing the next public update');

  return (
    <div>
      <HeroSection />

      <section className="section border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.85fr),minmax(0,1.15fr)] lg:items-start">
          <ScrollReveal>
            <p className="section-kicker">{copy.buildKicker}</p>
            <h2 className="section-title mt-4">{copy.buildTitle}</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <p className="max-w-3xl text-xl leading-9 text-foreground/78">{copy.buildBody}</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal className="max-w-2xl">
            <p className="section-kicker">{copy.currentKicker}</p>
            <h2 className="section-title mt-4">{copy.currentTitle}</h2>
          </ScrollReveal>

          {featuredProject ? (
            <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.08fr),minmax(0,0.92fr)] lg:items-end">
              <ScrollReveal>
                <Link to={`/projects/${featuredProject.id}`} className="group block overflow-hidden rounded-lg border border-border bg-card">
                  <div className="aspect-[16/10] bg-muted">
                    {featuredProject.image ? (
                      <img
                        src={featuredProject.image}
                        alt={featuredProject.name}
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {copy.noImage}
                      </div>
                    )}
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal delay={0.08}>
                <div className="border-t border-border pt-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">{currentStatus}</p>
                  <h3 className="mt-4 text-3xl font-semibold leading-tight text-foreground">{featuredProject.name}</h3>
                  <p className="mt-5 text-base leading-8 text-muted-foreground">
                    {featuredProject.shortDescription || featuredProject.description}
                  </p>
                  <dl className="mt-8 grid gap-5 border-y border-border py-6 sm:grid-cols-3">
                    {[
                      { label: copy.status, value: currentStatus },
                      { label: copy.lead, value: currentLead },
                      { label: copy.next, value: nextStep },
                    ].map((item) => (
                      <div key={item.label}>
                        <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.label}</dt>
                        <dd className="mt-2 text-sm leading-6 text-foreground">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link to={`/projects/${featuredProject.id}`} className="btn btn-secondary mt-8">
                    {copy.explore}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          ) : (
            <ScrollReveal>
              <div className="mt-12 rounded-lg border border-dashed border-border bg-card px-6 py-12">
                <p className="max-w-2xl text-base leading-8 text-muted-foreground">{copy.currentEmpty}</p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      <section className="section border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.85fr),minmax(0,1.15fr)] lg:items-start">
          <ScrollReveal>
            <p className="section-kicker">{copy.mattersKicker}</p>
            <h2 className="section-title mt-4">{copy.mattersTitle}</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <p className="max-w-3xl text-xl leading-9 text-foreground/78">{copy.mattersBody}</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr),minmax(0,1.2fr)] lg:items-start">
            <ScrollReveal>
              <p className="section-kicker">{copy.impactKicker}</p>
              <h2 className="section-title mt-4">{copy.impactTitle}</h2>
              <p className="section-lead">{copy.impactBody}</p>
            </ScrollReveal>
            <div className="grid gap-x-10 gap-y-8 border-t border-border pt-8 sm:grid-cols-2 lg:border-t-0 lg:pt-0">
              {copy.metrics.map((metric, index) => (
                <ScrollReveal key={metric.label} delay={index * 0.05}>
                  <div className="border-b border-border pb-6">
                    <p className="text-4xl font-semibold text-foreground tabular-nums">{metric.value}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{metric.label}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-charcoal">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <ScrollReveal>
            <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {copy.ctaTitle}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/65">{copy.ctaBody}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.14}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/projects" className="btn bg-white text-charcoal hover:bg-white/90">
                {copy.explore}
              </Link>
              <Link to="/contact" className="btn border border-white/20 text-white hover:bg-white/10">
                {copy.join}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
