import {
  createPrivilegedSupabase,
  serverConfig,
  type ApiRequest,
  type ApiResponse,
} from './_lib/server.js';

type MemberRow = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  contributions: number | null;
  join_date: string | null;
  created_at: string | null;
};

type AdminRow = {
  id: string;
  email: string;
};

type ProjectRow = {
  id: string;
  name: string;
  stage_name: string;
  status: string | null;
  image_url: string | null;
  category: string | null;
  term: string | null;
  start_date: string | null;
  team: unknown;
};

type AttendanceRow = {
  member_id: string;
  meeting_id: string;
  status: 'present' | 'absent';
  updated_at: string | null;
};

type MeetingRow = {
  id: string;
  meeting_date: string;
};

type ContributionRow = {
  member_id: string;
  title: string;
  points: number | null;
  notes: string | null;
  contribution_date: string;
};

type TeamAssignmentRow = {
  role?: string;
  members?: string[];
};

type AuthUserRecord = {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'member';
}

function normalize(value: string | null | undefined) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function titleCase(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function nameFromEmail(email: string) {
  const local = email.split('@')[0] ?? 'member';
  return titleCase(local);
}

function toPublicStorageUrl(url: string | null | undefined) {
  if (!url) return '';
  const base = url.split('?')[0];

  if (base.includes('/storage/v1/object/sign/')) {
    return base.replace('/storage/v1/object/sign/', '/storage/v1/object/public/');
  }

  if (base.includes('/storage/v1/object/public/')) {
    return base;
  }

  if (!supabaseUrl) return url;

  try {
    const parsed = new URL(base);
    const marker = '/storage/v1/object/';
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return url;
    const after = parsed.pathname.slice(idx + marker.length);
    const trimmed = after.startsWith('public/') ? after.slice('public/'.length) : after;
    const [bucket, ...rest] = trimmed.split('/');
    if (!bucket || !rest.length) return url;
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${rest.join('/')}`;
  } catch {
    return url;
  }
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function getAuthName(user: AuthUserRecord | undefined, fallbackName: string, fallbackEmail: string) {
  if (!user) return fallbackName || nameFromEmail(fallbackEmail);
  const metadata = user.user_metadata ?? {};
  const value = firstString(
    metadata.full_name,
    metadata.name,
    [metadata.given_name, metadata.family_name].filter(Boolean).join(' '),
    fallbackName,
    fallbackEmail ? nameFromEmail(fallbackEmail) : ''
  );
  return value || 'Member';
}

function getAuthAvatar(user: AuthUserRecord | undefined) {
  if (!user) return '';
  const metadata = user.user_metadata ?? {};
  return firstString(
    metadata.avatar_url,
    metadata.picture,
    metadata.photo_url
  );
}

function getSafeDate(value: string | null | undefined, fallback = new Date().toISOString()) {
  const source = value || fallback;
  return source.slice(0, 10);
}

function getTeamAssignmentRows(value: unknown) {
  if (!Array.isArray(value)) return [] as TeamAssignmentRow[];
  return value.filter((item): item is TeamAssignmentRow => Boolean(item) && typeof item === 'object');
}

function buildMemberProjectMaps(projects: ProjectRow[]) {
  const projectMap = new Map<string, ProjectRow[]>();
  const collaboratorMap = new Map<string, Set<string>>();

  for (const project of projects) {
    const assignments = getTeamAssignmentRows(project.team);
    const everyone = new Set<string>();

    for (const assignment of assignments) {
      const names = Array.isArray(assignment.members)
        ? assignment.members.map((name) => String(name).trim()).filter(Boolean)
        : [];
      names.forEach((name) => everyone.add(name));
    }

    for (const name of everyone) {
      const key = normalize(name);
      const current = projectMap.get(key) ?? [];
      current.push(project);
      projectMap.set(key, current);

      const collaboratorSet = collaboratorMap.get(key) ?? new Set<string>();
      for (const other of everyone) {
        if (normalize(other) !== key) collaboratorSet.add(other);
      }
      collaboratorMap.set(key, collaboratorSet);
    }
  }

  return { projectMap, collaboratorMap };
}

async function listRelevantAuthUsers(
  supabase: NonNullable<ReturnType<typeof createPrivilegedSupabase>>,
  targetIds: Set<string>,
  targetEmails: Set<string>
) {
  const matched = new Map<string, AuthUserRecord>();
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = (data.users ?? []) as AuthUserRecord[];
    for (const user of users) {
      const email = normalize(user.email);
      if (targetIds.has(user.id) || (email && targetEmails.has(email))) {
        matched.set(user.id, user);
      }
    }

    if (targetIds.size > 0 && matched.size >= targetIds.size) break;
    if (users.length < perPage) break;
    page += 1;
  }

  return matched;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createPrivilegedSupabase();

    if (!supabase) {
      return res.status(500).json({
        error: 'Server not configured',
        missing: {
          supabaseUrl: !serverConfig.supabaseUrl,
          serviceRoleKey: !serverConfig.serviceRoleKey,
        },
      });
    }

    const [
      membersResult,
      adminsResult,
      projectsResult,
      attendanceResult,
      meetingsResult,
      contributionsResult,
    ] = await Promise.all([
      supabase
        .from('members')
        .select('id,user_id,name,email,role,team,contributions,join_date,created_at')
        .order('join_date', { ascending: true }),
      supabase
        .from('admin_users')
        .select('id,email')
        .order('created_at', { ascending: true }),
      supabase
        .from('projects')
        .select('id,name,stage_name,status,image_url,category,term,start_date,team')
        .order('start_date', { ascending: true }),
      supabase
        .from('attendance')
        .select('member_id,meeting_id,status,updated_at')
        .eq('status', 'present'),
      supabase
        .from('meetings')
        .select('id,meeting_date')
        .order('meeting_date', { ascending: true }),
      supabase
        .from('contributions')
        .select('member_id,title,points,notes,contribution_date')
        .order('contribution_date', { ascending: false }),
    ]);

    if (membersResult.error) throw membersResult.error;
    if (adminsResult.error) throw adminsResult.error;
    if (projectsResult.error) throw projectsResult.error;
    if (attendanceResult.error) throw attendanceResult.error;
    if (meetingsResult.error) throw meetingsResult.error;
    if (contributionsResult.error) throw contributionsResult.error;

    const memberRows = (membersResult.data ?? []) as MemberRow[];
    const adminRows = (adminsResult.data ?? []) as AdminRow[];
    const projectRows = (projectsResult.data ?? []) as ProjectRow[];
    const attendanceRows = (attendanceResult.data ?? []) as AttendanceRow[];
    const meetingRows = (meetingsResult.data ?? []) as MeetingRow[];
    const contributionRows = (contributionsResult.data ?? []) as ContributionRow[];

    const targetIds = new Set<string>([
      ...memberRows.map((row) => row.user_id),
      ...adminRows.map((row) => row.id),
    ]);
    const targetEmails = new Set<string>([
      ...memberRows.map((row) => normalize(row.email)),
      ...adminRows.map((row) => normalize(row.email)),
    ]);
    const authUsers = await listRelevantAuthUsers(supabase, targetIds, targetEmails);
    const authByEmail = new Map(
      Array.from(authUsers.values())
        .map((user) => [normalize(user.email), user] as const)
        .filter(([email]) => Boolean(email))
    );

    const memberByUserId = new Set(memberRows.map((row) => row.user_id));
    const syntheticFounderRows: MemberRow[] = adminRows
      .filter((row) => !memberByUserId.has(row.id))
      .map((row) => {
        const authUser = authUsers.get(row.id) ?? authByEmail.get(normalize(row.email));
        return {
          id: `synthetic-${row.id}`,
          user_id: row.id,
          name: getAuthName(authUser, '', row.email),
          email: row.email,
          role: 'Founder',
          team: 'Platform',
          contributions: 0,
          join_date: getSafeDate(authUser?.created_at),
          created_at: authUser?.created_at ?? null,
        };
      });

    const allMembers = [...memberRows, ...syntheticFounderRows];

    const { projectMap, collaboratorMap } = buildMemberProjectMaps(projectRows);
    const meetingDateById = new Map(meetingRows.map((row) => [row.id, row.meeting_date]));
    const contributionMap = new Map<string, ContributionRow[]>();
    contributionRows.forEach((row) => {
      const current = contributionMap.get(row.member_id) ?? [];
      current.push(row);
      contributionMap.set(row.member_id, current);
    });

    const attendanceMap = new Map<string, string[]>();
    attendanceRows.forEach((row) => {
      const date = meetingDateById.get(row.meeting_id);
      if (!date) return;
      const current = attendanceMap.get(row.member_id) ?? [];
      current.push(date);
      attendanceMap.set(row.member_id, current);
    });

    const adminMemberIds = new Set(adminRows.map((row) => row.id));
    const founderCandidate = allMembers.find((row) => /founder/i.test(row.role))
      ?? allMembers.find((row) => /minjun|founder|creator/i.test(`${row.name} ${row.email}`))
      ?? allMembers.find((row) => adminMemberIds.has(row.user_id))
      ?? allMembers[0];

    const now = Date.now();
    const ninetyDaysMs = 1000 * 60 * 60 * 24 * 90;

    const members = allMembers.map((row) => {
      const authUser = authUsers.get(row.user_id) ?? authByEmail.get(normalize(row.email));
      const displayName = getAuthName(authUser, row.name, row.email);
      const memberProjects = (projectMap.get(normalize(displayName)) ?? projectMap.get(normalize(row.name)) ?? [])
        .map((project) => ({
          id: project.id,
          name: project.name,
          stageName: project.stage_name,
          status: project.status ?? undefined,
          image: toPublicStorageUrl(project.image_url),
          category: project.category ?? undefined,
          term: project.term ?? undefined,
        }));
      const collaborations = collaboratorMap.get(normalize(displayName)) ?? collaboratorMap.get(normalize(row.name)) ?? new Set<string>();
      const presentDates = attendanceMap.get(row.id) ?? [];
      const memberContributions = contributionMap.get(row.id) ?? [];
      const contributionPoints = memberContributions.reduce((sum, entry) => sum + (Number(entry.points) || 0), 0);
      const contributionScore = Math.max(Number(row.contributions) || 0, contributionPoints);
      const latestContributionTime = memberContributions[0]
        ? new Date(`${memberContributions[0].contribution_date}T00:00:00`).getTime()
        : 0;
      const latestMeetingTime = presentDates[0]
        ? new Date(`${presentDates[presentDates.length - 1]}T00:00:00`).getTime()
        : 0;
      const avatar = getAuthAvatar(authUser);
      const founder = founderCandidate ? founderCandidate.user_id === row.user_id : false;
      const activeSignal = Math.max(latestContributionTime, latestMeetingTime);
      const recentlyActive = Boolean(activeSignal && now - activeSignal < ninetyDaysMs);

      const timeline = [
        {
          date: getSafeDate(row.join_date ?? row.created_at),
          titleEn: founder ? 'Began building Student Startups' : 'Joined Student Startups',
          titleKo: founder ? 'Student Startups 구축 시작' : 'Student Startups 합류',
          detailEn: founder
            ? 'Set the operating direction and public standard for the platform.'
            : `Joined the ${row.team !== 'Unassigned' ? row.team : 'core'} function.`,
          detailKo: founder
            ? '플랫폼의 운영 방향과 공개 기준을 세웠습니다.'
            : `${row.team !== 'Unassigned' ? row.team : '핵심 운영'} 영역에 합류했습니다.`,
          type: 'joined' as const,
        },
        ...memberProjects.slice(0, 2).map((project) => {
          const sourceProject = projectRows.find((rowProject) => rowProject.id === project.id);
          return {
            date: getSafeDate(sourceProject?.start_date),
            titleEn: `Worked on ${project.name}`,
            titleKo: `${project.name} 참여`,
            detailEn: `${project.stageName} work contributed to the public record.`,
            detailKo: `${project.stageName} 단계의 작업에 기여했습니다.`,
            type: 'project' as const,
          };
        }),
        ...memberContributions.slice(0, 2).map((entry) => ({
          date: entry.contribution_date,
          titleEn: entry.title,
          titleKo: entry.title,
          detailEn: entry.notes ?? undefined,
          detailKo: entry.notes ?? undefined,
          type: 'achievement' as const,
        })),
      ]
        .filter((entry, index, arr) => arr.findIndex((candidate) => `${candidate.date}-${candidate.titleEn}` === `${entry.date}-${entry.titleEn}`) === index)
        .sort((a, b) => b.date.localeCompare(a.date));

      const roleIsLead = /founder|lead|director|owner|head/i.test(row.role);
      const photo = avatar;
      const bannerImage = toPublicStorageUrl(memberProjects[0]?.image) || photo;

      return {
        id: row.id,
        slug: slugify(displayName),
        name: displayName,
        role: row.role || (founder ? 'Founder' : 'Member'),
        team: row.team || (founder ? 'Platform' : 'Unassigned'),
        joinDate: getSafeDate(row.join_date ?? row.created_at),
        photo,
        bannerImage,
        founder,
        featured: founder || roleIsLead || memberProjects.length >= 2 || contributionScore >= 10,
        recentlyActive,
        leadershipEn: [],
        leadershipKo: [],
        currentGoalsEn: [],
        currentGoalsKo: [],
        achievementsEn: [],
        achievementsKo: [],
        skills: [],
        interests: [],
        timeline,
        projects: memberProjects,
        links: founder ? [{ label: 'Email', href: 'mailto:bnssstudentstartups@gmail.com' }] : [],
        stats: {
          projects: memberProjects.length,
          collaborations: collaborations.size,
          events: presentDates.length,
          contributions: contributionScore,
        },
      };
    })
      .sort((a, b) => {
        if (a.founder !== b.founder) return a.founder ? -1 : 1;
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if (a.stats.projects !== b.stats.projects) return b.stats.projects - a.stats.projects;
        if (a.stats.contributions !== b.stats.contributions) return b.stats.contributions - a.stats.contributions;
        return a.joinDate.localeCompare(b.joinDate);
      });

    return res.status(200).json({ members });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load team data';
    return res.status(500).json({ error: message });
  }
}
