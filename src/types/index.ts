export interface Project {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  slug?: string;
  problem?: string;
  solution?: string;
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
  gallery?: string[];
  startDate: string;
  category: string;
  term: string;
  status?: string;
  lead?: string;
  contributors?: string[];
  skillsUsed?: string[];
  timeline?: ProjectTimelineEntry[];
  updates?: ProjectUpdateEntry[];
  impactSummary?: string;
  nextSteps?: string;
  lessons?: string;
  featured?: boolean;
  published?: boolean;
  order?: number;
}

export interface TeamAssignment {
  role: string;
  members: string[];
}

export interface ProjectTimelineEntry {
  date: string;
  titleEn: string;
  titleKo: string;
  detailEn?: string;
  detailKo?: string;
}

export interface ProjectUpdateEntry {
  id: string;
  date: string;
  titleEn: string;
  titleKo: string;
  summaryEn: string;
  summaryKo: string;
  learningEn?: string;
  learningKo?: string;
  tags: string[];
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

export interface TeamQuote {
  en?: string;
  ko?: string;
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
  published?: boolean;
  order?: number;
  recentlyActive: boolean;
  shortDescriptionEn?: string;
  shortDescriptionKo?: string;
  bioEn?: string;
  bioKo?: string;
  whyJoinedEn?: string;
  whyJoinedKo?: string;
  whatBuiltEn?: string;
  whatBuiltKo?: string;
  quote?: TeamQuote;
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
  tags: string[];
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

export interface StoryMilestone {
  date: string;
  titleEn: string;
  titleKo: string;
  detailEn?: string;
  detailKo?: string;
}

export interface StoryContent {
  id: string;
  eyebrowEn: string;
  eyebrowKo: string;
  titleEn: string;
  titleKo: string;
  introEn: string;
  introKo: string;
  problemEn: string;
  problemKo: string;
  whyStartedEn: string;
  whyStartedKo: string;
  whatBuildingEn: string;
  whatBuildingKo: string;
  howWeWorkEn: string;
  howWeWorkKo: string;
  whereGoingEn: string;
  whereGoingKo: string;
  quoteEn?: string;
  quoteKo?: string;
  images: string[];
  timeline: StoryMilestone[];
}

export interface JournalPost {
  id: string;
  slug: string;
  titleEn: string;
  titleKo: string;
  date: string;
  author: string;
  authorId?: string;
  category: string;
  summaryEn: string;
  summaryKo: string;
  contentEn: string;
  contentKo: string;
  lessonsEn?: string;
  lessonsKo?: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  order?: number;
}

export interface MediaItem {
  id: string;
  title: string;
  fileUrl: string;
  storagePath?: string;
  altText?: string;
  category: string;
  linkedType?: 'member' | 'project' | 'journal' | 'story' | 'homepage' | 'general';
  linkedId?: string;
  createdAt?: string;
}

export type Language = 'en' | 'ko';
