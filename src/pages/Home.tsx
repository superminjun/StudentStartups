import { useRef, useState, type PointerEvent } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MotionMark from '@/components/features/MotionMark';
import ProjectCard from '@/components/features/ProjectCard';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useLanguage } from '@/hooks/useLanguage';
import { motionSpring, STAGGER } from '@/lib/motion';
import { useCMSStore } from '@/stores/cmsStore';
import { useSiteContentStore } from '@/stores/siteContentStore';

function Hero() {
  const { t } = useLanguage();
  const projects = useCMSStore((state) => state.projects).slice(0, 3);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-28%']);
  const stageY = useTransform(scrollYProgress, [0, 1], ['0%', '32%']);
  const stageScale = useTransform(scrollYProgress, [0, 0.9], [1, 0.82]);
  const opacity = useTransform(scrollYProgress, [0.55, 0.95], [1, 0]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-1, 1], [4, -4]), { stiffness: 110, damping: 24 });
  const rotateY = useSpring(useTransform(pointerX, [-1, 1], [-5, 5]), { stiffness: 110, damping: 24 });
  const words = t('hero.title').split(' ');

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  return (
    <section ref={ref} onPointerMove={handlePointerMove} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }} className="relative h-[145svh] bg-[var(--ss-canvas)]">
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden pt-20">
        <div className="ss-grain absolute inset-0 opacity-40" />
        <motion.div className="absolute -left-[12rem] top-[5%] size-[36rem] rounded-full bg-[var(--ss-sky)]/35 blur-[100px]" animate={reduceMotion ? undefined : { x: [0, 55, 0], y: [0, -20, 0] }} transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -right-40 bottom-[-10rem] size-[32rem] rounded-full bg-[var(--ss-coral)]/25 blur-[110px]" animate={reduceMotion ? undefined : { x: [0, -35, 0], y: [0, 30, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />

        <div className="relative mx-auto grid w-full max-w-[90rem] items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.02fr_.98fr]">
          <motion.div style={{ y: titleY, opacity }} className="relative z-10">
            <motion.p initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={motionSpring.reveal} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-black/50">
              <span className="size-2 rounded-full bg-[var(--ss-coral)] ss-pulse" /> {t('hero.tagline')} · Est. 2024
            </motion.p>
            <h1 className="mt-7 max-w-[12ch] text-[clamp(3.6rem,7.7vw,8.5rem)] font-semibold leading-[0.82] tracking-[-0.085em] text-[var(--ss-ink)]">
              {words.map((word, index) => (
                <span key={`${word}-${index}`} className="mr-[.18em] inline-block overflow-hidden pb-[.08em]">
                  <motion.span className="inline-block" initial={{ y: '115%', rotateX: 20, filter: 'blur(8px)' }} animate={{ y: 0, rotateX: 0, filter: 'blur(0px)' }} transition={{ ...motionSpring.depth, delay: 0.08 + index * STAGGER }}>{word}</motion.span>
                </span>
              ))}
            </h1>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionSpring.reveal, delay: 0.45 }} className="mt-8 flex max-w-xl flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-md text-base leading-7 text-black/58 sm:text-lg">{t('hero.subtitle')}</p>
              <motion.div whileTap={{ scale: 0.97, y: 1 }} transition={motionSpring.press}>
                <Link to="/projects" className="group inline-flex items-center gap-3 rounded-full bg-[var(--ss-ink)] px-6 py-4 text-sm font-bold text-white">
                  {t('hero.cta')}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="relative mx-auto hidden h-[34rem] w-full max-w-[38rem] lg:block" style={{ y: stageY, scale: stageScale, opacity, rotateX, rotateY, transformPerspective: 1100 }}>
            <div className="absolute left-[8%] top-[4%] size-[22rem] rounded-full border border-black/15" />
            <div className="absolute left-[23%] top-[18%] size-[14rem] rounded-full border border-black/15" />
            <motion.div className="absolute right-[6%] top-[8%] w-[48%] rotate-[7deg] rounded-[1.8rem] border border-black/10 bg-[var(--ss-sky)] p-2 shadow-[0_32px_80px_rgba(18,18,18,.16)]" animate={reduceMotion ? undefined : { y: [0, -12, 0], rotate: [7, 5.5, 7] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-black/10">{projects[1]?.image && <img src={projects[1].image} alt="" className="size-full object-cover" />}</div>
              <p className="px-2 pb-2 pt-3 text-sm font-bold tracking-[-0.03em]">{projects[1]?.name ?? 'In progress'}</p>
            </motion.div>
            <motion.div className="absolute bottom-[3%] left-[1%] z-10 w-[53%] -rotate-[6deg] rounded-[1.8rem] border border-black/10 bg-[var(--ss-lime)] p-2 shadow-[0_34px_90px_rgba(18,18,18,.18)]" animate={reduceMotion ? undefined : { y: [0, 11, 0], rotate: [-6, -4.5, -6] }} transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-black/10">{projects[0]?.image && <img src={projects[0].image} alt="" className="size-full object-cover" />}</div>
              <div className="flex items-center justify-between px-2 pb-2 pt-3"><p className="text-sm font-bold tracking-[-0.03em]">{projects[0]?.name ?? 'Building now'}</p><span className="text-xs">01</span></div>
            </motion.div>
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 8 }} transition={{ ...motionSpring.depth, delay: 0.65 }} className="absolute bottom-[8%] right-[3%] z-20 grid size-32 place-items-center rounded-full bg-[var(--ss-coral)] text-center text-xs font-black uppercase leading-4 tracking-[0.12em] text-white shadow-xl">Work<br />in public</motion.div>
          </motion.div>
        </div>
        <motion.div style={{ opacity }} className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-black/45"><ArrowDown className="size-3.5 ss-bob" /> Scroll to enter</motion.div>
      </div>
    </section>
  );
}

