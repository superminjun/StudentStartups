import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useCMSStore } from '@/stores/cmsStore';
import HeroSection from '@/components/features/HeroSection';
import WorkflowSteps from '@/components/features/WorkflowSteps';
import ImpactCounters from '@/components/features/ImpactCounters';
import ProjectCard from '@/components/features/ProjectCard';
import TeamMemberCard from '@/components/features/TeamMemberCard';
import TeamProfileModal from '@/components/features/TeamProfileModal';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useSiteContentStore } from '@/stores/siteContentStore';
import { useTeamStore, useTeamSync } from '@/stores/teamStore';
import { useJournalStore, useJournalSync } from '@/stores/journalStore';
import { teamPageCopy } from '@/constants/teamPageCopy';
import { FolderOpen, DollarSign, Users, Heart, ArrowRight, Sparkles, Rocket, ShieldCheck, NotebookTabs } from 'lucide-react';
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
    const launchReady = visibleProjects.filter((project) => project.stage >= 6).slice(0, 3);
    if (launchReady.length) return launchReady;

    return [...visibleProjects]
      .sort((a, b) => (b.revenue + (b.fundraise ?? 0)) - (a.revenue + (a.fundraise ?? 0)))
      .slice(0, 3);
  }, [projects]);
  const featuredMembers = useMemo(
    () => [...teamMembers]
      .filter((member) => member.featured)
      .sort((a, b) => {
        if (a.founder !== b.founder) return a.founder ? -1 : 1;
        return b.stats.projects - a.stats.projects;
      })
      .slice(0, 3),
    [teamMembers]
  );
  const featuredJournalPosts = useMemo(
    () => [...journalPosts]
      .filter((post) => post.published)
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.date.localeCompare(a.date);
      })
      .slice(0, 3),
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
    { icon: FolderOpen, key: 'stat1Label', value: formatCountValue(String(activeProjectCount)) },
    { icon: DollarSign, key: 'stat2Label', value: formatCurrencyValue(content.totalRevenue) },
    { icon: Users, key: 'stat3Label', value: formatCountValue(content.activeMembers) },
    { icon: Heart, key: 'stat4Label', value: formatCurrencyValue(content.totalDonated) },
  ];

  const valueProps = [
    { icon: Rocket, titleKey: 'valueProp.oneTitle', descKey: 'valueProp.oneDesc' },
    { icon: ShieldCheck, titleKey: 'valueProp.twoTitle', descKey: 'valueProp.twoDesc' },
    { icon: Sparkles, titleKey: 'valueProp.threeTitle', descKey: 'valueProp.threeDesc' },
  ];

  return (
    <div>
      <HeroSection />

      <section className="section border-b border-border/60 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr),minmax(0,1.08fr)] lg:items-start">
            <div>
              <ScrollReveal>
                <p className="section-kicker">{content.introKicker}</p>
                <h2 className="section-title mt-3">
                  {content.introTitle}
                </h2>
                <p className="section-lead">{content.introBody}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <Link to="/story" className="btn btn-secondary mt-6">
                  {lang === 'ko' ? '스토리 보기' : 'Read Our Story'} <ArrowRight className="size-4" />
                </Link>
              </ScrollReveal>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: lang === 'ko' ? '문제' : 'The problem',
                  body: lang === 'ko'
                    ? '아이디어를 실제로 만들고, 운영하고, 기록으로 남길 수 있는 학생 환경은 많지 않습니다.'
                    : 'Students are often asked to think ambitiously before they are given a place to operate seriously.',
                },
                {
                  label: lang === 'ko' ? '방식' : 'The method',
                  body: lang === 'ko'
                    ? '프로젝트, 역할, 리뷰, 숫자, 기록이 모두 같은 시스템 안에서 이어지도록 설계했습니다.'
                    : 'Projects, roles, reviews, numbers, and documentation sit inside the same visible system.',
                },
              ].map((card, index) => (
                <ScrollReveal key={card.label} delay={index * 0.08}>
                  <div className="card p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{card.label}</p>
                    <p className="mt-4 text-sm leading-7 text-foreground/82">{card.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value */}
      <section id="value" className="section bg-beige scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <ScrollReveal>
                <p className="section-kicker">{t('valueProp.kicker')}</p>
                <h2 className="section-title mt-3">
                  {t('valueProp.title')}
                </h2>
                <p className="section-lead">{t('valueProp.subtitle')}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <Link to="/about" className="btn btn-secondary mt-6">
                  {t('common.learnMore')} <ArrowRight className="size-4" />
                </Link>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {valueProps.map((item, i) => (
                  <ScrollReveal key={item.titleKey} delay={i * 0.08} direction="scale">
                    <motion.div whileHover={{ y: -4 }} className="card card-hover p-5">
                      <div className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <item.icon className="size-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-foreground">
                        {t(item.titleKey)}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t(item.descKey)}
                      </p>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                  <ScrollReveal key={stat.key} delay={i * 0.06} direction="scale">
                    <motion.div whileHover={{ y: -2 }} className="card card-hover p-4">
                      <stat.icon className="size-4 text-accent" />
                      <p className="mt-2 text-lg font-semibold text-foreground tabular-nums">{stat.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t(`mission.${stat.key}`)}</p>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WorkflowSteps />

      <section className="section border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr),minmax(0,1.08fr)] lg:items-end">
            <div>
              <ScrollReveal>
                <p className="section-kicker">{teamCopy.homeKicker}</p>
                <h2 className="section-title mt-3">{teamCopy.homeTitle}</h2>
                <p className="section-lead">{teamCopy.homeSubtitle}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <Link to="/team" className="btn btn-secondary mt-6">
                  {teamCopy.homeCta} <ArrowRight className="size-4" />
                </Link>
              </ScrollReveal>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {featuredMembers.map((member, index) => (
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
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section border-b border-border/60 bg-beige/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr),minmax(0,1.12fr)] lg:items-end">
            <div>
              <ScrollReveal>
                <p className="section-kicker">{content.journalKicker}</p>
                <h2 className="section-title mt-3">{content.journalTitle}</h2>
                <p className="section-lead">{content.journalBody}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <Link to="/journal" className="btn btn-secondary mt-6">
                  {lang === 'ko' ? '빌드 로그 보기' : 'Review the Build Log'} <ArrowRight className="size-4" />
                </Link>
              </ScrollReveal>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {featuredJournalPosts.map((post, index) => (
                <ScrollReveal key={post.id} delay={index * 0.06}>
                  <Link to={`/journal/${post.slug}`} className="group block rounded-[26px] border border-border bg-card p-5 shadow-[0_20px_52px_-36px_rgba(15,23,42,0.18)] transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      <span>{post.category}</span>
                      <NotebookTabs className="size-4" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground line-clamp-2">
                      {lang === 'ko' ? post.titleKo : post.titleEn}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground line-clamp-4">
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
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section id="proof" className="section bg-beige scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <p className="section-kicker">{t('proof.kicker')}</p>
            <h2 className="section-title mt-3">{t('impactPreview.title')}</h2>
            <p className="section-lead">{t('impactPreview.subtitle')}</p>
          </ScrollReveal>

          <div className="mt-10">
            <ImpactCounters />
          </div>

          <ScrollReveal className="mt-14">
            <h3 className="text-xl font-semibold text-foreground">{t('featured.title')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('featured.subtitle')}</p>
          </ScrollReveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project, i) => (
                <ScrollReveal key={project.id} delay={i * 0.08}>
                  <ProjectCard project={project} priority={i < 3} />
                </ScrollReveal>
              ))}
          </div>

          <ScrollReveal className="mt-10">
            <Link to="/projects" className="btn btn-secondary">
              {t('featured.viewAll')} <ArrowRight className="size-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="section bg-charcoal scroll-mt-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <ScrollReveal>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {content.joinTitle || t('cta.title')}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-base text-white/50">{content.joinBody || t('cta.subtitle')}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              to="/contact"
              className="btn btn-primary mt-8"
            >
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
