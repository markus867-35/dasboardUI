'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  locale: string;
  changeLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Kamus terjemahan dengan indeks tipe string yang aman
const translations: Record<string, Record<string, string>> = {
  id: {
    dashboard: 'Dashboard',
    theme: 'Tema:',
    lightMode: '☀️ Terang',
    darkMode: '🌙 Gelap',
  },
  en: {
    dashboard: 'Dashboard',
    theme: 'Theme:',
    lightMode: '☀️ Light',
    darkMode: '🌙 Dark',
  },
  zh: {
    dashboard: '仪表板',
    theme: '主题:',
    lightMode: '☀️ 浅色',
    darkMode: '🌙 深色',
  },
  es: {
    dashboard: 'Tablero',
    theme: 'Tema:',
    lightMode: '☀️ Claro',
    darkMode: '🌙 Oscuro',
  },
  ja: {
    dashboard: 'ダッシュボード',
    theme: 'テーマ:',
    lightMode: '☀️ ライト',
    darkMode: '🌙 ダーク',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>('id');

  useEffect(() => {
    const savedLang = localStorage.getItem('global_language');
    if (savedLang) {
      setLocale(savedLang);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    setLocale(lang);
    localStorage.setItem('global_language', lang);
  };

  const t = (key: string): string => {
    return translations[locale]?.[key] || translations['id']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}