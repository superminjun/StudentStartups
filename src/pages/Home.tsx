import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectCard from '@/components/features/ProjectCard';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useLanguage } from '@/hooks/useLanguage';
import { motionSpring, STAGGER } from '@/lib/motion';
import { useCMSStore } from '@/stores/cmsStore';
import { useSiteContentStore } from '@/stores/siteContentStore';
import type { Project } from '@/types';

type Chapter = { name: string; title: string; body: string };

function Hero() {
  const { t } = useLanguage();
  const project = useCMSStore((state) => state.projects[0]);

  return (
    <section className="bg-[var(--ss-paper)] pt-[4.5rem]">
      <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-[80rem] lg:grid-cols-[.82fr_1.18fr]">
        <div className="flex flex-col justify-between px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.reveal} className="ss-label text-[var(--ss-accent)]">
            {t('hero.tagline')} · BNSS
          </motion.p>
          <div className="my-16 lg:my-12">
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.depth, delay: .05 }} className="ss-display max-w-[13ch]">
              {t('hero.title')}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .14 }} className="mt-7 max-w-[34rem] text-[15px] leading-7 text-[var(--ss-muted)]">
              {t('hero.subtitle')}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .2 }} className="mt-8 flex flex-wrap gap-3">
              <Link to="/projects" className="btn btn-primary">{t('hero.cta')}<ArrowRight className="size-4" /></Link>
              <Link to="/about" className="btn btn-secondary">{t('hero.secondaryCta')}</Link>
            </motion.div>
          </div>
          <p className="max-w-sm border-t border-[var(--ss-rule)] pt-4 text-xs leading-5 text-[var(--ss-muted)]">{t('mission.p1')}</p>
        </div>

        <motion.figure initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} transition={{ duration: 1.05, ease: [0.23, 1, 0.32, 1] }} className="relative min-h-[50svh] overflow-hidden bg-[var(--ss-panel)] lg:min-h-full">
          {project?.image ? <img src={project.image} alt={project.name} fetchPriority="high" className="size-full object-cover" /> : <div className="size-full bg-[var(--ss-panel)]" />}
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-[var(--ss-navy)] px-5 py-4 text-white sm:px-8">
            <div><p className="text-[9px] font-semibold uppercase tracking-[.14em] text-white/45">{t('featured.title')}</p><p className="mt-1 font-heading text-base">{project?.name ?? t('common.comingSoon')}</p></div>
            <Link to={project ? `/projects/${project.id}` : '/projects'} aria-label={t('projects.viewDetails')} className="grid size-10 place-items-center border border-white/35 transition-colors hover:bg-white hover:text-[var(--ss-navy)]"><ArrowUpRight className="size-4" /></Link>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}

function ChapterLayer({ chapter, project, index, progress, mode }: { chapter: Chapter; project?: Project; index: number; progress: MotionValue<number>; mode: 'copy' | 'image' }) {
  const start = index * .25;
  const end = index === 3 ? 1 : (index + 1) * .25;
  const copyOpacity = useTransform(progress, index === 0 ? [0, .18, .27] : index === 3 ? [start - .05, start + .04, 1] : [start - .05, start + .04, end - .05, end + .02], index === 0 ? [1, 1, 0] : index === 3 ? [0, 1, 1] : [0, 1, 1, 0]);
  const copyY = useTransform(progress, [Math.max(0, start - .05), start + .06, end], [24, 0, -16]);
  const clipPath = useTransform(progress, [Math.max(0, start - .03), start + .08], index === 0 ? ['inset(0% 0 0 0)', 'inset(0% 0 0 0)'] : ['inset(100% 0 0 0)', 'inset(0% 0 0 0)']);
  const scale = useTransform(progress, [start, end], [1.045, 1]);

  if (mode === 'copy') {
    return (
      <motion.div style={{ opacity: copyOpacity, y: copyY }} className="absolute inset-0 flex flex-col justify-center pr-8">
        <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/40">{chapter.name}</p>
        <h3 className="mt-5 max-w-md font-heading text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-[1.16]">{chapter.title}</h3>
        <p className="mt-6 max-w-md text-sm leading-7 text-white/58">{chapter.body}</p>
      </motion.div>
    );
  }

  return (
      <motion.figure style={{ clipPath, scale, zIndex: index + 1 }} className="absolute inset-0 origin-center overflow-hidden bg-[var(--ss-navy-soft)]">
        {project?.image ? <img src={project.image} alt={project.name} className="size-full object-cover" /> : <div className="size-full bg-[var(--ss-navy-soft)]" />}
        <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[var(--ss-navy)]/92 px-5 py-4 text-xs text-white/68"><span>{project?.name ?? 'Student Startups'}</span><span>{project?.category ?? chapter.name}</span></figcaption>
      </motion.figure>
  );
}

