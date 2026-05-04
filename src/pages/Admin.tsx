import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Project, Product } from '@/types';
import { useCMSStore, type ImpactMetricRecord, type RevenuePoint, type DonationPoint, type MemberGrowthPoint } from '@/stores/cmsStore';
import { useSiteContentStore, type SiteContent } from '@/stores/siteContentStore';
import { useSiteThemeStore, type SiteTheme } from '@/stores/siteThemeStore';
import { useSiteCopyStore } from '@/stores/siteCopyStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { resolveStorageUrl, toPublicStorageUrl } from '@/lib/storage';
import ProductImageCropDialog from '@/components/admin/ProductImageCropDialog';
import { createProductImageFileFromUrl, cropProductImageToSquare, getFilePreviewUrl } from '@/lib/productImageUpload';
import { TEAM_OPTIONS, STAGE_LABELS_EN, TERMS } from '@/constants/config';
import { translations } from '@/constants/translations';
import { normalizeHex } from '@/lib/color';
import { Users as UsersIcon, FolderOpen, ShoppingBag, BarChart3, MessageSquare, CheckCircle, XCircle, Save, FileText, Trash2, Package, Palette, Type, Crop, Minus } from 'lucide-react';

type MemberRow = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  contributions: number;
  join_date: string;
  is_verified?: boolean;
};

type MemberRecord = MemberRow & {
  attendance: number;
  totalMeetings: number;
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
  attendanceId: string;
  date: string;
  status: 'present' | 'absent';
  feedback: string;
  meetingRole: string;
};

type MeetingRow = {
  id: string;
  meeting_date: string;
};

type MeetingAttendanceView = {
  attendanceId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  status: 'present' | 'absent';
};

type CopyDraft = {
  key: string;
  en: string;
  ko: string;
};

type ContributionRow = {
  id: string;
  member_id: string;
  title: string;
  points: number;
  notes: string | null;
  contribution_date: string;
  created_at: string;
};

type OrderRow = {
  id: string;
  buyer_name?: string;
  buyer_email?: string;
  total: number;
  created_at?: string;
  items: { name: string; qty: number; price: number }[];
  status?: 'pending' | 'completed' | 'cancelled';
  completed_at?: string | null;
  buyerName?: string;
  buyerEmail?: string;
  date?: string;
};

type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
  is_read?: boolean;
  is_resolved?: boolean;
};

type SaveState = {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
};

type UploadState = {
  status: 'idle' | 'uploading' | 'done' | 'error';
  message?: string;
};

