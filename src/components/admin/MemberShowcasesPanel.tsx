import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { uploadAdminFile } from '@/lib/adminMedia';
import type { Project, StoryMilestone } from '@/types';
import { useTeamStore } from '@/stores/teamStore';

type MemberOption = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  team: string;
  joinedDate: string;
};

type ShowcaseLink = { label: string; href: string };

type ShowcaseRow = {
  member_id: string | null;
  user_id: string | null;
  email: string | null;
  slug: string | null;
  short_description_en: string | null;
  short_description_ko: string | null;
  bio_en: string | null;
  bio_ko: string | null;
  why_joined_en: string | null;
  why_joined_ko: string | null;
  what_built_en: string | null;
  what_built_ko: string | null;
  quote_en: string | null;
  quote_ko: string | null;
  contribution_summary_en: string | null;
  contribution_summary_ko: string | null;
  leadership_en: string[] | null;
  leadership_ko: string[] | null;
  current_goals_en: string[] | null;
  current_goals_ko: string[] | null;
  achievements_en: string[] | null;
  achievements_ko: string[] | null;
  skills: string[] | null;
  interests: string[] | null;
  tags: string[] | null;
  links: unknown;
  timeline: unknown;
  profile_image_url: string | null;
  banner_image_url: string | null;
  is_founder: boolean | null;
  is_featured: boolean | null;
  is_published: boolean | null;
  display_order: number | null;
};

type ShowcaseDraft = {
  memberId: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  team: string;
  joinedDate: string;
  slug: string;
  shortDescriptionEn: string;
  shortDescriptionKo: string;
  bioEn: string;
  bioKo: string;
  whyJoinedEn: string;
  whyJoinedKo: string;
  whatBuiltEn: string;
  whatBuiltKo: string;
  quoteEn: string;
  quoteKo: string;
  contributionSummaryEn: string;
  contributionSummaryKo: string;
  leadershipEn: string[];
  leadershipKo: string[];
  currentGoalsEn: string[];
  currentGoalsKo: string[];
  achievementsEn: string[];
  achievementsKo: string[];
  skills: string[];
  interests: string[];
  tags: string[];
  links: ShowcaseLink[];
  timeline: StoryMilestone[];
  profileImage: string;
  bannerImage: string;
  isFounder: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  order: number;
};

type MemberShowcasesPanelProps = {
  members: MemberOption[];
  projects: Project[];
};

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');

const parseLinks = (value: unknown): ShowcaseLink[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        label: typeof row.label === 'string' ? row.label : '',
        href: typeof row.href === 'string' ? row.href : '',
      };
    })
    .filter((row) => row.label || row.href);
};

const parseTimeline = (value: unknown): StoryMilestone[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        date: String(row.date ?? '').slice(0, 10),
        titleEn: String(row.titleEn ?? row.title_en ?? ''),
        titleKo: String(row.titleKo ?? row.title_ko ?? ''),
        detailEn: typeof row.detailEn === 'string' ? row.detailEn : typeof row.detail_en === 'string' ? row.detail_en : '',
        detailKo: typeof row.detailKo === 'string' ? row.detailKo : typeof row.detail_ko === 'string' ? row.detail_ko : '',
      };
    })
    .filter((entry) => entry.date || entry.titleEn || entry.titleKo);
};

