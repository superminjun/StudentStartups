import { supabase } from '@/lib/supabaseClient';

type StorageLocation = { bucket: string; path: string };

const cache = new Map<string, string>();

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

export const resolveStorageUrl = async (url: string, expiresInSeconds = 60 * 60 * 24): Promise<string> => {
  if (!url) return url;
  if (url.includes('/storage/v1/object/sign/')) {
    const base = url.split('?')[0];
    const publicUrl = base.replace('/storage/v1/object/sign/', '/storage/v1/object/public/');
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

export const toPublicStorageUrl = (url: string): string => {
  if (!url) return url;
  if (url.includes('/storage/v1/object/sign/')) {
    const base = url.split('?')[0];
    return base.replace('/storage/v1/object/sign/', '/storage/v1/object/public/');
  }
  return url;
};
