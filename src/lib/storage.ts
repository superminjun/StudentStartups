import { supabase } from '@/lib/supabaseClient';

type StorageLocation = { bucket: string; path: string };

const cache = new Map<string, string>();
const preloadedImages = new Set<string>();
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');

export const parseStorageUrl = (url: string): StorageLocation | null => {
  try {
    const parsed = new URL(url);
    const marker = '/storage/v1/object/';
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;
    const after = parsed.pathname.slice(idx + marker.length);
    const trimmed = after.startsWith('public/') ? after.slice('public/'.length) : after;
    const [bucket, ...rest] = trimmed.split('/');
    if (!bucket || rest.length === 0) return null;
    return { bucket, path: rest.join('/') };
  } catch {
    return null;
  }
};

export const toPublicStorageUrl = (url: string): string => {
  if (!url) return url;

  const base = url.split('?')[0];

  if (base.includes('/storage/v1/object/sign/')) {
    return base.replace('/storage/v1/object/sign/', '/storage/v1/object/public/');
  }

  if (base.includes('/storage/v1/object/public/')) {
    return base;
  }

  const location = parseStorageUrl(base);
  if (!location || !supabaseUrl) return url;

  return `${supabaseUrl}/storage/v1/object/public/${location.bucket}/${location.path}`;
};

export const resolveStorageUrl = async (url: string, expiresInSeconds = 60 * 60 * 24): Promise<string> => {
  if (!url) return url;

  const publicUrl = toPublicStorageUrl(url);
  if (publicUrl !== url || publicUrl.includes('/storage/v1/object/public/')) {
    cache.set(url, publicUrl);
    return publicUrl;
  }

  if (cache.has(url)) return cache.get(url) as string;
  if (!supabase) return url;

  const location = parseStorageUrl(url);
  if (!location) return url;

  const { data, error } = await supabase.storage
    .from(location.bucket)
    .createSignedUrl(location.path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    cache.set(url, url);
    return url;
  }

  cache.set(url, data.signedUrl);
  return data.signedUrl;
};

export const preloadImage = (url: string) => {
  if (typeof window === 'undefined' || !url || preloadedImages.has(url)) return;

  preloadedImages.add(url);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
};

export const preloadImages = (urls: string[]) => {
  urls.forEach(preloadImage);
};
