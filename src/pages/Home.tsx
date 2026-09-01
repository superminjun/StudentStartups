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

type Chapter = { name: string; title: string; body: string; actions: string[]; outputs: string[] };

function Hero() {
  const { t } = useLanguage();

  return (
    <section className="border-b border-[var(--ss-rule)] bg-[var(--ss-paper)] pt-[4.5rem]">
      <div className="mx-auto flex min-h-[36rem] max-w-[80rem] flex-col justify-between px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={motionSpring.reveal} className="ss-label text-[var(--ss-accent)]">
          {t('hero.tagline')} · BNSS
        </motion.p>
        <div className="my-16 grid items-end gap-8 lg:grid-cols-[1.25fr_.75fr] lg:gap-16">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.depth, delay: .05 }} className="ss-display max-w-[13ch]">
              {t('hero.title')}
            </motion.h1>
          </div>
          <div className="pb-1">
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .14 }} className="max-w-[34rem] text-[15px] leading-7 text-[var(--ss-muted)]">
              {t('hero.subtitle')}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: .2 }} className="mt-8 flex flex-wrap gap-3">
              <Link to="/projects" className="btn btn-primary">{t('hero.cta')}<ArrowRight className="size-4" /></Link>
              <Link to="/about" className="btn btn-secondary">{t('hero.secondaryCta')}</Link>
            </motion.div>
          </div>
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...motionSpring.reveal, delay: .22 }} className="max-w-xl border-t border-[var(--ss-rule)] pt-4 text-xs leading-5 text-[var(--ss-muted)]">{t('mission.p1')}</motion.p>
      </div>
    </section>
  );
}

function useChapterOpacity(progress: MotionValue<number>, index: number) {
  const start = index * .25;
  const end = index === 3 ? 1 : (index + 1) * .25;
  return useTransform(progress, index === 0 ? [0, .18, .27] : index === 3 ? [start - .05, start + .04, 1] : [start - .05, start + .04, end - .05, end + .02], index === 0 ? [1, 1, 0] : index === 3 ? [0, 1, 1] : [0, 1, 1, 0]);
}

function ChapterCopy({ chapter, index, progress, lang }: { chapter: Chapter; index: number; progress: MotionValue<number>; lang: 'en' | 'ko' }) {
  const start = index * .25;
  const end = index === 3 ? 1 : (index + 1) * .25;
  const opacity = useChapterOpacity(progress, index);
  const copyY = useTransform(progress, [Math.max(0, start - .05), start + .06, end], [24, 0, -16]);
  return (
    <motion.div style={{ opacity, y: copyY }} className="absolute inset-0 flex flex-col pr-8">
      <div className="flex items-center justify-between border-b border-white/20 pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/48">{chapter.name}</p>
        <p className="font-heading text-sm tabular-nums text-white/42">0{index + 1} / 04</p>
      </div>
      <div className="my-auto py-8">
        <h3 className="max-w-md font-heading text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-[1.16]">{chapter.title}</h3>
        <p className="mt-5 max-w-md text-sm leading-7 text-white/62">{chapter.body}</p>
        <p className="mt-8 text-[9px] font-semibold uppercase tracking-[.14em] text-white/38">{lang === 'ko' ? '이 단계에서 하는 일' : 'What happens in this stage'}</p>
        <ol className="mt-3 max-w-md border-b border-white/20">
          {chapter.actions.map((action, item) => <li key={action} className="grid grid-cols-[2.25rem_1fr] items-center border-t border-white/20 py-3 text-xs leading-5 text-white/76"><span className="font-heading text-[11px] text-[var(--ss-accent)]">0{item + 1}</span><span>{action}</span></li>)}
        </ol>
      </div>
      <div className="grid grid-cols-4 gap-2 pb-1" aria-hidden="true">
        {[0, 1, 2, 3].map((item) => <span key={item} className={`h-px ${item === index ? 'bg-white' : 'bg-white/20'}`} />)}
      </div>
    </motion.div>
  );
}

function StageOutput({ chapter, index, lang }: { chapter: Chapter; index: number; lang: 'en' | 'ko' }) {
  return (
    <div className="border-t border-[var(--ss-rule)] bg-[var(--ss-surface)] p-5 sm:p-6">
      <div className="flex items-center justify-between text-[8px] font-semibold uppercase tracking-[.14em] text-[var(--ss-muted)]">
        <span>{lang === 'ko' ? '이 단계에서 남기는 것' : 'Stage output'}</span><span>0{index + 1} / 04</span>
      </div>
      <p className="mt-3 font-heading text-base font-medium">{chapter.title}</p>
      <div className="mt-4 grid grid-cols-3 border-y border-[var(--ss-rule)]">
        {chapter.outputs.map((output, item) => <p key={output} className={`py-3 text-[10px] leading-4 text-[var(--ss-muted)] ${item > 0 ? 'border-l border-[var(--ss-rule)] pl-3' : 'pr-3'}`}>{output}</p>)}
      </div>
    </div>
  );
}

