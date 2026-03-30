import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Project, Product } from '@/types';
import { useCMSStore, type ImpactMetricRecord, type RevenuePoint, type DonationPoint, type MemberGrowthPoint } from '@/stores/cmsStore';
import { useSiteContentStore, type SiteContent } from '@/stores/siteContentStore';
import { useSiteThemeStore, type SiteTheme } from '@/stores/siteThemeStore';
import { useSiteCopyStore } from '@/stores/siteCopyStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { TEAM_OPTIONS } from '@/constants/config';
import { translations } from '@/constants/translations';
import { normalizeHex } from '@/lib/color';
import { Users as UsersIcon, FolderOpen, ShoppingBag, BarChart3, MessageSquare, CheckCircle, XCircle, Save, FileText, Trash2, Package, Palette, Type } from 'lucide-react';

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
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [meetingError, setMeetingError] = useState('');
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
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const activeMember = members.find((m) => m.id === selectedMember);
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
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!supabase) return;
    await supabase.from('meetings').delete().eq('id', meetingId);
    loadMeetings();
    if (selectedMember) loadMemberMeetings(selectedMember);
    loadMembers();
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

  const createProjectDraft = (): Project => ({
    id: `project-${createId()}`,
    name: 'New Project',
    description: '',
    stage: 1,
    stageName: 'Planning',
    revenue: 0,
    expenses: 0,
    profit: 0,
    donation: 0,
    donationPercent: 0,
    team: [],
    image: '',
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

  const mapProjectToRow = (project: Project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    stage: Number(project.stage) || 1,
    stage_name: project.stageName,
    revenue: Number(project.revenue) || 0,
    expenses: Number(project.expenses) || 0,
    profit: Number(project.profit) || 0,
    donation: Number(project.donation) || 0,
    donation_percent: Number(project.donationPercent) || 0,
    team: project.team ?? [],
    image_url: project.image,
    start_date: project.startDate,
    category: project.category,
    term: project.term,
    status: project.status ?? 'active',
  });

  const mapProductToRow = (product: Product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price) || 0,
    image_url: product.image,
    images: product.images ?? [],
    category: product.category,
    inventory: Number(product.inventory) || 0,
    is_preorder: Boolean(product.isPreOrder),
    project_id: product.projectId ?? null,
    term: product.term,
    status: product.status ?? 'available',
  });

  const handleSaveProject = async (project: Project) => {
    if (!supabase) return;
    const { error: saveError } = await supabase
      .from('projects')
      .upsert(mapProjectToRow(project));
    setCmsNotice(saveError ? saveError.message : 'Project saved');
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!supabase) return;
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    setCmsNotice(deleteError ? deleteError.message : 'Project deleted');
  };

  const handleSaveProduct = async (product: Product) => {
    if (!supabase) return;
    const { error: saveError } = await supabase
      .from('products')
      .upsert(mapProductToRow(product));
    setCmsNotice(saveError ? saveError.message : 'Product saved');
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!supabase) return;
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    setCmsNotice(deleteError ? deleteError.message : 'Product deleted');
  };

  const uploadToBucket = async (bucket: string, filePath: string, file: File) => {
    if (!supabase) return null;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      setCmsNotice(uploadError.message);
      return null;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleProjectImageUpload = async (projectId: string, file?: File | null) => {
    if (!file) return;
    const safeName = file.name.replace(/\\s+/g, '-');
    const path = `${projectId}/${Date.now()}-${safeName}`;
    const url = await uploadToBucket('project-images', path, file);
    if (!url) return;
    setProjectDrafts((prev) => {
      const next = prev.map((p) => (p.id === projectId ? { ...p, image: url } : p));
      const updated = next.find((p) => p.id === projectId);
      if (updated) {
        void handleSaveProject(updated);
      }
      return next;
    });
  };

  const handleProductImageUpload = async (productId: string, file?: File | null) => {
    if (!file) return;
    const safeName = file.name.replace(/\\s+/g, '-');
    const path = `${productId}/${Date.now()}-${safeName}`;
    const url = await uploadToBucket('product-images', path, file);
    if (!url) return;
    setProductDrafts((prev) => {
      const next = prev.map((p) => (p.id === productId ? { ...p, image: url } : p));
      const updated = next.find((p) => p.id === productId);
      if (updated) {
        void handleSaveProduct(updated);
      }
      return next;
    });
  };

  const handleProductGalleryUpload = async (productId: string, files: FileList | null) => {
    if (!files || !files.length) return;
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/\\s+/g, '-');
      const path = `${productId}/gallery-${Date.now()}-${safeName}`;
      // eslint-disable-next-line no-await-in-loop
      const url = await uploadToBucket('product-images', path, file);
      if (url) uploaded.push(url);
    }
    if (!uploaded.length) return;
    setProductDrafts((prev) => {
      const next = prev.map((p) => (
        p.id === productId ? { ...p, images: [...(p.images ?? []), ...uploaded] } : p
      ));
      const updated = next.find((p) => p.id === productId);
      if (updated) {
        void handleSaveProduct(updated);
      }
      return next;
    });
  };

  const handleHeroBackgroundUpload = async (file?: File | null) => {
    if (!file) return;
    const safeName = file.name.replace(/\s+/g, '-');
    const path = `hero/${Date.now()}-${safeName}`;
    const url = await uploadToBucket('site-images', path, file);
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
    setCmsNotice(saveError ? saveError.message : 'Impact metrics saved');
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
    setCmsNotice(saveError ? saveError.message : 'Revenue chart saved');
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
    setCmsNotice(saveError ? saveError.message : 'Donations chart saved');
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
    setCmsNotice(saveError ? saveError.message : 'Member growth saved');
  };

  const handleDeleteImpactRow = async (table: 'impact_revenue' | 'impact_donations' | 'impact_member_growth' | 'impact_metrics', id?: string) => {
    if (!supabase || !id) return;
    await supabase.from(table).delete().eq('id', id);
  };

  const updateProjectDraft = (projectId: string, patch: Partial<Project>) => {
    setProjectDrafts((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...patch } : p)));
  };

  const updateProductDraft = (productId: string, patch: Partial<Product>) => {
    setProductDrafts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...patch } : p)));
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
    setProjectDrafts(cmsProjects);
  }, [cmsProjects]);

  useEffect(() => {
    setProductDrafts(cmsProducts);
  }, [cmsProducts]);

  useEffect(() => {
    setMetricDrafts(cmsImpactMetrics);
    setRevenueDrafts(cmsRevenueData);
    setDonationDrafts(cmsDonationData);
    setGrowthDrafts(cmsGrowthData);
  }, [cmsImpactMetrics, cmsRevenueData, cmsDonationData, cmsGrowthData]);

  useEffect(() => {
    setCopyDrafts(
      defaultCopyList.map((row) => ({
        ...row,
        en: copy[row.key]?.en ?? row.en,
        ko: copy[row.key]?.ko ?? row.ko,
      }))
    );
  }, [copy, defaultCopyList]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase
      .channel('admin-members-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => loadMembers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        loadMembers();
        if (selectedMember) loadMemberMeetings(selectedMember);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, () => {
        loadMembers();
        if (selectedMember) loadMemberMeetings(selectedMember);
        loadMeetings();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, () => {
        if (selectedMember) loadContributions(selectedMember);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMember]);

  const handleSaveContent = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handleSaveTheme = () => {
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
    setCopyNotice(saveError ? saveError.message : 'Copy saved');
    window.setTimeout(() => setCopyNotice(''), 1800);
  };

  const handleResetCopy = () => {
    setCopyDrafts(defaultCopyList);
  };

  const toggleAttendance = async (attendanceId: string, currentStatus: 'present' | 'absent') => {
    if (!supabase) return;
    await supabase
      .from('attendance')
      .update({ status: currentStatus === 'present' ? 'absent' : 'present' })
      .eq('id', attendanceId);
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
    .filter(([key]) => key !== 'heroBackgroundUrl');

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
    <div className="min-h-screen bg-beige pt-20">
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
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSelectedMember(null); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                tab === key ? 'bg-charcoal text-white' : 'bg-white text-mid hover:text-charcoal border border-[hsl(30,12%,90%)]'
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
            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-4">
              <p className="text-sm font-semibold text-charcoal">Add Meeting</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="date"
                  value={newMeetingDate}
                  onChange={(e) => setNewMeetingDate(e.target.value)}
                  className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
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

            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-4">
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
                    <div key={meeting.id} className="flex items-center justify-between rounded-lg border border-[hsl(30,12%,92%)] px-3 py-2">
                      <span className="text-sm text-charcoal">
                        {meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleDateString() : '—'}
                      </span>
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

            {membersLoading ? (
              <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6 text-center text-sm text-light">
                Loading members...
              </div>
            ) : members.length === 0 ? (
              <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6 text-center text-sm text-light">
                No members yet.
              </div>
            ) : (
              members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member.id)}
                  className="w-full text-left rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5 hover:shadow-md transition-shadow flex items-center justify-between"
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
            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6 mb-6">
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
                    className="rounded-lg border border-[hsl(30,12%,87%)] bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-charcoal"
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
                    className="w-44 rounded-lg border border-[hsl(30,12%,87%)] bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-charcoal"
                  />
                  <div className="flex items-center rounded-lg border border-[hsl(30,12%,87%)] bg-[hsl(30,15%,94%)] px-3 py-2 text-sm text-mid">
                    Contributions: <span className="ml-2 font-semibold text-charcoal">{contributionTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white overflow-hidden">
              <div className="grid grid-cols-12 gap-3 bg-[hsl(30,15%,94%)] px-5 py-3 border-b border-[hsl(30,12%,90%)]">
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
                    <div key={meeting.attendanceId} className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[hsl(30,12%,94%)] last:border-0 items-start">
                      <span className="col-span-3 text-sm text-charcoal tabular-nums pt-2">{meeting.date || '—'}</span>
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
                          className="w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
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
                          className="flex-1 rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
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

            <div className="mt-6 rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
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
                  className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                />
                <input
                  type="number"
                  value={newContribution.points}
                  onChange={(e) => setNewContribution((prev) => ({ ...prev, points: e.target.value }))}
                  placeholder="Points"
                  className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                />
                <input
                  type="date"
                  value={newContribution.date}
                  onChange={(e) => setNewContribution((prev) => ({ ...prev, date: e.target.value }))}
                  className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                />
                <input
                  type="text"
                  value={newContribution.notes}
                  onChange={(e) => setNewContribution((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes (optional)"
                  className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal sm:col-span-2 lg:col-span-4"
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
                    <div key={entry.id} className="flex flex-col gap-2 rounded-lg border border-[hsl(30,12%,92%)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-charcoal">Projects CMS</h3>
                  <p className="text-xs text-light">Edit every project detail, image, and status. Changes sync live.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cmsSources.projects === 'mock' && (
                    <button
                      onClick={handleSeedProjects}
                      className="rounded-full border border-[hsl(30,12%,85%)] px-4 py-2 text-xs font-semibold text-mid hover:text-charcoal hover:border-charcoal"
                    >
                      Seed From Mock
                    </button>
                  )}
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

            {projectDrafts.map((project) => (
              <div key={project.id} className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5 space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="w-full lg:w-56">
                    <div className="aspect-[4/3] overflow-hidden rounded-lg border border-[hsl(30,12%,90%)] bg-[hsl(30,15%,94%)]">
                      {project.image ? (
                        <img src={project.image} alt={project.name} className="size-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-light">No image</div>
                      )}
                    </div>
                    <label className="mt-3 block text-xs font-semibold text-mid">Image URL</label>
                    <input
                      type="text"
                      value={project.image}
                      onChange={(e) => updateProjectDraft(project.id, { image: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-xs outline-none focus:border-charcoal"
                    />
                    <label className="mt-3 block text-xs font-semibold text-mid">Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProjectImageUpload(project.id, e.target.files?.[0])}
                      className="mt-1 w-full text-xs text-mid"
                    />
                  </div>

                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-mid">Project Name</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProjectDraft(project.id, { name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Status</label>
                      <input
                        type="text"
                        value={project.status ?? ''}
                        onChange={(e) => updateProjectDraft(project.id, { status: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Stage</label>
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={project.stage}
                        onChange={(e) => updateProjectDraft(project.id, { stage: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Stage Name</label>
                      <input
                        type="text"
                        value={project.stageName}
                        onChange={(e) => updateProjectDraft(project.id, { stageName: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Category</label>
                      <input
                        type="text"
                        value={project.category}
                        onChange={(e) => updateProjectDraft(project.id, { category: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Term</label>
                      <input
                        type="text"
                        value={project.term}
                        onChange={(e) => updateProjectDraft(project.id, { term: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Start Date</label>
                      <input
                        type="date"
                        value={project.startDate}
                        onChange={(e) => updateProjectDraft(project.id, { startDate: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Donation %</label>
                      <input
                        type="number"
                        value={project.donationPercent}
                        onChange={(e) => updateProjectDraft(project.id, { donationPercent: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Revenue</label>
                      <input
                        type="number"
                        value={project.revenue}
                        onChange={(e) => updateProjectDraft(project.id, { revenue: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Expenses</label>
                      <input
                        type="number"
                        value={project.expenses}
                        onChange={(e) => updateProjectDraft(project.id, { expenses: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Profit</label>
                      <input
                        type="number"
                        value={project.profit}
                        onChange={(e) => updateProjectDraft(project.id, { profit: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Donation</label>
                      <input
                        type="number"
                        value={project.donation}
                        onChange={(e) => updateProjectDraft(project.id, { donation: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-mid">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProjectDraft(project.id, { description: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-charcoal">Team</p>
                    <button
                      onClick={() => {
                        const nextTeam = [...project.team, { role: '', members: [] }];
                        updateProjectDraft(project.id, { team: nextTeam });
                      }}
                      className="text-xs text-mid hover:text-charcoal"
                    >
                      + Add Role
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {project.team.length === 0 && <p className="text-xs text-light">No team roles yet.</p>}
                    {project.team.map((team, index) => (
                      <div key={`${project.id}-team-${index}`} className="grid gap-2 sm:grid-cols-[1fr,2fr,auto]">
                        <input
                          type="text"
                          value={team.role}
                          onChange={(e) => {
                            const nextTeam = project.team.map((t, i) => i === index ? { ...t, role: e.target.value } : t);
                            updateProjectDraft(project.id, { team: nextTeam });
                          }}
                          placeholder="Role (Marketing)"
                          className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                        />
                        <input
                          type="text"
                          value={team.members.join(', ')}
                          onChange={(e) => {
                            const members = e.target.value.split(',').map((m) => m.trim()).filter(Boolean);
                            const nextTeam = project.team.map((t, i) => i === index ? { ...t, members } : t);
                            updateProjectDraft(project.id, { team: nextTeam });
                          }}
                          placeholder="Members (comma separated)"
                          className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                        />
                        <button
                          onClick={() => {
                            const nextTeam = project.team.filter((_, i) => i !== index);
                            updateProjectDraft(project.id, { team: nextTeam });
                          }}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSaveProject(project)}
                    className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:bg-[hsl(20,8%,28%)]"
                  >
                    Save Project
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-300 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Shop */}
        {tab === 'shop' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-charcoal">Shop CMS</h3>
                  <p className="text-xs text-light">Edit products, images, pricing, inventory, and status.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cmsSources.products === 'mock' && (
                    <button
                      onClick={handleSeedProducts}
                      className="rounded-full border border-[hsl(30,12%,85%)] px-4 py-2 text-xs font-semibold text-mid hover:text-charcoal hover:border-charcoal"
                    >
                      Seed From Mock
                    </button>
                  )}
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

            {productDrafts.map((product) => (
              <div key={product.id} className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5 space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="w-full lg:w-56">
                    <div className="aspect-square overflow-hidden rounded-lg border border-[hsl(30,12%,90%)] bg-[hsl(30,15%,94%)]">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="size-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-light">No image</div>
                      )}
                    </div>
                    <label className="mt-3 block text-xs font-semibold text-mid">Image URL</label>
                    <input
                      type="text"
                      value={product.image}
                      onChange={(e) => updateProductDraft(product.id, { image: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-xs outline-none focus:border-charcoal"
                    />
                    <label className="mt-3 block text-xs font-semibold text-mid">Upload Main Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProductImageUpload(product.id, e.target.files?.[0])}
                      className="mt-1 w-full text-xs text-mid"
                    />
                    <label className="mt-3 block text-xs font-semibold text-mid">Upload Gallery Images</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleProductGalleryUpload(product.id, e.target.files)}
                      className="mt-1 w-full text-xs text-mid"
                    />
                  </div>

                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-mid">Product Name</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProductDraft(product.id, { name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Status</label>
                      <select
                        value={product.status}
                        onChange={(e) => updateProductDraft(product.id, { status: e.target.value as Product['status'] })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
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
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Term</label>
                      <input
                        type="text"
                        value={product.term}
                        onChange={(e) => updateProductDraft(product.id, { term: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Price</label>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => updateProductDraft(product.id, { price: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Inventory</label>
                      <input
                        type="number"
                        value={product.inventory}
                        onChange={(e) => updateProductDraft(product.id, { inventory: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Project ID</label>
                      <input
                        type="text"
                        value={product.projectId ?? ''}
                        onChange={(e) => updateProductDraft(product.id, { projectId: e.target.value || undefined })}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
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
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                        rows={3}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-mid">Gallery Images (comma separated URLs)</label>
                      <textarea
                        value={(product.images ?? []).join(', ')}
                        onChange={(e) => {
                          const urls = e.target.value.split(',').map((u) => u.trim()).filter(Boolean);
                          updateProductDraft(product.id, { images: urls });
                        }}
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSaveProduct(product)}
                    className="rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white hover:bg-[hsl(20,8%,28%)]"
                  >
                    Save Product
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-300 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Impact */}
        {tab === 'impact' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5">
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
                      placeholder="Label (EN)"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="text"
                      value={metric.labelKo}
                      onChange={(e) => setMetricDrafts((prev) => prev.map((m, i) => i === index ? { ...m, labelKo: e.target.value } : m))}
                      placeholder="Label (KO)"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="text"
                      value={metric.prefix ?? ''}
                      onChange={(e) => setMetricDrafts((prev) => prev.map((m, i) => i === index ? { ...m, prefix: e.target.value } : m))}
                      placeholder="Prefix"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="number"
                      value={metric.value}
                      onChange={(e) => setMetricDrafts((prev) => prev.map((m, i) => i === index ? { ...m, value: Number(e.target.value) } : m))}
                      placeholder="Value"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="text"
                      value={metric.suffix ?? ''}
                      onChange={(e) => setMetricDrafts((prev) => prev.map((m, i) => i === index ? { ...m, suffix: e.target.value } : m))}
                      placeholder="Suffix"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
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

            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5">
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
                      placeholder="Month"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="number"
                      value={row.revenue}
                      onChange={(e) => setRevenueDrafts((prev) => prev.map((r, i) => i === index ? { ...r, revenue: Number(e.target.value) } : r))}
                      placeholder="Revenue"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="number"
                      value={row.expenses}
                      onChange={(e) => setRevenueDrafts((prev) => prev.map((r, i) => i === index ? { ...r, expenses: Number(e.target.value) } : r))}
                      placeholder="Expenses"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
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

            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5">
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
                      placeholder="Project"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="number"
                      value={row.value}
                      onChange={(e) => setDonationDrafts((prev) => prev.map((r, i) => i === index ? { ...r, value: Number(e.target.value) } : r))}
                      placeholder="Donation"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
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

            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5">
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
                      placeholder="Month"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
                    />
                    <input
                      type="number"
                      value={row.members}
                      onChange={(e) => setGrowthDrafts((prev) => prev.map((r, i) => i === index ? { ...r, members: Number(e.target.value) } : r))}
                      placeholder="Members"
                      className="rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-sm outline-none focus:border-charcoal"
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
            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
              <h3 className="text-lg font-bold text-charcoal">Design Controls</h3>
              <p className="text-sm text-light mt-1">Update fonts and colors without redeploying.</p>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-[hsl(30,25%,98%)] p-5">
                  <p className="text-sm font-semibold text-charcoal">Typography</p>
                  <label className="mt-4 block text-xs font-semibold text-mid">Font URL (Google Fonts)</label>
                  <input
                    type="text"
                    value={theme.fontUrl}
                    onChange={(e) => updateTheme({ fontUrl: e.target.value })}
                    placeholder="https://fonts.googleapis.com/css2?family=Inter..."
                    className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-xs outline-none focus:border-charcoal"
                  />
                  <label className="mt-4 block text-xs font-semibold text-mid">Body Font Family</label>
                  <input
                    type="text"
                    value={theme.fontBody}
                    onChange={(e) => updateTheme({ fontBody: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-xs outline-none focus:border-charcoal"
                  />
                  <label className="mt-4 block text-xs font-semibold text-mid">Heading Font Family</label>
                  <input
                    type="text"
                    value={theme.fontHeading}
                    onChange={(e) => updateTheme({ fontHeading: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-xs outline-none focus:border-charcoal"
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-mid">Base Font Size</label>
                      <input
                        type="text"
                        value={theme.baseFontSize}
                        onChange={(e) => updateTheme({ baseFontSize: e.target.value })}
                        placeholder="16px"
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-xs outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-mid">Radius</label>
                      <input
                        type="text"
                        value={theme.radius}
                        onChange={(e) => updateTheme({ radius: e.target.value })}
                        placeholder="0.5rem"
                        className="mt-1 w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-xs outline-none focus:border-charcoal"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-[hsl(30,25%,98%)] p-5">
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
                            className="h-9 w-12 rounded-md border border-[hsl(30,12%,87%)] bg-white"
                          />
                          <input
                            type="text"
                            value={theme[key]}
                            onChange={(e) => {
                              const normalized = normalizeHex(e.target.value);
                              if (normalized) updateTheme({ [key]: normalized } as Partial<SiteTheme>);
                            }}
                            className="w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-xs outline-none focus:border-charcoal"
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
            <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-charcoal">Edit All Text</h3>
                  <p className="text-sm text-light">Search any key and update the English/Korean copy instantly.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleResetCopy}
                    className="rounded-full border border-[hsl(30,12%,85%)] px-4 py-2 text-xs text-mid hover:text-charcoal hover:border-charcoal"
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
                  className="w-full rounded-lg border border-[hsl(30,12%,87%)] px-4 py-2 text-sm outline-none focus:border-charcoal"
                />
                <span className="text-xs text-light">{filteredCopyDrafts.length} items</span>
              </div>

              <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                {filteredCopyDrafts.map((row) => (
                  <div key={row.key} className="grid gap-2 lg:grid-cols-[220px,1fr,1fr] items-start">
                    <div className="text-xs font-semibold text-mid break-all">{row.key}</div>
                    <input
                      type="text"
                      value={row.en}
                      onChange={(e) => setCopyDrafts((prev) => prev.map((item) => item.key === row.key ? { ...item, en: e.target.value } : item))}
                      placeholder="English"
                      className="w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-xs outline-none focus:border-charcoal"
                    />
                    <input
                      type="text"
                      value={row.ko}
                      onChange={(e) => setCopyDrafts((prev) => prev.map((item) => item.key === row.key ? { ...item, ko: e.target.value } : item))}
                      placeholder="Korean"
                      className="w-full rounded-lg border border-[hsl(30,12%,87%)] px-3 py-2 text-xs outline-none focus:border-charcoal"
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-6">
            <h3 className="text-lg font-bold text-charcoal mb-5">Edit Site Content</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal">Hero Background Image</label>
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-[hsl(30,12%,90%)] bg-[hsl(30,15%,94%)]">
                  {siteContent.heroBackgroundUrl ? (
                    <img src={siteContent.heroBackgroundUrl} alt="Hero Background" className="size-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-light">No image</div>
                  )}
                </div>
                <input
                  type="text"
                  value={siteContent.heroBackgroundUrl}
                  onChange={(e) => updateContent({ heroBackgroundUrl: e.target.value })}
                  placeholder="Paste image URL"
                  className="mt-2 w-full rounded-lg border border-[hsl(30,12%,87%)] px-4 py-2.5 text-sm outline-none focus:border-charcoal"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleHeroBackgroundUpload(e.target.files?.[0])}
                  className="mt-2 w-full text-xs text-mid"
                />
              </div>

              {contentEntries.map(([key, val]) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium text-charcoal capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateContent({ [key]: e.target.value } as Partial<SiteContent>)}
                    className="w-full rounded-lg border border-[hsl(30,12%,87%)] px-4 py-2.5 text-sm outline-none focus:border-charcoal"
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
              <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-8 text-center">
                <p className="text-base text-light">No orders yet.</p>
              </div>
            ) : (
              normalizedOrders.map((order, i) => (
                <div key={i} className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5">
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
                          className="rounded-full border border-[hsl(30,12%,85%)] px-3 py-1.5 text-xs text-mid hover:text-charcoal hover:border-charcoal transition-colors"
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
                  <div className="border-t border-[hsl(30,12%,92%)] pt-2 space-y-1">
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
              <div className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-8 text-center">
                <p className="text-base text-light">No messages yet.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5 ${message.is_read ? '' : 'shadow-sm'}`}>
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
                          className="rounded-full border border-[hsl(30,12%,85%)] px-3 py-1.5 text-xs text-mid hover:text-charcoal hover:border-charcoal transition-colors"
                        >
                          {message.is_read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button
                          onClick={() => updateMessageFlags(message.id, { is_resolved: !message.is_resolved })}
                          className="rounded-full border border-[hsl(30,12%,85%)] px-3 py-1.5 text-xs text-mid hover:text-charcoal hover:border-charcoal transition-colors"
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Projects', value: cmsProjects.length, icon: FolderOpen },
              { label: 'Total Products', value: cmsProducts.length, icon: ShoppingBag },
              { label: 'Messages', value: messages.length, icon: MessageSquare },
              { label: 'Orders', value: orders.length, icon: BarChart3 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[hsl(30,12%,90%)] bg-white p-5">
                <item.icon className="size-5 text-[hsl(24,80%,50%)]" />
                <p className="mt-3 text-2xl font-bold text-charcoal">{item.value}</p>
                <p className="mt-1 text-xs text-light">{item.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
