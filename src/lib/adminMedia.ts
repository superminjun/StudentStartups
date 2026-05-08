import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { parseStorageUrl, toPublicStorageUrl } from '@/lib/storage';

export async function uploadAdminFile(bucket: string, path: string, file: File) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || undefined,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return toPublicStorageUrl(data.publicUrl);
}

export async function deleteAdminFileByUrl(url: string) {
  if (!isSupabaseConfigured || !supabase || !url) return;

  const location = parseStorageUrl(url);
  if (!location) return;

  const { error } = await supabase.storage.from(location.bucket).remove([location.path]);
  if (error) {
    throw error;
  }
}

export function slugifyAdminText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'entry';
}
