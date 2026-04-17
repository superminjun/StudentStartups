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

export type Language = 'en' | 'ko';
