import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations } from '@/constants/translations';
import { useSiteCopyStore } from '@/stores/siteCopyStore';
import type { Language } from '@/types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (path: string) => string;
}

const staleCopy: Record<string, string[]> = {
  'nav.intro': ['Start Here'],
  'nav.value': ['Why It Works'],
  'nav.process': ['Build Cycle'],
  'nav.proof': ['Results'],
  'nav.cta': ['Start Building'],
  'hero.title': [
    'A serious place for early builders.',
    'Build something real before graduation.',
    'Where Students Build Real Businesses',
    '일찍 시작하는 빌더를 위한 진지한 플랫폼입니다.',
    'For students who would rather build than wait.',
    '기다리기보다 먼저 만드는 학생들을 위해.',
  ],
  'hero.subtitle': [
    'Student Startups is a platform for students developing real products, operating disciplined teams, and building a record that can be examined.',
    'Find teammates, test ideas, launch products, and learn how startups actually work.',
    'Find teammates, test ideas, launch products, and learn how startups actually work while you are still in school.',
    'Student Startups는 학생들이 실제 제품을 만들고, 팀을 운영하며, 검토를 버틸 만한 기록을 남기는 플랫폼입니다.',
    'Find people, make the first version, sell it, and keep a clear record of what actually happened.',
    '팀을 찾고, 첫 버전을 만들고, 팔아보고, 남은 기록까지 정리합니다. Student Startups는 그 과정을 실제로 굴리는 곳입니다.',
  ],
  'hero.cta': ['Review the Work', 'Start Building', 'Launch Your Idea', 'Build Your First Startup', 'See the Work', '작업 보기'],
  'valueProp.title': [
    'Built for students who want to ship.',
    'A serious platform for early builders.',
    '일찍 시작하는 빌더를 위한 진지한 플랫폼',
    'A place to do the unglamorous parts, too.',
    '아이디어 말고, 그 뒤의 귀찮은 일까지.',
  ],
  'valueProp.subtitle': [
    'Real teams, real deadlines, real customers. The whole system is designed to get ideas out of the group chat and into the world.',
    'Work happens inside real constraints: roles, timelines, budgets, and outcomes.',
    '여기서는 역할, 일정, 예산, 결과를 실제 기준으로 다룹니다.',
    'The idea is only one piece. Students also deal with ownership, timelines, money, and the awkward first release.',
    '좋은 말보다 실제 진행이 중요합니다. 역할, 일정, 돈, 첫 공개까지 직접 다룹니다.',
  ],
  'valueProp.oneTitle': [
    'Clear build system',
    'Structured execution',
    '구조화된 실행',
    'Someone owns the work',
    '누가 맡는지 분명하게',
  ],
  'valueProp.oneDesc': [
    'Move from idea to launch with a process that keeps teams shipping.',
    'Ideas move through a defined process with accountability at each stage.',
    '각 단계마다 책임이 분명한 프로세스를 거칩니다.',
    'Projects are split into clear jobs so progress does not disappear into a group chat.',
    '일이 단체 채팅방 안에서 사라지지 않도록 맡은 사람과 다음 행동을 정합니다.',
  ],
  'valueProp.twoTitle': [
    'Real startup roles',
    'Operating range',
    '운영 전반에 대한 경험',
    'More than one lane',
    '한 역할에만 머물지 않기',
  ],
  'valueProp.twoDesc': [
    'Own marketing, production, finance, or design and see how each part affects the business.',
    'Work spans marketing, production, finance, and design rather than a single narrow function.',
    '한 기능에 머무르지 않고 마케팅, 생산, 재무, 디자인 전반을 다룹니다.',
    'A product needs marketing, production, finance, design, and people willing to make tradeoffs.',
    '제품은 마케팅, 생산, 재무, 디자인, 운영이 같이 움직일 때 제대로 보입니다.',
  ],
  'valueProp.threeTitle': [
    'Durable record',
    '남는 기록',
    'A record that holds up',
    '꾸며내지 않아도 되는 기록',
  ],
  'valueProp.threeDesc': [
    'Leave with work, numbers, and decisions that stand up outside the institution.',
    '남는 것은 참여 경험이 아니라 밖에서도 설명 가능한 결과, 숫자, 판단입니다.',
    'Members leave with shipped work, numbers, notes, and decisions they can explain without dressing it up.',
    '결과, 숫자, 판단, 실패까지 나중에 설명할 수 있는 형태로 남깁니다.',
  ],
  'workflow.title': [
    'A disciplined operating cycle.',
    '검토 가능한 운영 사이클',
    'The work moves in small, visible loops.',
    '작게 만들고, 밖에 보여주고, 다시 고칩니다.',
  ],
  'workflow.subtitle': ['No grand speeches. Pick a problem, make the first version, show it to people, then adjust.', '거창한 발표보다 실제 반응이 더 정확합니다. 그래서 짧게 만들고 빨리 확인합니다.'],
  'workflow.steps.step1Title': ['Define the problem', '문제 정의'],
  'workflow.steps.step1Desc': ['Start with something specific enough to test.', '바로 확인할 수 있을 만큼 구체적인 문제로 좁힙니다.'],
  'workflow.steps.step2Title': ['Test demand', '수요 확인'],
  'workflow.steps.step2Desc': ['Talk to the people who might actually use or buy it.', '실제로 쓰거나 살 사람에게 먼저 묻습니다.'],
  'workflow.steps.step3Title': ['Build the first version', '첫 버전 제작'],
  'workflow.steps.step3Desc': ['Build the rough version people can react to.', '반응을 받을 수 있는 첫 형태를 만듭니다.'],
  'workflow.steps.step4Title': ['Review with users', '사용자 검토'],
  'workflow.steps.step4Desc': ['Let real reactions make the next decision clearer.', '팀 안의 의견보다 바깥 반응을 우선 봅니다.'],
  'workflow.steps.step5Title': ['Refine operations', '운영 정비'],
  'workflow.steps.step5Desc': ['Fix what broke, clean up the handoff, and make the next run easier.', '막힌 부분, 넘겨받기 어려운 부분, 품질 문제를 고칩니다.'],
  'workflow.steps.step6Title': ['Go to market', '시장에 내놓기'],
  'workflow.steps.step6Desc': ['Put it outside the team and see what happens.', '팀 밖으로 내보내고 실제 반응을 봅니다.'],
  'workflow.steps.step7Title': ['Measure the outcome', '결과 측정'],
  'workflow.steps.step7Desc': ['Write down revenue, costs, mistakes, and what should happen next.', '매출, 비용, 실수, 다음 결정을 남깁니다.'],
  'impactPreview.title': [
    'A public record of the work.',
    '기록으로 남는 결과',
    'What happened, not what we hoped would happen.',
    '바랐던 일이 아니라, 실제로 일어난 일.',
  ],
  'cta.title': [
    'Built for people with standards.',
    '기준을 중요하게 생각하는 사람을 위한 플랫폼입니다.',
    'Bring something you are willing to work on.',
    '진짜로 붙잡고 해볼 일이 있다면.',
  ],
  'mission.title': ['What Student Startups Is', 'Student Startups에 대해'],
  'mission.p1': ['Student Startups is a platform for students doing practical venture work: products, operations, sales, and review.', 'Student Startups는 학생들이 실제 제품, 운영, 매출, 검토 과정을 경험하는 실행 플랫폼입니다.'],
  'mission.p2': ['The standard is not participation. It is output: clear roles, accountable teams, and work that improves under scrutiny.', '중요한 것은 참여가 아니라 결과입니다. 역할은 분명하고, 책임은 남고, 일은 검토를 버틸 만큼 단단해져야 합니다.'],
  'featured.title': ['Work on the table', '지금 테이블 위에 있는 작업'],
  'featured.subtitle': ['A few projects that show what members are making, selling, or still figuring out.', '만들고 있거나, 팔아봤거나, 아직 정리 중인 프로젝트들입니다.'],
  'cta.subtitle': ['You do not need a polished pitch. You do need the patience to make, test, and improve the thing.', '완성된 피치보다 중요한 건 직접 만들고, 보여주고, 고칠 마음입니다.'],
  'about.title': ['About Student Startups', 'Student Startups 소개'],
  'about.subtitle': ['Student Startups is built around real work: products, responsibility, constraints, and outcomes.', 'Student Startups는 실제 업무를 중심에 둡니다. 제품, 책임, 제약, 결과가 모두 포함됩니다.'],
  'about.teamsTitle': ['Teams with defined responsibility', '역할이 분명한 팀'],
  'about.teamWheelTitle': ['Broad exposure, not narrow roles', '한 역할에 머물지 않습니다'],
  'teamPage.title': ['The people behind the work.', '작업을 실제로 맡는 사람들.'],
  'teamPage.subtitle': ['Student Startups is built by members with defined responsibilities across product, operations, design, and communication.', 'Student Startups는 역할이 분명한 멤버들이 제품, 운영, 디자인, 커뮤니케이션을 나누어 맡으며 만들어갑니다.'],
  'projects.title': ['Projects', '프로젝트'],
  'projects.subtitle': ['Work in progress, shipped launches, and projects under review.', '진행 중인 작업, 이미 공개된 결과, 검토 중인 프로젝트를 봅니다.'],
  'impact.title': ['Impact', '임팩트'],
  'impact.subtitle': ['A running record of launches, revenue, donations, and team growth.', '출시, 매출, 기부, 팀 성장에 대한 누적 기록입니다.'],
  'shop.title': ['Store', '스토어'],
  'shop.subtitle': ['Products developed and operated by student teams under real operating constraints.', '학생 팀이 실제 운영 기준 아래 다루는 제품입니다.'],
  'contact.title': ['Contact', '문의'],
  'contact.subtitle': ['Partnerships, platform questions, and institutional inquiries.', '협업, 플랫폼 문의, 대외 문의는 이곳으로 보내주세요.'],
  'footer.description': ['A student-run place for making real products, keeping records, and learning from the parts that do not go perfectly.', '학생들이 실제 제품을 만들고, 기록을 남기고, 완벽하지 않았던 부분까지 배워가는 곳입니다.'],
};

const isStaleCopy = (path: string, value: string) => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return staleCopy[path]?.some((item) => item.replace(/\s+/g, ' ').trim() === normalized) ?? false;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('bnss-lang');
    return (saved === 'ko' ? 'ko' : 'en') as Language;
  });
  const overrides = useSiteCopyStore((s) => s.copy);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('bnss-lang', newLang);
  }, []);

  const t = useCallback(
    (path: string): string => {
      const override = overrides[path];
      const overrideValue = lang === 'en' ? override?.en : override?.ko;
      if (overrideValue && overrideValue.trim() !== '' && !isStaleCopy(path, overrideValue)) {
        return overrideValue;
      }
      const keys = path.split('.');
      let result: unknown = translations[lang];
      for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
          result = (result as Record<string, unknown>)[key];
        } else {
          return path;
        }
      }
      return typeof result === 'string' ? result : path;
    },
    [lang, overrides]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
