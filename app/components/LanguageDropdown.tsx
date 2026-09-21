'use client';
import { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function LanguageDropdown() {
  const { locale, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'zh', label: '中文 (Chinese)' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'ja', label: '日本語 (Japanese)' },
    { code: 'id', label: 'Indonesia' },
  ];

  return (
    <div className="relative">
      {/* Tombol Ikon Bahasa (Huruf A dengan aksara) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center"
        title="Ganti Bahasa / Language"
      >
        <span className="font-bold text-xs">A</span>
        <span className="text-[9px] ml-0.5">文</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#1B2A35] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                locale === lang.code
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#253644]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}