type ProductCropSession = {
  productId: string;
  kind: 'main' | 'gallery';
  files: File[];
  index: number;
  sourceUrl: string;
  replaceUrl?: string;
};

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('members');
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [meetingEdits, setMeetingEdits] = useState<Record<string, { feedback?: string; role?: string }>>({});
  const [memberMeetings, setMemberMeetings] = useState<MeetingView[]>([]);
  const [memberMeetingsLoading, setMemberMeetingsLoading] = useState(false);
  const [meetings, setMeetings] = useState<MeetingRow[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [meetingAttendance, setMeetingAttendance] = useState<MeetingAttendanceView[]>([]);
  const [meetingAttendanceLoading, setMeetingAttendanceLoading] = useState(false);
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [meetingError, setMeetingError] = useState('');
  const [memberNotice, setMemberNotice] = useState('');
  const [memberError, setMemberError] = useState('');
  const [memberDeleting, setMemberDeleting] = useState(false);

  const formatMeetingDate = (date: string) => {
    if (!date) return '—';
    const local = new Date(`${date}T00:00:00`);
    if (Number.isNaN(local.getTime())) return date;
    return local.toLocaleDateString();
  };
  const [memberRoleInput, setMemberRoleInput] = useState('');
  const [memberTeamInput, setMemberTeamInput] = useState('');
  const [contributions, setContributions] = useState<ContributionRow[]>([]);
  const [contributionsLoading, setContributionsLoading] = useState(false);
  const [newContribution, setNewContribution] = useState({ title: '', points: '', notes: '', date: '' });
  const { content: siteContent, updateContent, status, error } = useSiteContentStore();
  const [saved, setSaved] = useState(false);
  const { theme, updateTheme, status: themeStatus, error: themeError } = useSiteThemeStore();
  const [themeSaved, setThemeSaved] = useState(false);
  const { copy, status: copyStatus, error: copyError } = useSiteCopyStore();
  const [copyDrafts, setCopyDrafts] = useState<CopyDraft[]>([]);
  const [copySearch, setCopySearch] = useState('');
  const [copyNotice, setCopyNotice] = useState('');
  const [newTermInput, setNewTermInput] = useState('');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const activeMember = members.find((m) => m.id === selectedMember);
  const memberOptions = useMemo(
    () => members.map((m) => ({ id: m.id, label: m.name || m.email })),
    [members]
  );
  const cmsProjects = useCMSStore((s) => s.projects);
  const cmsProducts = useCMSStore((s) => s.products);
  const cmsImpactMetrics = useCMSStore((s) => s.impactMetrics);
  const cmsRevenueData = useCMSStore((s) => s.revenueData);
  const cmsDonationData = useCMSStore((s) => s.donationData);
  const cmsGrowthData = useCMSStore((s) => s.memberGrowthData);
  const cmsSources = useCMSStore((s) => s.sources);
  const cmsStatus = useCMSStore((s) => s.status);
  const cmsError = useCMSStore((s) => s.error);
  const [projectDrafts, setProjectDrafts] = useState<Project[]>([]);
  const [productDrafts, setProductDrafts] = useState<Product[]>([]);
  const [metricDrafts, setMetricDrafts] = useState<ImpactMetricRecord[]>([]);
  const [revenueDrafts, setRevenueDrafts] = useState<RevenuePoint[]>([]);
  const [donationDrafts, setDonationDrafts] = useState<DonationPoint[]>([]);
  const [growthDrafts, setGrowthDrafts] = useState<MemberGrowthPoint[]>([]);
  const [cmsNotice, setCmsNotice] = useState('');
  const [projectSaveState, setProjectSaveState] = useState<Record<string, SaveState>>({});
  const [productSaveState, setProductSaveState] = useState<Record<string, SaveState>>({});
  const [projectUploadState, setProjectUploadState] = useState<Record<string, UploadState>>({});
  const [productUploadState, setProductUploadState] = useState<Record<string, UploadState>>({});
  const [projectDirty, setProjectDirty] = useState<Record<string, boolean>>({});
  const [productDirty, setProductDirty] = useState<Record<string, boolean>>({});
  const [projectImagePreview, setProjectImagePreview] = useState<Record<string, string>>({});
  const [projectBannerPreview, setProjectBannerPreview] = useState<Record<string, string>>({});
  const [productImagePreview, setProductImagePreview] = useState<Record<string, string>>({});
  const [productCropSession, setProductCropSession] = useState<ProductCropSession | null>(null);
  const activeProjectCount = useMemo(
    () => cmsProjects.filter((project) => (project.status ?? 'active').toLowerCase() === 'active').length,
    [cmsProjects]
  );
  const unreadMessagesCount = useMemo(
    () => messages.filter((message) => !message.is_read).length,
    [messages]
  );
  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => (order.status ?? 'pending') !== 'completed').length,
    [orders]
  );
  const lowStockProducts = useMemo(
    () => cmsProducts
      .filter((product) => product.inventory > 0 && product.inventory <= 5)
      .sort((a, b) => a.inventory - b.inventory)
      .slice(0, 4),
    [cmsProducts]
  );
  const projectsMissingMedia = useMemo(
    () => cmsProjects
      .filter((project) => !project.image?.trim() || !project.bannerImage?.trim())
      .slice(0, 4),
    [cmsProjects]
  );
  const unassignedMembers = useMemo(
    () => members
      .filter((member) => {
        const normalizedTeam = member.team?.trim().toLowerCase();
        return !normalizedTeam || normalizedTeam === 'unassigned' || normalizedTeam === 'tbd' || normalizedTeam === 'none';
      })
      .slice(0, 4),
    [members]
  );
  const averageAttendanceRate = useMemo(() => {
    const membersWithMeetings = members.filter((member) => member.totalMeetings > 0);
    if (!membersWithMeetings.length) return null;
    const totalRate = membersWithMeetings.reduce(
      (sum, member) => sum + (member.attendance / member.totalMeetings) * 100,
      0
    );
    return Math.round(totalRate / membersWithMeetings.length);
  }, [members]);
  const nextMeeting = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return meetings
      .map((meeting) => ({
        ...meeting,
        timestamp: new Date(`${meeting.meeting_date}T00:00:00`).getTime(),
      }))
      .filter((meeting) => Number.isFinite(meeting.timestamp) && meeting.timestamp >= today.getTime())
      .sort((a, b) => a.timestamp - b.timestamp)[0] ?? null;
  }, [meetings]);

  const loadOrders = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders((data as OrderRow[] | null) ?? []);
  };

  const loadMessages = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    setMessages((data as MessageRow[] | null) ?? []);
  };

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      let ordersChannel: ReturnType<typeof supabase.channel> | null = null;
      let messagesChannel: ReturnType<typeof supabase.channel> | null = null;

      loadOrders();
      loadMessages();

      ordersChannel = supabase
        .channel('orders-admin-feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          loadOrders();
        })
        .subscribe();

      messagesChannel = supabase
        .channel('messages-admin-feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
          loadMessages();
        })
        .subscribe();

      return () => {
        if (ordersChannel) supabase.removeChannel(ordersChannel);
        if (messagesChannel) supabase.removeChannel(messagesChannel);
      };
    } else {
      const storedOrders = JSON.parse(localStorage.getItem('bnss-orders') || '[]');
      const normalizedOrdersLocal = storedOrders.map((order: OrderRow, index: number) => ({
        id: order.id ?? `local-order-${index}`,
        status: order.status ?? 'pending',
        ...order,
      }));
      setOrders(normalizedOrdersLocal);

      const storedMessages = JSON.parse(localStorage.getItem('bnss-messages') || '[]');
      const normalizedMessagesLocal = storedMessages.map((message: MessageRow, index: number) => ({
        id: message.id ?? `local-message-${index}`,
        is_read: message.is_read ?? false,
        is_resolved: message.is_resolved ?? false,
        ...message,
      }));
      setMessages(normalizedMessagesLocal);
    }
  }, []);

  const loadMembers = async () => {
    if (!supabase) return;
    setMembersLoading(true);

    const { data: memberRows } = await supabase
      .from('members')
      .select('*')
      .eq('is_verified', true)
      .order('created_at', { ascending: false });

    const { data: attendanceRows } = await supabase
      .from('attendance')
      .select('member_id,status');

    const countMap = new Map<string, { present: number; total: number }>();
    (attendanceRows as { member_id: string; status: 'present' | 'absent' }[] | null)?.forEach((row) => {
      const current = countMap.get(row.member_id) ?? { present: 0, total: 0 };
      current.total += 1;
      if (row.status === 'present') current.present += 1;
      countMap.set(row.member_id, current);
    });

    const mapped = (memberRows as MemberRow[] | null)?.map((member) => {
      const counts = countMap.get(member.id) ?? { present: 0, total: 0 };
      return {
        ...member,
        attendance: counts.present,
        totalMeetings: counts.total,
      };
    }) ?? [];

    setMembers(mapped);
    setMembersLoading(false);
  };

  const loadMemberMeetings = async (memberId: string) => {
    if (!supabase) return;
    setMemberMeetingsLoading(true);

    const { data } = await supabase
      .from('attendance')
      .select('id,status,feedback,meeting_role, meeting:meetings(id, meeting_date)')
      .eq('member_id', memberId)
      .order('meeting_date', { foreignTable: 'meeting', ascending: false });

    const mapped = (data as AttendanceRow[] | null)?.map((row) => ({
      id: row.meeting?.id ?? row.id,
      attendanceId: row.id,
      date: row.meeting?.meeting_date ?? '',
      status: row.status,
      feedback: row.feedback,
      meetingRole: row.meeting_role ?? '',
    })) ?? [];

    setMemberMeetings(mapped);
    setMemberMeetingsLoading(false);
  };

  const loadMeetings = async () => {
    if (!supabase) return;
    setMeetingsLoading(true);
    const { data } = await supabase
      .from('meetings')
      .select('id, meeting_date')
      .order('meeting_date', { ascending: false });
    setMeetings((data as MeetingRow[] | null) ?? []);
    setMeetingsLoading(false);
  };

  const loadMeetingAttendance = async (meetingId: string) => {
    if (!supabase) return;
    setMeetingAttendanceLoading(true);
    const { data } = await supabase
      .from('attendance')
      .select('id,status, member:members(id,name,email)')
      .eq('meeting_id', meetingId)
      .order('member_id', { ascending: true });

    const rows = ((data as {
      id: string;
      status: 'present' | 'absent';
      member: { id: string; name: string; email: string } | null;
    }[] | null) ?? [])
      .filter((row) => row.member)
      .map((row) => ({
        attendanceId: row.id,
        memberId: row.member?.id ?? '',
        memberName: row.member?.name ?? row.member?.email ?? '',
        memberEmail: row.member?.email ?? '',
        status: row.status,
      }));

    setMeetingAttendance(rows);
    setMeetingAttendanceLoading(false);
  };

  const handleCreateMeeting = async () => {
    if (!newMeetingDate || !supabase) return;
    setMeetingError('');
    const { error: createError } = await supabase
      .from('meetings')
      .insert({ meeting_date: newMeetingDate });
    if (createError) {
      setMeetingError(createError.message);
      return;
    }
    setNewMeetingDate('');
    loadMeetings();
    const { data: createdMeeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('meeting_date', newMeetingDate)
      .maybeSingle();
    const nextMeetingId = (createdMeeting as { id: string } | null)?.id;
    if (nextMeetingId) {
      setSelectedMeetingId(nextMeetingId);
      loadMeetingAttendance(nextMeetingId);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!supabase) return;
    await supabase.from('meetings').delete().eq('id', meetingId);
    if (selectedMeetingId === meetingId) {
      setSelectedMeetingId(null);
      setMeetingAttendance([]);
    }
    loadMeetings();
    if (selectedMember) loadMemberMeetings(selectedMember);
    loadMembers();
  };

  const handleDeleteMember = async () => {
    if (!supabase || !activeMember) return;
    const confirmDelete = window.confirm(
      `Delete ${activeMember.name}? This removes their profile, attendance, and contributions.`
    );
    if (!confirmDelete) return;

    setMemberDeleting(true);
    setMemberNotice('');
    setMemberError('');

    const { error: deleteError } = await supabase
      .from('members')
      .delete()
      .eq('id', activeMember.id);

    if (deleteError) {
      setMemberError(deleteError.message);
      setMemberDeleting(false);
      return;
    }

    setSelectedMember(null);
    setMemberRoleInput('');
    setMemberTeamInput('');
    setMeetingEdits({});
    setMemberMeetings([]);
    setContributions([]);
    setMemberNotice('Member deleted.');
    await loadMembers();
    setMemberDeleting(false);
  };

  const loadContributions = async (memberId: string) => {
    if (!supabase) return;
    setContributionsLoading(true);
    const { data } = await supabase
      .from('contributions')
      .select('*')
      .eq('member_id', memberId)
      .order('contribution_date', { ascending: false });
    setContributions((data as ContributionRow[] | null) ?? []);
    setContributionsLoading(false);
  };

  const handleAddContribution = async () => {
    if (!supabase || !activeMember) return;
    const points = Number(newContribution.points);
    if (!newContribution.title.trim() || !Number.isFinite(points)) return;
    await supabase
      .from('contributions')
      .insert({
        member_id: activeMember.id,
        title: newContribution.title.trim(),
        points,
        notes: newContribution.notes.trim(),
        contribution_date: newContribution.date || new Date().toISOString().slice(0, 10),
      });
    setNewContribution({ title: '', points: '', notes: '', date: '' });
  };

  const handleDeleteContribution = async (id: string) => {
    if (!supabase) return;
    await supabase.from('contributions').delete().eq('id', id);
  };

  const updateMember = async (payload: Partial<MemberRow>) => {
    if (!supabase || !activeMember) return;
    await supabase
      .from('members')
      .update(payload)
      .eq('id', activeMember.id);
  };

  const handleSaveMeeting = async (attendanceId: string, currentRole: string, currentFeedback: string) => {
    if (!supabase) return;
    const edits = meetingEdits[attendanceId] ?? {};
    await supabase
      .from('attendance')
      .update({
        meeting_role: edits.role ?? currentRole ?? '',
        feedback: edits.feedback ?? currentFeedback ?? '',
      })
      .eq('id', attendanceId);
  };

  const updateOrderStatus = async (orderId: string, statusValue: 'pending' | 'completed') => {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('orders')
        .update({
          status: statusValue,
          completed_at: statusValue === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', orderId);
    } else {
      const next = orders.map((order) =>
        order.id === orderId ? { ...order, status: statusValue } : order
      );
      setOrders(next);
      localStorage.setItem('bnss-orders', JSON.stringify(next));
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('orders').delete().eq('id', orderId);
    } else {
      const next = orders.filter((order) => order.id !== orderId);
      setOrders(next);
      localStorage.setItem('bnss-orders', JSON.stringify(next));
    }
  };

  const updateMessageFlags = async (messageId: string, patch: Partial<MessageRow>) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('messages').update(patch).eq('id', messageId);
    } else {
      const next = messages.map((message) =>
        message.id === messageId ? { ...message, ...patch } : message
      );
      setMessages(next);
      localStorage.setItem('bnss-messages', JSON.stringify(next));
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('messages').delete().eq('id', messageId);
    } else {
      const next = messages.filter((message) => message.id !== messageId);
      setMessages(next);
      localStorage.setItem('bnss-messages', JSON.stringify(next));
    }
  };

  const createId = () => (
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`
  );

  const dedupeImages = (images: string[]) => (
    Array.from(new Set(images.map((img) => toPublicStorageUrl(img.trim())).filter(Boolean)))
  );

  const projectStatusOptions = ['active', 'paused', 'completed', 'archived'];

  const normalizeProductImages = (mainImage: string, images: string[] | undefined) => {
    const normalizedMain = toPublicStorageUrl(mainImage);
    const base = dedupeImages(images ?? []);
    if (!normalizedMain) return base;
    const withoutMain = base.filter((img) => img !== normalizedMain);
    return [normalizedMain, ...withoutMain];
  };

  const createProjectDraft = (): Project => ({
    id: `project-${createId()}`,
    name: 'New Project',
    description: '',
    stage: 1,
    stageName: STAGE_LABELS_EN[1],
    revenue: 0,
    expenses: 0,
    profit: 0,
    fundraise: 0,
    donation: 0,
    donationPercent: 0,
    team: [],
    image: '',
    bannerImage: '',
    startDate: new Date().toISOString().slice(0, 10),
    category: '',
    term: '',
    status: 'active',
  });

  const createProductDraft = (): Product => ({
    id: `product-${createId()}`,
    name: 'New Product',
    description: '',
    price: 0,
    image: '',
    images: [],
    category: '',
    inventory: 0,
    isPreOrder: false,
    projectId: undefined,
    term: '',
    status: 'available',
  });

  const mapProjectToRow = (project: Project) => {
    const normalized = normalizeProject(project);
    return ({
      id: normalized.id,
      name: normalized.name,
      description: normalized.description,
      stage: Number(normalized.stage) || 1,
      stage_name: normalized.stageName,
      revenue: Number(normalized.revenue) || 0,
      expenses: Number(normalized.expenses) || 0,
      profit: Number(normalized.profit) || 0,
      fundraise: Number(normalized.fundraise) || 0,
      donation: Number(normalized.donation) || 0,
      donation_percent: Number(normalized.donationPercent) || 0,
      team: normalized.team ?? [],
      image_url: normalized.image,
      banner_image_url: normalized.bannerImage ?? '',
      start_date: normalized.startDate,
      category: normalized.category,
      term: normalized.term,
      status: normalized.status ?? 'active',
    });
  };

  const mapProductToRow = (product: Product) => {
    const images = normalizeProductImages(product.image, product.images);
    const inventory = Number(product.inventory) || 0;
    const resolvedStatus = inventory <= 0
      ? 'sold-out'
      : product.status === 'sold-out'
        ? (product.isPreOrder ? 'in-production' : 'available')
        : (product.status ?? 'available');
    return ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price) || 0,
      image_url: product.image,
      images,
      category: product.category,
      inventory,
      is_preorder: Boolean(product.isPreOrder),
      project_id: product.projectId ?? null,
      term: product.term,
      status: resolvedStatus,
    });
  };

  const syncProjectToCMS = async (project: Project) => {
    const normalized = normalizeProject(project);
    const image = normalized.image ? await resolveStorageUrl(normalized.image) : normalized.image;
    const bannerImage = normalized.bannerImage ? await resolveStorageUrl(normalized.bannerImage) : normalized.bannerImage;
    useCMSStore.setState((state) => {
      const nextProject = { ...normalized, image, bannerImage };
      const existingIndex = state.projects.findIndex((item) => item.id === normalized.id);
      const nextProjects = existingIndex === -1
        ? [...state.projects, nextProject]
        : state.projects.map((item) => (item.id === normalized.id ? nextProject : item));
      return { projects: nextProjects };
    });
  };

  const syncProductToCMS = async (product: Product) => {
    const normalizedImages = normalizeProductImages(product.image, product.images);
    const image = toPublicStorageUrl(product.image);
    const images = normalizedImages.map((img) => toPublicStorageUrl(img));
    useCMSStore.setState((state) => {
      const nextProduct = { ...product, image, images };
      const existingIndex = state.products.findIndex((item) => item.id === product.id);
      const nextProducts = existingIndex === -1
        ? [...state.products, nextProduct]
        : state.products.map((item) => (item.id === product.id ? nextProduct : item));
      return { products: nextProducts };
    });
  };

  const handleSaveProject = async (project: Project) => {
    if (!supabase) return;
    setProjectSaveState((prev) => ({ ...prev, [project.id]: { status: 'saving' } }));
    const { error: saveError } = await supabase
      .from('projects')
      .upsert(mapProjectToRow(project));
    if (saveError) {
      setProjectSaveState((prev) => ({ ...prev, [project.id]: { status: 'error', message: saveError.message } }));
      setCmsNotice(saveError.message);
      return;
    }
    setProjectSaveState((prev) => ({ ...prev, [project.id]: { status: 'saved' } }));
    setProjectDirty((prev) => ({ ...prev, [project.id]: false }));
    setCmsNotice('Project saved');
    void syncProjectToCMS(project);
    void useCMSStore.getState().hydrate();
    window.setTimeout(() => {
      setProjectSaveState((prev) => ({ ...prev, [project.id]: { status: 'idle' } }));
    }, 1800);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!supabase) return;
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    if (deleteError) {
      setCmsNotice(deleteError.message);
      return;
    }
    setProjectDrafts((prev) => prev.filter((project) => project.id !== projectId));
    setProjectDirty((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
    setProjectSaveState((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
    setProjectUploadState((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
    setProjectImagePreview((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
    setProjectBannerPreview((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
    useCMSStore.setState((state) => ({
      projects: state.projects.filter((project) => project.id !== projectId),
    }));
    setCmsNotice('Project deleted');
  };

  const handleSaveProduct = async (product: Product) => {
    if (!supabase) return;
    const inventory = Number(product.inventory) || 0;
    const resolvedStatus = inventory <= 0
      ? 'sold-out'
      : product.status === 'sold-out'
        ? (product.isPreOrder ? 'in-production' : 'available')
        : (product.status ?? 'available');
    const normalizedProduct = { ...product, inventory, status: resolvedStatus };
    setProductSaveState((prev) => ({ ...prev, [product.id]: { status: 'saving' } }));
    const { error: saveError } = await supabase
      .from('products')
      .upsert(mapProductToRow(normalizedProduct));
    if (saveError) {
      setProductSaveState((prev) => ({ ...prev, [product.id]: { status: 'error', message: saveError.message } }));
      setCmsNotice(saveError.message);
      return;
    }
    setProductSaveState((prev) => ({ ...prev, [product.id]: { status: 'saved' } }));
    setProductDirty((prev) => ({ ...prev, [product.id]: false }));
    setCmsNotice('Product saved');
    setProductDrafts((prev) => prev.map((item) => (item.id === product.id ? normalizedProduct : item)));
    void syncProductToCMS(normalizedProduct);
    void useCMSStore.getState().hydrate();
    window.setTimeout(() => {
      setProductSaveState((prev) => ({ ...prev, [product.id]: { status: 'idle' } }));
    }, 1800);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!supabase) return;
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (deleteError) {
      setCmsNotice(deleteError.message);
      return;
    }
    setProductDrafts((prev) => prev.filter((product) => product.id !== productId));
    setProductDirty((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    setProductSaveState((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    setProductUploadState((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    setProductImagePreview((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    useCMSStore.setState((state) => ({
      products: state.products.filter((product) => product.id !== productId),
    }));
    setCmsNotice('Product deleted');
  };

  const uploadToBucket = async (bucket: string, filePath: string, file: File) => {
    if (!supabase) return { url: null, error: 'Supabase not configured' };
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || undefined,
        cacheControl: '31536000',
      });
    if (uploadError) {
      setCmsNotice(uploadError.message);
      return { url: null, error: uploadError.message };
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  };

  const startProductCropSession = async (
    productId: string,
    kind: ProductCropSession['kind'],
    files: File[],
    options?: { replaceUrl?: string; sourceUrl?: string }
  ) => {
    if (!files.length) return;
    try {
      const sourceUrl = options?.sourceUrl ?? await getFilePreviewUrl(files[0]);
      setProductUploadState((prev) => ({ ...prev, [productId]: { status: 'uploading' } }));
      setProductCropSession({
        productId,
        kind,
        files,
        index: 0,
        sourceUrl,
        replaceUrl: options?.replaceUrl,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load the selected image.';
      setProductUploadState((prev) => ({ ...prev, [productId]: { status: 'error', message } }));
    }
  };

  const uploadProcessedMainProductImage = async (productId: string, file: File, replaceUrl?: string) => {
    const safeName = file.name.replace(/\s+/g, '-');
    const path = `${productId}/${Date.now()}-${safeName}`;
    const { url, error } = await uploadToBucket('product-images', path, file);
    if (!url) {
      throw new Error(error ?? 'Upload failed');
    }
    const previewUrl = await resolveStorageUrl(url);
    const replaceTarget = replaceUrl ? toPublicStorageUrl(replaceUrl) : '';
    setProductDrafts((prev) => (
      prev.map((p) => (
        p.id === productId
          ? {
              ...p,
              image: url,
              images: normalizeProductImages(
                url,
                replaceTarget
                  ? normalizeProductImages(p.image, p.images).map((img) => (img === replaceTarget ? url : img))
                  : p.images
              ),
            }
          : p
      ))
    ));
    setProductImagePreview((prev) => ({ ...prev, [productId]: previewUrl }));
    setProductDirty((prev) => ({ ...prev, [productId]: true }));
  };

  const uploadProcessedProductGalleryImage = async (productId: string, file: File, replaceUrl?: string) => {
    const safeName = file.name.replace(/\s+/g, '-');
    const path = `${productId}/gallery-${Date.now()}-${safeName}`;
    const { url, error } = await uploadToBucket('product-images', path, file);
    if (!url) {
      throw new Error(error ?? 'Upload failed');
    }

    const currentProduct = productDrafts.find((product) => product.id === productId);
    const replaceTarget = replaceUrl ? toPublicStorageUrl(replaceUrl) : '';
    setProductDrafts((prev) => (
      prev.map((p) => {
        if (p.id !== productId) return p;
        const mergedImages = replaceTarget
          ? normalizeProductImages(p.image, p.images).map((img) => (img === replaceTarget ? url : img))
          : normalizeProductImages(p.image, [...(p.images ?? []), url]);
        const nextMain = p.image === replaceTarget ? url : (p.image || mergedImages[0] || '');
        return { ...p, image: nextMain, images: normalizeProductImages(nextMain, mergedImages) };
      })
    ));
    if (!replaceTarget && !toPublicStorageUrl(currentProduct?.image ?? '')) {
      setProductImagePreview((prev) => ({ ...prev, [productId]: url }));
    }
    setProductDirty((prev) => ({ ...prev, [productId]: true }));
  };

  const handleRecropProductImage = async (product: Product, imageUrl: string) => {
    const targetUrl = toPublicStorageUrl(imageUrl);
    if (!targetUrl) return;

    try {
      const currentIsMain = toPublicStorageUrl(product.image) === targetUrl;
      const fallbackName = `${product.id}-${currentIsMain ? 'main' : 'gallery'}.jpg`;
      const file = await createProductImageFileFromUrl(targetUrl, fallbackName);
      await startProductCropSession(product.id, currentIsMain ? 'main' : 'gallery', [file], {
        replaceUrl: targetUrl,
        sourceUrl: targetUrl,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not reopen the current image for cropping.';
      setProductUploadState((prev) => ({ ...prev, [product.id]: { status: 'error', message } }));
    }
  };

  const handleRemoveProductImage = (product: Product, imageUrl: string) => {
    const targetUrl = toPublicStorageUrl(imageUrl);
    const currentImages = normalizeProductImages(product.image, product.images);
    const remainingImages = currentImages.filter((img) => img !== targetUrl);
    const nextMain = toPublicStorageUrl(product.image) === targetUrl ? (remainingImages[0] ?? '') : product.image;
    const nextImages = nextMain ? normalizeProductImages(nextMain, remainingImages) : [];

    updateProductDraft(product.id, { image: nextMain, images: nextImages });
    setProductImagePreview((prev) => ({ ...prev, [product.id]: nextMain }));
  };

  const finishProductUploadState = (productId: string) => {
    setProductUploadState((prev) => ({ ...prev, [productId]: { status: 'done' } }));
    window.setTimeout(() => {
      setProductUploadState((prev) => ({ ...prev, [productId]: { status: 'idle' } }));
    }, 1800);
  };

  const handleProductCropCancel = () => {
    if (productCropSession) {
      setProductUploadState((prev) => ({ ...prev, [productCropSession.productId]: { status: 'idle' } }));
    }
    setProductCropSession(null);
  };

  const handleProductCropSave = async (settings: { x: number; y: number; width: number; height: number }) => {
    if (!productCropSession) return;

    const session = productCropSession;
    const currentFile = session.files[session.index];

    try {
      const croppedFile = await cropProductImageToSquare(currentFile, session.sourceUrl, settings);

      if (session.kind === 'main') {
        await uploadProcessedMainProductImage(session.productId, croppedFile, session.replaceUrl);
      } else {
        await uploadProcessedProductGalleryImage(session.productId, croppedFile, session.replaceUrl);
      }

      const nextIndex = session.index + 1;
      if (nextIndex < session.files.length) {
        const nextSourceUrl = await getFilePreviewUrl(session.files[nextIndex]);
        setProductCropSession({
          ...session,
          index: nextIndex,
          sourceUrl: nextSourceUrl,
          replaceUrl: undefined,
        });
        return;
      }

      setProductCropSession(null);
      finishProductUploadState(session.productId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setProductUploadState((prev) => ({ ...prev, [session.productId]: { status: 'error', message } }));
      setProductCropSession(null);
    }
  };

  const handleProjectImageUpload = async (projectId: string, file?: File | null) => {
    if (!file) return;
    setProjectUploadState((prev) => ({ ...prev, [projectId]: { status: 'uploading' } }));
    const safeName = file.name.replace(/\\s+/g, '-');
    const path = `${projectId}/${Date.now()}-${safeName}`;
    const { url, error } = await uploadToBucket('project-images', path, file);
    if (!url) {
      setProjectUploadState((prev) => ({ ...prev, [projectId]: { status: 'error', message: error ?? 'Upload failed' } }));
      return;
    }
    const previewUrl = await resolveStorageUrl(url);
    setProjectDrafts((prev) => {
      const next = prev.map((p) => (p.id === projectId ? { ...p, image: url } : p));
      return next;
    });
    setProjectImagePreview((prev) => ({ ...prev, [projectId]: previewUrl }));
    setProjectDirty((prev) => ({ ...prev, [projectId]: true }));
    setProjectUploadState((prev) => ({ ...prev, [projectId]: { status: 'done' } }));
    window.setTimeout(() => {
      setProjectUploadState((prev) => ({ ...prev, [projectId]: { status: 'idle' } }));
    }, 1800);
  };

  const handleProjectBannerUpload = async (projectId: string, file?: File | null) => {
    if (!file) return;
    setProjectUploadState((prev) => ({ ...prev, [projectId]: { status: 'uploading' } }));
    const safeName = file.name.replace(/\\s+/g, '-');
    const path = `${projectId}/banner-${Date.now()}-${safeName}`;
    const { url, error } = await uploadToBucket('project-images', path, file);
    if (!url) {
      setProjectUploadState((prev) => ({ ...prev, [projectId]: { status: 'error', message: error ?? 'Upload failed' } }));
      return;
    }
    const previewUrl = await resolveStorageUrl(url);
    setProjectDrafts((prev) => (
      prev.map((p) => (p.id === projectId ? { ...p, bannerImage: url } : p))
    ));
    setProjectBannerPreview((prev) => ({ ...prev, [projectId]: previewUrl }));
    setProjectDirty((prev) => ({ ...prev, [projectId]: true }));
    setProjectUploadState((prev) => ({ ...prev, [projectId]: { status: 'done' } }));
    window.setTimeout(() => {
      setProjectUploadState((prev) => ({ ...prev, [projectId]: { status: 'idle' } }));
    }, 1800);
  };

  const handleProductImageUpload = async (productId: string, file?: File | null) => {
    if (!file) return;
    await startProductCropSession(productId, 'main', [file]);
  };

  const handleProductGalleryUpload = async (productId: string, files: FileList | null) => {
    if (!files || !files.length) return;
    await startProductCropSession(productId, 'gallery', Array.from(files));
  };

  const handleHeroBackgroundUpload = async (file?: File | null) => {
    if (!file) return;
    const safeName = file.name.replace(/\s+/g, '-');
    const path = `hero/${Date.now()}-${safeName}`;
    const { url } = await uploadToBucket('site-images', path, file);
    if (!url) return;
    updateContent({ heroBackgroundUrl: url });
  };

  const handleSeedProjects = async () => {
    if (!supabase) return;
    const { error: seedError } = await supabase.from('projects').upsert(cmsProjects.map(mapProjectToRow));
    setCmsNotice(seedError ? seedError.message : 'Projects seeded');
  };

  const handleSeedProducts = async () => {
    if (!supabase) return;
    const { error: seedError } = await supabase.from('products').upsert(cmsProducts.map(mapProductToRow));
    setCmsNotice(seedError ? seedError.message : 'Products seeded');
  };

  const handleSaveImpactMetrics = async () => {
    if (!supabase) return;
    const payload = metricDrafts.map((metric, idx) => ({
      id: metric.id || `metric-${idx}`,
      label_en: metric.labelEn,
      label_ko: metric.labelKo,
      value: Number(metric.value) || 0,
      prefix: metric.prefix ?? '',
      suffix: metric.suffix ?? '',
      sort_order: idx + 1,
    }));
    const { error: saveError } = await supabase.from('impact_metrics').upsert(payload);
    if (saveError) {
      setCmsNotice(saveError.message);
      return;
    }
    const nextMetrics = metricDrafts.map((metric, idx) => ({
      ...metric,
      id: metric.id || `metric-${idx}`,
      value: Number(metric.value) || 0,
      prefix: metric.prefix ?? '',
      suffix: metric.suffix ?? '',
      sortOrder: idx + 1,
    }));
    useCMSStore.setState({ impactMetrics: nextMetrics });
    void useCMSStore.getState().hydrate();
    setCmsNotice('Impact metrics saved');
  };

  const handleSaveRevenue = async () => {
    if (!supabase) return;
    const payload = revenueDrafts.map((row, idx) => ({
      id: row.id || createId(),
      month: row.month,
      revenue: Number(row.revenue) || 0,
      expenses: Number(row.expenses) || 0,
      sort_order: idx + 1,
    }));
    const { error: saveError } = await supabase.from('impact_revenue').upsert(payload);
    if (saveError) {
      setCmsNotice(saveError.message);
      return;
    }
    const nextRevenue = revenueDrafts.map((row, idx) => ({
      ...row,
      id: row.id || createId(),
      revenue: Number(row.revenue) || 0,
      expenses: Number(row.expenses) || 0,
      sortOrder: idx + 1,
    }));
    useCMSStore.setState({ revenueData: nextRevenue });
    void useCMSStore.getState().hydrate();
    setCmsNotice('Revenue chart saved');
  };

  const handleSaveDonations = async () => {
    if (!supabase) return;
    const payload = donationDrafts.map((row, idx) => ({
      id: row.id || createId(),
      name: row.name,
      value: Number(row.value) || 0,
      sort_order: idx + 1,
    }));
    const { error: saveError } = await supabase.from('impact_donations').upsert(payload);
    if (saveError) {
      setCmsNotice(saveError.message);
      return;
    }
    const nextDonations = donationDrafts.map((row, idx) => ({
      ...row,
      id: row.id || createId(),
      value: Number(row.value) || 0,
      sortOrder: idx + 1,
    }));
    useCMSStore.setState({ donationData: nextDonations });
    void useCMSStore.getState().hydrate();
    setCmsNotice('Donations chart saved');
  };

  const handleSaveGrowth = async () => {
    if (!supabase) return;
    const payload = growthDrafts.map((row, idx) => ({
      id: row.id || createId(),
      month: row.month,
      members: Number(row.members) || 0,
      sort_order: idx + 1,
    }));
    const { error: saveError } = await supabase.from('impact_member_growth').upsert(payload);
    if (saveError) {
      setCmsNotice(saveError.message);
      return;
    }
    const nextGrowth = growthDrafts.map((row, idx) => ({
      ...row,
      id: row.id || createId(),
      members: Number(row.members) || 0,
      sortOrder: idx + 1,
    }));
    useCMSStore.setState({ memberGrowthData: nextGrowth });
    void useCMSStore.getState().hydrate();
    setCmsNotice('Member growth saved');
  };

  const handleDeleteImpactRow = async (table: 'impact_revenue' | 'impact_donations' | 'impact_member_growth' | 'impact_metrics', id?: string) => {
    if (!supabase || !id) return;
    await supabase.from(table).delete().eq('id', id);
  };

  function normalizeProject(project: Project): Project {
    const revenue = Number(project.revenue) || 0;
    const expenses = Number(project.expenses) || 0;
    const fundraise = Number(project.fundraise) || 0;
    const donation = Number(project.donation) || 0;
    const profit = revenue - expenses;
    const donationPercent = revenue > 0 ? Math.round((donation / revenue) * 1000) / 10 : 0;
    const stage = Math.min(Math.max(Number(project.stage) || 1, 1), 7);
    const stageName = STAGE_LABELS_EN[stage] ?? project.stageName;
    return {
      ...project,
      revenue,
      expenses,
      donation,
      fundraise,
      profit,
      donationPercent,
      stage,
      stageName,
      image: toPublicStorageUrl(project.image),
      bannerImage: toPublicStorageUrl(project.bannerImage ?? ''),
    };
  }

  const updateProjectDraft = (projectId: string, patch: Partial<Project>) => {
    setProjectDrafts((prev) =>
      prev.map((p) => (p.id === projectId ? normalizeProject({ ...p, ...patch }) : p))
    );
    setProjectDirty((prev) => ({ ...prev, [projectId]: true }));
  };

  const updateProductDraft = (productId: string, patch: Partial<Product>) => {
    setProductDrafts((prev) => prev.map((p) => {
      if (p.id !== productId) return p;
      const nextImage = patch.image !== undefined ? toPublicStorageUrl(patch.image) : p.image;
      const nextImages = patch.images !== undefined ? patch.images.map((img) => toPublicStorageUrl(img)) : p.images;
      return { ...p, ...patch, image: nextImage, images: nextImages };
    }));
    setProductDirty((prev) => ({ ...prev, [productId]: true }));
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    loadMembers();
    loadMeetings();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!selectedMember) return;
    loadMemberMeetings(selectedMember);
    loadContributions(selectedMember);
  }, [selectedMember]);

  useEffect(() => {
    if (!activeMember) return;
    setMemberRoleInput(activeMember.role ?? '');
    setMemberTeamInput(activeMember.team ?? '');
  }, [activeMember?.id]);

  useEffect(() => {
    const normalized = cmsProjects.map((project) => normalizeProject(project));
    setProjectDrafts((prev) => {
      const prevMap = new Map(prev.map((item) => [item.id, item]));
      const next = normalized.map((project) => (
        projectDirty[project.id] ? (prevMap.get(project.id) ?? project) : project
      ));
      const newDrafts = prev.filter((item) => !normalized.some((proj) => proj.id === item.id));
      return [...next, ...newDrafts];
    });
    setProjectImagePreview((prev) => {
      const next = { ...prev };
      normalized.forEach((project) => {
        if (!projectDirty[project.id]) delete next[project.id];
      });
      return next;
    });
    setProjectBannerPreview((prev) => {
      const next = { ...prev };
      normalized.forEach((project) => {
        if (!projectDirty[project.id]) delete next[project.id];
      });
      return next;
    });
  }, [cmsProjects, projectDirty]);

  useEffect(() => {
    setProductDrafts((prev) => {
      const prevMap = new Map(prev.map((item) => [item.id, item]));
      const next = cmsProducts.map((product) => (
        productDirty[product.id] ? (prevMap.get(product.id) ?? product) : product
      ));
      const newDrafts = prev.filter((item) => !cmsProducts.some((prod) => prod.id === item.id));
      return [...next, ...newDrafts];
    });
    setProductImagePreview((prev) => {
      const next = { ...prev };
      cmsProducts.forEach((product) => {
        if (!productDirty[product.id]) delete next[product.id];
      });
      return next;
    });
  }, [cmsProducts, productDirty]);

  useEffect(() => {
    setMetricDrafts(cmsImpactMetrics);
    setRevenueDrafts(cmsRevenueData);
    setDonationDrafts(cmsDonationData);
    setGrowthDrafts(cmsGrowthData);
  }, [cmsImpactMetrics, cmsRevenueData, cmsDonationData, cmsGrowthData]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase
      .channel('admin-members-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => loadMembers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        loadMembers();
        if (selectedMember) loadMemberMeetings(selectedMember);
        if (selectedMeetingId) loadMeetingAttendance(selectedMeetingId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, () => {
        loadMembers();
        if (selectedMember) loadMemberMeetings(selectedMember);
        if (selectedMeetingId) loadMeetingAttendance(selectedMeetingId);
        loadMeetings();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, () => {
        if (selectedMember) loadContributions(selectedMember);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMember, selectedMeetingId]);

  const handleSaveContent = async () => {
    await updateContent({ ...siteContent });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handleSaveTheme = async () => {
    await updateTheme({ ...theme });
    setThemeSaved(true);
    window.setTimeout(() => setThemeSaved(false), 1800);
  };

  const handleSaveCopy = async () => {
    if (!supabase) return;
    const payload = copyDrafts.map((row) => ({
      key: row.key,
      value_en: row.en,
      value_ko: row.ko,
    }));
    const { error: saveError } = await supabase.from('site_copy').upsert(payload);
    if (!saveError) {
      useSiteCopyStore.setState((state) => ({
        copy: payload.reduce((acc, row) => {
          acc[row.key] = { en: row.value_en, ko: row.value_ko };
          return acc;
        }, { ...state.copy } as Record<string, { en?: string | null; ko?: string | null }>)
      }));
    }
    setCopyNotice(saveError ? saveError.message : 'Copy saved');
    window.setTimeout(() => setCopyNotice(''), 1800);
  };

  const handleResetCopy = () => {
    setCopyDrafts(defaultCopyList);
  };

  const updateShopTerms = (terms: string[]) => {
    const cleaned = terms.map((term) => term.trim()).filter(Boolean);
    updateContent({ shopTerms: cleaned.join(', ') });
  };

  const handleAddTerm = () => {
    const nextTerm = newTermInput.trim();
    if (!nextTerm) return;
    const next = Array.from(new Set([...termOptions, nextTerm]));
    updateShopTerms(next);
    setNewTermInput('');
  };

  const handleRemoveTerm = (term: string) => {
    const next = termOptions.filter((t) => t !== term);
    updateShopTerms(next);
  };

  const toggleAttendance = async (attendanceId: string, currentStatus: 'present' | 'absent') => {
    if (!supabase) return;
    await supabase
      .from('attendance')
      .update({ status: currentStatus === 'present' ? 'absent' : 'present' })
      .eq('id', attendanceId);
  };

  const toggleMeetingAttendance = async (attendanceId: string, currentStatus: 'present' | 'absent') => {
    if (!supabase) return;
    const nextStatus = currentStatus === 'present' ? 'absent' : 'present';
    setMeetingAttendance((prev) =>
      prev.map((row) => (row.attendanceId === attendanceId ? { ...row, status: nextStatus } : row))
    );
    const { error: updateError } = await supabase
      .from('attendance')
      .update({ status: nextStatus })
      .eq('id', attendanceId);

    if (updateError && selectedMeetingId) {
      await loadMeetingAttendance(selectedMeetingId);
    }
  };

  const tabs = [
    { key: 'members', label: 'Members', icon: UsersIcon },
    { key: 'projects', label: 'Projects', icon: FolderOpen },
    { key: 'shop', label: 'Shop', icon: Package },
    { key: 'impact', label: 'Impact', icon: BarChart3 },
    { key: 'design', label: 'Design', icon: Palette },
    { key: 'copy', label: 'Copy', icon: Type },
    { key: 'content', label: 'Site Content', icon: FileText },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    { key: 'messages', label: 'Messages', icon: MessageSquare },
    { key: 'overview', label: 'Overview', icon: BarChart3 },
  ];

  const flattenTranslations = (source: Record<string, unknown>, prefix = ''): Record<string, string> => {
    const output: Record<string, string> = {};
    Object.entries(source).forEach(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        output[path] = value;
      } else if (value && typeof value === 'object') {
        Object.assign(output, flattenTranslations(value as Record<string, unknown>, path));
      }
    });
    return output;
  };

  const defaultCopyList = useMemo<CopyDraft[]>(() => {
    const enMap = flattenTranslations(translations.en as Record<string, unknown>);
    const koMap = flattenTranslations(translations.ko as Record<string, unknown>);
    const keys = Array.from(new Set([...Object.keys(enMap), ...Object.keys(koMap)])).sort();
    return keys.map((key) => ({
      key,
      en: enMap[key] ?? '',
      ko: koMap[key] ?? '',
    }));
  }, []);

  const parseTerms = (value: string) =>
    value
      .split(',')
      .map((term) => term.trim())
      .filter(Boolean);

  const termOptions = useMemo(() => {
    const parsed = parseTerms(siteContent.shopTerms ?? '');
    return parsed.length ? parsed : TERMS;
  }, [siteContent.shopTerms]);

  const stageOptions = useMemo(
    () => Object.entries(STAGE_LABELS_EN)
      .map(([value, label]) => ({ value: Number(value), label }))
      .sort((a, b) => a.value - b.value),
    []
  );

  useEffect(() => {
    setCopyDrafts(
      defaultCopyList.map((row) => ({
        ...row,
        en: copy[row.key]?.en ?? row.en,
        ko: copy[row.key]?.ko ?? row.ko,
      }))
    );
  }, [copy, defaultCopyList]);

  const themeColorFields = [
    { key: 'colorBeige', label: 'Beige' },
    { key: 'colorBeigeDark', label: 'Beige Dark' },
    { key: 'colorWarmWhite', label: 'Warm White' },
    { key: 'colorCharcoal', label: 'Charcoal' },
    { key: 'colorDark', label: 'Dark' },
    { key: 'colorMid', label: 'Mid' },
    { key: 'colorLight', label: 'Light' },
    { key: 'colorAccent', label: 'Accent' },
    { key: 'colorAccentSoft', label: 'Accent Soft' },
  ] as const;

  const getThemeColor = (key: keyof SiteTheme) => normalizeHex(theme[key] as string) ?? '#000000';

  const filteredCopyDrafts = useMemo(() => {
    const query = copySearch.trim().toLowerCase();
    if (!query) return copyDrafts;
    return copyDrafts.filter((row) =>
      row.key.toLowerCase().includes(query)
      || row.en.toLowerCase().includes(query)
      || row.ko.toLowerCase().includes(query)
    );
  }, [copyDrafts, copySearch]);

  const contentEntries = (Object.entries(siteContent) as [keyof SiteContent, string][])
    .filter(([key]) => key !== 'heroBackgroundUrl' && key !== 'shopTerms');

  const normalizedOrders = orders.map((order, index) => {
    let items: { name: string; qty: number; price: number }[] = [];
    if (Array.isArray(order.items)) {
      items = order.items as { name: string; qty: number; price: number }[];
    } else if (typeof order.items === 'string') {
      try {
        const parsed = JSON.parse(order.items) as { name: string; qty: number; price: number }[];
        if (Array.isArray(parsed)) items = parsed;
      } catch {
        items = [];
      }
    }
    return {
      id: order.id ?? `${index}`,
      buyerName: order.buyerName ?? order.buyer_name ?? '—',
      buyerEmail: order.buyerEmail ?? order.buyer_email ?? '—',
      total: Number(order.total) || 0,
      date: order.date ?? order.created_at ?? '',
      items,
      status: order.status ?? 'pending',
      completedAt: order.completed_at ?? null,
    };
  });

  const contributionTotal = contributions.reduce((sum, c) => sum + (Number(c.points) || 0), 0);

  return (
    <div className="min-h-screen bg-beige pt-20 overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Admin Dashboard</h1>
            <p className="text-sm text-light">Student Startups management panel</p>
            {user?.email && <p className="text-xs text-light mt-1">Signed in as {user.email}</p>}
          </div>
          <button
            onClick={() => { supabase?.auth.signOut(); }}
            className="text-sm text-mid hover:text-charcoal transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSelectedMember(null); if (key !== 'members') setSelectedMeetingId(null); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                tab === key ? 'bg-charcoal text-white' : 'bg-card text-mid hover:text-charcoal border border-border'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Members */}
        {tab === 'members' && !selectedMember && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-charcoal">Add Meeting</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="date"
                  value={newMeetingDate}
                  onChange={(e) => setNewMeetingDate(e.target.value)}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                />
                <button
                  onClick={handleCreateMeeting}
                  className="rounded-full bg-charcoal px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[hsl(20,8%,28%)]"
                >
                  Create Meeting
                </button>
                {meetingError && <p className="text-xs text-red-500">{meetingError}</p>}
              </div>
              <p className="mt-2 text-xs text-light">New meetings automatically add attendance rows for all members.</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-charcoal">Meetings</p>
                <span className="text-xs text-light">{meetings.length} total</span>
              </div>
              {meetingsLoading ? (
                <p className="mt-3 text-xs text-light">Loading meetings...</p>
              ) : meetings.length === 0 ? (
                <p className="mt-3 text-xs text-light">No meetings yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-colors ${
                      selectedMeetingId === meeting.id ? 'border-charcoal bg-muted/40' : 'border-border'
                    }`}>
                      <button
                        onClick={() => {
                          setSelectedMeetingId(meeting.id);
                          loadMeetingAttendance(meeting.id);
                        }}
                        className="text-left"
                      >
                        <span className="text-sm text-charcoal">
                          {formatMeetingDate(meeting.meeting_date)}
                        </span>
                        <p className="mt-0.5 text-[10px] text-light">Open attendance</p>
                      </button>
                      <button
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedMeetingId && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Meeting Attendance</p>
                    <p className="text-xs text-light">Click a member to toggle present or absent.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMeetingId(null);
                      setMeetingAttendance([]);
                    }}
                    className="text-xs text-mid hover:text-charcoal"
                  >
                    Close
                  </button>
                </div>

                {meetingAttendanceLoading ? (
                  <p className="mt-4 text-xs text-light">Loading attendance...</p>
                ) : meetingAttendance.length === 0 ? (
                  <p className="mt-4 text-xs text-light">No attendance rows yet.</p>
                ) : (
                  <>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Present</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-800">
                          {meetingAttendance.filter((row) => row.status === 'present').length}
                        </p>
                      </div>
                      <div className="rounded-lg border border-red-200 bg-red-50/60 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Absent</p>
                        <p className="mt-1 text-2xl font-bold text-red-800">
                          {meetingAttendance.filter((row) => row.status === 'absent').length}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {meetingAttendance.map((row) => (
                        <button
                          key={row.attendanceId}
                          type="button"
                          onClick={() => toggleMeetingAttendance(row.attendanceId, row.status)}
                          className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                            row.status === 'present'
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-card text-red-600 border border-red-200 hover:border-red-300'
                          }`}
                          title={row.memberEmail}
                        >
                          {row.memberName}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {membersLoading ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-light">
                Loading members...
              </div>
            ) : members.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-light">
                No members yet.
              </div>
            ) : (
              members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member.id)}
                  className="w-full text-left rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow flex items-center justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-charcoal">{member.name}</p>
                    <p className="text-sm text-mid">{member.role} · {member.team}</p>
                    <p className="text-xs text-light">Joined {member.join_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-charcoal">{member.attendance}/{member.totalMeetings}</p>
                    <p className="text-xs text-light">Attendance</p>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}

        {/* Member detail */}
        {tab === 'members' && activeMember && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setSelectedMember(null)} className="mb-4 text-sm text-mid hover:text-charcoal">← Back to Members</button>
            <div className="rounded-xl border border-border bg-card p-6 mb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-charcoal">{activeMember.name}</h3>
                  <p className="text-sm text-mid">{activeMember.email}</p>
                  <p className="mt-1 text-xs text-light">Joined {activeMember.join_date}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={memberTeamInput}
                    onChange={(e) => {
                      setMemberTeamInput(e.target.value);
                      updateMember({ team: e.target.value });
                    }}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-charcoal outline-none focus:border-charcoal"
                  >
                    {['Unassigned', ...TEAM_OPTIONS].map((team) => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={memberRoleInput}
                    onChange={(e) => setMemberRoleInput(e.target.value)}
                    onBlur={() => updateMember({ role: memberRoleInput || 'Member' })}
                    placeholder="Role (ex: Team Lead)"
                    className="w-44 rounded-lg border border-border bg-card px-3 py-2 text-sm text-charcoal outline-none focus:border-charcoal"
                  />
                  <div className="flex items-center rounded-lg border border-border bg-muted px-3 py-2 text-sm text-mid">
                    Contributions: <span className="ml-2 font-semibold text-charcoal">{contributionTotal}</span>
                  </div>
                </div>
              </div>
              {(memberNotice || memberError) && (
                <div className={`mt-3 text-xs ${memberError ? 'text-red-500' : 'text-emerald-600'}`}>
                  {memberError || memberNotice}
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-light">Deleting a member removes their attendance and contributions.</p>
                <button
                  onClick={handleDeleteMember}
                  disabled={memberDeleting}
                  className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:border-red-400 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {memberDeleting ? 'Deleting...' : 'Delete Member'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-12 gap-3 bg-muted px-5 py-3 border-b border-border">
                <span className="col-span-3 text-xs font-semibold text-mid">Date</span>
                <span className="col-span-2 text-xs font-semibold text-mid">Status</span>
                <span className="col-span-2 text-xs font-semibold text-mid">Role</span>
                <span className="col-span-5 text-xs font-semibold text-mid">Admin Feedback</span>
              </div>
              {memberMeetingsLoading ? (
                <div className="px-5 py-6 text-sm text-light">Loading meetings...</div>
              ) : memberMeetings.length === 0 ? (
                <div className="px-5 py-6 text-sm text-light">No meetings yet.</div>
              ) : (
                memberMeetings.map((meeting) => {
                  return (
                    <div key={meeting.attendanceId} className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-border last:border-0 items-start">
                      <span className="col-span-3 text-sm text-charcoal tabular-nums pt-2">{formatMeetingDate(meeting.date)}</span>
                      <div className="col-span-2 pt-2">
                        <button onClick={() => toggleAttendance(meeting.attendanceId, meeting.status)} className="flex items-center gap-1 text-sm">
                          {meeting.status === 'present' ? (
                            <><CheckCircle className="size-4 text-emerald-500" /><span className="text-emerald-600">Present</span></>
                          ) : (
                            <><XCircle className="size-4 text-red-400" /><span className="text-red-500">Absent</span></>
                          )}
                        </button>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          defaultValue={meeting.meetingRole}
                          onChange={(e) => setMeetingEdits((prev) => ({
                            ...prev,
                            [meeting.attendanceId]: { ...prev[meeting.attendanceId], role: e.target.value },
                          }))}
                          placeholder="Role"
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                        />
                      </div>
                      <div className="col-span-5 flex gap-2">
                        <input
                          type="text"
                          defaultValue={meeting.feedback}
                          onChange={(e) => setMeetingEdits((prev) => ({
                            ...prev,
                            [meeting.attendanceId]: { ...prev[meeting.attendanceId], feedback: e.target.value },
                          }))}
                          placeholder="Add feedback..."
                          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                        />
                        <button
                          onClick={() => handleSaveMeeting(meeting.attendanceId, meeting.meetingRole, meeting.feedback)}
                          className="rounded-lg bg-charcoal px-3 py-2 text-white hover:bg-[hsl(20,8%,28%)] transition-colors"
                        >
                          <Save className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-charcoal">Contributions</h4>
                <span className="text-xs text-light">Total {contributionTotal}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  type="text"
                  value={newContribution.title}
                  onChange={(e) => setNewContribution((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Contribution title"
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                />
                <input
                  type="number"
                  value={newContribution.points}
                  onChange={(e) => setNewContribution((prev) => ({ ...prev, points: e.target.value }))}
                  placeholder="Points"
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                />
                <input
                  type="date"
                  value={newContribution.date}
                  onChange={(e) => setNewContribution((prev) => ({ ...prev, date: e.target.value }))}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                />
                <input
                  type="text"
                  value={newContribution.notes}
                  onChange={(e) => setNewContribution((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes (optional)"
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal sm:col-span-2 lg:col-span-4"
                />
              </div>
              <button
                onClick={handleAddContribution}
                className="mt-4 rounded-full bg-charcoal px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[hsl(20,8%,28%)]"
              >
                Add Contribution
              </button>

              <div className="mt-4 space-y-2">
                {contributionsLoading ? (
                  <p className="text-sm text-light">Loading contributions...</p>
                ) : contributions.length === 0 ? (
                  <p className="text-sm text-light">No contributions yet.</p>
                ) : (
                  contributions.map((entry) => (
                    <div key={entry.id} className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-charcoal">{entry.title}</p>
                        <p className="text-xs text-light">{entry.contribution_date}</p>
                        {entry.notes && <p className="text-xs text-mid mt-1">{entry.notes}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[hsl(24,80%,50%)]">{entry.points}</span>
                        <button
                          onClick={() => handleDeleteContribution(entry.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Projects */}
        {tab === 'projects' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-charcoal">Projects CMS</h3>
                  <p className="text-xs text-light">Edit every project detail, image, and status. Changes sync live.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSeedProjects}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-mid hover:text-charcoal hover:border-charcoal"
                  >
                    {cmsSources.projects === 'mock' ? 'Seed Example Data' : 'Re-seed Example Data'}
                  </button>
                  <button
                    onClick={() => setProjectDrafts((prev) => [...prev, createProjectDraft()])}
                    className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:bg-[hsl(20,8%,28%)]"
                  >
                    Add Project
                  </button>
                </div>
              </div>
              {(cmsStatus === 'error' || cmsNotice) && (
                <p className={`mt-3 text-xs ${cmsStatus === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                  {cmsStatus === 'error' ? cmsError : cmsNotice}
                </p>
              )}
            </div>

            {projectDrafts.map((project) => {
              const imageSrc = projectImagePreview[project.id] ?? project.image;
              const bannerSrc = projectBannerPreview[project.id] ?? project.bannerImage ?? project.image;
              const saveState = projectSaveState[project.id]?.status ?? 'idle';
              const saveMessage = projectSaveState[project.id]?.message;
              const uploadState = projectUploadState[project.id]?.status ?? 'idle';
              const uploadMessage = projectUploadState[project.id]?.message;
              const isDirty = projectDirty[project.id];
              const uploadTone = uploadState === 'error'
                ? 'text-red-500'
                : uploadState === 'done'
                  ? 'text-emerald-600'
                  : 'text-mid';
              const uploadLabel = uploadState === 'uploading'
                ? 'Uploading image...'
                : uploadState === 'done'
                  ? 'Upload complete. Click Save.'
                  : uploadMessage ?? 'Upload failed';
              const selectedMembers = Array.from(
                new Set(project.team.flatMap((team) => team.members || []))
              );

              const projectCard = (
                <div key={project.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="w-full lg:w-56">
                    <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                      {imageSrc ? (
                        <img src={imageSrc} alt={project.name} className="size-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-light">No image</div>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-light">Recommended 1200×900 (4:3)</p>
                    <label className="mt-3 block text-xs font-semibold text-mid">Image URL</label>
                    <input
                      type="text"
                      value={project.image}
                      onChange={(e) => {
                        const nextUrl = e.target.value;
                        updateProjectDraft(project.id, { image: toPublicStorageUrl(nextUrl) });
                        setProjectImagePreview((prev) => ({ ...prev, [project.id]: nextUrl }));
                      }}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                    />
                    <label className="mt-3 block text-xs font-semibold text-mid">Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProjectImageUpload(project.id, e.target.files?.[0])}
                      className="mt-1 w-full text-xs text-mid"
                    />
                    <label className="mt-4 block text-xs font-semibold text-mid">Banner Preview</label>
                    <div className="mt-2 aspect-[3/1] overflow-hidden rounded-lg border border-border bg-muted">
                      {bannerSrc ? (
                        <img src={bannerSrc} alt={`${project.name} banner`} className="size-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-light">No banner</div>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-light">Recommended 1920×640 (3:1)</p>
                    <label className="mt-3 block text-xs font-semibold text-mid">Banner Image URL</label>
                    <input
                      type="text"
                      value={project.bannerImage ?? ''}
                      onChange={(e) => {
                        const nextUrl = e.target.value;
                        updateProjectDraft(project.id, { bannerImage: toPublicStorageUrl(nextUrl) });
                        setProjectBannerPreview((prev) => ({ ...prev, [project.id]: nextUrl }));
                      }}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                    />
                    <label className="mt-3 block text-xs font-semibold text-mid">Upload Banner Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProjectBannerUpload(project.id, e.target.files?.[0])}
                      className="mt-1 w-full text-xs text-mid"
                    />
                    {uploadState !== 'idle' && (
                      <p className={`mt-2 text-xs ${uploadTone}`}>{uploadLabel}</p>
                    )}
                  </div>

                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-mid">Project Name</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProjectDraft(project.id, { name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Status</label>
                      <select
                        value={project.status ?? 'active'}
                        onChange={(e) => updateProjectDraft(project.id, { status: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      >
                        {projectStatusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-mid">Stage</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {stageOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateProjectDraft(project.id, { stage: option.value })}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                              project.stage === option.value
                                ? 'bg-charcoal text-white'
                                : 'bg-card text-mid border border-border hover:text-charcoal'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-light">Current: {project.stage} · {project.stageName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Category</label>
                      <input
                        type="text"
                        value={project.category}
                        onChange={(e) => updateProjectDraft(project.id, { category: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-mid">Participants</label>
                      <div className="mt-2 rounded-lg border border-border px-3 py-2">
                        {memberOptions.length === 0 ? (
                          <p className="text-xs text-light">No members available yet.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {memberOptions.map((member) => {
                              const selected = selectedMembers.includes(member.label);
                              return (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() => {
                                    const nextMembers = selected
                                      ? selectedMembers.filter((m) => m !== member.label)
                                      : [...selectedMembers, member.label];
                                    updateProjectDraft(project.id, {
                                      team: nextMembers.length ? [{ role: 'Members', members: nextMembers }] : [],
                                    });
                                  }}
                                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                    selected ? 'bg-charcoal text-white' : 'bg-muted text-foreground hover:bg-muted/70'
                                  }`}
                                >
                                  {member.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-light">Select members who participated in this project.</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Start Date</label>
                      <input
                        type="date"
                        value={project.startDate}
                        onChange={(e) => updateProjectDraft(project.id, { startDate: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Donation % (auto)</label>
                      <input
                        type="text"
                        value={`${Number(project.donationPercent || 0).toFixed(1)}%`}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-mid outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Revenue</label>
                      <input
                        type="number"
                        value={project.revenue}
                        onChange={(e) => updateProjectDraft(project.id, { revenue: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Expenses</label>
                      <input
                        type="number"
                        value={project.expenses}
                        onChange={(e) => updateProjectDraft(project.id, { expenses: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Fundraise</label>
                      <input
                        type="number"
                        value={Number(project.fundraise || 0)}
                        onChange={(e) => updateProjectDraft(project.id, { fundraise: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Profit (auto)</label>
                      <input
                        type="number"
                        value={Number(project.profit || 0)}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-mid outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Donation</label>
                      <input
                        type="number"
                        value={project.donation}
                        onChange={(e) => updateProjectDraft(project.id, { donation: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-mid">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProjectDraft(project.id, { description: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSaveProject(project)}
                    disabled={saveState === 'saving' || uploadState === 'uploading'}
                    className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:bg-[hsl(20,8%,28%)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saveState === 'saving' ? 'Saving...' : 'Save Project'}
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-300 hover:text-red-600"
                  >
                    Delete
                  </button>
                  {isDirty && saveState === 'idle' && (
                    <span className="flex items-center text-xs text-amber-500">Unsaved changes</span>
                  )}
                  {saveState === 'saved' && (
                    <span className="flex items-center text-xs text-emerald-600">Saved</span>
                  )}
                  {saveState === 'error' && (
                    <span className="flex items-center text-xs text-red-500">{saveMessage ?? 'Save failed'}</span>
                  )}
                </div>
              </div>
              );
              return projectCard;
            })}
          </motion.div>
        )}

        {/* Shop */}
        {tab === 'shop' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-charcoal">Shop CMS</h3>
                  <p className="text-xs text-light">Edit products, images, pricing, inventory, and status.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSeedProducts}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-mid hover:text-charcoal hover:border-charcoal"
                  >
                    {cmsSources.products === 'mock' ? 'Seed Example Data' : 'Re-seed Example Data'}
                  </button>
                  <button
                    onClick={() => setProductDrafts((prev) => [...prev, createProductDraft()])}
                    className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:bg-[hsl(20,8%,28%)]"
                  >
                    Add Product
                  </button>
                </div>
              </div>
              {(cmsStatus === 'error' || cmsNotice) && (
                <p className={`mt-3 text-xs ${cmsStatus === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                  {cmsStatus === 'error' ? cmsError : cmsNotice}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">Term Options</h4>
                  <p className="text-xs text-light">These show up as filter buttons and product term options.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTermInput}
                    onChange={(e) => setNewTermInput(e.target.value)}
                    placeholder="Add term (ex: Term 1 2026)"
                    className="w-48 rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                  />
                  <button
                    onClick={handleAddTerm}
                    className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {termOptions.length === 0 ? (
                  <span className="text-xs text-light">No terms yet.</span>
                ) : (
                  termOptions.map((term) => (
                    <div key={term} className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-charcoal">
                      {term}
                      <button
                        onClick={() => handleRemoveTerm(term)}
                        className="text-[10px] text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {productDrafts.map((product) => {
              const imageSrc = productImagePreview[product.id] ?? product.image;
              const galleryImages = normalizeProductImages(product.image, product.images);
              const saveState = productSaveState[product.id]?.status ?? 'idle';
              const saveMessage = productSaveState[product.id]?.message;
              const uploadState = productUploadState[product.id]?.status ?? 'idle';
              const uploadMessage = productUploadState[product.id]?.message;
              const isDirty = productDirty[product.id];
              const uploadTone = uploadState === 'error'
                ? 'text-red-500'
                : uploadState === 'done'
                  ? 'text-emerald-600'
                  : 'text-mid';
              const uploadLabel = uploadState === 'uploading'
                ? 'Cropping / optimizing image...'
                : uploadState === 'done'
                  ? 'Upload complete. Click Save.'
                  : uploadMessage ?? 'Upload failed';

              const productCard = (
                <div key={product.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="w-full lg:w-56">
                    <div className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                      {imageSrc ? (
                        <img src={imageSrc} alt={product.name} className="size-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-light">No image</div>
                      )}
                      {imageSrc && (
                        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end gap-1 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <button
                            type="button"
                            title="Re-crop main image"
                            onClick={() => handleRecropProductImage(product, product.image)}
                            className="pointer-events-auto rounded-full bg-white/92 p-1.5 text-charcoal shadow-sm transition hover:bg-white"
                          >
                            <Crop className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Remove main image"
                            onClick={() => handleRemoveProductImage(product, product.image)}
                            className="pointer-events-auto rounded-full bg-white/92 p-1.5 text-red-500 shadow-sm transition hover:bg-white hover:text-red-600"
                          >
                            <Minus className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-light">Uploads are cropped to 1:1, compressed, and saved as fast-loading web images.</p>
                    <label className="mt-3 block text-xs font-semibold text-mid">Image URL</label>
                    <input
                      type="text"
                      value={product.image}
                      onChange={(e) => {
                        const nextUrl = e.target.value;
                        updateProductDraft(product.id, { image: toPublicStorageUrl(nextUrl), images: normalizeProductImages(nextUrl, product.images) });
                        setProductImagePreview((prev) => ({ ...prev, [product.id]: nextUrl }));
                      }}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                    />
                    <label className="mt-3 block text-xs font-semibold text-mid">Upload Main Image (crop to square)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProductImageUpload(product.id, e.target.files?.[0])}
                      className="mt-1 w-full text-xs text-mid"
                    />
                    <label className="mt-3 block text-xs font-semibold text-mid">Upload Gallery Images (crop each to square)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleProductGalleryUpload(product.id, e.target.files)}
                      className="mt-1 w-full text-xs text-mid"
                    />
                    {uploadState !== 'idle' && (
                      <p className={`mt-2 text-xs ${uploadTone}`}>{uploadLabel}</p>
                    )}
                  </div>

                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-mid">Product Name</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProductDraft(product.id, { name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Status</label>
                      <select
                        value={product.status}
                        onChange={(e) => updateProductDraft(product.id, { status: e.target.value as Product['status'] })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      >
                        <option value="available">available</option>
                        <option value="in-production">in-production</option>
                        <option value="sold-out">sold-out</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Category</label>
                      <input
                        type="text"
                        value={product.category}
                        onChange={(e) => updateProductDraft(product.id, { category: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-mid">Term</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {termOptions.map((term) => (
                          <button
                            key={`${product.id}-${term}`}
                            type="button"
                            onClick={() => updateProductDraft(product.id, { term })}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                              product.term === term
                                ? 'bg-charcoal text-white'
                                : 'bg-card text-mid border border-border hover:text-charcoal'
                            }`}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Price</label>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => updateProductDraft(product.id, { price: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Inventory</label>
                      <input
                        type="number"
                        value={product.inventory}
                        onChange={(e) => updateProductDraft(product.id, { inventory: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Project ID</label>
                      <input
                        type="text"
                        value={product.projectId ?? ''}
                        onChange={(e) => updateProductDraft(product.id, { projectId: e.target.value || undefined })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={product.isPreOrder}
                        onChange={(e) => updateProductDraft(product.id, { isPreOrder: e.target.checked })}
                      />
                      <span className="text-xs text-mid">Pre-order</span>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-mid">Description</label>
                      <textarea
                        value={product.description}
                        onChange={(e) => updateProductDraft(product.id, { description: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                        rows={3}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-mid">Gallery Images (comma separated URLs)</label>
                      <textarea
                        value={galleryImages.join(', ')}
                        onChange={(e) => {
                          const urls = e.target.value.split(',').map((u) => u.trim()).filter(Boolean);
                          const normalized = normalizeProductImages(product.image, urls);
                          const nextMain = product.image || normalized[0] || '';
                          updateProductDraft(product.id, { image: nextMain, images: normalizeProductImages(nextMain, normalized) });
                        }}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                        rows={2}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-mid">Gallery Preview (click to set main)</label>
                      {galleryImages.length === 0 ? (
                        <p className="mt-2 text-xs text-light">No gallery images yet.</p>
                      ) : (
                        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                          {galleryImages.map((img) => (
                            <div
                              key={img}
                              className={`group relative aspect-square overflow-hidden rounded-lg border-2 ${
                                product.image === img ? 'border-charcoal' : 'border-transparent hover:border-border'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const nextImages = normalizeProductImages(img, galleryImages);
                                  const nextMain = toPublicStorageUrl(img);
                                  updateProductDraft(product.id, { image: nextMain, images: normalizeProductImages(nextMain, nextImages) });
                                  setProductImagePreview((prev) => ({ ...prev, [product.id]: nextMain }));
                                }}
                                className="size-full"
                              >
                                <img src={img} alt="" className="size-full object-cover" />
                              </button>
                              {product.image === img && (
                                <span className="absolute left-1 top-1 rounded-full bg-charcoal px-2 py-0.5 text-[10px] text-white">Main</span>
                              )}
                              <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end gap-1 p-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                <button
                                  type="button"
                                  title="Re-crop image"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleRecropProductImage(product, img);
                                  }}
                                  className="pointer-events-auto rounded-full bg-white/92 p-1 text-charcoal shadow-sm transition hover:bg-white"
                                >
                                  <Crop className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  title="Remove image"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleRemoveProductImage(product, img);
                                  }}
                                  className="pointer-events-auto rounded-full bg-white/92 p-1 text-red-500 shadow-sm transition hover:bg-white hover:text-red-600"
                                >
                                  <Minus className="size-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {galleryImages.length > 0 && (
                        <p className="mt-2 text-[10px] text-light">Hover any image to crop it again or remove it. Click the image itself to make it the main product shot.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSaveProduct(product)}
                    disabled={saveState === 'saving' || uploadState === 'uploading'}
                    className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:bg-[hsl(20,8%,28%)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saveState === 'saving' ? 'Saving...' : 'Save Product'}
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-300 hover:text-red-600"
                  >
                    Delete
                  </button>
                  {isDirty && saveState === 'idle' && (
                    <span className="flex items-center text-xs text-amber-500">Unsaved changes</span>
                  )}
                  {saveState === 'saved' && (
                    <span className="flex items-center text-xs text-emerald-600">Saved</span>
                  )}
                  {saveState === 'error' && (
                    <span className="flex items-center text-xs text-red-500">{saveMessage ?? 'Save failed'}</span>
                  )}
                </div>
              </div>
              );
              return productCard;
            })}
          </motion.div>
        )}

        {/* Impact */}
        {tab === 'impact' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-charcoal">Impact CMS</h3>
                  <p className="text-xs text-light">Edit counters, prefixes/suffixes, and chart data.</p>
                </div>
                <button
                  onClick={handleSaveImpactMetrics}
                  className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:bg-[hsl(20,8%,28%)]"
                >
                  Save Metrics
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {metricDrafts.map((metric, index) => (
                  <div key={metric.id ?? index} className="grid gap-2 sm:grid-cols-[1fr,1fr,120px,100px,100px,auto] items-center">
                    <input
                      type="text"
                      value={metric.labelEn}
                      onChange={(e) => setMetricDrafts((prev) => prev.map((m, i) => i === index ? { ...m, labelEn: e.target.value } : m))}
                      placeholder="Label (EN) ex: Total Revenue"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="text"
                      value={metric.labelKo}
                      onChange={(e) => setMetricDrafts((prev) => prev.map((m, i) => i === index ? { ...m, labelKo: e.target.value } : m))}
                      placeholder="Label (KO) ex: 총 매출"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="text"
                      value={metric.prefix ?? ''}
                      onChange={(e) => setMetricDrafts((prev) => prev.map((m, i) => i === index ? { ...m, prefix: e.target.value } : m))}
                      placeholder="Prefix ex: $"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="number"
                      value={metric.value}
                      onChange={(e) => setMetricDrafts((prev) => prev.map((m, i) => i === index ? { ...m, value: Number(e.target.value) } : m))}
                      placeholder="Value ex: 12000"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="text"
                      value={metric.suffix ?? ''}
                      onChange={(e) => setMetricDrafts((prev) => prev.map((m, i) => i === index ? { ...m, suffix: e.target.value } : m))}
                      placeholder="Suffix ex: +"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <button
                      onClick={() => {
                        handleDeleteImpactRow('impact_metrics', metric.id);
                        setMetricDrafts((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setMetricDrafts((prev) => [...prev, { id: createId(), labelEn: '', labelKo: '', value: 0, prefix: '', suffix: '', sortOrder: prev.length + 1 }])}
                  className="text-xs text-mid hover:text-charcoal"
                >
                  + Add metric
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-charcoal">Revenue vs Expenses</h4>
                <button onClick={handleSaveRevenue} className="rounded-full bg-charcoal px-3 py-1.5 text-xs font-semibold text-white">Save</button>
              </div>
              <div className="mt-3 space-y-2">
                {revenueDrafts.map((row, index) => (
                  <div key={row.id ?? index} className="grid gap-2 sm:grid-cols-[1fr,1fr,1fr,auto] items-center">
                    <input
                      type="text"
                      value={row.month}
                      onChange={(e) => setRevenueDrafts((prev) => prev.map((r, i) => i === index ? { ...r, month: e.target.value } : r))}
                      placeholder="Month ex: Jan"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="number"
                      value={row.revenue}
                      onChange={(e) => setRevenueDrafts((prev) => prev.map((r, i) => i === index ? { ...r, revenue: Number(e.target.value) } : r))}
                      placeholder="Revenue ex: 2400"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="number"
                      value={row.expenses}
                      onChange={(e) => setRevenueDrafts((prev) => prev.map((r, i) => i === index ? { ...r, expenses: Number(e.target.value) } : r))}
                      placeholder="Expenses ex: 1200"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <button
                      onClick={() => {
                        handleDeleteImpactRow('impact_revenue', row.id);
                        setRevenueDrafts((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setRevenueDrafts((prev) => [...prev, { id: createId(), month: '', revenue: 0, expenses: 0, sortOrder: prev.length + 1 }])}
                  className="text-xs text-mid hover:text-charcoal"
                >
                  + Add row
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-charcoal">Donations by Project</h4>
                <button onClick={handleSaveDonations} className="rounded-full bg-charcoal px-3 py-1.5 text-xs font-semibold text-white">Save</button>
              </div>
              <div className="mt-3 space-y-2">
                {donationDrafts.map((row, index) => (
                  <div key={row.id ?? index} className="grid gap-2 sm:grid-cols-[1fr,1fr,auto] items-center">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => setDonationDrafts((prev) => prev.map((r, i) => i === index ? { ...r, name: e.target.value } : r))}
                      placeholder="Project ex: EcoBag"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="number"
                      value={row.value}
                      onChange={(e) => setDonationDrafts((prev) => prev.map((r, i) => i === index ? { ...r, value: Number(e.target.value) } : r))}
                      placeholder="Donation ex: 320"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <button
                      onClick={() => {
                        handleDeleteImpactRow('impact_donations', row.id);
                        setDonationDrafts((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setDonationDrafts((prev) => [...prev, { id: createId(), name: '', value: 0, sortOrder: prev.length + 1 }])}
                  className="text-xs text-mid hover:text-charcoal"
                >
                  + Add row
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-charcoal">Member Growth</h4>
                <button onClick={handleSaveGrowth} className="rounded-full bg-charcoal px-3 py-1.5 text-xs font-semibold text-white">Save</button>
              </div>
              <div className="mt-3 space-y-2">
                {growthDrafts.map((row, index) => (
                  <div key={row.id ?? index} className="grid gap-2 sm:grid-cols-[1fr,1fr,auto] items-center">
                    <input
                      type="text"
                      value={row.month}
                      onChange={(e) => setGrowthDrafts((prev) => prev.map((r, i) => i === index ? { ...r, month: e.target.value } : r))}
                      placeholder="Month ex: Sep '24"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="number"
                      value={row.members}
                      onChange={(e) => setGrowthDrafts((prev) => prev.map((r, i) => i === index ? { ...r, members: Number(e.target.value) } : r))}
                      placeholder="Members ex: 120"
                      className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <button
                      onClick={() => {
                        handleDeleteImpactRow('impact_member_growth', row.id);
                        setGrowthDrafts((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setGrowthDrafts((prev) => [...prev, { id: createId(), month: '', members: 0, sortOrder: prev.length + 1 }])}
                  className="text-xs text-mid hover:text-charcoal"
                >
                  + Add row
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Design */}
        {tab === 'design' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-bold text-charcoal">Design Controls</h3>
              <p className="text-sm text-light mt-1">Update fonts and colors without redeploying.</p>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-[hsl(30,25%,98%)] p-5">
                  <p className="text-sm font-semibold text-charcoal">Typography</p>
                  <label className="mt-4 block text-xs font-semibold text-mid">Font URL (Google Fonts)</label>
                  <input
                    type="text"
                    value={theme.fontUrl}
                    onChange={(e) => updateTheme({ fontUrl: e.target.value })}
                    placeholder="https://fonts.googleapis.com/css2?family=Inter..."
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                  />
                  <label className="mt-4 block text-xs font-semibold text-mid">Body Font Family</label>
                  <input
                    type="text"
                    value={theme.fontBody}
                    onChange={(e) => updateTheme({ fontBody: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                  />
                  <label className="mt-4 block text-xs font-semibold text-mid">Heading Font Family</label>
                  <input
                    type="text"
                    value={theme.fontHeading}
                    onChange={(e) => updateTheme({ fontHeading: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-mid">Base Font Size</label>
                      <input
                        type="text"
                        value={theme.baseFontSize}
                        onChange={(e) => updateTheme({ baseFontSize: e.target.value })}
                        placeholder="16px"
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Radius</label>
                      <input
                        type="text"
                        value={theme.radius}
                        onChange={(e) => updateTheme({ radius: e.target.value })}
                        placeholder="0.5rem"
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-[hsl(30,25%,98%)] p-5">
                  <p className="text-sm font-semibold text-charcoal">Colors</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {themeColorFields.map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-xs font-semibold text-mid">{label}</label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="color"
                            value={getThemeColor(key)}
                            onChange={(e) => updateTheme({ [key]: e.target.value } as Partial<SiteTheme>)}
                            className="h-9 w-12 rounded-md border border-border bg-card"
                          />
                          <input
                            type="text"
                            value={theme[key]}
                            onChange={(e) => {
                              const normalized = normalizeHex(e.target.value);
                              if (normalized) updateTheme({ [key]: normalized } as Partial<SiteTheme>);
                            }}
                            className="w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={handleSaveTheme} className="rounded-full bg-charcoal px-6 py-2.5 text-sm font-semibold text-white">
                  Save Changes
                </button>
                <span className={`text-xs ${themeError ? 'text-red-500' : themeSaved ? 'text-emerald-600' : 'text-light'}`}>
                  {themeError
                    ? themeError
                    : themeSaved
                      ? 'Saved'
                      : themeStatus === 'loading'
                        ? 'Syncing...'
                        : themeStatus === 'demo'
                          ? 'Local demo mode (not synced)'
                          : 'Changes sync instantly'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Copy */}
        {tab === 'copy' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-charcoal">Edit All Text</h3>
                  <p className="text-sm text-light">Search any key and update the English/Korean copy instantly.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleResetCopy}
                    className="rounded-full border border-border px-4 py-2 text-xs text-mid hover:text-charcoal hover:border-charcoal"
                  >
                    Reset to Defaults
                  </button>
                  <button
                    onClick={handleSaveCopy}
                    className="rounded-full bg-charcoal px-5 py-2 text-xs font-semibold text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={copySearch}
                  onChange={(e) => setCopySearch(e.target.value)}
                  placeholder="Search by key or text..."
                  className="w-full rounded-lg border border-border px-4 py-2 text-sm outline-none focus:border-charcoal"
                />
                <span className="text-xs text-light">{filteredCopyDrafts.length} items</span>
              </div>

              <div className="mt-4 space-y-3">
                {filteredCopyDrafts.map((row) => (
                  <div key={row.key} className="grid gap-2 lg:grid-cols-[220px,1fr,1fr] items-start min-w-0">
                    <div className="text-xs font-semibold text-mid break-all">{row.key}</div>
                    <input
                      type="text"
                      value={row.en}
                      onChange={(e) => setCopyDrafts((prev) => prev.map((item) => item.key === row.key ? { ...item, en: e.target.value } : item))}
                      placeholder="English"
                      className="w-full min-w-0 rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                    />
                    <input
                      type="text"
                      value={row.ko}
                      onChange={(e) => setCopyDrafts((prev) => prev.map((item) => item.key === row.key ? { ...item, ko: e.target.value } : item))}
                      placeholder="Korean"
                      className="w-full min-w-0 rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-charcoal"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-light">
                {copyError
                  ? copyError
                  : copyNotice
                    ? copyNotice
                    : copyStatus === 'loading'
                      ? 'Syncing...'
                      : copyStatus === 'demo'
                        ? 'Local demo mode (not synced)'
                        : 'Changes sync instantly'}
              </div>
            </div>
          </motion.div>
        )}

        {/* Site Content */}
        {tab === 'content' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold text-charcoal mb-5">Edit Site Content</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal">Hero Background Image</label>
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-muted">
                  {siteContent.heroBackgroundUrl ? (
                    <img src={siteContent.heroBackgroundUrl} alt="Hero Background" className="size-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-light">No image</div>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-light">Recommended 1600×900 (16:9)</p>
                <input
                  type="text"
                  value={siteContent.heroBackgroundUrl}
                  onChange={(e) => updateContent({ heroBackgroundUrl: e.target.value })}
                  placeholder="Paste image URL"
                  className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-charcoal"
                />
                <button
                  type="button"
                  onClick={() => updateContent({ heroBackgroundUrl: '' })}
                  className="mt-2 text-xs text-red-500 hover:text-red-600"
                >
                  Remove background image
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleHeroBackgroundUpload(e.target.files?.[0])}
                  className="mt-2 w-full text-xs text-mid"
                />
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="text-sm font-semibold text-charcoal">Active Projects (auto)</p>
                <p className="mt-2 text-2xl font-bold text-charcoal tabular-nums">{activeProjectCount}</p>
                <p className="mt-1 text-xs text-light">This updates automatically from projects where status is `active`.</p>
              </div>

              {contentEntries.map(([key, val]) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium text-charcoal capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateContent({ [key]: e.target.value } as Partial<SiteContent>)}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-charcoal"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button onClick={handleSaveContent} className="rounded-full bg-charcoal px-6 py-2.5 text-sm font-semibold text-white">Save Changes</button>
              <span className={`text-xs ${error ? 'text-red-500' : saved ? 'text-emerald-600' : 'text-light'}`}>
                {error
                  ? error
                  : saved
                    ? 'Saved'
                    : status === 'loading'
                      ? 'Syncing...'
                      : status === 'demo'
                        ? 'Local demo mode (not synced)'
                        : 'Changes sync instantly'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {normalizedOrders.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-base text-light">No orders yet.</p>
              </div>
            ) : (
              normalizedOrders.map((order, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
                    <div>
                      <p className="text-base font-semibold text-charcoal">{order.buyerName}</p>
                      <p className="text-sm text-mid">{order.buyerEmail}</p>
                      <div className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        order.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {order.status === 'completed' ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-charcoal">${order.total.toFixed(2)}</p>
                      <p className="text-xs text-light">{order.date ? new Date(order.date).toLocaleDateString() : '—'}</p>
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, order.status === 'completed' ? 'pending' : 'completed')}
                          className="rounded-full border border-border px-3 py-1.5 text-xs text-mid hover:text-charcoal hover:border-charcoal transition-colors"
                        >
                          {order.status === 'completed' ? 'Reopen' : 'Mark Completed'}
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:border-red-300 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border pt-2 space-y-1">
                    {order.items.map((item: { name: string; qty: number; price: number }, j: number) => (
                      <p key={j} className="text-sm text-mid">{item.name} × {item.qty} — ${(item.price * item.qty).toFixed(2)}</p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Messages */}
        {tab === 'messages' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {messages.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-base text-light">No messages yet.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`rounded-xl border border-border bg-card p-5 ${message.is_read ? '' : 'shadow-sm'}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-charcoal">{message.subject}</p>
                      <p className="text-sm text-mid">{message.name} · {message.email}</p>
                      <p className="mt-2 text-sm text-charcoal leading-relaxed">{message.message}</p>
                      <p className="mt-2 text-xs text-light">{message.created_at ? new Date(message.created_at).toLocaleString() : '—'}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${message.is_read ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {message.is_read ? 'Read' : 'Unread'}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${message.is_resolved ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {message.is_resolved ? 'Completed' : 'Open'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateMessageFlags(message.id, { is_read: !message.is_read })}
                          className="rounded-full border border-border px-3 py-1.5 text-xs text-mid hover:text-charcoal hover:border-charcoal transition-colors"
                        >
                          {message.is_read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button
                          onClick={() => updateMessageFlags(message.id, { is_resolved: !message.is_resolved })}
                          className="rounded-full border border-border px-3 py-1.5 text-xs text-mid hover:text-charcoal hover:border-charcoal transition-colors"
                        >
                          {message.is_resolved ? 'Reopen' : 'Mark Completed'}
                        </button>
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:border-red-300 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Overview */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Active Projects', value: activeProjectCount, icon: FolderOpen },
                { label: 'Unread Messages', value: unreadMessagesCount, icon: MessageSquare },
                { label: 'Pending Orders', value: pendingOrdersCount, icon: ShoppingBag },
                { label: 'Attendance Avg', value: averageAttendanceRate === null ? '—' : `${averageAttendanceRate}%`, icon: BarChart3 },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-card p-5">
                  <item.icon className="size-5 text-[hsl(24,80%,50%)]" />
                  <p className="mt-3 text-2xl font-bold text-charcoal">{item.value}</p>
                  <p className="mt-1 text-xs text-light">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr,1fr,1fr]">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-charcoal">Needs Attention</h3>
                    <p className="mt-1 text-xs text-light">A quick operational sweep for this week.</p>
                  </div>
                  <div className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    {lowStockProducts.length + projectsMissingMedia.length + unassignedMembers.length} items
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-light">Low Stock</p>
                      <button onClick={() => setTab('shop')} className="text-xs font-medium text-charcoal underline-offset-4 hover:underline">
                        Open Shop
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {lowStockProducts.length ? lowStockProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-charcoal">{product.name}</p>
                            <p className="text-[11px] text-light">{product.term || 'No term set'}</p>
                          </div>
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                            {product.inventory} left
                          </span>
                        </div>
                      )) : (
                        <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-light">No low-stock products right now.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-light">Project Media</p>
                      <button onClick={() => setTab('projects')} className="text-xs font-medium text-charcoal underline-offset-4 hover:underline">
                        Open Projects
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {projectsMissingMedia.length ? projectsMissingMedia.map((project) => (
                        <div key={project.id} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-charcoal">{project.name}</p>
                            <p className="text-[11px] text-light">
                              {!project.image?.trim() ? 'Main image missing' : 'Banner image missing'}
                            </p>
                          </div>
                          <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] font-semibold text-stone-700">
                            Needs upload
                          </span>
                        </div>
                      )) : (
                        <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-light">All projects have core visuals set.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-light">Unassigned Members</p>
                      <button onClick={() => setTab('members')} className="text-xs font-medium text-charcoal underline-offset-4 hover:underline">
                        Open Members
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {unassignedMembers.length ? unassignedMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-charcoal">{member.name}</p>
                            <p className="text-[11px] text-light">{member.email}</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                            Assign team
                          </span>
                        </div>
                      )) : (
                        <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-light">Everyone is assigned to a team.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-charcoal">Weekly Snapshot</h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-border/70 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-light">Next Meeting</p>
                    <p className="mt-2 text-base font-semibold text-charcoal">
                      {nextMeeting ? formatMeetingDate(nextMeeting.meeting_date) : 'No meeting scheduled'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/70 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-light">Projects</p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-semibold text-charcoal">{cmsProjects.length}</p>
                        <p className="text-light">Total tracked</p>
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal">{cmsProjects.filter((project) => (project.status ?? '').toLowerCase() === 'completed').length}</p>
                        <p className="text-light">Completed</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/70 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-light">Store Health</p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-semibold text-charcoal">{cmsProducts.filter((product) => product.inventory <= 0 || product.status === 'sold-out').length}</p>
                        <p className="text-light">Sold out</p>
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal">{lowStockProducts.length}</p>
                        <p className="text-light">Low stock</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-charcoal">Quick Actions</h3>
                <div className="mt-4 grid gap-2">
                  {[
                    { label: 'Review unread messages', tabKey: 'messages' },
                    { label: 'Update low-stock products', tabKey: 'shop' },
                    { label: 'Assign member teams', tabKey: 'members' },
                    { label: 'Check project media', tabKey: 'projects' },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() => setTab(action.tabKey)}
                      className="rounded-lg border border-border px-3 py-3 text-left text-sm text-charcoal transition-colors hover:border-charcoal hover:bg-stone-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <ProductImageCropDialog
        open={Boolean(productCropSession)}
        sourceUrl={productCropSession?.sourceUrl ?? ''}
        fileName={productCropSession?.files[productCropSession.index]?.name ?? 'product-image'}
        fileIndex={productCropSession ? productCropSession.index + 1 : undefined}
        fileCount={productCropSession?.files.length}
        onCancel={handleProductCropCancel}
        onSave={handleProductCropSave}
      />
    </div>
  );
}
