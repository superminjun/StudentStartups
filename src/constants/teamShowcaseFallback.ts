import type { TeamMemberShowcase } from '@/types';

const emptyLinks = [] as TeamMemberShowcase['links'];

export const teamShowcaseFallback: TeamMemberShowcase[] = [
  {
    id: 'founder-minjun-kim',
    slug: 'minjun-kim',
    name: 'Minjun Kim',
    role: 'Founder',
    team: 'Platform',
    joinDate: '2024-09-01',
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    bannerImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
    founder: true,
    featured: true,
    recentlyActive: true,
    bioEn:
      'Minjun oversees platform direction, system design, and the public face of Student Startups.',
    bioKo:
      '민준은 Student Startups의 방향, 시스템 설계, 대외적인 구조를 총괄합니다.',
    contributionSummaryEn:
      'Defined the platform structure, coordinated cross-functional priorities, and built the public system that presents projects, members, and outcomes.',
    contributionSummaryKo:
      '플랫폼 구조를 설계하고, 팀 간 우선순위를 조정하며, 프로젝트·멤버·결과를 보여주는 공개 시스템을 구축했습니다.',
    leadershipEn: [
      'Set the operating model for projects, members, and review.',
      'Led the platform architecture and public site system.',
      'Established standards for how work is documented and presented.',
    ],
    leadershipKo: [
      '프로젝트, 멤버, 검토 방식의 운영 구조를 설계했습니다.',
      '플랫폼 아키텍처와 공개 사이트 시스템을 주도했습니다.',
      '기록과 발표 방식에 대한 기준을 세웠습니다.',
    ],
    currentGoalsEn: [
      'Tighten the public portfolio layer for members and teams.',
      'Improve launch discipline across projects and product lines.',
      'Develop Student Startups into a durable institution with long-term continuity.',
    ],
    currentGoalsKo: [
      '멤버와 팀을 위한 공개 포트폴리오 레이어를 더 정교하게 다듬는 것.',
      '프로젝트와 제품 운영 전반의 출시 기준을 높이는 것.',
      'Student Startups를 오래 유지되는 구조로 발전시키는 것.',
    ],
    achievementsEn: [
      'Designed the public platform and member system.',
      'Built the operating structure linking projects, impact, and team records.',
      'Created a visible standard for how student work is documented.',
    ],
    achievementsKo: [
      '공개 플랫폼과 멤버 시스템을 설계했습니다.',
      '프로젝트, 임팩트, 팀 기록을 연결하는 운영 구조를 만들었습니다.',
      '학생 작업이 어떻게 기록되어야 하는지 기준을 세웠습니다.',
    ],
    skills: ['Product strategy', 'Systems design', 'Operations', 'Brand direction'],
    interests: ['Platform design', 'Venture systems', 'Public presentation'],
    timeline: [
      {
        date: '2024-09-01',
        titleEn: 'Established Student Startups',
        titleKo: 'Student Startups 시작',
        detailEn: 'Set the initial operating structure and public direction.',
        detailKo: '초기 운영 구조와 대외 방향을 정했습니다.',
        type: 'joined',
      },
      {
        date: '2025-01-15',
        titleEn: 'Built the first public platform',
        titleKo: '첫 공개 플랫폼 구축',
        detailEn: 'Connected projects, members, impact, and store operations.',
        detailKo: '프로젝트, 멤버, 임팩트, 스토어 운영을 하나의 구조로 연결했습니다.',
        type: 'achievement',
      },
      {
        date: '2026-03-01',
        titleEn: 'Expanded member portfolio layer',
        titleKo: '멤버 포트폴리오 레이어 확장',
        detailEn: 'Turned contributor records into a visible public system.',
        detailKo: '기여 기록을 대외적으로 보이는 시스템으로 확장했습니다.',
        type: 'achievement',
      },
    ],
    projects: [],
    links: [{ label: 'Email', href: 'mailto:bnssstudentstartups@gmail.com' }],
    stats: {
      projects: 3,
      collaborations: 14,
      events: 18,
      contributions: 42,
    },
  },
  {
    id: 'eunji-seo',
    slug: 'eunji-seo',
    name: 'Eunji Seo',
    role: 'Marketing Lead',
    team: 'Marketing',
    joinDate: '2025-01-08',
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    bannerImage:
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80',
    founder: false,
    featured: true,
    recentlyActive: true,
    bioEn:
      'Eunji works on positioning, launch communication, and how projects are presented to external audiences.',
    bioKo:
      '은지는 포지셔닝, 출시 커뮤니케이션, 대외 발표 방식 전반을 맡고 있습니다.',
    contributionSummaryEn:
      'Leads market-facing communication across project launches and public updates.',
    contributionSummaryKo:
      '프로젝트 출시와 외부 커뮤니케이션 전반을 이끌고 있습니다.',
    leadershipEn: ['Led launch messaging for multiple projects.', 'Raised the standard of external presentation.'],
    leadershipKo: ['여러 프로젝트의 출시 메시지를 정리했습니다.', '대외 발표 품질 기준을 끌어올렸습니다.'],
    currentGoalsEn: ['Develop stronger launch narratives.', 'Build clearer public-facing systems for student work.'],
    currentGoalsKo: ['더 강한 출시 내러티브를 만드는 것.', '학생 작업을 위한 더 명확한 공개 구조를 만드는 것.'],
    achievementsEn: ['Published launch campaigns.', 'Improved project presentation systems.'],
    achievementsKo: ['출시 캠페인을 실행했습니다.', '프로젝트 발표 시스템을 개선했습니다.'],
    skills: ['Positioning', 'Launch communication', 'Audience research'],
    interests: ['Brand systems', 'Product storytelling'],
    timeline: [],
    projects: [],
    links: emptyLinks,
    stats: {
      projects: 2,
      collaborations: 9,
      events: 10,
      contributions: 24,
    },
  },
  {
    id: 'jiho-kim',
    slug: 'jiho-kim',
    name: 'Jiho Kim',
    role: 'Operations & Production',
    team: 'Production',
    joinDate: '2025-02-12',
    photo:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    bannerImage:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80',
    founder: false,
    featured: true,
    recentlyActive: true,
    bioEn:
      'Jiho focuses on sourcing, production workflows, and the discipline required to turn prototypes into reliable output.',
    bioKo:
      '지호는 소싱, 생산 워크플로, 프로토타입을 실제 결과로 바꾸는 운영 기준을 맡고 있습니다.',
    contributionSummaryEn:
      'Helps teams move from prototype work into repeatable production and tighter execution.',
    contributionSummaryKo:
      '팀이 프로토타입 단계에서 반복 가능한 생산 단계로 넘어가도록 돕습니다.',
    leadershipEn: ['Improved production handoff between teams.'],
    leadershipKo: ['팀 간 생산 인수인계 방식을 개선했습니다.'],
    currentGoalsEn: ['Reduce production friction.', 'Create cleaner operations documentation.'],
    currentGoalsKo: ['생산 과정의 마찰을 줄이는 것.', '운영 문서를 더 명확하게 만드는 것.'],
    achievementsEn: ['Standardized fulfillment workflows.'],
    achievementsKo: ['상품 처리 흐름을 표준화했습니다.'],
    skills: ['Production planning', 'Sourcing', 'Operations'],
    interests: ['Fulfillment systems', 'Process design'],
    timeline: [],
    projects: [],
    links: emptyLinks,
    stats: {
      projects: 2,
      collaborations: 7,
      events: 8,
      contributions: 19,
    },
  },
  {
    id: 'sophie-chen',
    slug: 'sophie-chen',
    name: 'Sophie Chen',
    role: 'Finance Lead',
    team: 'Finance',
    joinDate: '2025-03-01',
    photo:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80',
    bannerImage:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
    founder: false,
    featured: false,
    recentlyActive: true,
    bioEn:
      'Sophie tracks budgets, margins, and the financial discipline behind each project.',
    bioKo:
      '소피는 예산, 마진, 프로젝트별 재무 기준을 관리합니다.',
    contributionSummaryEn:
      'Maintains visibility into costs, margins, and where capital is being used effectively.',
    contributionSummaryKo:
      '비용, 마진, 자본 사용 흐름을 명확하게 유지합니다.',
    leadershipEn: ['Brought financial reporting into weekly review.'],
    leadershipKo: ['주간 검토에 재무 리포팅을 정착시켰습니다.'],
    currentGoalsEn: ['Improve margin reporting.', 'Make project finance easier to review.'],
    currentGoalsKo: ['마진 리포팅을 더 정교하게 만드는 것.', '프로젝트 재무를 더 쉽게 검토할 수 있게 하는 것.'],
    achievementsEn: ['Built cleaner project-level cost tracking.'],
    achievementsKo: ['프로젝트 단위 비용 추적 구조를 정리했습니다.'],
    skills: ['Financial planning', 'Reporting', 'Decision support'],
    interests: ['Venture finance', 'Operational metrics'],
    timeline: [],
    projects: [],
    links: emptyLinks,
    stats: {
      projects: 1,
      collaborations: 6,
      events: 7,
      contributions: 17,
    },
  },
] as const;
