'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import { useTheme } from '@/app/context/ThemeContext';
import FontSizeDropdown from '@/app/components/FontSizeDropdown';
import LanguageDropdown from '@/app/components/LanguageDropdown';
import { useLanguage } from '@/app/context/LanguageContext';

export default function Header() {
  const { mode, toggleMode, colorTheme, setColorTheme, toggleSidebar, getThemeClasses, isSidebarOpen } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ADMIN_ID = '11111111-1111-1111-1111-111111111111'; // ID statis Anda
  const [adminData, setAdminData] = useState({
    name: 'memuat....',
    email: 'memuat....',
    avatar_url: null,
  });

useEffect(() => {
    async function fetchAdminData() {
      try {
        // Ambil ID admin yang sedang login dari localStorage
        const currentAdminId = localStorage.getItem('adminId');
        
        if (!currentAdminId) return; // Jika belum login, hentikan proses

        const { data, error } = await supabase
          .from('admins')
          .select('name, email, avatar_url')
          .eq('id', currentAdminId) // 👈 Gunakan variabel dari localStorage
          .single();

        if (data && !error) {
          setAdminData({
            name: data.name || 'Admin User',
            email: data.email || 'admin@gmail.com',
            avatar_url: data.avatar_url || null,
          });
        }
      } catch (err) {
        console.error('Gagal mengambil data admin:', err);
      }
    }

    fetchAdminData();
  }, []);

  // 👇 VARIABEL INI WAJIB ADA AGAR TIDAK ERROR "isDark is not defined"
  const isDark = mode === 'dark';

  return (
  <header className="h-20 bg-inherit border-b border-slate-700/35 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-50 backdrop-blur-md">
    {/* Bagian Kiri: Tombol Toggle Sidebar & Judul */}
    <div className="flex items-center space-x-3 sm:space-x-4">
      <button
        type="button"
        onClick={() => toggleSidebar()}
        className="relative z-40 p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer pointer-events-auto shrink-0"
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

      {/* Bagian judul dengan gambar ikon di sampingnya */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-wide">{t('dashboard')}</h2>
        <div className="w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center bg-slate-800/40 shrink-0">
          <img 
            src="https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80" 
            alt="Dashboard Icon" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </div>

    {/* Bagian Kanan: Desktop Menu (Diselaraskan tinggi h-11 agar rata semua) */}
    <div className="hidden lg:flex items-center space-x-3">
      {/* Pilihan Tema */}
      <div className="flex items-center space-x-2 bg-slate-800/40 px-3 h-11 rounded-xl border border-slate-700/60 shadow-sm">
        <span className="text-xs text-slate-300 font-medium whitespace-nowrap">{t('theme')}</span>
        <div className="relative">
          <select
            value={colorTheme}
            onChange={(e) => setColorTheme(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none pr-7"
          >
            <option value="navy">Navy</option>
            <option value="slate">Slate</option>
            <option value="midnight">Midnight</option>
            <option value="emerald">Emerald</option>
            <option value="purple">Purple</option>
            <option value="indigo">Indigo</option>
            <option value="rose">Rose</option>
            <option value="amber">Amber</option>
            <option value="cyan">Cyan</option>
            <option value="red">Crimson</option>
            <option value="dark">Onyx (Dark)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* FontSizeDropdown */}
      <div className="h-11 flex items-center bg-slate-800/40 px-2 rounded-xl border border-slate-700/60 shadow-sm">
        <FontSizeDropdown />
      </div>

      {/* LanguageDropdown */}
      <div className="h-11 flex items-center bg-slate-800/40 px-2 rounded-xl border border-slate-700/60 shadow-sm">
        <LanguageDropdown />
      </div>

      {/* Tombol Toggle Mode */}
      <button 
        onClick={toggleMode} 
        className="h-11 px-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-xs font-semibold transition-all shadow-sm whitespace-nowrap flex items-center justify-center border border-slate-700/60"
      >
        {mode === 'dark' ? t('lightMode') : t('darkMode')}
      </button>

      {/* Profil Pengguna */}
      <div className="flex items-center space-x-3 bg-slate-800/40 px-3 h-11 rounded-xl border border-slate-700/60 shadow-sm">
        <div 
          onClick={() => {
            Swal.fire({
              title: '<span class="' + (isDark ? 'text-slate-100' : 'text-slate-900') + ' text-xl font-bold">Foto Profil</span>',
              html: `
                <div class="flex flex-col items-center justify-center space-y-4 py-2">
                  <div class="w-64 h-64 rounded-full bg-transparent overflow-hidden border-4 border-blue-500 shadow-2xl">
                    <img src="${adminData.avatar_url || 'https://via.placeholder.com/150'}" alt="Foto Profil Utama" class="w-full h-full object-cover" />
                  </div>
                  <p class="text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}">${adminData.name}</p>
                </div>
              `,
              showCloseButton: false,
              showConfirmButton: false,
              width: '550px',
              background: 'transparent',
            });
          }}
          className="w-8 h-8 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center font-bold text-white text-xs border border-indigo-400 relative group cursor-pointer shrink-0 shadow"
          title="Klik untuk melihat foto"
        >
          {adminData.avatar_url ? (
            <img src={adminData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            adminData.name && adminData.name !== 'Memuat...' ? adminData.name.charAt(0).toUpperCase() : 'A'
          )}
        </div>

        <Link href="/dashboard/setting/profile" className="text-left cursor-pointer group max-w-[120px]">
          <p className="text-xs font-semibold text-slate-100 group-hover:text-blue-300 transition truncate">{adminData.name}</p>
          <p className="text-[10px] text-blue-400 truncate">{adminData.email}</p>
        </Link>
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

    {/* PORTAL DRAWER KANAN (Mobile) */}
    {mounted && isRightMenuOpen && createPortal(
      <div className="fixed inset-0 z-50 lg:hidden flex">
        <div 
          onClick={() => setIsRightMenuOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />
        <div className="fixed top-0 right-0 bottom-0 w-72 bg-[#1B2A35] border-l border-slate-700 shadow-2xl p-6 flex flex-col z-50 text-white overflow-y-auto ml-auto">
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
          <div className="flex flex-col space-y-5">
            <div 
              onClick={() => {
                setIsRightMenuOpen(false);
                router.push('/dashboard/setting/profile');
              }}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 flex items-center space-x-3 cursor-pointer transition relative z-10"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-base overflow-hidden shrink-0">
                {adminData.avatar_url ? (
                  <img src={adminData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  adminData.name ? adminData.name.charAt(0).toUpperCase() : 'A'
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{adminData.name}</p>
                <p className="text-xs text-slate-400 truncate">{adminData.email}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
              <span className="text-sm text-slate-300">Tema Warna</span>
              <div className="relative">
                <select
                  value={colorTheme}
                  onChange={(e) => setColorTheme(e.target.value)}
                  className="bg-slate-900 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none pr-8"
                >
                  <option value="navy">Navy</option>
                  <option value="slate">Slate</option>
                  <option value="midnight">Midnight</option>
                  <option value="emerald">Emerald</option>
                  <option value="purple">Purple</option>
                  <option value="indigo">Indigo</option>
                  <option value="rose">Rose</option>
                  <option value="amber">Amber</option>
                  <option value="cyan">Cyan</option>
                  <option value="red">Crimson</option>
                  <option value="dark">Onyx (Dark)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col space-y-3">
              <span className="text-sm text-slate-300">Preferensi Tampilan</span>
              <div className="w-full"><FontSizeDropdown /></div>
              <div className="w-full"><LanguageDropdown /></div>
            </div>

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