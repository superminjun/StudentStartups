import { useEffect } from 'react';
import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { resolveStorageUrl } from '@/lib/storage';
import {
  projects as mockProjects,
  products as mockProducts,
  impactMetrics as mockImpactMetrics,
  revenueChartData as mockRevenueChartData,
  donationByProject as mockDonationByProject,
  memberGrowth as mockMemberGrowth,
} from '@/constants/mockData';
import type { Project, Product } from '@/types';

const isBrowser = typeof window !== 'undefined';

const readCache = <T,>(key: string, fallback: T): T => {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeCache = (key: string, value: unknown) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors (private mode, storage full)
  }
};

const CACHE_KEYS = {
  projects: 'bnss-cms-projects',
  products: 'bnss-cms-products',
  impactMetrics: 'bnss-cms-impact-metrics',
  revenue: 'bnss-cms-impact-revenue',
  donations: 'bnss-cms-impact-donations',
  growth: 'bnss-cms-impact-growth',
};

export type ImpactMetricRecord = {
  id: string;
  labelEn: string;
  labelKo: string;
  value: number;
  prefix?: string;
  suffix?: string;
  sortOrder: number;
};

export type RevenuePoint = {
  id: string;
  month: string;
  revenue: number;
  expenses: number;
  sortOrder: number;
};

export type DonationPoint = {
  id: string;
  name: string;
  value: number;
  sortOrder: number;
};

export type MemberGrowthPoint = {
  id: string;
  month: string;
  members: number;
  sortOrder: number;
};

type CMSStatus = 'idle' | 'loading' | 'ready' | 'error' | 'demo';

type SourceMap = {
  projects: 'db' | 'mock';
  products: 'db' | 'mock';
  impact: 'db' | 'mock';
};

type ProjectRow = {
  id: string;
  name: string;
  description: string;
  stage: number;
  stage_name: string;
  revenue: number;
  expenses: number;
  profit: number;
  donation: number;
  donation_percent: number;
  team: unknown;
  image_url: string;
  banner_image_url?: string | null;
  start_date: string;
  category: string;
  term: string;
  status: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images: unknown;
  category: string;
  inventory: number;
  is_preorder: boolean;
  project_id: string | null;
  term: string;
  status: 'available' | 'sold-out' | 'in-production';
};

type ImpactMetricRow = {
  id: string;
  label_en: string;
  label_ko: string;
  value: number;
  prefix: string | null;
  suffix: string | null;
  sort_order: number;
};

type RevenueRow = {
  id: string;
  month: string;
  revenue: number;
  expenses: number;
  sort_order: number;
};

type DonationRow = {
  id: string;
  name: string;
  value: number;
  sort_order: number;
};

type GrowthRow = {
  id: string;
  month: string;
  members: number;
  sort_order: number;
};

const mapProjectRow = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  description: row.description,
  stage: Number(row.stage) || 1,
  stageName: row.stage_name,
  revenue: Number(row.revenue) || 0,
  expenses: Number(row.expenses) || 0,
  profit: Number(row.profit) || 0,
  donation: Number(row.donation) || 0,
  donationPercent: Number(row.donation_percent) || 0,
  team: Array.isArray(row.team) ? (row.team as Project['team']) : [],
  image: row.image_url,
  bannerImage: row.banner_image_url ?? '',
  startDate: row.start_date,
  category: row.category,
  term: row.term,
  status: row.status ?? undefined,
});

const mapProductRow = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: Number(row.price) || 0,
  image: row.image_url,
  images: Array.isArray(row.images) ? (row.images as string[]) : [],
  category: row.category,
  inventory: Number(row.inventory) || 0,
  isPreOrder: Boolean(row.is_preorder),
  projectId: row.project_id ?? undefined,
  term: row.term,
  status: row.status ?? 'available',
});

const mapMetricRow = (row: ImpactMetricRow): ImpactMetricRecord => ({
  id: row.id,
  labelEn: row.label_en,
  labelKo: row.label_ko,
  value: Number(row.value) || 0,
  prefix: row.prefix ?? undefined,
  suffix: row.suffix ?? undefined,
  sortOrder: Number(row.sort_order) || 0,
});

