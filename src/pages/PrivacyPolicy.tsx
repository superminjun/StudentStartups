import LegalDocumentPage from '@/components/legal/LegalDocumentPage';
import { useLanguage } from '@/hooks/useLanguage';

const PRIVACY_COPY = {
  en: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    subtitle:
      'This explains what Student Startups collects, why we collect it, and what choices members, customers, and visitors have when using the platform.',
    lastUpdatedLabel: 'Last updated',
    lastUpdatedValue: 'May 6, 2026',
    sections: [
      {
        heading: 'Information We Collect',
        paragraphs: [
          'We collect the information you provide directly to us, including your name, email address, authentication details, profile information, messages, order details, and any content you submit through the member portal, admin tools, contact forms, or shop checkout flow.',
          'We also collect limited technical information that helps the site function securely, such as session data, browser details, and basic usage logs.',
        ],
      },
      {
        heading: 'How We Use Information',
        bullets: [
          'To create and manage member, customer, and admin accounts.',
          'To authenticate sign-ins, including email/password and supported social sign-in providers such as Google.',
          'To run the member portal, manage meetings, show contribution records, and support club operations.',
          'To process orders, respond to messages, and provide customer support.',
          'To improve site reliability, security, and performance.',
        ],
      },
      {
        heading: 'Authentication and Social Sign-In',
        paragraphs: [
          'Authentication is handled through Supabase. If you sign in with Google or another supported provider, we receive the verified email address and limited profile data that provider shares with us, such as your display name and provider identifier.',
          'We use that information only to authenticate your account, connect you to an existing profile when appropriate, and keep your access secure.',
        ],
      },
      {
        heading: 'When We Share Information',
        paragraphs: [
          'We do not sell personal information. We only share information with service providers that help us operate the platform, such as authentication, hosting, storage, analytics, or payment-related tools, and only to the extent needed to provide the service.',
        ],
      },
      {
        heading: 'Retention and Security',
        paragraphs: [
          'We keep information only as long as it is reasonably necessary for club operations, member history, support, legal compliance, or fraud prevention. We use reasonable administrative, technical, and organizational safeguards to protect account and platform data.',
        ],
      },
      {
        heading: 'Your Rights and Choices',
        bullets: [
          'You may request access to, correction of, or deletion of your personal information.',
          'You may ask us to remove a member account or reset an authentication record when appropriate.',
          'You can contact us if you have privacy questions or need help with your data.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'For privacy-related questions, contact Student Startups through the public contact page or by email at bnssstudentstartups@gmail.com.',
        ],
      },
    ],
  },
  ko: {
    eyebrow: '법적 안내',
    title: '개인정보 처리방침',
    subtitle:
      'Student Startups가 어떤 정보를 수집하고 왜 사용하는지, 그리고 멤버·고객·방문자가 어떤 선택권을 가지는지 설명합니다.',
    lastUpdatedLabel: '마지막 업데이트',
    lastUpdatedValue: '2026년 5월 6일',
    sections: [
      {
        heading: '수집하는 정보',
        paragraphs: [
          '이름, 이메일 주소, 로그인 정보, 프로필 정보, 메시지, 주문 정보, 그리고 멤버 포털·관리자 도구·문의 폼·샵 주문 과정에서 직접 제출한 내용을 수집할 수 있습니다.',
          '또한 사이트를 안전하게 운영하기 위해 세션 정보, 브라우저 정보, 기본적인 사용 로그와 같은 제한된 기술 정보도 수집합니다.',
        ],
      },
      {
        heading: '정보 사용 목적',
        bullets: [
          '멤버, 고객, 관리자 계정을 생성하고 관리하기 위해',
          '이메일/비밀번호 및 Google 등 지원되는 소셜 로그인을 포함한 인증을 처리하기 위해',
          '멤버 포털, 미팅 관리, 기여 기록, 클럽 운영 기능을 제공하기 위해',
          '주문 처리, 메시지 응답, 고객 지원을 제공하기 위해',
          '사이트의 보안, 안정성, 성능을 개선하기 위해',
        ],
      },
      {
        heading: '인증 및 소셜 로그인',
        paragraphs: [
          '인증은 Supabase를 통해 처리됩니다. Google 또는 다른 지원 제공자를 통해 로그인하면, 제공자가 전달하는 검증된 이메일 주소와 표시 이름, 제공자 식별자 같은 제한된 프로필 정보를 받을 수 있습니다.',
          '이 정보는 계정 인증, 기존 프로필 연결, 보안 유지 목적에 한해서만 사용됩니다.',
        ],
      },
      {
        heading: '정보 공유 방식',
        paragraphs: [
          '개인정보를 판매하지 않습니다. 다만 인증, 호스팅, 저장소, 분석, 결제 관련 도구 등 플랫폼 운영에 필요한 서비스 제공자에게 필요한 범위 안에서만 정보를 공유할 수 있습니다.',
        ],
      },
      {
        heading: '보관 및 보안',
        paragraphs: [
          '정보는 클럽 운영, 멤버 이력 관리, 고객 지원, 법적 의무, 부정 사용 방지에 필요한 기간 동안만 보관합니다. 또한 계정과 플랫폼 데이터를 보호하기 위해 합리적인 관리적·기술적·조직적 보호 조치를 사용합니다.',
        ],
      },
      {
        heading: '이용자의 권리',
        bullets: [
          '본인 정보에 대한 열람, 수정, 삭제를 요청할 수 있습니다.',
          '필요한 경우 멤버 계정 삭제 또는 인증 기록 초기화를 요청할 수 있습니다.',
          '개인정보 관련 문의나 지원이 필요하면 언제든 연락할 수 있습니다.',
        ],
      },
      {
        heading: '연락처',
        paragraphs: [
          '개인정보 관련 문의는 공개 Contact 페이지 또는 bnssstudentstartups@gmail.com 으로 연락해 주세요.',
        ],
      },
    ],
  },
} as const;

export default function PrivacyPolicy() {
  const { lang } = useLanguage();
  const copy = PRIVACY_COPY[lang];

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
