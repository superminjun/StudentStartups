import { useEffect, useMemo, useState } from 'react';
import { Copy, Trash2, Upload } from 'lucide-react';
import { deleteAdminFileByUrl, uploadAdminFile } from '@/lib/adminMedia';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { toPublicStorageUrl } from '@/lib/storage';
import type { MediaItem } from '@/types';

type MediaRow = {
  id: string;
  title: string | null;
  bucket: string;
  file_path: string;
  public_url: string;
  category: string | null;
  alt_text: string | null;
  attached_type: string | null;
  attached_id: string | null;
  created_at: string | null;
};

function createMediaId() {
  return `media-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function MediaLibraryPanel() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [bucket, setBucket] = useState<'site-images' | 'project-images' | 'product-images'>('site-images');
  const [category, setCategory] = useState('general');
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [attachedType, setAttachedType] = useState('');
  const [attachedId, setAttachedId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const stats = useMemo(() => ({
    total: items.length,
    site: items.filter((item) => item.bucket === 'site-images').length,
    project: items.filter((item) => item.bucket === 'project-images').length,
    product: items.filter((item) => item.bucket === 'product-images').length,
  }), [items]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        if (!isSupabaseConfigured || !supabase) {
          if (!cancelled) setItems([]);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('media_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (!cancelled) {
          setItems(
            ((data ?? []) as MediaRow[]).map((row) => ({
              id: row.id,
              title: row.title ?? '',
              bucket: row.bucket,
              path: row.file_path,
              publicUrl: toPublicStorageUrl(row.public_url),
              category: row.category ?? 'general',
              altText: row.alt_text ?? '',
              attachedType: row.attached_type ?? '',
              attachedId: row.attached_id ?? '',
              createdAt: row.created_at ?? '',
            }))
          );
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Could not load the media library.');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    setError('');
    setNotice('');

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase is required for the media library.');
      }

      const safeName = file.name.replace(/\s+/g, '-');
      const path = `library/${Date.now()}-${safeName}`;
      const publicUrl = await uploadAdminFile(bucket, path, file);
      const payload = {
        id: createMediaId(),
        title: title.trim() || safeName,
        bucket,
        file_path: path,
        public_url: publicUrl,
        category: category.trim() || 'general',
        alt_text: altText.trim(),
        attached_type: attachedType.trim() || null,
        attached_id: attachedId.trim() || null,
      };

      const { error: insertError } = await supabase.from('media_items').insert(payload);
      if (insertError) throw insertError;

      setItems((prev) => [
        {
          id: payload.id,
          title: payload.title,
          bucket: payload.bucket,
          path: payload.file_path,
          publicUrl: payload.public_url,
          category: payload.category,
          altText: payload.alt_text,
          attachedType: payload.attached_type ?? '',
          attachedId: payload.attached_id ?? '',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setTitle('');
      setAltText('');
      setAttachedType('');
      setAttachedId('');
      setNotice('Media uploaded.');
      window.setTimeout(() => setNotice(''), 1800);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not upload media.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase is required for deleting media.');
      }

      await deleteAdminFileByUrl(item.publicUrl);
      const { error: deleteError } = await supabase.from('media_items').delete().eq('id', item.id);
      if (deleteError) throw deleteError;
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      setNotice('Media removed.');
      window.setTimeout(() => setNotice(''), 1600);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not remove the media item.');
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice('URL copied.');
      window.setTimeout(() => setNotice(''), 1200);
    } catch {
      setError('Could not copy the URL.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-charcoal">Media Library</h3>
            <p className="mt-1 text-xs text-light">
              Upload images once, keep them organized, and reuse the public URLs in team profiles, projects, story sections, and build log posts.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-light">All media</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-light">Site</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal">{stats.site}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-light">Project / Product</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal">{stats.project + stats.product}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold text-charcoal">Upload Media</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-mid">Bucket</label>
            <select
              value={bucket}
              onChange={(e) => setBucket(e.target.value as typeof bucket)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            >
              <option value="site-images">site-images</option>
              <option value="project-images">project-images</option>
              <option value="product-images">product-images</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-mid">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
              placeholder="team / journal / story / project"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-mid">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
              placeholder="Team working session"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-mid">Alt text</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
              placeholder="Students reviewing prototypes"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-mid">Attached type (optional)</label>
            <input
              type="text"
              value={attachedType}
              onChange={(e) => setAttachedType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
              placeholder="member / project / journal"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-mid">Attached id (optional)</label>
            <input
              type="text"
              value={attachedId}
              onChange={(e) => setAttachedId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
              placeholder="member id / project id / post id"
            />
          </div>
        </div>
        <label className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-stone-50">
          <Upload className="size-3.5" />
          {uploading ? 'Uploading...' : 'Upload file'}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
        </label>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold text-charcoal">Uploaded Media</h4>
        {loading ? (
          <p className="mt-4 text-xs text-light">Loading media…</p>
        ) : items.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-xs text-light">
            No media items yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="aspect-[4/3] bg-muted/50">
                  <img src={item.publicUrl} alt={item.altText || item.title} className="size-full object-cover" loading="lazy" />
                </div>
                <div className="space-y-2 p-4">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{item.title || 'Untitled media'}</p>
                    <p className="mt-1 text-[11px] text-light">{item.bucket} · {item.category || 'general'}</p>
                  </div>
                  {(item.attachedType || item.attachedId) && (
                    <p className="text-[11px] text-mid">
                      Linked to: {item.attachedType || 'item'} {item.attachedId ? `· ${item.attachedId}` : ''}
                    </p>
                  )}
                  <p className="truncate text-[11px] text-mid">{item.publicUrl}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.publicUrl)}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-stone-50"
                    >
                      <Copy className="size-3.5" />
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:text-red-700"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs">
        <span className={error ? 'text-red-500' : 'text-emerald-600'}>{error || notice}</span>
      </div>
    </div>
  );
}