const mapRevenueRow = (row: RevenueRow): RevenuePoint => ({
  id: row.id,
  month: row.month,
  revenue: Number(row.revenue) || 0,
  expenses: Number(row.expenses) || 0,
  sortOrder: Number(row.sort_order) || 0,
});

const mapDonationRow = (row: DonationRow): DonationPoint => ({
  id: row.id,
  name: row.name,
  value: Number(row.value) || 0,
  sortOrder: Number(row.sort_order) || 0,
});

const mapGrowthRow = (row: GrowthRow): MemberGrowthPoint => ({
  id: row.id,
  month: row.month,
  members: Number(row.members) || 0,
  sortOrder: Number(row.sort_order) || 0,
});

const mockMetricRecords: ImpactMetricRecord[] = mockImpactMetrics.map((m, idx) => ({
  id: `metric-${idx}`,
  labelEn: m.labelEn,
  labelKo: m.labelKo,
  value: m.value,
  prefix: m.prefix,
  suffix: m.suffix,
  sortOrder: idx + 1,
}));

const mockRevenueRecords: RevenuePoint[] = mockRevenueChartData.map((d, idx) => ({
  id: `rev-${idx}`,
  month: d.month,
  revenue: d.revenue,
  expenses: d.expenses,
  sortOrder: idx + 1,
}));

const mockDonationRecords: DonationPoint[] = mockDonationByProject.map((d, idx) => ({
  id: `don-${idx}`,
  name: d.name,
  value: d.value,
  sortOrder: idx + 1,
}));

const mockGrowthRecords: MemberGrowthPoint[] = mockMemberGrowth.map((d, idx) => ({
  id: `grow-${idx}`,
  month: d.month,
  members: d.members,
  sortOrder: idx + 1,
}));

const cachedProjects = isSupabaseConfigured ? readCache<Project[]>(CACHE_KEYS.projects, []) : [];
const cachedProducts = isSupabaseConfigured ? readCache<Product[]>(CACHE_KEYS.products, []) : [];
const cachedMetrics = isSupabaseConfigured ? readCache<ImpactMetricRecord[]>(CACHE_KEYS.impactMetrics, []) : [];
const cachedRevenue = isSupabaseConfigured ? readCache<RevenuePoint[]>(CACHE_KEYS.revenue, []) : [];
const cachedDonations = isSupabaseConfigured ? readCache<DonationPoint[]>(CACHE_KEYS.donations, []) : [];
const cachedGrowth = isSupabaseConfigured ? readCache<MemberGrowthPoint[]>(CACHE_KEYS.growth, []) : [];

const initialProjects = isSupabaseConfigured ? cachedProjects : mockProjects;
const initialProducts = isSupabaseConfigured ? cachedProducts : mockProducts;
const initialMetrics = isSupabaseConfigured ? cachedMetrics : mockMetricRecords;
const initialRevenue = isSupabaseConfigured ? cachedRevenue : mockRevenueRecords;
const initialDonations = isSupabaseConfigured ? cachedDonations : mockDonationRecords;
const initialGrowth = isSupabaseConfigured ? cachedGrowth : mockGrowthRecords;
const initialSources: SourceMap = isSupabaseConfigured
  ? { projects: 'db', products: 'db', impact: 'db' }
  : { projects: 'mock', products: 'mock', impact: 'mock' };