function ProcessDiagram({ index, lang }: { index: number; lang: 'en' | 'ko' }) {
  const copy = lang === 'ko' ? {
    question: ['인터뷰 시트', '누가 이 문제를 겪나요?', '언제 가장 자주 생기나요?', '무엇이 달라지면 성공인가요?', '관찰', '기록'],
    prototype: ['제작·테스트 보드', '핵심 기능', '첫 제작', '사용자 테스트', '피드백 반영', '비용 기록'],
    market: ['출시 기록', '가격', '수량', '구매자 반응', '판매', '피드백'],
    review: ['학기 결과 정리', '수입', '비용', '결과', '기부 내역', '배운 점', '다음 팀 결정'],
  } : {
    question: ['Interview sheet', 'Who experiences this?', 'When does it happen most?', 'What would better look like?', 'Observe', 'Record'],
    prototype: ['Build & test board', 'Core function', 'First build', 'User test', 'Apply feedback', 'Record cost'],
    market: ['Launch record', 'Price', 'Quantity', 'Buyer response', 'Sales', 'Feedback'],
    review: ['Term review', 'Income', 'Costs', 'Outcome', 'Donation record', 'What we learned', 'Next-team decision'],
  };

  if (index === 0) return (
    <div className="flex size-full flex-col p-7 sm:p-9">
      <div className="flex items-center justify-between border-b border-[var(--ss-accent)] pb-3"><p className="text-[9px] font-semibold uppercase tracking-[.15em] text-[var(--ss-accent)]">{copy.question[0]}</p><span className="font-heading text-sm text-[var(--ss-muted)]">01 / 03</span></div>
      <div className="mt-5 grid flex-1 gap-3">
        {copy.question.slice(1, 4).map((prompt, item) => <div key={prompt} className="grid grid-cols-[2.5rem_1fr] gap-3 border border-[var(--ss-rule)] bg-[var(--ss-surface)] p-4"><span className="font-heading text-sm text-[var(--ss-accent)]">0{item + 1}</span><div><p className="text-xs font-medium">{prompt}</p><div className="mt-4 space-y-2"><span className="block h-px bg-[var(--ss-rule)]" /><span className="block h-px w-4/5 bg-[var(--ss-rule)]" /></div></div></div>)}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3"><div className="border-l-2 border-[var(--ss-accent)] pl-3"><p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[var(--ss-muted)]">{copy.question[4]}</p><p className="mt-1 font-heading text-sm">03 ×</p></div><div className="border-l-2 border-[var(--ss-accent)] pl-3"><p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[var(--ss-muted)]">{copy.question[5]}</p><p className="mt-1 font-heading text-sm">01 →</p></div></div>
    </div>
  );

  if (index === 1) return (
    <div className="flex size-full flex-col p-7 sm:p-9">
      <div className="flex items-center justify-between border-b border-[var(--ss-accent)] pb-3"><p className="text-[9px] font-semibold uppercase tracking-[.15em] text-[var(--ss-accent)]">{copy.prototype[0]}</p><span className="font-heading text-sm text-[var(--ss-muted)]">02 / 04</span></div>
      <div className="mt-6 grid flex-1 grid-cols-2 gap-3">
        {copy.prototype.slice(1, 5).map((label, item) => <div key={label} className="flex flex-col justify-between border border-[var(--ss-rule)] bg-[var(--ss-surface)] p-4"><div className="flex items-center justify-between"><span className="font-heading text-sm text-[var(--ss-accent)]">0{item + 1}</span><span className={`size-2 ${item < 2 ? 'bg-[var(--ss-accent)]' : 'border border-[var(--ss-accent)]'}`} /></div><p className="mt-8 text-xs font-medium">{label}</p><span className="mt-3 block h-px bg-[var(--ss-rule)]" /></div>)}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[var(--ss-rule)] pt-4 text-[9px] font-semibold uppercase tracking-[.13em] text-[var(--ss-muted)]"><span>{copy.prototype[5]}</span><span className="text-[var(--ss-accent)]">CAD ———</span></div>
    </div>
  );

  if (index === 2) return (
    <div className="flex size-full flex-col p-7 sm:p-9">
      <div className="flex items-center justify-between border-b border-[var(--ss-accent)] pb-3"><p className="text-[9px] font-semibold uppercase tracking-[.15em] text-[var(--ss-accent)]">{copy.market[0]}</p><span className="font-heading text-sm text-[var(--ss-muted)]">03 / 04</span></div>
      <div className="mt-5 grid grid-cols-3 border border-[var(--ss-rule)] bg-[var(--ss-surface)]">{copy.market.slice(1, 4).map((label, item) => <div key={label} className={`p-4 ${item > 0 ? 'border-l border-[var(--ss-rule)]' : ''}`}><p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[var(--ss-muted)]">{label}</p><p className="mt-4 font-heading text-lg text-[var(--ss-accent)]">—</p></div>)}</div>
      <div className="mt-4 flex-1 border border-[var(--ss-rule)] bg-[var(--ss-surface)]">
        <div className="grid grid-cols-[2.5rem_1fr_.7fr] border-b border-[var(--ss-rule)] px-4 py-3 text-[8px] font-semibold uppercase tracking-[.12em] text-[var(--ss-muted)]"><span>#</span><span>{copy.market[4]}</span><span>{copy.market[5]}</span></div>
        {[1, 2, 3, 4].map((row) => <div key={row} className="grid grid-cols-[2.5rem_1fr_.7fr] items-center border-b border-[var(--ss-rule)] px-4 py-3"><span className="font-heading text-xs text-[var(--ss-accent)]">0{row}</span><span className="h-px w-3/4 bg-[var(--ss-rule)]" /><span className="h-px w-2/3 bg-[var(--ss-rule)]" /></div>)}
      </div>
    </div>
  );

  return (
    <div className="flex size-full flex-col p-7 sm:p-9">
      <div className="flex items-center justify-between border-b border-[var(--ss-accent)] pb-3"><p className="text-[9px] font-semibold uppercase tracking-[.15em] text-[var(--ss-accent)]">{copy.review[0]}</p><span className="font-heading text-sm text-[var(--ss-muted)]">04 / 04</span></div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center border border-[var(--ss-rule)] bg-[var(--ss-surface)] p-5 text-center"><div><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[var(--ss-muted)]">{copy.review[1]}</p><p className="mt-3 font-heading text-xl">—</p></div><span className="text-[var(--ss-accent)]">−</span><div><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[var(--ss-muted)]">{copy.review[2]}</p><p className="mt-3 font-heading text-xl">—</p></div><span className="text-[var(--ss-accent)]">=</span><div><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[var(--ss-muted)]">{copy.review[3]}</p><p className="mt-3 font-heading text-xl text-[var(--ss-accent)]">—</p></div></div>
      <div className="mt-4 grid flex-1 gap-3">
        {copy.review.slice(4).map((label, item) => <div key={label} className="grid grid-cols-[2.25rem_1fr] items-center border border-[var(--ss-rule)] bg-[var(--ss-surface)] p-4"><span className="font-heading text-sm text-[var(--ss-accent)]">0{item + 1}</span><div><p className="text-xs font-medium">{label}</p><span className="mt-3 block h-px bg-[var(--ss-rule)]" /></div></div>)}
      </div>
    </div>
  );
}

function ProcessGraphicLayer({ chapter, index, progress, lang }: { chapter: Chapter; index: number; progress: MotionValue<number>; lang: 'en' | 'ko' }) {
  const start = index * .25;
  const end = index === 3 ? 1 : (index + 1) * .25;
  const opacity = useChapterOpacity(progress, index);
  const scale = useTransform(progress, [Math.max(0, start - .04), start + .06, end], [.92, 1, 1.025]);
  const rotate = useTransform(progress, [Math.max(0, start - .04), start + .06, end], [index % 2 ? 2 : -2, 0, 0]);
  return <motion.div aria-hidden="true" style={{ opacity, scale, rotate, zIndex: index + 1 }} className="absolute inset-0 grid grid-rows-[minmax(0,1fr)_auto]"><ProcessDiagram index={index} lang={lang} /><StageOutput chapter={chapter} index={index} lang={lang} /></motion.div>;
}

function WorkJourney() {
  const { lang, t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: .8, restDelta: .0005 });
  const lineScale = useTransform(progress, [0, 1], [0, 1]);
  const chapters: Chapter[] = [
    { name: lang === 'ko' ? '질문' : 'Question', title: t('workflow.steps.step1Title'), body: t('workflow.steps.step1Desc'), actions: lang === 'ko' ? ['문제를 겪는 사람과 대화하기', '한 가지 구체적인 필요로 좁히기', '확인 가능한 성공 기준 정하기'] : ['Talk to people who face the problem', 'Narrow it to one specific need', 'Set a success measure you can test'], outputs: lang === 'ko' ? ['사용자 인터뷰', '한 문장 문제 정의', '성공 조건'] : ['User interviews', 'One-sentence problem', 'Success criteria'] },
    { name: lang === 'ko' ? '시제품' : 'Prototype', title: t('workflow.steps.step3Title'), body: t('workflow.steps.step3Desc'), actions: lang === 'ko' ? ['핵심 기능만 먼저 만들기', '작은 사용자 그룹과 테스트하기', '재료와 개당 비용 기록하기'] : ['Build the core function first', 'Test with a small user group', 'Record materials and unit cost'], outputs: lang === 'ko' ? ['작동하는 시제품', '재료·비용 목록', '테스트 계획'] : ['Working prototype', 'Materials and costs', 'Test plan'] },
    { name: lang === 'ko' ? '시장' : 'Market', title: t('workflow.steps.step6Title'), body: t('workflow.steps.step6Desc'), actions: lang === 'ko' ? ['가격과 판매 수량 정하기', '실제 사용자에게 제안하기', '판매와 반응을 함께 기록하기'] : ['Set the price and quantity', 'Offer it to a real audience', 'Record sales and response together'], outputs: lang === 'ko' ? ['가격과 수량', '판매 기록', '사용자 피드백'] : ['Price and quantity', 'Sales record', 'User feedback'] },
    { name: lang === 'ko' ? '회고' : 'Review', title: t('workflow.steps.step7Title'), body: t('workflow.steps.step7Desc'), actions: lang === 'ko' ? ['수입과 비용 비교하기', '기부 내역과 배운 점 남기기', '다음 팀의 결정을 명확히 적기'] : ['Compare income with costs', 'Record the donation and lessons', 'Leave a clear next-team decision'], outputs: lang === 'ko' ? ['수입·비용 정리', '기부 내역', '다음 팀 메모'] : ['Income and costs', 'Donation record', 'Next-team notes'] },
  ];

  if (reduceMotion) {
    return <section className="bg-[var(--ss-navy)] py-20 text-white"><div className="ss-wrap space-y-16">{chapters.map((chapter, index) => <article key={chapter.name} className="grid gap-6 border-t border-white/20 pt-7 md:grid-cols-2"><div><p className="ss-label text-white/40">{chapter.name}</p><h3 className="ss-heading mt-4">{chapter.title}</h3><p className="mt-4 text-sm leading-7 text-white/62">{chapter.body}</p><ol className="mt-5 space-y-2 text-xs text-white/70">{chapter.actions.map((action, item) => <li key={action}>0{item + 1} — {action}</li>)}</ol></div><div className="bg-[var(--ss-paper)] text-[var(--ss-ink)]"><div aria-hidden="true" className="min-h-[28rem] md:aspect-[4/3] md:min-h-0"><ProcessDiagram index={index} lang={lang} /></div><StageOutput chapter={chapter} index={index} lang={lang} /></div></article>)}</div></section>;
  }

  return (
    <>
      <section className="bg-[var(--ss-navy)] py-20 text-white md:hidden"><div className="ss-wrap space-y-14">{chapters.map((chapter, index) => <article key={chapter.name} className="border-t border-white/20 pt-6"><p className="ss-label text-white/40">{chapter.name}</p><h3 className="ss-title mt-4">{chapter.title}</h3><p className="mt-4 text-sm leading-7 text-white/62">{chapter.body}</p><ol className="mt-5 space-y-2 text-xs text-white/70">{chapter.actions.map((action, item) => <li key={action}>0{item + 1} — {action}</li>)}</ol><div className="mt-6 bg-[var(--ss-paper)] text-[var(--ss-ink)]"><div aria-hidden="true" className="min-h-[28rem]"><ProcessDiagram index={index} lang={lang} /></div><StageOutput chapter={chapter} index={index} lang={lang} /></div></article>)}</div></section>
      <section ref={ref} className="relative hidden h-[440svh] bg-[var(--ss-navy)] text-white md:block">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="ss-wrap grid h-full grid-cols-[.78fr_1.22fr] gap-12 py-20 lg:gap-20">
          <div className="relative min-w-0"><div className="absolute inset-0">{chapters.map((chapter, index) => <ChapterCopy key={chapter.name} chapter={chapter} index={index} progress={progress} lang={lang} />)}</div></div>
          <div className="relative min-w-0 overflow-hidden border border-white/20 bg-[var(--ss-paper)] text-[var(--ss-ink)]" style={{ backgroundImage: 'linear-gradient(var(--ss-rule) 1px, transparent 1px), linear-gradient(90deg, var(--ss-rule) 1px, transparent 1px)', backgroundSize: '28px 28px' }}><div className="absolute inset-4 border border-[var(--ss-accent)]/20" />{chapters.map((chapter, index) => <ProcessGraphicLayer key={chapter.name} chapter={chapter} index={index} progress={progress} lang={lang} />)}</div>
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
