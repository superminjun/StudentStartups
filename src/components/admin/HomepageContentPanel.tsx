import { useEffect, useState } from 'react';
import { useSiteContentStore, type SiteContent } from '@/stores/siteContentStore';
import { useCMSStore } from '@/stores/cmsStore';
import { useTeamStore, useTeamSync } from '@/stores/teamStore';
import { useJournalStore, useJournalSync } from '@/stores/journalStore';

export default function HomepageContentPanel() {
  useTeamSync();
  useJournalSync();
  const { content, updateContent, status, error } = useSiteContentStore();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const projects = useCMSStore((state) => state.projects).filter((project) => project.featured);
  const members = useTeamStore((state) => state.members).filter((member) => member.featured);
  const posts = useJournalStore((state) => state.posts).filter((post) => post.featured);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent(draft);
      setNotice('Homepage content saved.');
    } finally {
      setSaving(false);
      window.setTimeout(() => setNotice(''), 1800);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-lg font-bold text-charcoal">Homepage Editor</h3>
        <p className="mt-1 text-xs text-light">
          Edit the hero, the short human introduction, the build-log preview copy, and the final join section.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-light">Featured members</p>
            <p className="mt-2 text-2xl font-semibold text-charcoal">{members.length}</p>
            <p className="mt-1 text-xs text-light">Controlled from People profiles.</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-light">Featured projects</p>
            <p className="mt-2 text-2xl font-semibold text-charcoal">{projects.length}</p>
            <p className="mt-1 text-xs text-light">Controlled from Project settings.</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-light">Featured build log posts</p>
            <p className="mt-2 text-2xl font-semibold text-charcoal">{posts.length}</p>
            <p className="mt-1 text-xs text-light">Controlled from Build Log posts.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-mid">Hero tagline</label>
            <input
              type="text"
              value={draft.heroTagline}
              onChange={(e) => setDraft((prev) => ({ ...prev, heroTagline: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-mid">Hero CTA</label>
            <input
              type="text"
              value={draft.heroCta}
              onChange={(e) => setDraft((prev) => ({ ...prev, heroCta: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Hero title</label>
            <textarea
              value={draft.heroTitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, heroTitle: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Hero subtitle</label>
            <textarea
              value={draft.heroSubtitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold text-charcoal">Intro section</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-mid">Intro kicker</label>
            <input
              type="text"
              value={draft.introKicker}
              onChange={(e) => setDraft((prev) => ({ ...prev, introKicker: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Intro title</label>
            <textarea
              value={draft.introTitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, introTitle: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Intro body</label>
            <textarea
              value={draft.introBody}
              onChange={(e) => setDraft((prev) => ({ ...prev, introBody: e.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold text-charcoal">Build log preview</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-mid">Build log kicker</label>
            <input
              type="text"
              value={draft.journalKicker}
              onChange={(e) => setDraft((prev) => ({ ...prev, journalKicker: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Build log title</label>
            <textarea
              value={draft.journalTitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, journalTitle: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Build log body</label>
            <textarea
              value={draft.journalBody}
              onChange={(e) => setDraft((prev) => ({ ...prev, journalBody: e.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold text-charcoal">Final CTA / join section</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-mid">CTA button</label>
            <input
              type="text"
              value={draft.joinCta}
              onChange={(e) => setDraft((prev) => ({ ...prev, joinCta: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Join title</label>
            <textarea
              value={draft.joinTitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, joinTitle: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-mid">Join body</label>
            <textarea
              value={draft.joinBody}
              onChange={(e) => setDraft((prev) => ({ ...prev, joinBody: e.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-charcoal px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[hsl(20,8%,28%)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save Homepage'}
        </button>
        <span className={`text-xs ${error ? 'text-red-500' : 'text-emerald-600'}`}>
          {error ? error : notice ? notice : status === 'loading' ? 'Loading content...' : ''}
        </span>
      </div>
    </div>
  );
}
