import LegalDocumentPage from '@/components/legal/LegalDocumentPage';
import { useLanguage } from '@/hooks/useLanguage';

const TERMS_COPY = {
  en: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    subtitle:
      'These terms cover the basic rules for using Student Startups, including account responsibility, acceptable use, and platform limits.',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedValue: 'May 6, 2026',
    sections: [
      {
        heading: 'Using the Platform',
        paragraphs: [
          'By using Student Startups, you agree to use the platform lawfully, respectfully, and only for its intended product, collaboration, and operational purposes.',
        ],
      },
      {
        heading: 'Account Responsibility',
        bullets: [
          'You are responsible for the accuracy of the information you submit.',
          'You are responsible for maintaining the security of your login credentials and sign-in methods.',
          'You should notify us promptly if you believe your account has been accessed without permission.',
        ],
      },
      {
        heading: 'Acceptable Use',
        paragraphs: [
          'You may use the site to participate in club activities, access member records, submit messages, place shop orders, and manage authorized content based on your role.',
        ],
      },
      {
        heading: 'Prohibited Misuse',
        bullets: [
          'Do not misuse the platform, attempt unauthorized access, or interfere with site security.',
          'Do not impersonate another user or submit false, harmful, or misleading information.',
          'Do not scrape, overload, reverse engineer, or disrupt the site or connected services.',
          'Do not upload or share content that violates law, intellectual property rights, or community safety.',
        ],
      },
      {
        heading: 'Content Ownership',
        paragraphs: [
          'You retain ownership of content you create, but you grant Student Startups permission to store, display, and process that content as needed to operate the platform, showcase projects, and support club activities. Platform branding, site design, and organizational materials remain the property of Student Startups or their respective owners.',
        ],
      },
      {
        heading: 'Orders and Operational Changes',
        paragraphs: [
          'Shop listings, stock levels, event information, project information, and member-facing content may change over time. We may update, pause, or remove features when needed for operations, safety, maintenance, or policy reasons.',
        ],
      },
      {
        heading: 'Limitation of Liability',
        paragraphs: [
          'Student Startups provides the platform on an as-available basis. To the fullest extent permitted by law, we are not liable for indirect, incidental, special, or consequential damages arising from your use of the site, including loss of access, data issues, or third-party service interruptions.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'Questions about these terms can be sent through the public Contact page or to bnssstudentstartups@gmail.com.',
        ],
      },
    ],
  },
  ko: {
    eyebrow: '법적 안내',
    title: '서비스 이용약관',
    subtitle:
      'Student Startups를 사용할 때 적용되는 기본 규칙, 계정 책임, 허용되는 사용 방식, 책임 제한을 설명합니다.',
    lastUpdatedLabel: '마지막 업데이트',
    lastUpdatedValue: '2026년 5월 6일',
    sections: [
      {
        heading: '플랫폼 이용',
        paragraphs: [
          'Student Startups를 이용하면, 이 플랫폼을 합법적이고 존중하는 방식으로 사용하고 원래 의도된 제품 제작, 협업, 운영 목적 안에서만 이용하는 데 동의하는 것으로 봅니다.',
        ],
      },
      {
        heading: '계정 책임',
        bullets: [
          '제출하는 정보의 정확성은 사용자에게 책임이 있습니다.',
          '로그인 정보와 인증 수단의 보안 유지 책임은 사용자에게 있습니다.',
          '무단 접근이 의심되면 즉시 알려야 합니다.',
        ],
      },
      {
        heading: '허용되는 사용',
        paragraphs: [
          '사용자는 자신의 권한에 따라 클럽 활동 참여, 멤버 기록 확인, 메시지 전송, 샵 주문, 콘텐츠 관리 기능 등을 이용할 수 있습니다.',
        ],
      },
      {
        heading: '금지되는 행위',
        bullets: [
          '무단 접근 시도, 보안 우회, 시스템 방해를 해서는 안 됩니다.',
          '다른 사용자를 사칭하거나 허위·유해·오해의 소지가 있는 정보를 제출해서는 안 됩니다.',
          '사이트 또는 연결된 서비스를 스크래핑, 과부하 유발, 역설계, 방해하는 행위를 해서는 안 됩니다.',
          '법률, 지식재산권, 커뮤니티 안전을 침해하는 콘텐츠를 업로드하거나 공유해서는 안 됩니다.',
        ],
      },
      {
        heading: '콘텐츠 소유권',
        paragraphs: [
          '사용자가 만든 콘텐츠의 소유권은 사용자에게 남아 있습니다. 다만 플랫폼 운영, 프로젝트 소개, 클럽 활동 지원을 위해 Student Startups가 해당 콘텐츠를 저장, 표시, 처리할 수 있도록 허용해야 합니다. 사이트 디자인, 브랜드 요소, 운영 자료는 Student Startups 또는 각 권리자에게 귀속됩니다.',
        ],
      },
      {
        heading: '주문 및 운영 변경',
        paragraphs: [
          '샵 상품, 재고, 행사 정보, 프로젝트 정보, 멤버용 콘텐츠는 시간에 따라 변경될 수 있습니다. 운영, 안전, 유지보수, 정책상 이유로 일부 기능을 수정, 일시중지, 제거할 수 있습니다.',
        ],
      },
      {
        heading: '책임의 제한',
        paragraphs: [
          'Student Startups는 플랫폼을 현재 가능한 상태로 제공합니다. 법이 허용하는 최대 범위에서, 사이트 이용으로 인해 발생하는 간접적·부수적·특별한 손해 또는 결과적 손해에 대해 책임을 지지 않습니다. 여기에는 접근 중단, 데이터 문제, 제3자 서비스 장애 등이 포함될 수 있습니다.',
        ],
      },
      {
        heading: '연락처',
        paragraphs: [
          '이 약관에 관한 문의는 공개 Contact 페이지 또는 bnssstudentstartups@gmail.com 으로 보내주세요.',
        ],
      },
    ],
  },
} as const;

export default function TermsOfService() {
  const { lang } = useLanguage();
  const copy = TERMS_COPY[lang];

  return (
    <LegalDocumentPage
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      lastUpdatedLabel={copy.lastUpdatedLabel}
      lastUpdatedValue={copy.lastUpdatedValue}
      sections={copy.sections}
    />
  );
}