function Story() {
  const { lang } = useLanguage();
  const projects = useCMSStore((state) => state.projects);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const orbitRotate = useTransform(scrollYProgress, [0, 1], [0, 305]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [0.92, 1.12]);
  const lineScale = useSpring(scrollYProgress, { stiffness: 100, damping: 28 });
  const scenes = lang === 'ko' ? [
    { no: '01', verb: '찾는다', title: '설명할 수 있는 문제부터.', body: '멋진 아이디어보다 먼저, 누구의 어떤 불편을 바꿀지 한 문장으로 좁힙니다.', color: 'var(--ss-sky)', tag: 'DEFINE' },
    { no: '02', verb: '만든다', title: '반응을 얻을 만큼만.', body: '완벽한 제품을 기다리지 않습니다. 누군가 만지고 판단할 수 있는 첫 버전을 만듭니다.', color: 'var(--ss-lime)', tag: 'BUILD' },
    { no: '03', verb: '내놓는다', title: '팀 밖에서 검증한다.', body: '실제 가격, 실제 고객, 실제 마감 안에서 제품이 버티는지 확인합니다.', color: 'var(--ss-coral)', tag: 'LAUNCH' },
    { no: '04', verb: '남긴다', title: '숫자와 판단을 기록한다.', body: '매출, 비용, 실패한 선택까지 남겨 다음 팀이 처음부터 헤매지 않게 합니다.', color: 'var(--ss-violet)', tag: 'RECORD' },
  ] : [
    { no: '01', verb: 'Find', title: 'Start with a problem you can name.', body: 'Before the big idea, narrow down whose problem you are changing and why it matters now.', color: 'var(--ss-sky)', tag: 'DEFINE' },
    { no: '02', verb: 'Make', title: 'Build only enough to get a reaction.', body: 'Do not wait for polish. Make the first version somebody can touch, judge, and reject.', color: 'var(--ss-lime)', tag: 'BUILD' },
    { no: '03', verb: 'Release', title: 'Test it outside the team.', body: 'Real prices, real customers, real deadlines. That is where the work tells the truth.', color: 'var(--ss-coral)', tag: 'LAUNCH' },
    { no: '04', verb: 'Record', title: 'Keep the numbers and the decisions.', body: 'Revenue, costs, misses, and next moves stay visible so the next team starts further ahead.', color: 'var(--ss-violet)', tag: 'RECORD' },
  ];

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = Math.min(3, Math.floor(value * 4));
    setActive((current) => current === next ? current : next);
  });

  const scene = scenes[active];
  const project = projects[active] ?? projects[0];

  return (
    <section ref={ref} className="relative h-[430svh] bg-[var(--ss-night)] text-white">
      <div className="sticky top-0 min-h-screen overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div key={active} className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 75% 45%, ${scene.color}, transparent 34%)` }} initial={{ opacity: 0 }} animate={{ opacity: .22 }} exit={{ opacity: 0 }} transition={motionSpring.state} />
        </AnimatePresence>
        <div className="mx-auto grid min-h-screen max-w-[90rem] items-center gap-12 px-5 pb-10 pt-24 sm:px-8 lg:grid-cols-[.88fr_1.12fr]">
          <div className="relative z-10">
            <p className="mb-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.28em] text-white/42"><span className="h-px w-8 bg-white/35" /> The build cycle</p>
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={reduceMotion ? false : { opacity: 0, y: 34, scale: .94, rotateX: 4, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)' }} exit={reduceMotion ? undefined : { opacity: 0, y: -24, scale: .97, filter: 'blur(6px)' }} transition={motionSpring.depth} style={{ transformPerspective: 900 }}>
                <p className="text-sm font-bold" style={{ color: scene.color }}>{scene.no} / 04 · {scene.tag}</p>
                <p className="mt-5 text-[clamp(4.8rem,10vw,10rem)] font-semibold leading-[.75] tracking-[-.1em]">{scene.verb}.</p>
                <h2 className="mt-10 max-w-xl text-2xl font-semibold leading-tight tracking-[-.045em] sm:text-4xl">{scene.title}</h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-white/55">{scene.body}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-12 flex items-center gap-3">
              {scenes.map((item, index) => <button key={item.no} type="button" onClick={() => setActive(index)} className="group relative h-8 w-12" aria-label={`Scene ${index + 1}`}><span className="absolute inset-x-0 top-1/2 h-px bg-white/20" /><motion.span className="absolute inset-x-0 top-1/2 h-px origin-left" style={{ background: item.color }} animate={{ scaleX: index === active ? 1 : 0 }} transition={motionSpring.state} /></button>)}
            </div>
          </div>

          <div className="relative hidden min-h-[38rem] items-center justify-center md:flex">
            <motion.div style={{ rotate: orbitRotate }} className="absolute size-[min(43vw,36rem)] rounded-full border border-white/15">
              <span className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: scene.color }} />
              <span className="absolute bottom-[7%] right-[12%] h-px w-20 rotate-45 bg-white/20" />
            </motion.div>
            <motion.div style={{ scale: imageScale }} className="relative w-[min(29vw,23rem)] rotate-[-3deg] rounded-[1.8rem] bg-white p-2 text-black shadow-[0_40px_100px_rgba(0,0,0,.42)]">
              <AnimatePresence mode="wait">
                <motion.div key={`${active}-${project?.id}`} initial={{ opacity: 0, scale: .9, filter: 'blur(8px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 1.06, filter: 'blur(6px)' }} transition={motionSpring.depth}>
                  <div className="aspect-[4/5] overflow-hidden rounded-[1.35rem]" style={{ background: scene.color }}>{project?.image && <img src={project.image} alt={project.name} className="size-full object-cover" />}</div>
                  <div className="flex items-end justify-between px-3 pb-3 pt-4"><div><p className="text-[9px] font-black tracking-[.18em] text-black/40">CURRENT WORK</p><p className="mt-1 max-w-[14rem] truncate text-base font-bold">{project?.name ?? 'Project in progress'}</p></div><span className="text-xl">↗</span></div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
            <motion.div key={scene.tag} initial={{ scale: 0, rotate: -35 }} animate={{ scale: 1, rotate: 8 }} transition={motionSpring.depth} className="absolute bottom-[13%] right-[2%] grid size-28 place-items-center rounded-full text-xs font-black tracking-[.12em] text-black" style={{ background: scene.color }}>{scene.tag}</motion.div>
          </div>
        </div>
        <motion.div className="absolute bottom-0 left-0 h-1 origin-left bg-white" style={{ scaleX: lineScale }} />
        <p className="absolute bottom-6 right-6 text-[10px] font-bold uppercase tracking-[.2em] text-white/35">Scroll / {scene.no}</p>
      </div>
    </section>
  );
}

