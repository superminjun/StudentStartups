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

function useChapterOpacity(progress: MotionValue<number>, index: number) {
  const start = index * .25;
  const end = index === 3 ? 1 : (index + 1) * .25;
  return useTransform(progress, index === 0 ? [0, .18, .27] : index === 3 ? [start - .05, start + .04, 1] : [start - .05, start + .04, end - .05, end + .02], index === 0 ? [1, 1, 0] : index === 3 ? [0, 1, 1] : [0, 1, 1, 0]);
}

function ChapterCopy({ chapter, index, progress }: { chapter: Chapter; index: number; progress: MotionValue<number> }) {
  const start = index * .25;
  const end = index === 3 ? 1 : (index + 1) * .25;
  const opacity = useChapterOpacity(progress, index);
  const copyY = useTransform(progress, [Math.max(0, start - .05), start + .06, end], [24, 0, -16]);
  return (
    <motion.div style={{ opacity, y: copyY }} className="absolute inset-0 flex flex-col justify-center pr-8">
      <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/42">{chapter.name}</p>
      <h3 className="mt-5 max-w-md font-heading text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-[1.16]">{chapter.title}</h3>
      <p className="mt-6 max-w-md text-sm leading-7 text-white/62">{chapter.body}</p>
    </motion.div>
  );
}

function ProcessDiagram({ index, lang }: { index: number; lang: 'en' | 'ko' }) {
  const copy = lang === 'ko' ? {
    question: ['관찰', '대상', '필요', '상황', '이유'],
    prototype: ['부품 04', '작동하는 버전 01'],
    market: ['제품', '사용자 반응'],
    review: ['매출', '비용', '기부', '다음 학기'],
  } : {
    question: ['OBSERVE', 'WHO', 'NEED', 'CONTEXT', 'WHY'],
    prototype: ['04 PARTS', '01 WORKING VERSION'],
    market: ['PRODUCT', 'PUBLIC RESPONSE'],
    review: ['REVENUE', 'COST', 'DONATION', 'NEXT TERM'],
  };

  if (index === 0) return (
    <div className="relative size-full">
      <p className="absolute left-6 top-6 text-[9px] font-semibold uppercase tracking-[.16em] text-[var(--ss-accent)]">{copy.question[0]}</p>
      <div className="absolute inset-[17%] rounded-full border border-[var(--ss-accent)]/30" />
      <div className="absolute inset-[29%] rounded-full border border-[var(--ss-accent)]/60" />
      <div className="absolute left-1/2 top-[14%] h-[72%] w-px bg-[var(--ss-accent)]/25" />
      <div className="absolute left-[14%] top-1/2 h-px w-[72%] bg-[var(--ss-accent)]/25" />
      <div className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center border border-[var(--ss-accent)] bg-[var(--ss-paper)] font-heading text-2xl text-[var(--ss-accent)]">01</div>
      {[['left-[9%] top-[45%]', copy.question[1]], ['right-[9%] top-[45%]', copy.question[2]], ['left-[44%] top-[8%]', copy.question[3]], ['left-[46%] bottom-[8%]', copy.question[4]]].map(([position, label]) => <span key={label} className={`absolute ${position} text-[9px] font-semibold uppercase tracking-[.12em] text-[var(--ss-muted)]`}>{label}</span>)}
    </div>
  );

  if (index === 1) return (
    <div className="relative grid size-full place-items-center">
      <div className="absolute inset-x-[12%] top-1/2 h-px bg-[var(--ss-accent)]/25" />
      <div className="grid w-[72%] grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((part) => <div key={part} className="flex aspect-[2/1] items-center justify-between border border-[var(--ss-accent)]/35 bg-[var(--ss-surface)] px-4"><span className="text-[9px] text-[var(--ss-muted)]">0{part}</span><span className={`block ${part % 2 ? 'size-5 rounded-full' : 'h-5 w-8'} bg-[var(--ss-accent)]/15`} /></div>)}
      </div>
      <div className="absolute bottom-6 left-6 text-[9px] font-semibold uppercase tracking-[.14em] text-[var(--ss-muted)]">{copy.prototype[0]}</div>
      <div className="absolute bottom-6 right-6 border-b border-[var(--ss-accent)] pb-1 text-[9px] font-semibold uppercase tracking-[.14em] text-[var(--ss-accent)]">{copy.prototype[1]}</div>
    </div>
  );

  if (index === 2) return (
    <div className="relative flex size-full items-center px-[11%]">
      <div className="relative z-10 grid size-28 shrink-0 place-items-center bg-[var(--ss-accent)] text-center text-[9px] font-semibold uppercase tracking-[.14em] text-white">{copy.market[0]}<span className="block font-heading text-2xl">01</span></div>
      <div className="relative h-64 flex-1">
        {[16, 32, 48, 64, 80].map((top, item) => <div key={top} className="absolute left-0 right-0 flex items-center" style={{ top: `${top}%` }}><span className="h-px flex-1 origin-left bg-[var(--ss-accent)]/30" /><span className="grid size-8 place-items-center rounded-full border border-[var(--ss-accent)]/45 bg-[var(--ss-paper)] text-[8px] text-[var(--ss-accent)]">0{item + 1}</span></div>)}
      </div>
      <p className="absolute bottom-6 right-6 text-[9px] font-semibold uppercase tracking-[.14em] text-[var(--ss-accent)]">{copy.market[1]}</p>
    </div>
  );

  return (
    <div className="relative size-full p-[10%]">
      <div className="border-t border-[var(--ss-accent)]">
        {copy.review.map((label, row) => <div key={label} className="grid grid-cols-[1fr_1.25fr_.35fr] items-center gap-4 border-b border-[var(--ss-rule)] py-4"><span className="text-[9px] font-semibold uppercase tracking-[.12em] text-[var(--ss-muted)]">{label}</span><span className="h-1.5 origin-left bg-[var(--ss-accent)]" style={{ width: `${86 - row * 13}%`, opacity: .2 + row * .18 }} /><span className="text-right font-heading text-sm tabular-nums text-[var(--ss-accent)]">0{row + 1}</span></div>)}
      </div>
      <div className="absolute bottom-[10%] right-[10%] grid size-24 rotate-[-8deg] place-items-center rounded-full border border-[var(--ss-accent)] text-center text-[8px] font-semibold uppercase leading-4 tracking-[.14em] text-[var(--ss-accent)]">{lang === 'ko' ? <>1학기<br />검토 완료</> : <>TERM 01<br />REVIEWED</>}</div>
    </div>
  );
}

