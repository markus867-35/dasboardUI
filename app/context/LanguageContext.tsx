'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Kamus terjemahan sederhana untuk contoh (bisa diperluas)
const translations = {
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

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('id'); // Default Bahasa Indonesia / ganti 'en'

  useEffect(() => {
    const savedLang = localStorage.getItem('global_language');
    if (savedLang) {
      setLocale(savedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLocale(lang);
    localStorage.setItem('global_language', lang);
  };

  // Fungsi penerjemah teks otomatis (t: translation)
  const t = (key) => {
    return translations[locale]?.[key] || translations['id'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);