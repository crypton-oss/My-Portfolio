import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Locale, getTranslation } from './translations';

type LocaleContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string) => string;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

function resolvePath(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : path;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  const t = (path: string) => {
    const translations = getTranslation(locale) as unknown as Record<string, unknown>;
    return resolvePath(translations, path);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useT must be used within LocaleProvider');
  return ctx;
}
