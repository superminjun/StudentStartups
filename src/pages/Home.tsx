import { useRef, useState, type PointerEvent } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectCard from '@/components/features/ProjectCard';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useLanguage } from '@/hooks/useLanguage';
import { motionSpring, STAGGER } from '@/lib/motion';
import { useCMSStore } from '@/stores/cmsStore';
import { useSiteContentStore } from '@/stores/siteContentStore';
import type { Project } from '@/types';

type Scene = { no: string; verb: string; title: string; body: string; tag: string };

function Hero() {
  const { t } = useLanguage();
  const projects = useCMSStore((state) => state.projects).slice(0, 2);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: .9 });
  const titleY = useTransform(progress, [0, 1], ['0%', '-24%']);
  const titleScale = useTransform(progress, [0, 1], [1, .94]);
  const visualY = useTransform(progress, [0, 1], ['0%', '22%']);
  const visualScale = useTransform(progress, [0, 1], [1, 1.1]);
  const opacity = useTransform(progress, [.58, .94], [1, 0]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-1, 1], [2.2, -2.2]), { stiffness: 95, damping: 26 });
  const rotateY = useSpring(useTransform(pointerX, [-1, 1], [-2.8, 2.8]), { stiffness: 95, damping: 26 });
  const words = t('hero.title').split(' ');

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - .5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - .5) * 2);
  };

  return (
    <section ref={ref} onPointerMove={handlePointerMove} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }} className="relative h-[165svh] bg-[var(--ss-canvas)]">
      <div className="sticky top-0 min-h-screen overflow-hidden pt-[4.75rem]">
        <div className="ss-grain absolute inset-0 opacity-20" />
        <div className="absolute inset-y-0 left-[8%] hidden w-px bg-black/[.07] lg:block" />
        <div className="absolute inset-y-0 right-[8%] hidden w-px bg-black/[.07] lg:block" />
        <motion.div style={{ opacity }} className="mx-auto grid min-h-[calc(100svh-4.75rem)] w-full max-w-[90rem] items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 lg:py-12">
          <motion.div style={{ y: titleY, scale: titleScale }} className="relative z-10 origin-left">
            <motion.p initial={{ opacity: 0, y: 14, filter: 'blur(7px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={motionSpring.reveal} className="ss-label flex items-center gap-3 text-black/45">
              <span className="h-px w-8 bg-[var(--ss-bronze)]" /> {t('hero.tagline')} · Est. 2024
            </motion.p>
            <h1 className="ss-display mt-7 max-w-[15ch] text-[var(--ss-ink)]">
              {words.map((word, index) => (
                <span key={`${word}-${index}`} className="mr-[.2em] inline-block overflow-hidden pb-[.08em]">
                  <motion.span className="inline-block" initial={{ y: '112%', rotateX: 4, filter: 'blur(7px)' }} animate={{ y: 0, rotateX: 0, filter: 'blur(0px)' }} transition={{ ...motionSpring.depth, delay: .08 + index * STAGGER }}>{word}</motion.span>
                </span>
              ))}
            </h1>
            <motion.div initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ ...motionSpring.reveal, delay: .42 }} className="mt-7 flex max-w-2xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:mt-9">
              <p className="max-w-md text-sm leading-7 text-black/52 sm:text-base">{t('hero.subtitle')}</p>
              <motion.div whileTap={{ scale: .98, y: 1 }} transition={motionSpring.press}>
                <Link to="/projects" className="group inline-flex items-center gap-3 rounded-full bg-[var(--ss-ink)] px-6 py-3.5 text-xs font-semibold text-white">
                  {t('hero.cta')}<ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div style={{ y: visualY, scale: visualScale, rotateX, rotateY, transformPerspective: 1300 }} className="relative mx-auto h-[36svh] w-full max-w-[25rem] sm:h-[43svh] lg:h-[68svh] lg:max-w-[31rem]">
            <div className="absolute -inset-4 translate-x-5 translate-y-5 border border-black/10 bg-[var(--ss-panel)]" />
            <div className="absolute -inset-2 -translate-x-3 -translate-y-3 border border-black/10 bg-white/55" />
            <div className="relative flex size-full flex-col border border-black/15 bg-[var(--ss-ink)] p-2 shadow-[0_35px_90px_rgba(18,18,18,.18)]">
              <div className="relative min-h-0 flex-1 overflow-hidden bg-black/20">
                {projects[0]?.image && <img src={projects[0].image} alt={projects[0].name} className="size-full object-cover grayscale-[18%] transition-transform duration-1000 ease-out hover:scale-[1.025]" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
                <p className="absolute left-4 top-4 text-[9px] font-semibold uppercase tracking-[.22em] text-white/75">Live project / 01</p>
              </div>
              <div className="flex items-end justify-between px-3 pb-2 pt-4 text-white">
                <div><p className="text-[9px] uppercase tracking-[.18em] text-white/40">Currently building</p><p className="mt-1 text-sm font-medium tracking-[-.025em]">{projects[0]?.name ?? 'Project in progress'}</p></div>
                <span className="text-xs text-white/45">2024—26</span>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ ...motionSpring.depth, delay: .7 }} className="absolute -right-6 bottom-[14%] hidden w-40 border border-black/10 bg-[var(--ss-canvas)] p-3 shadow-[0_18px_45px_rgba(18,18,18,.12)] sm:block">
              <div className="aspect-[4/3] overflow-hidden bg-black/5">{projects[1]?.image && <img src={projects[1].image} alt="" className="size-full object-cover grayscale-[35%]" />}</div>
              <p className="mt-2 truncate text-[10px] font-semibold">{projects[1]?.name ?? 'Next project'}</p>
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div style={{ opacity }} className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[9px] font-semibold uppercase tracking-[.24em] text-black/38"><ArrowDown className="size-3 ss-bob" /> Scroll to enter</motion.div>
      </div>
    </section>
  );
}

