import { useEffect } from 'react';
import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import type { StoryContent, StoryMilestone } from '@/types';
import { storyFallback } from '@/constants/storyFallback';
import { preloadImages, toPublicStorageUrl } from '@/lib/storage';

const CACHE_KEY = 'bnss-story-cache';
const TABLE_NAME = 'story_content';
const SINGLETON_ID = 'global';
const isBrowser = typeof window !== 'undefined';

type StoryRow = {
  id: string;
  eyebrow_en: string | null;
  eyebrow_ko: string | null;
  title_en: string | null;
  title_ko: string | null;
  intro_en: string | null;
  intro_ko: string | null;
  problem_en: string | null;
  problem_ko: string | null;
  why_started_en: string | null;
  why_started_ko: string | null;
  what_building_en: string | null;
  what_building_ko: string | null;
  how_we_work_en: string | null;
  how_we_work_ko: string | null;
  where_going_en: string | null;
  where_going_ko: string | null;
  quote_en: string | null;
  quote_ko: string | null;
  images: unknown;
  timeline: unknown;
};

type StoryStatus = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';

const readCache = () => {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoryContent;
  } catch {
    return null;
  }
};

const writeCache = (story: StoryContent) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(story));
  } catch {
    // ignore
  }
};

const mapTimeline = (value: unknown): StoryMilestone[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        date: String(row.date ?? '').slice(0, 10),
        titleEn: String(row.titleEn ?? row.title_en ?? ''),
        titleKo: String(row.titleKo ?? row.title_ko ?? ''),
        detailEn: typeof row.detailEn === 'string' ? row.detailEn : typeof row.detail_en === 'string' ? row.detail_en : undefined,
        detailKo: typeof row.detailKo === 'string' ? row.detailKo : typeof row.detail_ko === 'string' ? row.detail_ko : undefined,
      };
    })
    .filter((entry) => entry.date && entry.titleEn);
};

const mapRowToStory = (row: StoryRow | null): StoryContent => {
  const timeline = mapTimeline(row?.timeline);
  return {
    id: row?.id ?? storyFallback.id,
    eyebrowEn: row?.eyebrow_en ?? storyFallback.eyebrowEn,
    eyebrowKo: row?.eyebrow_ko ?? storyFallback.eyebrowKo,
    titleEn: row?.title_en ?? storyFallback.titleEn,
    titleKo: row?.title_ko ?? storyFallback.titleKo,
    introEn: row?.intro_en ?? storyFallback.introEn,
    introKo: row?.intro_ko ?? storyFallback.introKo,
    problemEn: row?.problem_en ?? storyFallback.problemEn,
    problemKo: row?.problem_ko ?? storyFallback.problemKo,
    whyStartedEn: row?.why_started_en ?? storyFallback.whyStartedEn,
    whyStartedKo: row?.why_started_ko ?? storyFallback.whyStartedKo,
    whatBuildingEn: row?.what_building_en ?? storyFallback.whatBuildingEn,
    whatBuildingKo: row?.what_building_ko ?? storyFallback.whatBuildingKo,
    howWeWorkEn: row?.how_we_work_en ?? storyFallback.howWeWorkEn,
    howWeWorkKo: row?.how_we_work_ko ?? storyFallback.howWeWorkKo,
    whereGoingEn: row?.where_going_en ?? storyFallback.whereGoingEn,
    whereGoingKo: row?.where_going_ko ?? storyFallback.whereGoingKo,
    quoteEn: row?.quote_en ?? storyFallback.quoteEn,
    quoteKo: row?.quote_ko ?? storyFallback.quoteKo,
    images: Array.isArray(row?.images) ? (row?.images as string[]).map((image) => toPublicStorageUrl(image)) : storyFallback.images,
    timeline: timeline.length ? timeline : storyFallback.timeline,
  };
};

export const useStoryStore = create<{
  story: StoryContent;
  status: StoryStatus;
  error: string | null;
  hydrate: () => Promise<void>;
}>((set) => ({
  story: readCache() ?? storyFallback,
  status: readCache() ? 'ready' : 'idle',
  error: null,
  hydrate: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ story: storyFallback, status: 'fallback', error: null });
      return;
    }

    set((state) => ({ status: state.story ? state.status : 'loading', error: null }));

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', SINGLETON_ID)
      .maybeSingle();

    if (error) {
      const fallback = readCache() ?? storyFallback;
      set({ story: fallback, status: 'fallback', error: error.message });
      return;
    }

    const nextStory = mapRowToStory(data as StoryRow | null);
    writeCache(nextStory);
    preloadImages(nextStory.images);
    set({ story: nextStory, status: 'ready', error: null });
  },
}));

export function useStorySync() {
  const hydrate = useStoryStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
}
