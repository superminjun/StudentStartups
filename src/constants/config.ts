export const SITE_CONFIG = {
  name: 'Student Startups',
  shortName: 'BNSS',
  domain: 'studentstartups.com',
  description: 'Student-led entrepreneurship through real product creation.',
  email: 'bnssstudentstartups@gmail.com',
  address: '751 Hammarskjold Drive Burnaby, BC V5B 4A5 Canada',
  maps: {
    embed: 'https://www.google.com/maps?q=751%20Hammarskjold%20Drive%20Burnaby%2C%20BC%20V5B%204A5%20Canada&output=embed',
    link: 'https://www.google.com/maps?q=751%20Hammarskjold%20Drive%20Burnaby%2C%20BC%20V5B%204A5%20Canada',
  },
  social: {
    instagram: 'https://www.instagram.com/bnssstudentstartups/',
    email: 'bnssstudentstartups@gmail.com',
  },
};

export const STAGE_LABELS_EN: Record<number, string> = {
  1: 'Planning',
  2: 'Research',
  3: 'Developing',
  4: 'Testing',
  5: 'Production',
  6: 'Sales',
  7: 'Completed',
};

export const STAGE_LABELS_KO: Record<number, string> = {
  1: '기획',
  2: '조사',
  3: '개발',
  4: '테스트',
  5: '생산',
  6: '판매',
  7: '완료',
};

export const STAGE_COLORS: Record<number, string> = {
  1: 'bg-violet-50 text-violet-700 border-violet-200',
  2: 'bg-blue-50 text-blue-700 border-blue-200',
  3: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  4: 'bg-amber-50 text-amber-700 border-amber-200',
  5: 'bg-orange-50 text-orange-700 border-orange-200',
  6: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  7: 'bg-green-50 text-green-800 border-green-200',
};

export const TERMS = ['Term 1 (2025)', 'Term 2 (2025)', 'Term 3 (2026)', 'Term 4 (2026)'];

export const TEAM_OPTIONS = ['Finance', 'Marketing', 'Design', 'Production'];