function StoryPanel({ scene, project, index, progress }: { scene: Scene; project?: Project; index: number; progress: MotionValue<number> }) {
  const center = .08 + index * .28;
  const mediaY = useTransform(progress, [center - .22, center, center + .22], [70, 0, -70]);
  const mediaScale = useTransform(progress, [center - .2, center, center + .2], [.88, 1, .91]);
  const copyY = useTransform(progress, [center - .18, center, center + .18], [40, 0, -40]);
  const copyOpacity = useTransform(progress, [center - .2, center - .11, center + .11, center + .2], [.22, 1, 1, .22]);
  const ruleScale = useTransform(progress, [center - .16, center + .04], [0, 1]);

  return (
    <article className="h-full w-screen shrink-0 px-5 sm:px-8">
      <div className="mx-auto grid h-full max-w-[90rem] items-center gap-8 pb-16 pt-24 md:grid-cols-[.78fr_1.22fr] md:gap-14 lg:gap-24">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-10 self-end pb-2 md:self-center md:pb-0">
          <p className="ss-label text-white/38">{scene.no} / 04 · {scene.tag}</p>
          <p className="ss-heading mt-4 text-white">{scene.verb}.</p>
          <motion.div style={{ scaleX: ruleScale }} className="my-6 h-px origin-left bg-[var(--ss-bronze)]" />
          <h2 className="ss-title max-w-xl text-white">{scene.title}</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/46 sm:text-base sm:leading-7">{scene.body}</p>
        </motion.div>

        <motion.div style={{ y: mediaY, scale: mediaScale }} className="relative h-[38svh] min-h-64 overflow-hidden border border-white/15 bg-white/[.04] md:h-[68svh]">
          {project?.image && <img src={project.image} alt={project.name} className="size-full object-cover grayscale-[22%] contrast-[1.02]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/15 p-4 text-[9px] font-semibold uppercase tracking-[.2em] text-white/55"><span>Student Startups</span><span>{scene.tag} / 2026</span></div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white"><div><p className="text-[9px] uppercase tracking-[.2em] text-white/45">Work in progress</p><p className="mt-2 text-lg font-medium tracking-[-.035em] sm:text-2xl">{project?.name ?? 'Project in progress'}</p></div><span className="text-5xl font-light tracking-[-.08em] text-white/30">{scene.no}</span></div>
        </motion.div>
      </div>
    </article>
  );
}

function Story() {
  const { lang } = useLanguage();
  const projects = useCMSStore((state) => state.projects);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 58, damping: 20, mass: .9, restDelta: .0005 });
  const trackX = useTransform(progress, [.06, .94], ['0vw', '-300vw']);
  const lineScale = useTransform(progress, [.04, .96], [0, 1]);
  const scenes: Scene[] = lang === 'ko' ? [
    { no: '01', verb: '찾는다', title: '설명할 수 있는 문제부터.', body: '멋진 아이디어보다 먼저, 누구의 어떤 불편을 바꿀지 한 문장으로 좁힙니다.', tag: 'DEFINE' },
    { no: '02', verb: '만든다', title: '반응을 얻을 만큼만.', body: '완벽한 제품을 기다리지 않습니다. 누군가 만지고 판단할 수 있는 첫 버전을 만듭니다.', tag: 'BUILD' },
    { no: '03', verb: '내놓는다', title: '팀 밖에서 검증한다.', body: '실제 가격, 실제 고객, 실제 마감 안에서 제품이 버티는지 확인합니다.', tag: 'LAUNCH' },
    { no: '04', verb: '남긴다', title: '숫자와 판단을 기록한다.', body: '매출, 비용, 실패한 선택까지 남겨 다음 팀이 처음부터 헤매지 않게 합니다.', tag: 'RECORD' },
  ] : [
    { no: '01', verb: 'Find', title: 'Start with a problem you can name.', body: 'Before the big idea, narrow down whose problem you are changing and why it matters now.', tag: 'DEFINE' },
    { no: '02', verb: 'Make', title: 'Build only enough to get a reaction.', body: 'Do not wait for polish. Make the first version somebody can touch, judge, and reject.', tag: 'BUILD' },
    { no: '03', verb: 'Release', title: 'Test it outside the team.', body: 'Real prices, real customers, real deadlines. That is where the work tells the truth.', tag: 'LAUNCH' },
    { no: '04', verb: 'Record', title: 'Keep the numbers and the decisions.', body: 'Revenue, costs, misses, and next moves stay visible so the next team starts further ahead.', tag: 'RECORD' },
  ];

  useMotionValueEvent(progress, 'change', (value) => {
    const next = Math.max(0, Math.min(3, Math.round((value - .08) / .28)));
    setActive((current) => current === next ? current : next);
  });

  const goToChapter = (index: number) => {
    if (!ref.current) return;
    const scrollable = ref.current.offsetHeight - window.innerHeight;
    window.scrollTo({ top: ref.current.offsetTop + scrollable * (.08 + index * .28), behavior: 'smooth' });
  };

  if (reduceMotion) {
    return <section className="bg-[var(--ss-night)] px-5 py-24 text-white sm:px-8"><div className="mx-auto max-w-[90rem] space-y-24">{scenes.map((scene, index) => <div key={scene.no} className="grid gap-8 border-t border-white/20 pt-8 md:grid-cols-2"><div><p className="text-xs text-white/40">{scene.no} / 04</p><h2 className="ss-heading mt-4">{scene.verb}.</h2><p className="mt-5 text-white/50">{scene.body}</p></div>{projects[index]?.image && <img src={projects[index].image} alt={projects[index].name} className="aspect-[4/3] size-full object-cover grayscale" />}</div>)}</div></section>;
  }

  return (
    <section ref={ref} className="relative h-[540svh] bg-[var(--ss-night)] text-white">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 ss-dark-grain opacity-40" />
        <div className="absolute inset-x-5 top-6 z-20 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[.24em] text-white/38 sm:inset-x-8"><span>The build cycle</span><span>Vertical input / Horizontal story</span></div>
        <motion.div style={{ x: trackX }} className="relative z-10 flex h-full w-[400vw] will-change-transform">
          {scenes.map((scene, index) => <StoryPanel key={scene.no} scene={scene} project={projects[index] ?? projects[0]} index={index} progress={progress} />)}
        </motion.div>
        <div className="absolute inset-x-5 bottom-6 z-20 flex items-end justify-between sm:inset-x-8">
          <div className="flex gap-1.5">{scenes.map((scene, index) => <button key={scene.no} type="button" onClick={() => goToChapter(index)} aria-label={`Go to ${scene.tag}`} className="group relative h-7 w-11"><span className="absolute inset-x-0 top-1/2 h-px bg-white/15" /><motion.span animate={{ scaleX: index === active ? 1 : 0 }} transition={motionSpring.state} className="absolute inset-x-0 top-1/2 h-px origin-left bg-white" /></button>)}</div>
          <p className="text-[9px] font-semibold uppercase tracking-[.22em] text-white/35">Scroll / {scenes[active].no}</p>
        </div>
        <motion.div style={{ scaleX: lineScale }} className="absolute bottom-0 left-0 z-30 h-[2px] w-full origin-left bg-[var(--ss-bronze)]" />
      </div>
    </section>
  );
}

