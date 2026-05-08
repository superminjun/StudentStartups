import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/features/ScrollReveal';
import { useLanguage } from '@/hooks/useLanguage';
import { useJournalStore, useJournalSync } from '@/stores/journalStore';

export default function Journal() {
  useJournalSync();

  const { lang } = useLanguage();
  const posts = useJournalStore((state) => state.posts);
  const status = useJournalStore((state) => state.status);
  const [category, setCategory] = useState('all');

  const categories = useMemo(
    () => Array.from(new Set(posts.map((post) => post.category).filter(Boolean))),
    [posts]
  );

  const filteredPosts = useMemo(
    () => posts.filter((post) => category === 'all' || post.category === category),
    [category, posts]
  );

  const featuredPost = filteredPosts.find((post) => post.featured) ?? filteredPosts[0];
  const restPosts = featuredPost ? filteredPosts.filter((post) => post.id !== featuredPost.id) : filteredPosts;

  return (
    <div className="bg-beige">
      <section className="section border-b border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(96,140,255,0.08),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,240,0.92))]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-4xl">
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="section-kicker">
              {lang === 'ko' ? '빌드 로그' : 'Build Log'}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="section-title mt-4">
              {lang === 'ko' ? '진행 과정을 남기는 공개 기록' : 'A public record of the work in progress'}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-lead max-w-3xl">
              {lang === 'ko'
                ? '회의 메모, 디자인 수정, 프로토타입, 실패한 가정, 그리고 다시 시도한 방식까지 남깁니다. 결과만이 아니라 과정도 Student Startups의 일부입니다.'
                : 'Meeting notes, design revisions, prototypes, wrong assumptions, and better decisions all belong here. The record is part of the platform, not a side note.'}
            </motion.p>
          </div>

          <ScrollReveal className="mt-8">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${category === 'all' ? 'bg-foreground text-background' : 'border border-border bg-card text-muted-foreground hover:text-foreground'}`}
              >
                {lang === 'ko' ? '전체' : 'All'}
              </button>
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${category === item ? 'bg-foreground text-background' : 'border border-border bg-card text-muted-foreground hover:text-foreground'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {featuredPost && (
            <ScrollReveal>
              <Link to={`/journal/${featuredPost.slug}`} className="group block overflow-hidden rounded-[32px] border border-border bg-card shadow-[0_24px_72px_-40px_rgba(15,23,42,0.22)]">
                <div className="grid gap-0 lg:grid-cols-[1.1fr,minmax(0,0.9fr)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted/60">
                    {featuredPost.coverImage ? (
                      <img
                        src={featuredPost.coverImage}
                        alt={lang === 'ko' ? featuredPost.titleKo : featuredPost.titleEn}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        loading="eager"
                        decoding="async"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  </div>
                  <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {featuredPost.category}
                      </p>
                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        {lang === 'ko' ? featuredPost.titleKo : featuredPost.titleEn}
                      </h2>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                        {lang === 'ko' ? featuredPost.summaryKo : featuredPost.summaryEn}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <div className="text-xs text-muted-foreground">
                        <p>{featuredPost.author}</p>
                        <p className="mt-1">
                          {new Date(`${featuredPost.date}T00:00:00`).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                        {lang === 'ko' ? '전체 기록 보기' : 'Read entry'} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          )}

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(status === 'loading' ? [] : restPosts).map((post, index) => (
              <ScrollReveal key={post.id} delay={index * 0.04}>
                <Link to={`/journal/${post.slug}`} className="group block rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.2)] transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {post.category}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                    {lang === 'ko' ? post.titleKo : post.titleEn}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground line-clamp-4">
                    {lang === 'ko' ? post.summaryKo : post.summaryEn}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>
                      {new Date(`${post.date}T00:00:00`).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          {!filteredPosts.length && (
            <div className="rounded-[28px] border border-dashed border-border bg-card/70 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-foreground">
                {lang === 'ko' ? '기록이 곧 이곳에 표시됩니다.' : 'Entries will appear here.'}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {lang === 'ko'
                  ? '미팅 노트, 디자인 변경, 프로토타입, 회고가 쌓이면 이 페이지가 살아 있는 기록으로 채워집니다.'
                  : 'Meeting notes, design changes, prototypes, and reflections will make this page a living record over time.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
