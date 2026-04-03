import { useEffect } from 'react';
import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { hexToHsl, normalizeHex } from '@/lib/color';

const STORAGE_KEY = 'bnss-admin-theme';
const CACHE_KEY = 'bnss-site-theme-cache';
const TABLE_NAME = 'site_theme';
const SINGLETON_ID = 'global';

const defaultTheme = {
  fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  fontBody: "'Inter', system-ui, -apple-system, sans-serif",
  fontHeading: "'Inter', system-ui, -apple-system, sans-serif",
  baseFontSize: '16px',
  radius: '0.5rem',
  colorBeige: '#f5f2ef',
  colorBeigeDark: '#e9e6e2',
  colorWarmWhite: '#fbfaf8',
  colorCharcoal: '#2a2522',
  colorDark: '#3d3734',
  colorMid: '#78716d',
  colorLight: '#a39c99',
  colorAccent: '#e66b19',
  colorAccentSoft: '#faf1eb',
};

export type SiteTheme = typeof defaultTheme;
type ColorMode = 'light' | 'dark';

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

const getSystemColorMode = (): ColorMode => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

let preferredMode: ColorMode = getSystemColorMode();

const resolveMode = (mode?: ColorMode): ColorMode => mode ?? getSystemColorMode();

const deriveDarkTheme = (theme: SiteTheme): SiteTheme => ({
  ...theme,
  // Warm charcoal base with a soft, editorial feel
  colorBeige: '#1a1715',       // page background
  colorBeigeDark: '#25211f',   // muted background
  colorWarmWhite: '#2a2522',   // card/surface (requested tone)
  colorCharcoal: '#f6f1ed',    // primary text
  colorDark: '#e1d8d1',        // strong text
  colorMid: '#b8aea6',         // secondary text
  colorLight: '#8d847d',       // tertiary text
  colorAccent: '#e9a46a',      // warm highlight
  colorAccentSoft: '#3a2f29',  // accent surface
});

const applyThemeToDocument = (theme: SiteTheme, mode?: ColorMode) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const resolvedMode = resolveMode(mode);
  preferredMode = resolvedMode;
  root.classList.toggle('dark', resolvedMode === 'dark');
  root.style.colorScheme = resolvedMode;
  const setVar = (name: string, value: string) => root.style.setProperty(name, value);

  const fallbackTheme = resolvedMode === 'dark' ? deriveDarkTheme(defaultTheme) : defaultTheme;
  const palette = resolvedMode === 'dark' ? deriveDarkTheme(theme) : theme;

  const beige = normalizeThemeColor(palette.colorBeige, fallbackTheme.colorBeige);
  const beigeDark = normalizeThemeColor(palette.colorBeigeDark, fallbackTheme.colorBeigeDark);
  const warmWhite = normalizeThemeColor(palette.colorWarmWhite, fallbackTheme.colorWarmWhite);
  const charcoal = normalizeThemeColor(palette.colorCharcoal, fallbackTheme.colorCharcoal);
  const dark = normalizeThemeColor(palette.colorDark, fallbackTheme.colorDark);
  const mid = normalizeThemeColor(palette.colorMid, fallbackTheme.colorMid);
  const light = normalizeThemeColor(palette.colorLight, fallbackTheme.colorLight);
  const accent = normalizeThemeColor(palette.colorAccent, fallbackTheme.colorAccent);
  const accentSoft = normalizeThemeColor(palette.colorAccentSoft, fallbackTheme.colorAccentSoft);

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

  const sidebarBackground = resolvedMode === 'dark' ? beige : charcoal;
  const sidebarForeground = resolvedMode === 'dark' ? charcoal : beige;
  const sidebarAccent = resolvedMode === 'dark' ? beigeDark : dark;
  const sidebarBorder = resolvedMode === 'dark' ? beigeDark : dark;

  setVar('--sidebar-background', hexToHsl(sidebarBackground));
  setVar('--sidebar-foreground', hexToHsl(sidebarForeground));
  setVar('--sidebar-primary', hexToHsl(accent));
  setVar('--sidebar-primary-foreground', '0 0% 100%');
  setVar('--sidebar-accent', hexToHsl(sidebarAccent));
  setVar('--sidebar-accent-foreground', hexToHsl(sidebarForeground));
  setVar('--sidebar-border', hexToHsl(sidebarBorder));
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
    return readCache() ?? defaultTheme;
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultTheme;
  try {
    const parsed = JSON.parse(saved) as Partial<SiteTheme>;
    return { ...defaultTheme, ...parsed };
  } catch {
    return defaultTheme;
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
    writeCache(mapped);
    set({ theme: mapped, status: 'ready' });
    applyThemeToDocument(mapped);
  },
  updateTheme: async (next) => {
    const merged = { ...get().theme, ...next };
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

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return () => {};

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const nextMode: ColorMode = media.matches ? 'dark' : 'light';
      const currentTheme = useSiteThemeStore.getState().theme;
      applyThemeToDocument(currentTheme, nextMode);
    };

    handleChange();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);
}