export const useCMSStore = create<{
  projects: Project[];
  products: Product[];
  impactMetrics: ImpactMetricRecord[];
  revenueData: RevenuePoint[];
  donationData: DonationPoint[];
  memberGrowthData: MemberGrowthPoint[];
  status: CMSStatus;
  error: string | null;
  sources: SourceMap;
  hydrate: () => Promise<void>;
}>((set) => ({
  projects: initialProjects,
  products: initialProducts,
  impactMetrics: initialMetrics,
  revenueData: initialRevenue,
  donationData: initialDonations,
  memberGrowthData: initialGrowth,
  status: 'idle',
  error: null,
  sources: initialSources,
  hydrate: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({
        status: 'demo',
        projects: mockProjects,
        products: mockProducts,
        impactMetrics: mockMetricRecords,
        revenueData: mockRevenueRecords,
        donationData: mockDonationRecords,
        memberGrowthData: mockGrowthRecords,
        sources: { projects: 'mock', products: 'mock', impact: 'mock' },
      });
      return;
    }

    set({ status: 'loading', error: null });

    const [projectsRes, productsRes, metricsRes, revenueRes, donationRes, growthRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: true }),
      supabase.from('products').select('*').order('created_at', { ascending: true }),
      supabase.from('impact_metrics').select('*').order('sort_order', { ascending: true }),
      supabase.from('impact_revenue').select('*').order('sort_order', { ascending: true }),
      supabase.from('impact_donations').select('*').order('sort_order', { ascending: true }),
      supabase.from('impact_member_growth').select('*').order('sort_order', { ascending: true }),
    ]);

    const resolvedProjects = projectsRes.error
      ? []
      : (projectsRes.data?.length ? (projectsRes.data as ProjectRow[]).map(mapProjectRow) : []);

    const resolvedProducts = productsRes.error
      ? []
      : (productsRes.data?.length ? (productsRes.data as ProductRow[]).map(mapProductRow) : []);

    const metricsData = metricsRes.error
      ? []
      : (metricsRes.data?.length ? (metricsRes.data as ImpactMetricRow[]).map(mapMetricRow) : []);

    const revenueData = revenueRes.error
      ? []
      : (revenueRes.data?.length ? (revenueRes.data as RevenueRow[]).map(mapRevenueRow) : []);

    const donationData = donationRes.error
      ? []
      : (donationRes.data?.length ? (donationRes.data as DonationRow[]).map(mapDonationRow) : []);

    const memberGrowthData = growthRes.error
      ? []
      : (growthRes.data?.length ? (growthRes.data as GrowthRow[]).map(mapGrowthRow) : []);

    const previewProjects = resolvedProjects;
    const previewProducts = resolvedProducts;
    const previewMetrics = metricsData;
    const previewRevenue = revenueData;
    const previewDonations = donationData;
    const previewGrowth = memberGrowthData;

    const nextSources: SourceMap = {
      projects: 'db',
      products: 'db',
      impact: 'db',
    };

    const firstError = projectsRes.error || productsRes.error || metricsRes.error || revenueRes.error || donationRes.error || growthRes.error;

    const projectsWithImages = await Promise.all(
      previewProjects.map(async (project) => ({
        ...project,
        image: project.image ? await resolveStorageUrl(project.image) : project.image,
        bannerImage: project.bannerImage ? await resolveStorageUrl(project.bannerImage) : project.bannerImage,
      }))
    );

    const productsWithImages = await Promise.all(
      previewProducts.map(async (product) => ({
        ...product,
        image: product.image ? await resolveStorageUrl(product.image) : product.image,
        images: Array.isArray(product.images)
          ? await Promise.all(product.images.map((img) => (img ? resolveStorageUrl(img) : img)))
          : [],
      }))
    );

    writeCache(CACHE_KEYS.projects, projectsWithImages);
    writeCache(CACHE_KEYS.products, productsWithImages);
    writeCache(CACHE_KEYS.impactMetrics, previewMetrics);
    writeCache(CACHE_KEYS.revenue, previewRevenue);
    writeCache(CACHE_KEYS.donations, previewDonations);
    writeCache(CACHE_KEYS.growth, previewGrowth);

    set({
      projects: projectsWithImages,
      products: productsWithImages,
      impactMetrics: previewMetrics,
      revenueData: previewRevenue,
      donationData: previewDonations,
      memberGrowthData: previewGrowth,
      status: firstError ? 'error' : 'ready',
      error: firstError?.message ?? null,
      sources: nextSources,
    });
  },
}));

export function useCMSDataSync() {
  const hydrate = useCMSStore((s) => s.hydrate);

  useEffect(() => {
    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

    hydrate();

    if (!isSupabaseConfigured || !supabase) return () => {};

    channel = supabase
      .channel('cms-content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => hydrate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => hydrate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'impact_metrics' }, () => hydrate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'impact_revenue' }, () => hydrate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'impact_donations' }, () => hydrate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'impact_member_growth' }, () => hydrate())
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [hydrate]);
}
