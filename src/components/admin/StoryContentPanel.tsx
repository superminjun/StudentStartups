import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { uploadAdminFile } from '@/lib/adminMedia';
import { useStoryStore, useStorySync } from '@/stores/storyStore';
import type { StoryContent, StoryMilestone } from '@/types';

const CACHE_KEY = 'bnss-story-cache';

function createMilestone(): StoryMilestone {
  return {
    date: new Date().toISOString().slice(0, 10),
    titleEn: '',
    titleKo: '',
    detailEn: '',
    detailKo: '',
  };
}

export default function StoryContentPanel() {
  useStorySync();
  const story = useStoryStore((state) => state.story);
  const hydrate = useStoryStore((state) => state.hydrate);
  const [draft, setDraft] = useState<StoryContent>(story);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(story);
  }, [story]);

  const updateDraft = (patch: Partial<StoryContent>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const updateTimelineEntry = (index: number, patch: Partial<StoryMilestone>) => {
    setDraft((prev) => ({
      ...prev,
      timeline: prev.timeline.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...patch } : entry)),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice('');
    setError('');

    const payload = {
      id: draft.id || 'global',
      eyebrow_en: draft.eyebrowEn,
      eyebrow_ko: draft.eyebrowKo,
      title_en: draft.titleEn,
      title_ko: draft.titleKo,
      intro_en: draft.introEn,
      intro_ko: draft.introKo,
      problem_en: draft.problemEn,
      problem_ko: draft.problemKo,
      why_started_en: draft.whyStartedEn,
      why_started_ko: draft.whyStartedKo,
      what_building_en: draft.whatBuildingEn,
      what_building_ko: draft.whatBuildingKo,
      how_we_work_en: draft.howWeWorkEn,
      how_we_work_ko: draft.howWeWorkKo,
      where_going_en: draft.whereGoingEn,
      where_going_ko: draft.whereGoingKo,
      quote_en: draft.quoteEn ?? '',
      quote_ko: draft.quoteKo ?? '',
      images: draft.images.filter(Boolean),
      timeline: draft.timeline,
    };

    try {
      if (!isSupabaseConfigured || !supabase) {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(draft));
        useStoryStore.setState({ story: draft, status: 'fallback', error: null });
      } else {
        const { error: saveError } = await supabase.from('story_content').upsert(payload);
        if (saveError) throw saveError;
        await hydrate();
      }

      setNotice('Story page saved.');
      window.setTimeout(() => setNotice(''), 1800);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not save the story page.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const safeName = file.name.replace(/\s+/g, '-');
      const publicUrl = await uploadAdminFile('site-images', `story/${Date.now()}-${safeName}`, file);
      updateDraft({ images: [...draft.images, publicUrl] });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not upload the image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-lg font-bold text-charcoal">Story Page</h3>
        <p className="mt-1 text-xs text-light">
          Shape the narrative behind Student Startups: why it exists, how the work happens, and where the platform is going.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-mid">Eyebrow (EN)</label>
            <input
              type="text"
              value={draft.eyebrowEn}
              onChange={(e) => updateDraft({ eyebrowEn: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-mid">Eyebrow (KO)</label>
            <input
              type="text"
              value={draft.eyebrowKo}
              onChange={(e) => updateDraft({ eyebrowKo: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Page title (EN)</label>
            <textarea
              value={draft.titleEn}
              onChange={(e) => updateDraft({ titleEn: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Page title (KO)</label>
            <textarea
              value={draft.titleKo}
              onChange={(e) => updateDraft({ titleKo: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Intro (EN)</label>
            <textarea
              value={draft.introEn}
              onChange={(e) => updateDraft({ introEn: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Intro (KO)</label>
            <textarea
              value={draft.introKo}
              onChange={(e) => updateDraft({ introKo: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
        </div>
      </div>

      {[
        ['The Problem', 'problemEn', 'problemKo'],
        ['Why We Started', 'whyStartedEn', 'whyStartedKo'],
        ['What We Are Building', 'whatBuildingEn', 'whatBuildingKo'],
        ['How We Work', 'howWeWorkEn', 'howWeWorkKo'],
        ['Where We Are Going', 'whereGoingEn', 'whereGoingKo'],
      ].map(([label, enKey, koKey]) => (
        <div key={label} className="rounded-xl border border-border bg-card p-5">
          <h4 className="text-sm font-semibold text-charcoal">{label}</h4>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-mid">{label} (EN)</label>
              <textarea
                value={draft[enKey as keyof StoryContent] as string}
                onChange={(e) => updateDraft({ [enKey]: e.target.value } as Partial<StoryContent>)}
                rows={5}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-mid">{label} (KO)</label>
              <textarea
                value={draft[koKey as keyof StoryContent] as string}
                onChange={(e) => updateDraft({ [koKey]: e.target.value } as Partial<StoryContent>)}
                rows={5}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold text-charcoal">Quote</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Quote (EN)</label>
            <textarea
              value={draft.quoteEn ?? ''}
              onChange={(e) => updateDraft({ quoteEn: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Quote (KO)</label>
            <textarea
              value={draft.quoteKo ?? ''}
              onChange={(e) => updateDraft({ quoteKo: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-charcoal">Images</h4>
            <p className="mt-1 text-xs text-light">These are used for the story page and can also be reused across the site.</p>
          </div>
          <label className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-stone-50">
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {draft.images.map((image) => (
            <div key={image} className="overflow-hidden rounded-xl border border-border bg-muted/30">
              <div className="aspect-[4/3] bg-muted/50">
                <img src={image} alt="" className="size-full object-cover" loading="lazy" />
              </div>
              <div className="flex items-center justify-between gap-3 p-3">
                <p className="truncate text-[11px] text-mid">{image}</p>
                <button
                  type="button"
                  onClick={() => updateDraft({ images: draft.images.filter((entry) => entry !== image) })}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {draft.images.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-4 text-xs text-light">
              No story images uploaded yet.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-charcoal">Timeline</h4>
            <p className="mt-1 text-xs text-light">Track how the ecosystem took shape over time.</p>
          </div>
          <button
            type="button"
            onClick={() => updateDraft({ timeline: [...draft.timeline, createMilestone()] })}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-stone-50"
          >
            <Plus className="size-3.5" />
            Add milestone
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {draft.timeline.map((entry, index) => (
            <div key={`${entry.date}-${index}`} className="rounded-xl border border-border/80 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-mid">Date</label>
                  <input
                    type="date"
                    value={entry.date}
                    onChange={(e) => updateTimelineEntry(index, { date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => updateDraft({ timeline: draft.timeline.filter((_, itemIndex) => itemIndex !== index) })}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Title (EN)</label>
                  <input
                    type="text"
                    value={entry.titleEn}
                    onChange={(e) => updateTimelineEntry(index, { titleEn: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Title (KO)</label>
                  <input
                    type="text"
                    value={entry.titleKo}
                    onChange={(e) => updateTimelineEntry(index, { titleKo: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-mid">Detail (EN)</label>
                  <textarea
                    value={entry.detailEn ?? ''}
                    onChange={(e) => updateTimelineEntry(index, { detailEn: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-mid">Detail (KO)</label>
                  <textarea
                    value={entry.detailKo ?? ''}
                    onChange={(e) => updateTimelineEntry(index, { detailKo: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-charcoal px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[hsl(20,8%,28%)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save Story Page'}
        </button>
        <span className={`text-xs ${error ? 'text-red-500' : 'text-emerald-600'}`}>
          {error || notice}
        </span>
      </div>
    </div>
  );
}
