import type { JournalPost } from '@/types';

export const journalFallback: JournalPost[] = [
  {
    id: 'journal-1',
    slug: 'first-build-log',
    titleEn: 'Why we started recording the work in public',
    titleKo: '왜 작업 기록을 공개하기로 했는가',
    date: '2026-04-20',
    author: 'Student Startups',
    category: 'Reflection',
    summaryEn: 'A note on why visible process matters more than polished storytelling when a team is still learning how to build.',
    summaryKo: '아직 배우는 단계의 팀에게는 다듬어진 소개보다 보이는 과정이 더 중요하다는 기록입니다.',
    contentEn:
      'A polished site can hide too much. We wanted a place where meetings, revisions, missed assumptions, and better decisions could remain visible. The build log is not there to make the work look larger than it is. It is there to make the work legible.',
    contentKo:
      '완성된 사이트는 때로 너무 많은 것을 숨깁니다. 우리는 미팅, 수정, 잘못된 가정, 더 나은 판단이 그대로 남는 공간을 원했습니다. 빌드 로그는 작업을 더 크게 보이게 만들기 위한 것이 아니라, 작업이 어떻게 이루어졌는지 읽히게 하기 위한 기록입니다.',
    lessonsEn: 'Documentation is part of the work, not an extra task added afterward.',
    lessonsKo: '기록은 나중에 붙이는 일이 아니라 작업 자체의 일부입니다.',
    tags: ['Process', 'Website', 'Reflection'],
    published: true,
    featured: true,
    order: 1,
  },
  {
    id: 'journal-2',
    slug: 'meeting-structure-update',
    titleEn: 'What changed in the weekly meeting structure',
    titleKo: '주간 미팅 구조를 어떻게 바꿨는가',
    date: '2026-04-28',
    author: 'Operations',
    category: 'Meeting',
    summaryEn: 'We tightened the meeting flow so project decisions, blockers, and follow-up ownership are easier to track.',
    summaryKo: '프로젝트 결정, 막히는 지점, 후속 책임이 더 분명히 남도록 미팅 구조를 정리했습니다.',
    contentEn:
      'The previous format gave everyone room to speak, but not enough structure to carry decisions into the next week. We now end each meeting with named owners, expected outputs, and a short written review.',
    contentKo:
      '이전 방식은 모두가 말할 수는 있었지만, 결정이 다음 주까지 이어지기에는 구조가 부족했습니다. 이제는 각 미팅을 담당자, 기대 결과, 짧은 서면 리뷰로 마무리합니다.',
    lessonsEn: 'Clarity often comes from better meeting design rather than more motivation.',
    lessonsKo: '명확함은 동기부여보다 미팅 설계에서 더 자주 나옵니다.',
    tags: ['Operations', 'Meetings'],
    published: true,
    featured: true,
    order: 2,
  },
  {
    id: 'journal-3',
    slug: 'prototype-feedback-notes',
    titleEn: 'Three small product assumptions that did not survive contact with users',
    titleKo: '사용자 반응 앞에서 무너진 세 가지 가정',
    date: '2026-05-03',
    author: 'Product',
    category: 'Product',
    summaryEn: 'A short note on the kind of assumptions that feel obvious inside the team and disappear after the first review.',
    summaryKo: '팀 안에서는 당연해 보였지만 첫 검토 이후 바로 사라진 가정들을 정리했습니다.',
    contentEn:
      'We assumed people would read a longer explanation, notice secondary actions, and interpret our labels the same way we did. None of that held. The next iteration became simpler, clearer, and easier to act on.',
    contentKo:
      '사람들이 긴 설명을 읽고, 보조 행동을 발견하고, 우리가 붙인 라벨을 같은 의미로 이해할 것이라 생각했습니다. 실제로는 그렇지 않았습니다. 다음 버전은 더 단순하고, 더 분명하고, 더 쉽게 반응할 수 있게 바뀌었습니다.',
    lessonsEn: 'Most early product clarity comes from removing what the team no longer needs to explain.',
    lessonsKo: '초기 제품의 명확함은 팀이 더 이상 설명하지 않아도 되는 부분을 지우는 데서 나옵니다.',
    tags: ['Prototype', 'Review'],
    published: true,
    featured: false,
    order: 3,
  },
];
