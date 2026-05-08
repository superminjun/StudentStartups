import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useLanguage } from '@/hooks/useLanguage';
import { useStoryStore, useStorySync } from '@/stores/storyStore';

export default function Story() {
  useStorySync();

  const { lang } = useLanguage();
  const story = useStoryStore((state) => state.story);
  const status = useStoryStore((state) => state.status);

  const sections = [
    {
      key: lang === 'ko' ? '문제' : 'The Problem',
      title: lang === 'ko' ? '문제' : 'The Problem',
      body: lang === 'ko' ? story.problemKo : story.problemEn,
    },
    {
      key: lang === 'ko' ? '왜 시작했는가' : 'Why We Started',
      title: lang === 'ko' ? '왜 시작했는가' : 'Why We Started',
      body: lang === 'ko' ? story.whyStartedKo : story.whyStartedEn,
    },
    {
      key: lang === 'ko' ? '무엇을 만들고 있는가' : 'What We Are Building',
      title: lang === 'ko' ? '무엇을 만들고 있는가' : 'What We Are Building',
      body: lang === 'ko' ? story.whatBuildingKo : story.whatBuildingEn,
    },
    {
      key: lang === 'ko' ? '어떻게 일하는가' : 'How We Work',
      title: lang === 'ko' ? '어떻게 일하는가' : 'How We Work',
      body: lang === 'ko' ? story.howWeWorkKo : story.howWeWorkEn,
    },
    {
      key: lang === 'ko' ? '어디로 가는가' : 'Where We Are Going',
      title: lang === 'ko' ? '어디로 가는가' : 'Where We Are Going',
      body: lang === 'ko' ? story.whereGoingKo : story.whereGoingEn,
    },
  ];

  return (
    <div className="bg-beige">
      <section className="section border-b border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(96,140,255,0.1),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,240,0.9))]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="section-kicker"
            >
              {lang === 'ko' ? story.eyebrowKo : story.eyebrowEn}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="section-title mt-4"
            >
              {lang === 'ko' ? story.titleKo : story.titleEn}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="section-lead max-w-3xl"
            >
              {lang === 'ko' ? story.introKo : story.introEn}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/team" className="btn btn-secondary">
                {lang === 'ko' ? '팀 보기' : 'Review the Team'} <ArrowRight className="size-4" />
              </Link>
              <Link to="/journal" className="btn btn-primary">
                {lang === 'ko' ? '빌드 로그 보기' : 'Read the Build Log'}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-2">
            {sections.map((section, index) => (
              <ScrollReveal key={section.key} delay={index * 0.06}>
                <article className="rounded-[28px] border border-border bg-card p-6 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.22)]">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {section.title}
                  </p>
                  <p className="mt-4 text-sm leading-8 text-foreground/84 sm:text-[15px]">
                    {section.body}
                  </p>
                </article>
              </ScrollReveal>
            ))}
          </div>

          {(lang === 'ko' ? story.quoteKo : story.quoteEn) && (
            <ScrollReveal className="mt-8">
              <div className="rounded-[30px] border border-border bg-charcoal px-6 py-8 text-white shadow-[0_30px_80px_-48px_rgba(15,23,42,0.58)]">
                <p className="max-w-4xl text-xl leading-relaxed text-white/88 sm:text-2xl">
                  {lang === 'ko' ? story.quoteKo : story.quoteEn}
                </p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      <section className="section border-t border-border/60 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <p className="section-kicker">{lang === 'ko' ? '타임라인' : 'Timeline'}</p>
            <h2 className="section-title mt-3 text-3xl sm:text-4xl">
              {lang === 'ko' ? '어떻게 여기까지 왔는가' : 'How the platform has taken shape'}
            </h2>
          </ScrollReveal>

          <div className="mt-8 space-y-4">
            {(status === 'loading' ? [] : story.timeline).map((entry, index) => (
              <ScrollReveal key={`${entry.date}-${entry.titleEn}`} delay={index * 0.05}>
                <div className="rounded-[24px] border border-border bg-card px-5 py-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {lang === 'ko' ? entry.titleKo : entry.titleEn}
                      </p>
                      {(lang === 'ko' ? entry.detailKo : entry.detailEn) && (
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {lang === 'ko' ? entry.detailKo : entry.detailEn}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {new Date(`${entry.date}T00:00:00`).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
