import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import AnimatedProgress from '@/components/features/AnimatedProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { LogOut, Calendar, Award, Users, Clock, CheckCircle, XCircle, Edit3 } from 'lucide-react';

type MemberRow = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  contributions: number;
  join_date: string;
};

type AttendanceRow = {
  id: string;
  status: 'present' | 'absent';
  feedback: string;
  meeting_role?: string | null;
  meeting: { id: string; meeting_date: string } | null;
};

type MeetingView = {
  id: string;
  date: string;
  status: 'present' | 'absent';
  feedback: string;
  meetingRole: string;
};

type ContributionRow = {
  id: string;
  title: string;
  points: number;
  notes: string | null;
  contribution_date: string;
};

export default function MemberPortal() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [member, setMember] = useState<MemberRow | null>(null);
  const [meetings, setMeetings] = useState<MeetingView[]>([]);
  const [contributions, setContributions] = useState<ContributionRow[]>([]);
  const [contributionsLoading, setContributionsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';

  useEffect(() => {
    setEditName(displayName);
  }, [displayName]);

  useEffect(() => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const loadMember = async () => {
      setLoading(true);
      const { data: memberRow } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      let resolvedMember = memberRow as MemberRow | null;
      if (!resolvedMember) {
        const { data: inserted } = await supabase
          .from('members')
          .insert({
            user_id: user.id,
            name: displayName,
            email: user.email ?? '',
            role: 'Member',
            team: 'Unassigned',
            contributions: 0,
          })
          .select('*')
          .single();
        resolvedMember = inserted as MemberRow | null;
      }

      if (cancelled) return;
      setMember(resolvedMember);
      if (resolvedMember) {
        setEditName(resolvedMember.name || displayName);
      }
      setLoading(false);
    };

    loadMember();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!member || !supabase) return;
    let cancelled = false;

    const loadAttendance = async () => {
      const { data } = await supabase
        .from('attendance')
        .select('id,status,feedback,meeting_role, meeting:meetings(id, meeting_date)')
        .eq('member_id', member.id)
        .order('meeting_date', { foreignTable: 'meeting', ascending: false });

      if (cancelled) return;
      const mapped = (data as AttendanceRow[] | null)?.map((row) => ({
        id: row.id,
        status: row.status,
        feedback: row.feedback,
        date: row.meeting?.meeting_date ?? '',
        meetingRole: row.meeting_role ?? '',
      })) ?? [];
      setMeetings(mapped);
    };

    const loadContributions = async () => {
      setContributionsLoading(true);
      const { data } = await supabase
        .from('contributions')
        .select('id,title,points,notes,contribution_date')
        .eq('member_id', member.id)
        .order('contribution_date', { ascending: false });
      if (cancelled) return;
      setContributions((data as ContributionRow[] | null) ?? []);
      setContributionsLoading(false);
    };

    loadAttendance();
    loadContributions();

    if (!isSupabaseConfigured) return () => {};

    const attendanceChannel = supabase
      .channel(`attendance-member-${member.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance', filter: `member_id=eq.${member.id}` },
        () => loadAttendance()
      )
      .subscribe();

    const contributionsChannel = supabase
      .channel(`contributions-member-${member.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contributions', filter: `member_id=eq.${member.id}` },
        () => loadContributions()
      )
      .subscribe();

    const memberChannel = supabase
      .channel(`member-profile-${member.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members', filter: `id=eq.${member.id}` },
        (payload) => {
          const next = payload.new as MemberRow;
          setMember(next);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(attendanceChannel);
      supabase.removeChannel(contributionsChannel);
      supabase.removeChannel(memberChannel);
    };
  }, [member?.id]);

  const handleLogout = () => {
    supabase?.auth.signOut();
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    if (supabase && user) {
      await supabase.auth.updateUser({ data: { full_name: editName } });
      if (member) {
        await supabase
          .from('members')
          .update({ name: editName })
          .eq('id', member.id);
      }
    }
    setSavingProfile(false);
    setEditMode(false);
  };

  const tabs = ['overview', 'meetings', 'stats'];

  const attendanceCount = useMemo(
    () => meetings.filter((m) => m.status === 'present').length,
    [meetings]
  );
  const contributionTotal = useMemo(
    () => contributions.reduce((sum, entry) => sum + (Number(entry.points) || 0), 0),
    [contributions]
  );
  const totalMeetings = meetings.length;
  const profile = member ?? {
    name: displayName,
    email: user?.email ?? '',
    role: 'Member',
    team: 'Unassigned',
    contributions: contributionTotal,
    join_date: new Date().toISOString().slice(0, 10),
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-beige">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-border border-t-[hsl(24,80%,50%)]" />
          <p className="mt-4 text-sm text-light">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-charcoal pb-6 pt-24 lg:pt-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40">{t('portal.dashboard')}</p>
              <div className="flex items-center gap-3 mt-1">
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-lg border border-white/20 bg-card/10 px-3 py-1.5 text-xl font-bold text-white outline-none"
                    />
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="rounded-full bg-card/20 px-3 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {savingProfile ? t('portal.saving') : t('portal.save')}
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white">{editName}</h1>
                    <button onClick={() => setEditMode(true)} className="text-white/40 hover:text-white transition-colors">
                      <Edit3 className="size-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-card/10 transition-all"
            >
              <LogOut className="size-4" />
              {t('portal.logout')}
            </button>
          </div>

          <div className="mt-5 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-beige text-charcoal' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t(`portal.${tab}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-beige py-8 lg:py-10">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { icon: Users, label: t('portal.team'), value: profile.team, color: 'bg-blue-50 text-blue-600' },
                    { icon: Award, label: t('portal.role'), value: profile.role, color: 'bg-amber-50 text-amber-600' },
                    { icon: Calendar, label: t('portal.attendance'), value: `${attendanceCount}/${totalMeetings}`, color: 'bg-emerald-50 text-emerald-600' },
                    { icon: Clock, label: t('portal.joined'), value: profile.join_date, color: 'bg-violet-50 text-violet-600' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-xl border border-border bg-card p-5"
                    >
                      <div className={`inline-flex size-9 items-center justify-center rounded-lg ${item.color}`}>
                        <item.icon className="size-4" />
                      </div>
                      <p className="mt-3 text-xs text-light">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold text-charcoal">{item.value}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'meetings' && (
              <motion.div key="meetings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted px-5 py-3">
                    <span className="col-span-3 text-xs font-semibold text-mid">{t('portal.meetingDate')}</span>
                    <span className="col-span-2 text-xs font-semibold text-mid">{t('portal.meetingStatus')}</span>
                    <span className="col-span-2 text-xs font-semibold text-mid">{t('portal.meetingRole')}</span>
                    <span className="col-span-5 text-xs font-semibold text-mid">{t('portal.meetingFeedback')}</span>
                  </div>
                  {meetings.length === 0 ? (
                    <div className="px-5 py-6 text-sm text-light">No meetings yet.</div>
                  ) : (
                    meetings.map((meeting) => (
                      <div key={meeting.id} className="grid grid-cols-12 gap-4 border-b border-border px-5 py-3.5 last:border-b-0">
                        <span className="col-span-3 text-sm text-charcoal tabular-nums">{meeting.date || '—'}</span>
                        <span className="col-span-2 flex items-center gap-1.5 text-sm">
                          {meeting.status === 'present' ? (
                          <><CheckCircle className="size-3.5 text-emerald-500" /> <span className="text-emerald-600">{t('portal.present')}</span></>
                        ) : (
                          <><XCircle className="size-3.5 text-red-400" /> <span className="text-red-500">{t('portal.absent')}</span></>
                        )}
                        </span>
                        <span className="col-span-2 text-sm text-mid">{meeting.meetingRole || '—'}</span>
                        <span className="col-span-5 text-sm text-mid leading-relaxed">{meeting.feedback || '—'}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-charcoal">{t('portal.attendance')}</h3>
                  <div className="mt-5">
                    <AnimatedProgress value={attendanceCount} max={Math.max(totalMeetings, 1)} label={`${attendanceCount} of ${totalMeetings} meetings`} color="bg-emerald-500" />
                  </div>
                  <p className="mt-4 text-4xl font-bold text-charcoal tabular-nums">
                    {totalMeetings ? Math.round((attendanceCount / totalMeetings) * 100) : 0}%
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-charcoal">{t('portal.contributions')}</h3>
                  <div className="mt-5">
                    <p className="text-4xl font-bold text-[hsl(24,80%,50%)] tabular-nums">{contributionTotal}</p>
                    <p className="mt-2 text-sm text-mid">{t('portal.contributionSummary')}</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {contributionsLoading ? (
                      <p className="text-sm text-light">{t('common.loading')}</p>
                    ) : contributions.length === 0 ? (
                      <p className="text-sm text-light">{t('portal.noContributions')}</p>
                    ) : (
                      contributions.slice(0, 6).map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                          <div>
                            <p className="text-xs font-semibold text-charcoal">{entry.title}</p>
                            <p className="text-[11px] text-light">{entry.contribution_date}</p>
                          </div>
                          <span className="text-xs font-semibold text-[hsl(24,80%,50%)]">{entry.points}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
