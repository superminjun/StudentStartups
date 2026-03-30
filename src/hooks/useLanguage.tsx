import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations } from '@/constants/translations';
import { useSiteCopyStore } from '@/stores/siteCopyStore';
import type { Language } from '@/types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (path: string) => string;
}

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
      if (overrideValue && overrideValue.trim() !== '') {
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
