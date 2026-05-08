import { useEffect } from 'react';
import { create } from 'zustand';
import { preloadImages } from '@/lib/storage';
import type { TeamMemberShowcase } from '@/types';
import { teamShowcaseFallback } from '@/constants/teamShowcaseFallback';

const CACHE_KEY = 'bnss-team-cache';
const isBrowser = typeof window !== 'undefined';

type TeamStatus = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';

const readCache = () => {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TeamMemberShowcase[];
  } catch {
    return null;
  }
};

const writeCache = (members: TeamMemberShowcase[]) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(members));
  } catch {
    // ignore
  }
};

const normalizeMember = (member: TeamMemberShowcase): TeamMemberShowcase => ({
  ...member,
  quote: member.quote ?? {},
  leadershipEn: Array.isArray(member.leadershipEn) ? member.leadershipEn : [],
  leadershipKo: Array.isArray(member.leadershipKo) ? member.leadershipKo : [],
  currentGoalsEn: Array.isArray(member.currentGoalsEn) ? member.currentGoalsEn : [],
  currentGoalsKo: Array.isArray(member.currentGoalsKo) ? member.currentGoalsKo : [],
  achievementsEn: Array.isArray(member.achievementsEn) ? member.achievementsEn : [],
  achievementsKo: Array.isArray(member.achievementsKo) ? member.achievementsKo : [],
  skills: Array.isArray(member.skills) ? member.skills : [],
  interests: Array.isArray(member.interests) ? member.interests : [],
  tags: Array.isArray(member.tags) ? member.tags : [],
  timeline: Array.isArray(member.timeline) ? member.timeline : [],
  projects: Array.isArray(member.projects) ? member.projects : [],
  links: Array.isArray(member.links) ? member.links : [],
  stats: {
    projects: Number(member.stats?.projects) || 0,
    collaborations: Number(member.stats?.collaborations) || 0,
    events: Number(member.stats?.events) || 0,
    contributions: Number(member.stats?.contributions) || 0,
  },
});

const initialMembers = (readCache() ?? [...teamShowcaseFallback]).map(normalizeMember);

export const useTeamStore = create<{
  members: TeamMemberShowcase[];
  status: TeamStatus;
  error: string | null;
  hydrate: () => Promise<void>;
}>((set) => ({
  members: initialMembers,
  status: readCache() ? 'ready' : 'idle',
  error: null,
  hydrate: async () => {
    set((state) => ({ status: state.members.length ? state.status : 'loading', error: null }));

    try {
      const response = await fetch('/api/team', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { members?: TeamMemberShowcase[] };
      const nextMembers = (Array.isArray(payload.members) && payload.members.length
        ? payload.members
        : [...teamShowcaseFallback]).map(normalizeMember);

      preloadImages(
        nextMembers.flatMap((member) => [member.photo, member.bannerImage]).filter(Boolean)
      );
      writeCache(nextMembers);
      set({ members: nextMembers, status: 'ready', error: null });
    } catch (error) {
      const fallbackMembers = (readCache() ?? [...teamShowcaseFallback]).map(normalizeMember);
      preloadImages(
        fallbackMembers.flatMap((member) => [member.photo, member.bannerImage]).filter(Boolean)
      );
      set({
        members: fallbackMembers,
        status: 'fallback',
        error: error instanceof Error ? error.message : 'Failed to load team data',
      });
    }
  },
}));

export function useTeamSync() {
  const hydrate = useTeamStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
}