function WorkJourney() {
  const { lang, t } = useLanguage();
  const projects = useCMSStore((state) => state.projects);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: .8, restDelta: .0005 });
  const lineScale = useTransform(progress, [0, 1], [0, 1]);
  const chapters: Chapter[] = [
    { name: lang === 'ko' ? '질문' : 'Question', title: t('workflow.steps.step1Title'), body: t('workflow.steps.step1Desc') },
    { name: lang === 'ko' ? '시제품' : 'Prototype', title: t('workflow.steps.step3Title'), body: t('workflow.steps.step3Desc') },
    { name: lang === 'ko' ? '시장' : 'Market', title: t('workflow.steps.step6Title'), body: t('workflow.steps.step6Desc') },
    { name: lang === 'ko' ? '회고' : 'Review', title: t('workflow.steps.step7Title'), body: t('workflow.steps.step7Desc') },
  ];

  if (reduceMotion) {
    return <section className="bg-[var(--ss-navy)] py-20 text-white"><div className="ss-wrap space-y-16">{chapters.map((chapter, index) => <article key={chapter.name} className="grid gap-6 border-t border-white/20 pt-7 md:grid-cols-2"><div><p className="ss-label text-white/40">{chapter.name}</p><h3 className="ss-heading mt-4">{chapter.title}</h3><p className="mt-4 text-sm leading-7 text-white/58">{chapter.body}</p></div>{projects[index]?.image && <img src={projects[index].image} alt={projects[index].name} className="aspect-[4/3] size-full object-cover" />}</article>)}</div></section>;
  }

  return (
    <>
      <section className="bg-[var(--ss-navy)] py-20 text-white md:hidden"><div className="ss-wrap space-y-14">{chapters.map((chapter, index) => <article key={chapter.name} className="border-t border-white/20 pt-6"><p className="ss-label text-white/40">{chapter.name}</p><h3 className="ss-title mt-4">{chapter.title}</h3><p className="mt-4 text-sm leading-7 text-white/58">{chapter.body}</p>{projects[index]?.image && <img src={projects[index].image} alt={projects[index].name} className="mt-6 aspect-[4/3] w-full object-cover" />}</article>)}</div></section>
      <section ref={ref} className="relative hidden h-[500svh] bg-[var(--ss-navy)] text-white md:block">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="ss-wrap grid h-full grid-cols-[.78fr_1.22fr] gap-12 py-20 lg:gap-20">
          <div className="relative min-w-0"><div className="absolute inset-0">{chapters.map((chapter, index) => <ChapterLayer key={chapter.name} chapter={chapter} project={projects[index] ?? projects[0]} index={index} progress={progress} mode="copy" />)}</div></div>
          <div className="relative min-w-0 overflow-hidden border border-white/15 bg-[var(--ss-navy-soft)]">{chapters.map((chapter, index) => <ChapterLayer key={chapter.name} chapter={chapter} project={projects[index] ?? projects[0]} index={index} progress={progress} mode="image" />)}</div>
        </div>
        <motion.div style={{ scaleX: lineScale }} className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-[var(--ss-accent)]" />
      </div>
      </section>
    </>
  );
}

export default function Home() {
  const { lang, t } = useLanguage();
  const projects = useCMSStore((state) => state.projects);
  const content = useSiteContentStore((state) => state.content);
  const metrics = [
    [String(projects.length), lang === 'ko' ? '공개 프로젝트' : 'Published projects'],
    [`$${Number(content.totalRevenue || 0).toLocaleString()}`, lang === 'ko' ? '누적 매출' : 'Revenue recorded'],
    [`$${Number(content.totalDonated || 0).toLocaleString()}`, lang === 'ko' ? '누적 기부' : 'Donations recorded'],
    [String(content.activeMembers), lang === 'ko' ? '참여 멤버' : 'Members'],
  ];

  return (
    <div className="bg-[var(--ss-paper)]">
      <Hero />

      <section className="ss-section border-y border-[var(--ss-rule)] bg-[var(--ss-surface)]">
        <div className="ss-wrap grid gap-10 lg:grid-cols-[.38fr_1fr]">
          <ScrollReveal><p className="ss-label text-[var(--ss-accent)]">{t('mission.title')}</p></ScrollReveal>
          <ScrollReveal delay={.05}><h2 className="ss-heading max-w-3xl">{t('valueProp.title')}</h2><p className="mt-6 max-w-2xl text-[15px] leading-8 text-[var(--ss-muted)]">{t('valueProp.subtitle')}</p></ScrollReveal>
        </div>
      </section>

      <WorkJourney />

      <section className="ss-section">
        <div className="ss-wrap">
          <ScrollReveal className="grid gap-8 lg:grid-cols-[.38fr_1fr]"><p className="ss-label text-[var(--ss-accent)]">{t('proof.kicker')}</p><h2 className="ss-heading max-w-3xl">{t('impactPreview.title')}</h2></ScrollReveal>
          <div className="mt-12 grid border-y border-[var(--ss-rule)] sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(([value, label], index) => <ScrollReveal key={label} delay={index * STAGGER}><div className="min-h-36 border-b border-[var(--ss-rule)] py-6 sm:px-6 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0"><p className="ss-stat tabular-nums">{value}</p><p className="mt-3 text-xs text-[var(--ss-muted)]">{label}</p></div></ScrollReveal>)}
          </div>
        </div>
      </section>

      <section className="ss-section bg-[var(--ss-surface)]">
        <div className="ss-wrap">
          <ScrollReveal className="flex flex-col gap-6 border-b border-[var(--ss-rule)] pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="ss-label text-[var(--ss-accent)]">{t('featured.title')}</p><h2 className="ss-heading mt-4">{t('featured.subtitle')}</h2></div><Link to="/projects" className="ss-link w-fit">{t('featured.viewAll')}<ArrowUpRight className="size-4" /></Link></ScrollReveal>
          <div className="mt-10 grid gap-x-6 gap-y-12 lg:grid-cols-3">{projects.slice(0, 3).map((project, index) => <ScrollReveal key={project.id} delay={index * STAGGER}><ProjectCard project={project} index={index} priority /></ScrollReveal>)}</div>
        </div>
      </section>

      <section className="border-t border-white/15 bg-[var(--ss-navy)] py-16 text-white lg:py-20">
        <div className="ss-wrap flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="ss-label text-white/42">{t('nav.contact')}</p><h2 className="ss-heading mt-4 max-w-2xl">{t('cta.title')}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/55">{t('cta.subtitle')}</p></div><Link to="/contact" className="btn shrink-0 border border-white/40 text-white hover:bg-white hover:text-[var(--ss-navy)]">{t('cta.button')}<ArrowRight className="size-4" /></Link></div>
      </section>
    </div>
  );
}