const parseLineList = (value: string) =>
  Array.from(
    new Set(
      value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

const parseTagList = (value: string) =>
  Array.from(
    new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'member';

function createDefaultDraft(member: MemberOption, order: number): ShowcaseDraft {
  return {
    memberId: member.id,
    userId: member.userId,
    email: member.email,
    name: member.name,
    role: member.role,
    team: member.team,
    joinedDate: member.joinedDate,
    slug: slugify(member.name || member.email),
    shortDescriptionEn: '',
    shortDescriptionKo: '',
    bioEn: '',
    bioKo: '',
    whyJoinedEn: '',
    whyJoinedKo: '',
    whatBuiltEn: '',
    whatBuiltKo: '',
    quoteEn: '',
    quoteKo: '',
    contributionSummaryEn: '',
    contributionSummaryKo: '',
    leadershipEn: [],
    leadershipKo: [],
    currentGoalsEn: [],
    currentGoalsKo: [],
    achievementsEn: [],
    achievementsKo: [],
    skills: [],
    interests: [],
    tags: [],
    links: [],
    timeline: [],
    profileImage: '',
    bannerImage: '',
    isFounder: /founder/i.test(member.role),
    isFeatured: false,
    isPublished: true,
    order,
  };
}

function mergeDraft(member: MemberOption, row: ShowcaseRow | undefined, order: number): ShowcaseDraft {
  const base = createDefaultDraft(member, order);
  if (!row) return base;
  return {
    ...base,
    slug: row.slug ?? base.slug,
    shortDescriptionEn: row.short_description_en ?? '',
    shortDescriptionKo: row.short_description_ko ?? '',
    bioEn: row.bio_en ?? '',
    bioKo: row.bio_ko ?? '',
    whyJoinedEn: row.why_joined_en ?? '',
    whyJoinedKo: row.why_joined_ko ?? '',
    whatBuiltEn: row.what_built_en ?? '',
    whatBuiltKo: row.what_built_ko ?? '',
    quoteEn: row.quote_en ?? '',
    quoteKo: row.quote_ko ?? '',
    contributionSummaryEn: row.contribution_summary_en ?? '',
    contributionSummaryKo: row.contribution_summary_ko ?? '',
    leadershipEn: isStringArray(row.leadership_en) ? row.leadership_en : [],
    leadershipKo: isStringArray(row.leadership_ko) ? row.leadership_ko : [],
    currentGoalsEn: isStringArray(row.current_goals_en) ? row.current_goals_en : [],
    currentGoalsKo: isStringArray(row.current_goals_ko) ? row.current_goals_ko : [],
    achievementsEn: isStringArray(row.achievements_en) ? row.achievements_en : [],
    achievementsKo: isStringArray(row.achievements_ko) ? row.achievements_ko : [],
    skills: isStringArray(row.skills) ? row.skills : [],
    interests: isStringArray(row.interests) ? row.interests : [],
    tags: isStringArray(row.tags) ? row.tags : [],
    links: parseLinks(row.links),
    timeline: parseTimeline(row.timeline),
    profileImage: row.profile_image_url ?? '',
    bannerImage: row.banner_image_url ?? '',
    isFounder: Boolean(row.is_founder ?? base.isFounder),
    isFeatured: Boolean(row.is_featured),
    isPublished: row.is_published == null ? true : Boolean(row.is_published),
    order: Number(row.display_order) || order,
  };
}

function createTimelineEntry(): StoryMilestone {
  return {
    date: new Date().toISOString().slice(0, 10),
    titleEn: '',
    titleKo: '',
    detailEn: '',
    detailKo: '',
  };
}

export default function MemberShowcasesPanel({ members, projects }: MemberShowcasesPanelProps) {
  const hydrateTeam = useTeamStore((state) => state.hydrate);
  const [drafts, setDrafts] = useState<ShowcaseDraft[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(members[0]?.id ?? null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        if (!isSupabaseConfigured || !supabase) {
          if (!cancelled) {
            const nextDrafts = members.map((member, index) => createDefaultDraft(member, index + 1));
            setDrafts(nextDrafts);
            setSelectedMemberId((current) => current ?? nextDrafts[0]?.memberId ?? null);
          }
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('member_showcases')
          .select('*');

        if (fetchError) throw fetchError;

        const rows = (data ?? []) as ShowcaseRow[];
        const byMemberId = new Map(rows.filter((row) => row.member_id).map((row) => [row.member_id as string, row]));
        const byUserId = new Map(rows.filter((row) => row.user_id).map((row) => [row.user_id as string, row]));
        const byEmail = new Map(rows.filter((row) => row.email).map((row) => [String(row.email).toLowerCase(), row]));

        const nextDrafts = members.map((member, index) => {
          const row = byMemberId.get(member.id)
            ?? byUserId.get(member.userId)
            ?? byEmail.get(member.email.toLowerCase());
          return mergeDraft(member, row, index + 1);
        });

        if (!cancelled) {
          setDrafts(nextDrafts);
          setSelectedMemberId((current) => current ?? nextDrafts[0]?.memberId ?? null);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setDrafts(members.map((member, index) => createDefaultDraft(member, index + 1)));
          setError(caughtError instanceof Error ? caughtError.message : 'Could not load public member profiles.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [members]);

  const selectedDraft = drafts.find((draft) => draft.memberId === selectedMemberId) ?? null;

  const projectAssignments = useMemo(() => {
    const map = new Map<string, Project[]>();

    members.forEach((member) => {
      const normalizedName = member.name.trim().toLowerCase();
      const normalizedEmail = member.email.trim().toLowerCase();
      const assigned = projects.filter((project) => {
        const lead = String(project.lead ?? '').trim().toLowerCase();
        const contributors = (project.contributors ?? []).map((entry) => entry.trim().toLowerCase());
        return lead === normalizedName || lead === normalizedEmail || contributors.includes(normalizedName) || contributors.includes(normalizedEmail);
      });
      map.set(member.id, assigned);
    });

    return map;
  }, [members, projects]);

  const updateDraft = (memberId: string, patch: Partial<ShowcaseDraft>) => {
    setDrafts((prev) => prev.map((draft) => (draft.memberId === memberId ? { ...draft, ...patch } : draft)));
  };

  const updateTimeline = (memberId: string, index: number, patch: Partial<StoryMilestone>) => {
    updateDraft(memberId, {
      timeline: (drafts.find((draft) => draft.memberId === memberId)?.timeline ?? []).map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry
      ),
    });
  };

  const updateLinks = (memberId: string, updater: (links: ShowcaseLink[]) => ShowcaseLink[]) => {
    const currentLinks = drafts.find((draft) => draft.memberId === memberId)?.links ?? [];
    updateDraft(memberId, { links: updater(currentLinks) });
  };

  const handleSave = async (draft: ShowcaseDraft) => {
    setSavingId(draft.memberId);
    setNotice('');
    setError('');

    const payload = {
      member_id: draft.memberId,
      user_id: draft.userId,
      email: draft.email,
      slug: slugify(draft.slug || draft.name),
      short_description_en: draft.shortDescriptionEn,
      short_description_ko: draft.shortDescriptionKo,
      bio_en: draft.bioEn,
      bio_ko: draft.bioKo,
      why_joined_en: draft.whyJoinedEn,
      why_joined_ko: draft.whyJoinedKo,
      what_built_en: draft.whatBuiltEn,
      what_built_ko: draft.whatBuiltKo,
      quote_en: draft.quoteEn,
      quote_ko: draft.quoteKo,
      contribution_summary_en: draft.contributionSummaryEn,
      contribution_summary_ko: draft.contributionSummaryKo,
      leadership_en: draft.leadershipEn,
      leadership_ko: draft.leadershipKo,
      current_goals_en: draft.currentGoalsEn,
      current_goals_ko: draft.currentGoalsKo,
      achievements_en: draft.achievementsEn,
      achievements_ko: draft.achievementsKo,
      skills: draft.skills,
      interests: draft.interests,
      tags: draft.tags,
      links: draft.links,
      timeline: draft.timeline,
      profile_image_url: draft.profileImage,
      banner_image_url: draft.bannerImage,
      is_founder: draft.isFounder,
      is_featured: draft.isFeatured,
      is_published: draft.isPublished,
      display_order: Number(draft.order) || 0,
    };

    try {
      if (!isSupabaseConfigured || !supabase) {
        useTeamStore.setState((state) => ({
          members: state.members.map((member) =>
            member.id === draft.memberId
              ? {
                  ...member,
                  slug: payload.slug,
                  founder: draft.isFounder,
                  featured: draft.isFeatured,
                  published: draft.isPublished,
                  order: draft.order,
                  shortDescriptionEn: draft.shortDescriptionEn,
                  shortDescriptionKo: draft.shortDescriptionKo,
                  bioEn: draft.bioEn,
                  bioKo: draft.bioKo,
                  whyJoinedEn: draft.whyJoinedEn,
                  whyJoinedKo: draft.whyJoinedKo,
                  whatBuiltEn: draft.whatBuiltEn,
                  whatBuiltKo: draft.whatBuiltKo,
                  quote: { en: draft.quoteEn, ko: draft.quoteKo },
                  contributionSummaryEn: draft.contributionSummaryEn,
                  contributionSummaryKo: draft.contributionSummaryKo,
                  leadershipEn: draft.leadershipEn,
                  leadershipKo: draft.leadershipKo,
                  currentGoalsEn: draft.currentGoalsEn,
                  currentGoalsKo: draft.currentGoalsKo,
                  achievementsEn: draft.achievementsEn,
                  achievementsKo: draft.achievementsKo,
                  skills: draft.skills,
                  interests: draft.interests,
                  tags: draft.tags,
                  links: draft.links,
                  timeline: draft.timeline,
                  photo: draft.profileImage,
                  bannerImage: draft.bannerImage,
                }
              : member
          ),
        }));
      } else {
        const { error: saveError } = await supabase
          .from('member_showcases')
          .upsert(payload, { onConflict: 'member_id' });
        if (saveError) throw saveError;
        await hydrateTeam();
      }

      setNotice('Public profile saved.');
      window.setTimeout(() => setNotice(''), 1800);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not save the public profile.');
    } finally {
      setSavingId(null);
    }
  };

  const handleResetProfile = async (memberId: string) => {
    const member = members.find((entry) => entry.id === memberId);
    if (!member) return;

    updateDraft(memberId, createDefaultDraft(member, drafts.find((entry) => entry.memberId === memberId)?.order ?? 0));

    if (!isSupabaseConfigured || !supabase) {
      setNotice('Profile reset locally.');
      window.setTimeout(() => setNotice(''), 1600);
      return;
    }

    try {
      const { error: deleteError } = await supabase.from('member_showcases').delete().eq('member_id', memberId);
      if (deleteError) throw deleteError;
      await hydrateTeam();
      setNotice('Profile reset.');
      window.setTimeout(() => setNotice(''), 1600);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not reset the profile.');
    }
  };

  const handleImageUpload = async (draft: ShowcaseDraft, kind: 'profile' | 'banner', file?: File | null) => {
    if (!file) return;
    setUploadingTarget(`${draft.memberId}:${kind}`);
    setError('');

    try {
      const safeName = file.name.replace(/\s+/g, '-');
      const publicUrl = await uploadAdminFile('site-images', `people/${draft.memberId}/${kind}-${Date.now()}-${safeName}`, file);
      if (kind === 'profile') {
        updateDraft(draft.memberId, { profileImage: publicUrl });
      } else {
        updateDraft(draft.memberId, { bannerImage: publicUrl });
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not upload the image.');
    } finally {
      setUploadingTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-lg font-bold text-charcoal">People Profiles</h3>
        <p className="mt-1 text-xs text-light">
          This layer turns signed-up members into public-facing contributor profiles. Keep the member record in the Members tab, then shape the public portfolio here.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[340px,minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-sm font-semibold text-charcoal">People</h4>
          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-xs text-light">Loading member profiles...</p>
            ) : drafts.map((draft) => {
              const linkedProjects = projectAssignments.get(draft.memberId) ?? [];
              return (
                <button
                  key={draft.memberId}
                  type="button"
                  onClick={() => setSelectedMemberId(draft.memberId)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                    selectedMemberId === draft.memberId ? 'border-charcoal bg-muted/30' : 'border-border hover:border-charcoal/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{draft.name}</p>
                      <p className="mt-1 text-xs text-mid">{draft.role} · {draft.team}</p>
                      <p className="mt-2 text-[11px] text-light">
                        {draft.isFounder ? 'Founder' : draft.isFeatured ? 'Featured contributor' : 'Public profile'}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-light">
                      <p>{linkedProjects.length} projects</p>
                      <p className="mt-1">{draft.isPublished ? 'Visible' : 'Hidden'}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          {selectedDraft ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">Profile Editor</h4>
                  <p className="mt-1 text-xs text-light">
                    Public profile for {selectedDraft.name}. Assigned projects are pulled from the Projects tab.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleResetProfile(selectedDraft.memberId)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:text-red-700"
                  >
                    <Trash2 className="size-3.5" />
                    Reset Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(selectedDraft)}
                    disabled={savingId === selectedDraft.memberId}
                    className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[hsl(20,8%,28%)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingId === selectedDraft.memberId ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-light">Assigned projects</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(projectAssignments.get(selectedDraft.memberId) ?? []).length ? (
                      (projectAssignments.get(selectedDraft.memberId) ?? []).map((project) => (
                        <span key={project.id} className="rounded-full border border-border bg-card px-3 py-1 text-[11px] text-charcoal">
                          {project.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-light">No project assignments yet. Add lead/contributors in the Projects tab.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-light">Identity</p>
                  <div className="mt-3 space-y-1 text-xs text-mid">
                    <p>{selectedDraft.email}</p>
                    <p>Joined {selectedDraft.joinedDate || '—'}</p>
                    <p>{selectedDraft.role} · {selectedDraft.team}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-mid">Slug</label>
                  <input
                    type="text"
                    value={selectedDraft.slug}
                    onChange={(e) => updateDraft(selectedDraft.memberId, { slug: slugify(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Display order</label>
                  <input
                    type="number"
                    value={selectedDraft.order}
                    onChange={(e) => updateDraft(selectedDraft.memberId, { order: Number(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-mid">One-line description (EN)</label>
                  <input
                    type="text"
                    value={selectedDraft.shortDescriptionEn}
                    onChange={(e) => updateDraft(selectedDraft.memberId, { shortDescriptionEn: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-mid">One-line description (KO)</label>
                  <input
                    type="text"
                    value={selectedDraft.shortDescriptionKo}
                    onChange={(e) => updateDraft(selectedDraft.memberId, { shortDescriptionKo: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-charcoal">
                    <input
                      type="checkbox"
                      checked={selectedDraft.isFounder}
                      onChange={(e) => updateDraft(selectedDraft.memberId, { isFounder: e.target.checked })}
                    />
                    Founder
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-charcoal">
                    <input
                      type="checkbox"
                      checked={selectedDraft.isFeatured}
                      onChange={(e) => updateDraft(selectedDraft.memberId, { isFeatured: e.target.checked })}
                    />
                    Featured
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-charcoal">
                    <input
                      type="checkbox"
                      checked={selectedDraft.isPublished}
                      onChange={(e) => updateDraft(selectedDraft.memberId, { isPublished: e.target.checked })}
                    />
                    Visible
                  </label>
                </div>
                <div>
                  <label className="text-xs font-semibold text-mid">Tags</label>
                  <input
                    type="text"
                    value={selectedDraft.tags.join(', ')}
                    onChange={(e) => updateDraft(selectedDraft.memberId, { tags: parseTagList(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    placeholder="Designer, Product, Founder"
                  />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-charcoal">Profile Image</p>
                    <label className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-stone-50">
                      {uploadingTarget === `${selectedDraft.memberId}:profile` ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(selectedDraft, 'profile', e.target.files?.[0])} />
                    </label>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="aspect-[4/5] bg-muted/50">
                      {selectedDraft.profileImage ? (
                        <img src={selectedDraft.profileImage} alt={selectedDraft.name} className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-light">No image yet</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-charcoal">Banner Image</p>
                    <label className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-stone-50">
                      {uploadingTarget === `${selectedDraft.memberId}:banner` ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(selectedDraft, 'banner', e.target.files?.[0])} />
                    </label>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="aspect-[16/9] bg-muted/50">
                      {selectedDraft.bannerImage ? (
                        <img src={selectedDraft.bannerImage} alt={`${selectedDraft.name} banner`} className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-light">No banner yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {[
                ['Bio', 'bioEn', 'bioKo'],
                ['Why they joined', 'whyJoinedEn', 'whyJoinedKo'],
                ['What they built', 'whatBuiltEn', 'whatBuiltKo'],
                ['Contribution summary', 'contributionSummaryEn', 'contributionSummaryKo'],
                ['Member quote', 'quoteEn', 'quoteKo'],
              ].map(([label, enKey, koKey]) => (
                <div key={label} className="rounded-xl border border-border bg-card/70 p-4">
                  <p className="text-sm font-semibold text-charcoal">{label}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-mid">{label} (EN)</label>
                      <textarea
                        value={selectedDraft[enKey as keyof ShowcaseDraft] as string}
                        onChange={(e) => updateDraft(selectedDraft.memberId, { [enKey]: e.target.value } as Partial<ShowcaseDraft>)}
                        rows={4}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-mid">{label} (KO)</label>
                      <textarea
                        value={selectedDraft[koKey as keyof ShowcaseDraft] as string}
                        onChange={(e) => updateDraft(selectedDraft.memberId, { [koKey]: e.target.value } as Partial<ShowcaseDraft>)}
                        rows={4}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {[
                ['Leadership & initiative (EN)', selectedDraft.leadershipEn, 'leadershipEn'],
                ['Leadership & initiative (KO)', selectedDraft.leadershipKo, 'leadershipKo'],
                ['Current goals (EN)', selectedDraft.currentGoalsEn, 'currentGoalsEn'],
                ['Current goals (KO)', selectedDraft.currentGoalsKo, 'currentGoalsKo'],
                ['Achievements (EN)', selectedDraft.achievementsEn, 'achievementsEn'],
                ['Achievements (KO)', selectedDraft.achievementsKo, 'achievementsKo'],
                ['Skills', selectedDraft.skills, 'skills'],
                ['Interests', selectedDraft.interests, 'interests'],
              ].map(([label, value, key]) => (
                <div key={label} className="rounded-xl border border-border bg-card/70 p-4">
                  <label className="text-xs font-semibold text-mid">{label}</label>
                  <textarea
                    value={(value as string[]).join('\n')}
                    onChange={(e) => updateDraft(selectedDraft.memberId, { [key]: parseLineList(e.target.value) } as Partial<ShowcaseDraft>)}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    placeholder="One item per line"
                  />
                </div>
              ))}

              <div className="rounded-xl border border-border bg-card/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Links</p>
                    <p className="mt-1 text-xs text-light">Optional contact or portfolio links.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateLinks(selectedDraft.memberId, (links) => [...links, { label: '', href: '' }])}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-stone-50"
                  >
                    <Plus className="size-3.5" />
                    Add Link
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedDraft.links.map((link, index) => (
                    <div key={`${link.href}-${index}`} className="grid gap-3 sm:grid-cols-[1fr,1.6fr,auto] sm:items-center">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLinks(selectedDraft.memberId, (links) => links.map((entry, entryIndex) => entryIndex === index ? { ...entry, label: e.target.value } : entry))}
                        placeholder="Label"
                        className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => updateLinks(selectedDraft.memberId, (links) => links.map((entry, entryIndex) => entryIndex === index ? { ...entry, href: e.target.value } : entry))}
                        placeholder="https://"
                        className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                      <button
                        type="button"
                        onClick={() => updateLinks(selectedDraft.memberId, (links) => links.filter((_, entryIndex) => entryIndex !== index))}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {selectedDraft.links.length === 0 && (
                    <p className="text-xs text-light">No links yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Timeline</p>
                    <p className="mt-1 text-xs text-light">Joined, launches, milestones, and contributions over time.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateDraft(selectedDraft.memberId, { timeline: [...selectedDraft.timeline, createTimelineEntry()] })}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-stone-50"
                  >
                    <Plus className="size-3.5" />
                    Add milestone
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedDraft.timeline.map((entry, index) => (
                    <div key={`${entry.date}-${index}`} className="rounded-xl border border-border/80 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-mid">Date</label>
                          <input
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateTimeline(selectedDraft.memberId, index, { date: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                          />
                        </div>
                        <div className="flex items-end justify-end">
                          <button
                            type="button"
                            onClick={() => updateDraft(selectedDraft.memberId, { timeline: selectedDraft.timeline.filter((_, itemIndex) => itemIndex !== index) })}
                            className="text-xs text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-mid">Title (EN)</label>
                          <input
                            type="text"
                            value={entry.titleEn}
                            onChange={(e) => updateTimeline(selectedDraft.memberId, index, { titleEn: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-mid">Title (KO)</label>
                          <input
                            type="text"
                            value={entry.titleKo}
                            onChange={(e) => updateTimeline(selectedDraft.memberId, index, { titleKo: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-mid">Detail (EN)</label>
                          <textarea
                            value={entry.detailEn ?? ''}
                            onChange={(e) => updateTimeline(selectedDraft.memberId, index, { detailEn: e.target.value })}
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-mid">Detail (KO)</label>
                          <textarea
                            value={entry.detailKo ?? ''}
                            onChange={(e) => updateTimeline(selectedDraft.memberId, index, { detailKo: e.target.value })}
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedDraft.timeline.length === 0 && (
                    <p className="text-xs text-light">No milestones added yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-light">
              Select a member to edit the public profile.
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
