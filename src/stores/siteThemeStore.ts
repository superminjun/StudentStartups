import { useEffect } from 'react';
import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { hexToHsl, normalizeHex } from '@/lib/color';

const STORAGE_KEY = 'bnss-admin-theme';
const CACHE_KEY = 'bnss-site-theme-cache';
const TABLE_NAME = 'site_theme';
const SINGLETON_ID = 'global';

const BRAND_PALETTE = {
  colorBeige: '#faf1eb',
  colorWarmWhite: '#faf1eb',
  colorBeigeDark: '#faf1eb',
  colorCharcoal: '#2a2522',
  colorDark: '#2a2522',
  colorMid: '#2a2522',
  colorLight: '#2a2522',
  colorAccentSoft: '#faf1eb',
};

const defaultTheme = {
  fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  fontBody: "'Inter', system-ui, -apple-system, sans-serif",
  fontHeading: "'Inter', system-ui, -apple-system, sans-serif",
  baseFontSize: '16px',
  radius: '0.5rem',
  colorBeige: BRAND_PALETTE.colorBeige,
  colorBeigeDark: BRAND_PALETTE.colorBeigeDark,
  colorWarmWhite: BRAND_PALETTE.colorWarmWhite,
  colorCharcoal: BRAND_PALETTE.colorCharcoal,
  colorDark: BRAND_PALETTE.colorDark,
  colorMid: BRAND_PALETTE.colorMid,
  colorLight: BRAND_PALETTE.colorLight,
  colorAccent: '#e66b19',
  colorAccentSoft: BRAND_PALETTE.colorAccentSoft,
};

export type SiteTheme = typeof defaultTheme;

type SiteThemeRow = {
  id: string;
  font_url: string | null;
  font_body: string | null;
  font_heading: string | null;
  base_font_size: string | null;
  radius: string | null;
  color_beige: string | null;
  color_beige_dark: string | null;
  color_warm_white: string | null;
  color_charcoal: string | null;
  color_dark: string | null;
  color_mid: string | null;
  color_light: string | null;
  color_accent: string | null;
  color_accent_soft: string | null;
};

type SiteThemeStatus = 'idle' | 'loading' | 'ready' | 'error' | 'demo';

const mapRowToTheme = (row: SiteThemeRow | null): SiteTheme => ({
  fontUrl: row?.font_url ?? defaultTheme.fontUrl,
  fontBody: row?.font_body ?? defaultTheme.fontBody,
  fontHeading: row?.font_heading ?? defaultTheme.fontHeading,
  baseFontSize: row?.base_font_size ?? defaultTheme.baseFontSize,
  radius: row?.radius ?? defaultTheme.radius,
  colorBeige: row?.color_beige ?? defaultTheme.colorBeige,
  colorBeigeDark: row?.color_beige_dark ?? defaultTheme.colorBeigeDark,
  colorWarmWhite: row?.color_warm_white ?? defaultTheme.colorWarmWhite,
  colorCharcoal: row?.color_charcoal ?? defaultTheme.colorCharcoal,
  colorDark: row?.color_dark ?? defaultTheme.colorDark,
  colorMid: row?.color_mid ?? defaultTheme.colorMid,
  colorLight: row?.color_light ?? defaultTheme.colorLight,
  colorAccent: row?.color_accent ?? defaultTheme.colorAccent,
  colorAccentSoft: row?.color_accent_soft ?? defaultTheme.colorAccentSoft,
});

const applyBrandPalette = (theme: SiteTheme): SiteTheme => ({
  ...theme,
  ...BRAND_PALETTE,
});

const isBrandPalette = (theme: SiteTheme): boolean =>
  Object.entries(BRAND_PALETTE).every(([key, value]) => normalizeHex((theme as SiteTheme)[key as keyof SiteTheme] as string) === normalizeHex(value));

const mapThemeToRow = (theme: SiteTheme): SiteThemeRow => ({
  id: SINGLETON_ID,
  font_url: theme.fontUrl,
  font_body: theme.fontBody,
  font_heading: theme.fontHeading,
  base_font_size: theme.baseFontSize,
  radius: theme.radius,
  color_beige: theme.colorBeige,
  color_beige_dark: theme.colorBeigeDark,
  color_warm_white: theme.colorWarmWhite,
  color_charcoal: theme.colorCharcoal,
  color_dark: theme.colorDark,
  color_mid: theme.colorMid,
  color_light: theme.colorLight,
  color_accent: theme.colorAccent,
  color_accent_soft: theme.colorAccentSoft,
});

const normalizeThemeColor = (value: string, fallback: string) => normalizeHex(value) ?? fallback;

