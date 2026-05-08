import { useEffect } from 'react';
import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { TERMS } from '@/constants/config';

const STORAGE_KEY = 'bnss-admin-content';
const CACHE_KEY = 'bnss-site-content-cache';
const TABLE_NAME = 'site_content';
const SINGLETON_ID = 'global';

const defaultContent = {
  heroTagline: 'Student Startups',
  heroTitle: 'A serious place for early builders.',
  heroSubtitle: 'Student Startups is a platform for students developing real products, operating disciplined teams, and building a record that can be examined.',
  heroCta: 'Review the Work',
  introKicker: 'Why this exists',
  introTitle: 'Students are often taught how products work long before they are trusted to build one.',
  introBody: 'Student Startups was started to create that missing environment: a place where students can work with real teammates, operate under visible standards, and document what they make over time.',
  journalKicker: 'Build log',
  journalTitle: 'A public record of progress.',
  journalBody: 'We keep notes on meetings, design changes, working prototypes, and the parts that did not work. That record matters as much as the polished outcome.',
  joinTitle: 'Open to serious contributors.',
  joinBody: 'Some members lead projects. Some support operations. Some are still finding their role. The point is that the work is real, shared, and documented.',
  joinCta: 'Contact the Team',
  heroBackgroundUrl: '',
  shopTerms: TERMS.join(', '),
  totalRevenue: '24850',
  totalProfit: '12430',
  totalDonated: '6200',
  activeMembers: '84',
};

export type SiteContent = typeof defaultContent;

type SiteContentRow = {
  id: string;
  hero_tagline: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta: string | null;
  intro_kicker: string | null;
  intro_title: string | null;
  intro_body: string | null;
  journal_kicker: string | null;
  journal_title: string | null;
  journal_body: string | null;
  join_title: string | null;
  join_body: string | null;
  join_cta: string | null;
  hero_background_url: string | null;
  shop_terms: string | null;
  total_revenue: string | null;
  total_profit: string | null;
  total_donated: string | null;
  active_members: string | null;
};

type SiteContentStatus = 'idle' | 'loading' | 'ready' | 'error' | 'demo';

const mapRowToContent = (row: SiteContentRow | null): SiteContent => ({
  heroTagline: row?.hero_tagline ?? defaultContent.heroTagline,
  heroTitle: row?.hero_title ?? defaultContent.heroTitle,
  heroSubtitle: row?.hero_subtitle ?? defaultContent.heroSubtitle,
  heroCta: row?.hero_cta ?? defaultContent.heroCta,
  introKicker: row?.intro_kicker ?? defaultContent.introKicker,
  introTitle: row?.intro_title ?? defaultContent.introTitle,
  introBody: row?.intro_body ?? defaultContent.introBody,
  journalKicker: row?.journal_kicker ?? defaultContent.journalKicker,
  journalTitle: row?.journal_title ?? defaultContent.journalTitle,
  journalBody: row?.journal_body ?? defaultContent.journalBody,
  joinTitle: row?.join_title ?? defaultContent.joinTitle,
  joinBody: row?.join_body ?? defaultContent.joinBody,
  joinCta: row?.join_cta ?? defaultContent.joinCta,
  heroBackgroundUrl: row?.hero_background_url ?? defaultContent.heroBackgroundUrl,
  shopTerms: row?.shop_terms ?? defaultContent.shopTerms,
  totalRevenue: row?.total_revenue ?? defaultContent.totalRevenue,
  totalProfit: row?.total_profit ?? defaultContent.totalProfit,
  totalDonated: row?.total_donated ?? defaultContent.totalDonated,
  activeMembers: row?.active_members ?? defaultContent.activeMembers,
});

const mapContentToRow = (content: SiteContent): SiteContentRow => ({
  id: SINGLETON_ID,
  hero_tagline: content.heroTagline,
  hero_title: content.heroTitle,
  hero_subtitle: content.heroSubtitle,
  hero_cta: content.heroCta,
  intro_kicker: content.introKicker,
  intro_title: content.introTitle,
  intro_body: content.introBody,
  journal_kicker: content.journalKicker,
  journal_title: content.journalTitle,
  journal_body: content.journalBody,
  join_title: content.joinTitle,
  join_body: content.joinBody,
  join_cta: content.joinCta,
  hero_background_url: content.heroBackgroundUrl,
  shop_terms: content.shopTerms,
  total_revenue: content.totalRevenue,
  total_profit: content.totalProfit,
  total_donated: content.totalDonated,
  active_members: content.activeMembers,
});

const isBrowser = typeof window !== 'undefined';

const readCache = (): SiteContent | null => {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SiteContent;
  } catch {
    return null;
  }
};

const writeCache = (content: SiteContent) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(content));
  } catch {
    // ignore
  }
};

const loadFallback = (): SiteContent => {
  if (typeof window === 'undefined') return defaultContent;
  if (isSupabaseConfigured) {
    return readCache() ?? defaultContent;
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultContent;
  try {
    const parsed = JSON.parse(saved) as Partial<SiteContent>;
    return { ...defaultContent, ...parsed };
  } catch {
    return defaultContent;
  }
};

export const useSiteContentStore = create<{
  content: SiteContent;
  status: SiteContentStatus;
  error: string | null;
  hydrate: () => Promise<void>;
  updateContent: (next: Partial<SiteContent>) => Promise<void>;
}>((set, get) => ({
  content: loadFallback(),
  status: 'idle',
  error: null,
  hydrate: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ status: 'demo', content: loadFallback() });
      return;
    }

    set({ status: 'loading', error: null });
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', SINGLETON_ID)
      .maybeSingle();

    if (error) {
      set({ status: 'error', error: error.message });
      return;
    }

    const mapped = mapRowToContent(data as SiteContentRow | null);
    writeCache(mapped);
    set({ content: mapped, status: 'ready' });
  },
  updateContent: async (next) => {
    const merged = { ...get().content, ...next };
    set({ content: merged });

    if (!isSupabaseConfigured || !supabase) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      return;
    }

    const { error } = await supabase.from(TABLE_NAME).upsert(mapContentToRow(merged));
    if (error) {
      set({ status: 'error', error: error.message });
    } else {
      writeCache(merged);
      set({ status: 'ready', error: null });
    }
  },
}));

export function useSiteContentSync() {
  const hydrate = useSiteContentStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
}
