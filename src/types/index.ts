export interface Project {
  id: string;
  name: string;
  description: string;
  stage: number;
  stageName: string;
  revenue: number;
  expenses: number;
  profit: number;
  fundraise?: number;
  donation: number;
  donationPercent: number;
  team: TeamAssignment[];
  image: string;
  bannerImage?: string;
  startDate: string;
  category: string;
  term: string;
  status?: string;
}

export interface TeamAssignment {
  role: string;
  members: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  inventory: number;
  isPreOrder: boolean;
  projectId?: string;
  term: string;
  status: 'available' | 'sold-out' | 'in-production';
}

export interface WorkflowStep {
  id: number;
  titleEn: string;
  titleKo: string;
  descEn: string;
  descKo: string;
  icon: string;
}

export interface ImpactMetric {
  labelEn: string;
  labelKo: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

export interface TeamInfo {
  nameEn: string;
  nameKo: string;
  descEn: string;
  descKo: string;
  icon: string;
  color: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  reserved?: boolean;
}

export interface MemberProfile {
  name: string;
  email: string;
  role: string;
  team: string;
  attendance: number;
  totalMeetings: number;
  contributions: number;
  joinDate: string;
}

export interface TeamProjectSummary {
  id: string;
  name: string;
  stageName: string;
  status?: string;
  image?: string;
  category?: string;
  term?: string;
}

export interface TeamMilestone {
  date: string;
  titleEn: string;
  titleKo: string;
  detailEn?: string;
  detailKo?: string;
  type: 'joined' | 'project' | 'review' | 'achievement';
}

export interface TeamLink {
  label: string;
  href: string;
}

export interface TeamMemberShowcase {
  id: string;
  slug: string;
  name: string;
  role: string;
  team: string;
  joinDate: string;
  photo: string;
  bannerImage: string;
  founder: boolean;
  featured: boolean;
  recentlyActive: boolean;
  bioEn?: string;
  bioKo?: string;
  contributionSummaryEn?: string;
  contributionSummaryKo?: string;
  leadershipEn: string[];
  leadershipKo: string[];
  currentGoalsEn: string[];
  currentGoalsKo: string[];
  achievementsEn: string[];
  achievementsKo: string[];
  skills: string[];
  interests: string[];
  timeline: TeamMilestone[];
  projects: TeamProjectSummary[];
  links: TeamLink[];
  stats: {
    projects: number;
    collaborations: number;
    events: number;
    contributions: number;
  };
}

export type Language = 'en' | 'ko';