const applyThemeToDocument = (theme: SiteTheme) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const setVar = (name: string, value: string) => root.style.setProperty(name, value);

  const beige = normalizeThemeColor(theme.colorBeige, defaultTheme.colorBeige);
  const beigeDark = normalizeThemeColor(theme.colorBeigeDark, defaultTheme.colorBeigeDark);
  const warmWhite = normalizeThemeColor(theme.colorWarmWhite, defaultTheme.colorWarmWhite);
  const charcoal = normalizeThemeColor(theme.colorCharcoal, defaultTheme.colorCharcoal);
  const dark = normalizeThemeColor(theme.colorDark, defaultTheme.colorDark);
  const mid = normalizeThemeColor(theme.colorMid, defaultTheme.colorMid);
  const light = normalizeThemeColor(theme.colorLight, defaultTheme.colorLight);
  const accent = normalizeThemeColor(theme.colorAccent, defaultTheme.colorAccent);
  const accentSoft = normalizeThemeColor(theme.colorAccentSoft, defaultTheme.colorAccentSoft);

  setVar('--font-body', theme.fontBody || defaultTheme.fontBody);
  setVar('--font-heading', theme.fontHeading || theme.fontBody || defaultTheme.fontHeading);
  setVar('--font-size-base', theme.baseFontSize || defaultTheme.baseFontSize);
  setVar('--radius', theme.radius || defaultTheme.radius);

  setVar('--color-beige', hexToHsl(beige));
  setVar('--color-beige-dark', hexToHsl(beigeDark));
  setVar('--color-warm-white', hexToHsl(warmWhite));
  setVar('--color-charcoal', hexToHsl(charcoal));
  setVar('--color-dark', hexToHsl(dark));
  setVar('--color-mid', hexToHsl(mid));
  setVar('--color-light', hexToHsl(light));
  setVar('--color-accent', hexToHsl(accent));
  setVar('--color-accent-soft', hexToHsl(accentSoft));

  setVar('--background', hexToHsl(beige));
  setVar('--foreground', hexToHsl(charcoal));
  setVar('--card', hexToHsl(warmWhite));
  setVar('--card-foreground', hexToHsl(charcoal));
  setVar('--popover', hexToHsl(warmWhite));
  setVar('--popover-foreground', hexToHsl(charcoal));
  setVar('--primary', hexToHsl(charcoal));
  setVar('--primary-foreground', hexToHsl(beige));
  setVar('--secondary', hexToHsl(beigeDark));
  setVar('--secondary-foreground', hexToHsl(charcoal));
  setVar('--muted', hexToHsl(beigeDark));
  setVar('--muted-foreground', hexToHsl(mid));
  setVar('--accent', hexToHsl(accent));
  setVar('--accent-foreground', '0 0% 100%');
  setVar('--destructive', '0 72% 51%');
  setVar('--destructive-foreground', '0 0% 100%');
  setVar('--border', hexToHsl(beigeDark));
  setVar('--input', hexToHsl(beigeDark));
  setVar('--ring', hexToHsl(accent));

  setVar('--sidebar-background', hexToHsl(charcoal));
  setVar('--sidebar-foreground', hexToHsl(beige));
  setVar('--sidebar-primary', hexToHsl(accent));
  setVar('--sidebar-primary-foreground', '0 0% 100%');
  setVar('--sidebar-accent', hexToHsl(dark));
  setVar('--sidebar-accent-foreground', hexToHsl(beige));
  setVar('--sidebar-border', hexToHsl(dark));
  setVar('--sidebar-ring', hexToHsl(accent));

  root.style.fontSize = theme.baseFontSize || defaultTheme.baseFontSize;

  const linkId = 'site-theme-fonts';
  const existing = document.getElementById(linkId) as HTMLLinkElement | null;
  if (theme.fontUrl) {
    if (existing) {
      existing.href = theme.fontUrl;
    } else {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = theme.fontUrl;
      document.head.appendChild(link);
    }
  } else if (existing) {
    existing.remove();
  }
};

const isBrowser = typeof window !== 'undefined';

const readCache = (): SiteTheme | null => {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SiteTheme;
  } catch {
    return null;
  }
};

const writeCache = (theme: SiteTheme) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(theme));
  } catch {
    // ignore
  }
};

const loadFallback = (): SiteTheme => {
  if (!isBrowser) return defaultTheme;
  if (isSupabaseConfigured) {
    const cached = readCache() ?? defaultTheme;
    return applyBrandPalette(cached);
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return applyBrandPalette(defaultTheme);
  try {
    const parsed = JSON.parse(saved) as Partial<SiteTheme>;
    return applyBrandPalette({ ...defaultTheme, ...parsed });
  } catch {
    return applyBrandPalette(defaultTheme);
  }
};

export const useSiteThemeStore = create<{
  theme: SiteTheme;
  status: SiteThemeStatus;
  error: string | null;
  hydrate: () => Promise<void>;
  updateTheme: (next: Partial<SiteTheme>) => Promise<void>;
}>((set, get) => ({
  theme: loadFallback(),
  status: 'idle',
  error: null,
  hydrate: async () => {
    if (!isSupabaseConfigured || !supabase) {
      const fallback = loadFallback();
      set({ status: 'demo', theme: fallback });
      applyThemeToDocument(fallback);
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

    const mapped = mapRowToTheme(data as SiteThemeRow | null);
    const branded = applyBrandPalette(mapped);
    writeCache(branded);
    set({ theme: branded, status: 'ready' });
    applyThemeToDocument(branded);
    if (!isBrandPalette(mapped)) {
      await supabase.from(TABLE_NAME).upsert(mapThemeToRow(branded));
    }
  },
  updateTheme: async (next) => {
    const merged = applyBrandPalette({ ...get().theme, ...next });
    set({ theme: merged });
    applyThemeToDocument(merged);

    if (!isSupabaseConfigured || !supabase) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      return;
    }

    const { error } = await supabase.from(TABLE_NAME).upsert(mapThemeToRow(merged));
    if (error) {
      set({ status: 'error', error: error.message });
    } else {
      writeCache(merged);
      set({ status: 'ready', error: null });
    }
  },
}));

export function useSiteThemeSync() {
  const hydrate = useSiteThemeStore((s) => s.hydrate);

  useEffect(() => {
    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

    hydrate();

    if (!isSupabaseConfigured || !supabase) return () => {};

    channel = supabase
      .channel('site-theme-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE_NAME, filter: `id=eq.${SINGLETON_ID}` },
        (payload) => {
          const next = mapRowToTheme(payload.new as SiteThemeRow);
          writeCache(next);
          useSiteThemeStore.setState({ theme: next, status: 'ready', error: null });
          applyThemeToDocument(next);
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [hydrate]);
}
