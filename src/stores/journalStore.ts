import { useEffect } from 'react';
import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import type { JournalPost } from '@/types';
import { journalFallback } from '@/constants/journalFallback';
import { preloadImages, toPublicStorageUrl } from '@/lib/storage';

const CACHE_KEY = 'bnss-journal-cache';
const TABLE_NAME = 'journal_posts';
const isBrowser = typeof window !== 'undefined';

type JournalRow = {
  id: string;
  slug: string;
  title_en: string;
  title_ko: string;
  date: string;
  author_name: string | null;
  author_id: string | null;
  category: string;
  summary_en: string;
  summary_ko: string;
  content_en: string;
  content_ko: string;
  lessons_en: string | null;
  lessons_ko: string | null;
  cover_image_url: string | null;
  tags: unknown;
  published: boolean | null;
  featured: boolean | null;
  sort_order: number | null;
};

type JournalStatus = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';

const readCache = () => {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as JournalPost[];
  } catch {
    return null;
  }
};

const writeCache = (posts: JournalPost[]) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(posts));
  } catch {
    // ignore
  }
};

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');

const mapRow = (row: JournalRow): JournalPost => ({
  id: row.id,
  slug: row.slug,
  titleEn: row.title_en,
  titleKo: row.title_ko,
  date: row.date,
  author: row.author_name ?? 'Student Startups',
  authorId: row.author_id ?? undefined,
  category: row.category,
  summaryEn: row.summary_en,
  summaryKo: row.summary_ko,
  contentEn: row.content_en,
  contentKo: row.content_ko,
  lessonsEn: row.lessons_en ?? undefined,
  lessonsKo: row.lessons_ko ?? undefined,
  coverImage: toPublicStorageUrl(row.cover_image_url ?? ''),
  tags: isStringArray(row.tags) ? row.tags : [],
  published: row.published == null ? true : Boolean(row.published),
  featured: Boolean(row.featured),
  order: Number(row.sort_order) || 0,
});

export const useJournalStore = create<{
  posts: JournalPost[];
  status: JournalStatus;
  error: string | null;
  hydrate: () => Promise<void>;
}>((set) => ({
  posts: readCache() ?? journalFallback,
  status: readCache() ? 'ready' : 'idle',
  error: null,
  hydrate: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ posts: journalFallback, status: 'fallback', error: null });
      return;
    }

    set((state) => ({ status: state.posts.length ? state.status : 'loading', error: null }));

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('date', { ascending: false });

    if (error) {
      const fallback = readCache() ?? journalFallback;
      set({ posts: fallback, status: 'fallback', error: error.message });
      return;
    }

    const nextPosts = (data?.length ? (data as JournalRow[]).map(mapRow) : journalFallback)
      .filter((post) => post.published);

    writeCache(nextPosts);
    preloadImages(nextPosts.map((post) => post.coverImage).filter(Boolean) as string[]);
    set({ posts: nextPosts, status: 'ready', error: null });
  },
}));

export function useJournalSync() {
  const hydrate = useJournalStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
}