function ProcessGraphicLayer({ index, progress, lang }: { index: number; progress: MotionValue<number>; lang: 'en' | 'ko' }) {
  const start = index * .25;
  const end = index === 3 ? 1 : (index + 1) * .25;
  const opacity = useChapterOpacity(progress, index);
  const scale = useTransform(progress, [Math.max(0, start - .04), start + .06, end], [.92, 1, 1.025]);
  const rotate = useTransform(progress, [Math.max(0, start - .04), start + .06, end], [index % 2 ? 2 : -2, 0, 0]);
  return <motion.div aria-hidden="true" style={{ opacity, scale, rotate, zIndex: index + 1 }} className="absolute inset-0"><ProcessDiagram index={index} lang={lang} /></motion.div>;
}

function WorkJourney() {
  const { lang, t } = useLanguage();
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
    return <section className="bg-[var(--ss-navy)] py-20 text-white"><div className="ss-wrap space-y-16">{chapters.map((chapter, index) => <article key={chapter.name} className="grid gap-6 border-t border-white/20 pt-7 md:grid-cols-2"><div><p className="ss-label text-white/40">{chapter.name}</p><h3 className="ss-heading mt-4">{chapter.title}</h3><p className="mt-4 text-sm leading-7 text-white/62">{chapter.body}</p></div><div aria-hidden="true" className="aspect-[4/3] bg-[var(--ss-paper)] text-[var(--ss-ink)]"><ProcessDiagram index={index} lang={lang} /></div></article>)}</div></section>;
  }

  return (
    <>
      <section className="bg-[var(--ss-navy)] py-20 text-white md:hidden"><div className="ss-wrap space-y-14">{chapters.map((chapter, index) => <article key={chapter.name} className="border-t border-white/20 pt-6"><p className="ss-label text-white/40">{chapter.name}</p><h3 className="ss-title mt-4">{chapter.title}</h3><p className="mt-4 text-sm leading-7 text-white/62">{chapter.body}</p><div aria-hidden="true" className="mt-6 aspect-[4/3] bg-[var(--ss-paper)] text-[var(--ss-ink)]"><ProcessDiagram index={index} lang={lang} /></div></article>)}</div></section>
      <section ref={ref} className="relative hidden h-[500svh] bg-[var(--ss-navy)] text-white md:block">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="ss-wrap grid h-full grid-cols-[.78fr_1.22fr] gap-12 py-20 lg:gap-20">
          <div className="relative min-w-0"><div className="absolute inset-0">{chapters.map((chapter, index) => <ChapterCopy key={chapter.name} chapter={chapter} index={index} progress={progress} />)}</div></div>
          <div className="relative min-w-0 overflow-hidden border border-white/20 bg-[var(--ss-paper)] text-[var(--ss-ink)]" style={{ backgroundImage: 'linear-gradient(var(--ss-rule) 1px, transparent 1px), linear-gradient(90deg, var(--ss-rule) 1px, transparent 1px)', backgroundSize: '28px 28px' }}><div className="absolute inset-4 border border-[var(--ss-accent)]/20" />{chapters.map((_, index) => <ProcessGraphicLayer key={index} index={index} progress={progress} lang={lang} />)}</div>
        </div>
        <motion.div style={{ scaleX: lineScale }} className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-[var(--ss-paper)]" />
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
