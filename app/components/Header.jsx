'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/app/context/ThemeContext';
import FontSizeDropdown from '@/app/components/FontSizeDropdown';
import LanguageDropdown from '@/app/components/LanguageDropdown';
import { useLanguage } from '@/app/context/LanguageContext';

export default function Header() {
  const { mode, toggleMode, colorTheme, setColorTheme, toggleSidebar, isSidebarOpen } = useTheme();
  const { t } = useLanguage();
  
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-20 bg-inherit border-b border-slate-700/35 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 backdrop-blur-md">
      {/* Bagian Kiri: Tombol Toggle Sidebar & Judul */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          type="button"
          onClick={() => toggleSidebar()}
          className="relative z-40 p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer pointer-events-auto"
          aria-label={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
        >
          {isSidebarOpen ? (
            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <h2 className="text-lg sm:text-xl font-bold tracking-wide">{t('dashboard')}</h2>
      </div>

      {/* Bagian Kanan: Desktop Menu */}
      <div className="hidden lg:flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-300 font-medium">{t('theme')}</span>
          <button onClick={() => setColorTheme('navy')} className={`w-4 h-4 rounded-full bg-[#222D3D] border ${colorTheme === 'navy' ? 'ring-2 ring-white' : ''}`} title="Navy" />
          <button onClick={() => setColorTheme('indigo')} className={`w-4 h-4 rounded-full bg-indigo-600 border ${colorTheme === 'indigo' ? 'ring-2 ring-white' : ''}`} title="Indigo" />
          <button onClick={() => setColorTheme('emerald')} className={`w-4 h-4 rounded-full bg-emerald-600 border ${colorTheme === 'emerald' ? 'ring-2 ring-white' : ''}`} title="Emerald" />
        </div>

        <FontSizeDropdown />
        <LanguageDropdown />

        <button onClick={toggleMode} className="px-3 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-xs font-semibold transition-all">
          {mode === 'dark' ? t('lightMode') : t('darkMode')}
        </button>

        <div className="flex items-center space-x-3 bg-slate-800/40 px-4 py-2 rounded-full border border-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">A</div>
          <div className="text-left">
            <p className="text-xs font-semibold">Admin User</p>
            <p className="text-[10px] text-slate-400">admin@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Bagian Kanan: Tombol Toggle Khusus Mobile di Pojok Kanan */}
      <div className="flex lg:hidden items-center">
        <button
          type="button"
          onClick={() => setIsRightMenuOpen(true)}
          className="p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
          aria-label="Buka Menu Pengaturan"
        >
          <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* PORTAL DRAWER KANAN (Dirender di document.body agar menutupi seluruh layar secara penuh) */}
      {mounted && isRightMenuOpen && createPortal(
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Gelap yang Menutup Seluruh Layar */}
          <div 
            onClick={() => setIsRightMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Panel Samping Kanan Penuh dari Atas ke Bawah */}
          <div className="fixed top-0 right-0 bottom-0 w-72 bg-[#1B2A35] border-l border-slate-700 shadow-2xl p-6 flex flex-col z-50 text-white overflow-y-auto ml-auto">
            
            {/* Header Panel Kanan: Judul & Tombol Close */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-700">
              <h3 className="text-base font-bold text-white">Pengaturan Menu</h3>
              <button
                type="button"
                onClick={() => setIsRightMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* KONTEN UTAMA */}
            <div className="flex flex-col space-y-5">
              
              {/* 1. Profil Pengguna */}
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-base">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Admin User</p>
                  <p className="text-xs text-slate-400">admin@gmail.com</p>
                </div>
              </div>

              {/* 2. Pilihan Warna Tema */}
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-300">Tema Warna</span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setColorTheme('navy')} 
                    className={`w-5 h-5 rounded-full bg-[#222D3D] border-2 ${colorTheme === 'navy' ? 'border-white' : 'border-transparent'}`} 
                  />
                  <button 
                    onClick={() => setColorTheme('indigo')} 
                    className={`w-5 h-5 rounded-full bg-indigo-600 border-2 ${colorTheme === 'indigo' ? 'border-white' : 'border-transparent'}`} 
                  />
                  <button 
                    onClick={() => setColorTheme('emerald')} 
                    className={`w-5 h-5 rounded-full bg-emerald-600 border-2 ${colorTheme === 'emerald' ? 'border-white' : 'border-transparent'}`} 
                  />
                </div>
              </div>

              {/* 3. Pengaturan Teks & Bahasa */}
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col space-y-3">
                <span className="text-sm text-slate-300">Preferensi Tampilan</span>
                <div className="w-full">
                  <FontSizeDropdown />
                </div>
                <div className="w-full">
                  <LanguageDropdown />
                </div>
              </div>

              {/* 4. Tombol Dark/Light Mode */}
              <button 
                onClick={toggleMode}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white text-center shadow transition-all cursor-pointer"
              >
                {mode === 'dark' ? '☀️ Mode Terang' : '🌙 Mode Gelap'}
              </button>

            </div>

          </div>
        </div>,
        document.body
      )}
    </header>
  );
}