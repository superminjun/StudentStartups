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
  'valueProp.title': [
    'Built for students who want to ship.',
    'A serious platform for early builders.',
    '일찍 시작하는 빌더를 위한 진지한 플랫폼',
  ],
  'valueProp.subtitle': [
    'Real teams, real deadlines, real customers. The whole system is designed to get ideas out of the group chat and into the world.',
    'Work happens inside real constraints: roles, timelines, budgets, and outcomes.',
    '여기서는 역할, 일정, 예산, 결과를 실제 기준으로 다룹니다.',
  ],
  'valueProp.oneTitle': [
    'Clear build system',
    'Structured execution',
    '구조화된 실행',
  ],
  'valueProp.oneDesc': [
    'Move from idea to launch with a process that keeps teams shipping.',
    'Ideas move through a defined process with accountability at each stage.',
    '각 단계마다 책임이 분명한 프로세스를 거칩니다.',
  ],
  'valueProp.twoTitle': [
    'Real startup roles',
    'Operating range',
    '운영 전반에 대한 경험',
  ],
  'valueProp.twoDesc': [
    'Own marketing, production, finance, or design and see how each part affects the business.',
    'Work spans marketing, production, finance, and design rather than a single narrow function.',
    '한 기능에 머무르지 않고 마케팅, 생산, 재무, 디자인 전반을 다룹니다.',
  ],
  'valueProp.threeTitle': [
    'Durable record',
    '남는 기록',
  ],
  'valueProp.threeDesc': [
    'Leave with work, numbers, and decisions that stand up outside the institution.',
    '남는 것은 참여 경험이 아니라 밖에서도 설명 가능한 결과, 숫자, 판단입니다.',
  ],
  'workflow.title': [
    'A disciplined operating cycle.',
    '검토 가능한 운영 사이클',
  ],
  'impactPreview.title': [
    'A public record of the work.',
    '기록으로 남는 결과',
  ],
  'cta.title': [
    'Built for people with standards.',
    '기준을 중요하게 생각하는 사람을 위한 플랫폼입니다.',
  ],
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
