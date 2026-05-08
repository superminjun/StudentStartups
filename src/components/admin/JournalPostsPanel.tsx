import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { slugifyAdminText, uploadAdminFile } from '@/lib/adminMedia';
import { useJournalStore } from '@/stores/journalStore';
import type { JournalPost } from '@/types';

const CACHE_KEY = 'bnss-journal-cache';

type MemberOption = {
  id: string;
  label: string;
};

type JournalPostsPanelProps = {
  memberOptions: MemberOption[];
};

function createPostDraft(): JournalPost {
  const stamp = Date.now().toString(36);
  return {
    id: `journal-${stamp}`,
    slug: `entry-${stamp}`,
    titleEn: '',
    titleKo: '',
    date: new Date().toISOString().slice(0, 10),
    author: 'Student Startups',
    category: 'Reflection',
    summaryEn: '',
    summaryKo: '',
    contentEn: '',
    contentKo: '',
    lessonsEn: '',
    lessonsKo: '',
    coverImage: '',
    tags: [],
    published: false,
    featured: false,
    order: 0,
  };
}

const parseTags = (value: string) =>
  Array.from(new Set(value.split(',').map((tag) => tag.trim()).filter(Boolean)));

export default function JournalPostsPanel({ memberOptions }: JournalPostsPanelProps) {
  const posts = useJournalStore((state) => state.posts);
  const hydrate = useJournalStore((state) => state.hydrate);
  const [drafts, setDrafts] = useState<JournalPost[]>(posts);
  const [selectedId, setSelectedId] = useState<string | null>(posts[0]?.id ?? null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setDrafts(posts);
    setSelectedId((current) => current ?? posts[0]?.id ?? null);
  }, [posts]);

  const selectedPost = drafts.find((post) => post.id === selectedId) ?? null;

  const stats = useMemo(() => ({
    total: drafts.length,
    published: drafts.filter((post) => post.published).length,
    featured: drafts.filter((post) => post.featured).length,
  }), [drafts]);

  const updatePost = (id: string, patch: Partial<JournalPost>) => {
    setDrafts((prev) => prev.map((post) => (post.id === id ? { ...post, ...patch } : post)));
  };

  const persistLocal = (nextPosts: JournalPost[]) => {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(nextPosts));
    useJournalStore.setState({ posts: nextPosts, status: 'fallback', error: null });
  };

  const handleSave = async (post: JournalPost) => {
    const cleanSlug = slugifyAdminText(post.slug || post.titleEn || post.titleKo);
    const nextPost = { ...post, slug: cleanSlug };
    updatePost(post.id, { slug: cleanSlug });
    setSavingId(post.id);
    setNotice('');
    setError('');

    const payload = {
      id: nextPost.id,
      slug: cleanSlug,
      title_en: nextPost.titleEn,
      title_ko: nextPost.titleKo || nextPost.titleEn,
      date: nextPost.date,
      author_name: nextPost.author,
      author_id: nextPost.authorId ?? null,
      category: nextPost.category,
      summary_en: nextPost.summaryEn,
      summary_ko: nextPost.summaryKo || nextPost.summaryEn,
      content_en: nextPost.contentEn,
      content_ko: nextPost.contentKo || nextPost.contentEn,
      lessons_en: nextPost.lessonsEn ?? '',
      lessons_ko: nextPost.lessonsKo ?? '',
      cover_image_url: nextPost.coverImage ?? '',
      tags: nextPost.tags,
      published: nextPost.published,
      featured: nextPost.featured,
      sort_order: Number(nextPost.order) || 0,
    };

    try {
      if (!isSupabaseConfigured || !supabase) {
        const nextPosts = drafts.map((entry) => (entry.id === nextPost.id ? nextPost : entry));
        persistLocal(nextPosts);
      } else {
        const { error: saveError } = await supabase.from('journal_posts').upsert(payload);
        if (saveError) throw saveError;
        await hydrate();
      }

      setNotice('Build log entry saved.');
      window.setTimeout(() => setNotice(''), 1800);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not save the build log entry.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (postId: string) => {
    const nextPosts = drafts.filter((post) => post.id !== postId);
    setDrafts(nextPosts);
    if (selectedId === postId) {
      setSelectedId(nextPosts[0]?.id ?? null);
    }

    try {
      if (!isSupabaseConfigured || !supabase) {
        persistLocal(nextPosts);
      } else {
        const { error: deleteError } = await supabase.from('journal_posts').delete().eq('id', postId);
        if (deleteError) throw deleteError;
        await hydrate();
      }
      setNotice('Build log entry removed.');
      window.setTimeout(() => setNotice(''), 1600);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not remove the build log entry.');
    }
  };

  const handleUploadCover = async (postId: string, file?: File | null) => {
    if (!file) return;
    setUploadingId(postId);
    setError('');

    try {
      const safeName = file.name.replace(/\s+/g, '-');
      const publicUrl = await uploadAdminFile('site-images', `journal/${Date.now()}-${safeName}`, file);
      updatePost(postId, { coverImage: publicUrl });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not upload the cover image.');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-charcoal">Build Log</h3>
            <p className="mt-1 text-xs text-light">
              Publish meeting notes, milestones, reflections, and behind-the-scenes updates so the site feels lived in.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-light">Entries</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-light">Published</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal">{stats.published}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-light">Featured</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal">{stats.featured}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px,minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-charcoal">Posts</h4>
            <button
              type="button"
              onClick={() => {
                const nextPost = createPostDraft();
                setDrafts((prev) => [nextPost, ...prev]);
                setSelectedId(nextPost.id);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-stone-50"
            >
              <Plus className="size-3.5" />
              Add Post
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {drafts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedId(post.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  selectedId === post.id ? 'border-charcoal bg-muted/30' : 'border-border hover:border-charcoal/30'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-charcoal">{post.titleEn || 'Untitled post'}</p>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                    post.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-light">{post.category} · {post.date || 'No date set'}</p>
              </button>
            ))}
            {drafts.length === 0 && (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-xs text-light">
                No build log posts yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          {selectedPost ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">Post Editor</h4>
                  <p className="mt-1 text-xs text-light">Publish milestones, reflections, or behind-the-scenes notes.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedPost.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:text-red-700"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(selectedPost)}
                    disabled={savingId === selectedPost.id}
                    className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[hsl(20,8%,28%)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingId === selectedPost.id ? 'Saving...' : 'Save Post'}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-mid">Title (EN)</label>
                  <input
                    type="text"
                    value={selectedPost.titleEn}
                    onChange={(e) => updatePost(selectedPost.id, { titleEn: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Title (KO)</label>
                  <input
                    type="text"
                    value={selectedPost.titleKo}
                    onChange={(e) => updatePost(selectedPost.id, { titleKo: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Slug</label>
                  <input
                    type="text"
                    value={selectedPost.slug}
                    onChange={(e) => updatePost(selectedPost.id, { slug: slugifyAdminText(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Date</label>
                  <input
                    type="date"
                    value={selectedPost.date}
                    onChange={(e) => updatePost(selectedPost.id, { date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Author</label>
                  <input
                    type="text"
                    value={selectedPost.author}
                    onChange={(e) => updatePost(selectedPost.id, { author: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Author link</label>
                  <select
                    value={selectedPost.authorId ?? ''}
                    onChange={(e) => updatePost(selectedPost.id, { authorId: e.target.value || undefined })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  >
                    <option value="">Manual author name</option>
                    {memberOptions.map((member) => (
                      <option key={member.id} value={member.id}>{member.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Category</label>
                  <input
                    type="text"
                    value={selectedPost.category}
                    onChange={(e) => updatePost(selectedPost.id, { category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    placeholder="Design / Meeting / Website / Reflection"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Tags</label>
                  <input
                    type="text"
                    value={selectedPost.tags.join(', ')}
                    onChange={(e) => updatePost(selectedPost.id, { tags: parseTags(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    placeholder="design, prototype, feedback"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-charcoal">
                    <input
                      type="checkbox"
                      checked={selectedPost.published}
                      onChange={(e) => updatePost(selectedPost.id, { published: e.target.checked })}
                    />
                    Published
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-charcoal">
                    <input
                      type="checkbox"
                      checked={selectedPost.featured}
                      onChange={(e) => updatePost(selectedPost.id, { featured: e.target.checked })}
                    />
                    Featured
                  </label>
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Display order</label>
                  <input
                    type="number"
                    value={selectedPost.order}
                    onChange={(e) => updatePost(selectedPost.id, { order: Number(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-mid">Summary (EN)</label>
                  <textarea
                    value={selectedPost.summaryEn}
                    onChange={(e) => updatePost(selectedPost.id, { summaryEn: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-mid">Summary (KO)</label>
                  <textarea
                    value={selectedPost.summaryKo}
                    onChange={(e) => updatePost(selectedPost.id, { summaryKo: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-mid">Full content (EN)</label>
                  <textarea
                    value={selectedPost.contentEn}
                    onChange={(e) => updatePost(selectedPost.id, { contentEn: e.target.value })}
                    rows={10}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-mid">Full content (KO)</label>
                  <textarea
                    value={selectedPost.contentKo}
                    onChange={(e) => updatePost(selectedPost.id, { contentKo: e.target.value })}
                    rows={10}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-mid">What we learned (EN)</label>
                  <textarea
                    value={selectedPost.lessonsEn ?? ''}
                    onChange={(e) => updatePost(selectedPost.id, { lessonsEn: e.target.value })}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-mid">What we learned (KO)</label>
                  <textarea
                    value={selectedPost.lessonsKo ?? ''}
                    onChange={(e) => updatePost(selectedPost.id, { lessonsKo: e.target.value })}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Cover Image</p>
                    <p className="mt-1 text-xs text-light">Optional, but useful for homepage and build log previews.</p>
                  </div>
                  <label className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-stone-50">
                    {uploadingId === selectedPost.id ? 'Uploading...' : 'Upload Cover'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadCover(selectedPost.id, e.target.files?.[0])} />
                  </label>
                </div>
                {selectedPost.coverImage ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
                    <div className="aspect-[16/9] bg-muted/50">
                      <img src={selectedPost.coverImage} alt="" className="size-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3">
                      <p className="truncate text-[11px] text-mid">{selectedPost.coverImage}</p>
                      <button
                        type="button"
                        onClick={() => updatePost(selectedPost.id, { coverImage: '' })}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-xs text-light">
                    No cover image selected yet.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-light">
              Select a build log post to edit it.
            </div>
          )}
        </div>
      </div>

      <div className="text-xs">
        <span className={error ? 'text-red-500' : 'text-emerald-600'}>{error || notice}</span>
      </div>
    </div>
  );
}
