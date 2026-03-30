import { useEffect } from 'react';
import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

const TABLE_NAME = 'site_copy';

export type SiteCopyEntry = {
  en?: string | null;
  ko?: string | null;
};

type SiteCopyRow = {
  key: string;
  value_en: string | null;
  value_ko: string | null;
};

type SiteCopyStatus = 'idle' | 'loading' | 'ready' | 'error' | 'demo';

const mapRowsToCopy = (rows: SiteCopyRow[] | null): Record<string, SiteCopyEntry> => {
  const copy: Record<string, SiteCopyEntry> = {};
  (rows ?? []).forEach((row) => {
    copy[row.key] = { en: row.value_en, ko: row.value_ko };
  });
  return copy;
};

export const useSiteCopyStore = create<{
  copy: Record<string, SiteCopyEntry>;
  status: SiteCopyStatus;
  error: string | null;
  hydrate: () => Promise<void>;
  upsertMany: (rows: SiteCopyRow[]) => Promise<void>;
}>((set) => ({
  copy: {},
  status: 'idle',
  error: null,
  hydrate: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ status: 'demo', copy: {} });
      return;
    }

    set({ status: 'loading', error: null });
    const { data, error } = await supabase.from(TABLE_NAME).select('*');
    if (error) {
      set({ status: 'error', error: error.message });
      return;
    }
    set({ copy: mapRowsToCopy(data as SiteCopyRow[] | null), status: 'ready', error: null });
  },
  upsertMany: async (rows) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from(TABLE_NAME).upsert(rows);
    if (error) {
      set({ status: 'error', error: error.message });
    } else {
      set({ status: 'ready', error: null });
    }
  },
}));

export function useSiteCopySync() {
  const hydrate = useSiteCopyStore((s) => s.hydrate);

  useEffect(() => {
    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

    hydrate();

    if (!isSupabaseConfigured || !supabase) return () => {};

    channel = supabase
      .channel('site-copy-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, () => hydrate())
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [hydrate]);
}