export default function Home() {
  const { lang, t } = useLanguage();
  const projects = useCMSStore((state) => state.projects);
  const content = useSiteContentStore((state) => state.content);
  const metrics = [
    [String(projects.length).padStart(2, '0'), lang === 'ko' ? '공개 프로젝트' : 'Public projects'],
    [`$${Number(content.totalRevenue || 0).toLocaleString()}`, lang === 'ko' ? '기록된 매출' : 'Revenue recorded'],
    [`$${Number(content.totalDonated || 0).toLocaleString()}`, lang === 'ko' ? '기부금' : 'Given back'],
    [`${content.activeMembers}+`, lang === 'ko' ? '활동 멤버' : 'Active members'],
  ];

  return (
    <div className="bg-[var(--ss-canvas)]">
      <Hero />
      <div className="ss-marquee overflow-hidden border-y border-black/15 bg-[var(--ss-panel)] py-3 text-[10px] font-semibold uppercase tracking-[.26em] text-black/65"><div>BUILD · TEST · SELL · RECORD · BUILD · TEST · SELL · RECORD · BUILD · TEST · SELL · RECORD ·</div></div>
      <Story />

      <section className="px-5 py-24 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-[90rem]">
          <ScrollReveal className="grid gap-8 lg:grid-cols-[.55fr_1.45fr] lg:items-end"><p className="ss-label text-black/42">{t('proof.kicker')} / 2024—26</p><h2 className="ss-heading max-w-4xl text-[var(--ss-ink)]">{t('impactPreview.title')}</h2></ScrollReveal>
          <div className="mt-14 grid overflow-hidden border border-black/10 bg-white/40 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(([value, label], index) => <ScrollReveal key={label} delay={index * STAGGER} className="min-w-0"><div className="flex min-h-52 flex-col justify-between border-b border-r border-black/10 p-6 lg:p-7"><div className="ss-label flex items-center justify-between text-black/38"><span>0{index + 1}</span><span className="h-px w-6 bg-[var(--ss-bronze)]" /></div><div><p className="ss-stat break-words tabular-nums">{value}</p><p className="mt-3 text-xs font-medium text-black/45">{label}</p></div></div></ScrollReveal>)}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-[90rem]">
          <ScrollReveal className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="ss-label text-black/42">Selected work</p><h2 className="ss-heading mt-5">{t('featured.title')}</h2></div><Link to="/projects" className="group inline-flex items-center gap-2 text-sm font-semibold">{t('featured.viewAll')}<ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></ScrollReveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">{projects.slice(0, 3).map((project, index) => <ScrollReveal key={project.id} delay={index * STAGGER}><ProjectCard project={project} index={index} priority /></ScrollReveal>)}</div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--ss-night)] px-5 py-24 text-white sm:px-8 lg:py-36">
        <div className="absolute right-[8%] top-0 h-full w-px bg-white/10" />
        <div className="relative mx-auto max-w-[90rem]">
          <ScrollReveal><p className="ss-label text-white/38">Your move</p><h2 className="ss-display mt-6 max-w-4xl">{t('cta.title')}</h2></ScrollReveal>
          <ScrollReveal delay={.1} className="mt-12 flex flex-col gap-7 border-t border-white/20 pt-7 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-2xl text-base leading-7 text-white/48">{t('cta.subtitle')}</p><motion.div whileTap={{ scale: .98, y: 1 }} transition={motionSpring.press}><Link to="/contact" className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-xs font-semibold text-black">{t('cta.button')}<ArrowRight className="size-4" /></Link></motion.div></ScrollReveal>
        </div>
      </section>
    </div>
  );
}
