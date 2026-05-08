import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useJournalStore, useJournalSync } from '@/stores/journalStore';

const renderParagraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

export default function JournalPost() {
  useJournalSync();

  const { slug } = useParams();
  const { lang } = useLanguage();
  const posts = useJournalStore((state) => state.posts);
  const status = useJournalStore((state) => state.status);

  const post = useMemo(() => posts.find((entry) => entry.slug === slug), [posts, slug]);

  if (status === 'loading' && !post) {
    return (
      <div className="bg-beige pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-12 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-5 w-full animate-pulse rounded bg-muted" />
          <div className="mt-2 h-5 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-beige pt-20">
        <div className="text-center">
          <p className="text-base text-muted-foreground">
            {lang === 'ko' ? '이 기록을 찾을 수 없습니다.' : 'This entry is not available.'}
          </p>
          <Link to="/journal" className="mt-4 inline-flex text-sm font-medium text-foreground underline underline-offset-4">
            {lang === 'ko' ? '빌드 로그로 돌아가기' : 'Back to Build Log'}
          </Link>
        </div>
      </div>
    );
  }

  const title = lang === 'ko' ? post.titleKo : post.titleEn;
  const summary = lang === 'ko' ? post.summaryKo : post.summaryEn;
  const content = lang === 'ko' ? post.contentKo : post.contentEn;
  const lessons = lang === 'ko' ? post.lessonsKo : post.lessonsEn;

  return (
    <div className="bg-beige">
      <section className="border-b border-border/60 bg-card/30 pt-28 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link to="/journal" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {lang === 'ko' ? '← 빌드 로그로 돌아가기' : '← Back to Build Log'}
          </Link>

          <div className="mt-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {post.category}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
              {summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>{post.author}</span>
              <span>
                {new Date(`${post.date}T00:00:00`).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {post.coverImage && (
            <div className="overflow-hidden rounded-[28px] border border-border shadow-[0_24px_72px_-42px_rgba(15,23,42,0.22)]">
              <img src={post.coverImage} alt={title} className="w-full object-cover" loading="eager" decoding="async" />
            </div>
          )}

          <article className="mt-8 rounded-[30px] border border-border bg-card px-6 py-7 shadow-[0_18px_56px_-42px_rgba(15,23,42,0.18)] sm:px-8">
            <div className="space-y-6 text-[15px] leading-8 text-foreground/84">
              {renderParagraphs(content).map((block, index) => (
                <p key={index}>{block}</p>
              ))}
            </div>

            {lessons && (
              <div className="mt-8 rounded-[24px] border border-border bg-muted/25 p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {lang === 'ko' ? 'What we learned' : 'What we learned'}
                </p>
                <p className="mt-3 text-sm leading-7 text-foreground/84">{lessons}</p>
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground/80">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
