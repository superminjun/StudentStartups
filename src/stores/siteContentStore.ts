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
  heroTitle: 'Where Students Build Real Businesses',
  heroSubtitle: 'A student-led entrepreneurship program. Learn market research, production, finance, and design by creating and selling real products.',
  heroCta: 'Explore Projects',
  heroBackgroundUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&h=900&fit=crop',
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
    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

    hydrate();

    if (!isSupabaseConfigured || !supabase) return () => {};

    channel = supabase
      .channel('site-content-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE_NAME, filter: `id=eq.${SINGLETON_ID}` },
        (payload) => {
          const next = mapRowToContent(payload.new as SiteContentRow);
          writeCache(next);
          useSiteContentStore.setState({ content: next, status: 'ready', error: null });
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [hydrate]);
}