export default function Home() {
  const { lang, t } = useLanguage();
  const projects = useCMSStore((state) => state.projects);
  const content = useSiteContentStore((state) => state.content);
  const metrics = [
    [String(projects.length).padStart(2, '0'), lang === 'ko' ? '공개 프로젝트' : 'Public projects', 'var(--ss-sky)'],
    [`$${Number(content.totalRevenue || 0).toLocaleString()}`, lang === 'ko' ? '기록된 매출' : 'Revenue recorded', 'var(--ss-lime)'],
    [`$${Number(content.totalDonated || 0).toLocaleString()}`, lang === 'ko' ? '기부금' : 'Given back', 'var(--ss-sand)'],
    [`${content.activeMembers}+`, lang === 'ko' ? '활동 멤버' : 'Active members', 'var(--ss-violet)'],
  ];

  return (
    <div className="bg-[var(--ss-canvas)]">
      <Hero />
      <div className="ss-marquee overflow-hidden border-y border-black/15 bg-[var(--ss-lime)] py-4 text-sm font-black uppercase tracking-[.2em] text-black"><div>BUILD · TEST · SELL · RECORD · BUILD · TEST · SELL · RECORD · BUILD · TEST · SELL · RECORD ·</div></div>
      <Story />

      <section className="px-5 py-24 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-[90rem]">
          <ScrollReveal className="grid gap-8 lg:grid-cols-[.55fr_1.45fr] lg:items-end">
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-black/45">{t('proof.kicker')} / 2024—26</p>
            <h2 className="max-w-5xl text-[clamp(3rem,6vw,7rem)] font-semibold leading-[.88] tracking-[-.075em] text-[var(--ss-ink)]">{t('impactPreview.title')}</h2>
          </ScrollReveal>
          <div className="mt-14 grid overflow-hidden rounded-[2rem] border border-black/10 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(([value, label, color], index) => (
              <ScrollReveal key={label} delay={index * STAGGER} className="min-w-0">
                <motion.div whileHover={{ y: -8 }} whileTap={{ scale: .975 }} transition={motionSpring.press} className="flex min-h-64 flex-col justify-between border-b border-r border-black/10 p-6 sm:min-h-72 lg:p-7" style={{ background: color }}>
                  <div className="flex items-center justify-between text-[10px] font-black tracking-[.16em]"><span>0{index + 1}</span><span className="size-2 rounded-full bg-black ss-pulse" /></div>
                  <div><p className="break-words text-[clamp(2.5rem,4.5vw,5rem)] font-semibold leading-none tracking-[-.075em] tabular-nums">{value}</p><p className="mt-3 text-sm font-semibold text-black/55">{label}</p></div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-[90rem]">
          <ScrollReveal className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[10px] font-bold uppercase tracking-[.28em] text-black/45">Selected work</p><h2 className="mt-5 text-[clamp(3rem,6vw,6rem)] font-semibold leading-[.88] tracking-[-.07em]">{t('featured.title')}</h2></div>
            <Link to="/projects" className="group inline-flex items-center gap-2 text-sm font-bold">{t('featured.viewAll')}<ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" /></Link>
          </ScrollReveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {projects.slice(0, 3).map((project, index) => <ScrollReveal key={project.id} delay={index * STAGGER}><ProjectCard project={project} index={index} priority /></ScrollReveal>)}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--ss-coral)] px-5 py-24 text-white sm:px-8 lg:py-36">
        <MotionMark dark className="absolute -right-20 -top-24 size-[26rem] opacity-25" />
        <div className="relative mx-auto max-w-[90rem]">
          <ScrollReveal><p className="text-[10px] font-black uppercase tracking-[.3em] text-white/60">Your move</p><h2 className="mt-6 max-w-5xl text-[clamp(3.5rem,8vw,9rem)] font-semibold leading-[.82] tracking-[-.085em]">{t('cta.title')}</h2></ScrollReveal>
          <ScrollReveal delay={.1} className="mt-12 flex flex-col gap-7 border-t border-white/30 pt-7 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-2xl text-base leading-7 text-white/70">{t('cta.subtitle')}</p><motion.div whileTap={{ scale: .97, y: 1 }} transition={motionSpring.press}><Link to="/contact" className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-bold text-black">{t('cta.button')}<ArrowRight className="size-4" /></Link></motion.div></ScrollReveal>
        </div>
      </section>
    </div>
  );
}
