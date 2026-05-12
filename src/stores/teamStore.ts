import { useEffect } from 'react';
import { create } from 'zustand';
import type { TeamProfile } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { toPublicStorageUrl } from '@/lib/storage';

const CACHE_KEY = 'bnss-team-profiles-cache-v1';

type TeamProfileRow = {
  id: string;
  member_id?: string | null;
  full_name?: string | null;
  role_title?: string | null;
  joined_date?: string | null;
  short_bio?: string | null;
  focus?: string | null;
  contribution?: string | null;
  current_work?: string | null;
  photo_url?: string | null;
  tags?: unknown;
  is_founder?: boolean | null;
  is_featured?: boolean | null;
  sort_order?: number | null;
};

type TeamStatus = 'idle' | 'loading' | 'ready' | 'error' | 'demo';

const isBrowser = typeof window !== 'undefined';

const parseTags = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
};

export const mapTeamProfileRow = (row: TeamProfileRow): TeamProfile => ({
  id: row.id,
  memberId: row.member_id ?? null,
  fullName: row.full_name?.trim() || 'Student Startups Member',
  roleTitle: row.role_title?.trim() || 'Member',
  joinedDate: row.joined_date ?? '',
  shortBio: row.short_bio?.trim() || 'Contributing to the Student Startups operating system.',
  focus: row.focus?.trim() || 'Building practical judgment through real work.',
  contribution: row.contribution?.trim() || 'Supports projects through execution, review, and iteration.',
  currentWork: row.current_work?.trim() || 'Active across current Student Startups work.',
  photoUrl: toPublicStorageUrl(row.photo_url ?? ''),
  tags: parseTags(row.tags),
  isFounder: Boolean(row.is_founder),
  isFeatured: Boolean(row.is_featured),
  sortOrder: Number(row.sort_order) || 0,
});

const readCache = (): TeamProfile[] => {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as TeamProfile[] : [];
  } catch {
    return [];
  }
};

const writeCache = (profiles: TeamProfile[]) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(profiles));
  } catch {
    // Keep the public page usable even if browser storage is unavailable.
  }
};

export const useTeamStore = create<{
  profiles: TeamProfile[];
  status: TeamStatus;
  error: string | null;
  hydrate: () => Promise<void>;
}>((set) => ({
  profiles: readCache(),
  status: 'idle',
  error: null,
  hydrate: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ profiles: readCache(), status: 'demo', error: null });
      return;
    }

    set({ status: 'loading', error: null });

    const { data, error } = await supabase
      .from('team_profiles')
      .select('*')
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('full_name', { ascending: true });

    if (error) {
      const cached = readCache();
      set({ profiles: cached, status: cached.length ? 'ready' : 'error', error: error.message });
      return;
    }

    const profiles = ((data as TeamProfileRow[] | null) ?? []).map(mapTeamProfileRow);
    writeCache(profiles);
    set({ profiles, status: 'ready', error: null });
  },
}));

export function useTeamSync() {
  const hydrate = useTeamStore((state) => state.hydrate);

  useEffect(() => {
    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

    hydrate();

    if (!isSupabaseConfigured || !supabase) return () => {};

    channel = supabase
      .channel('team-profiles-public-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_profiles' }, () => {
        hydrate();
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [hydrate]);
}
