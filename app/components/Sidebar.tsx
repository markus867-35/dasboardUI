'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTheme } from '@/app/context/ThemeContext';
import { useSidebarTheme } from '@/app/context/SidebarThemeContext'; // Sesuaikan path-nya


export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { setIsSidebarOpen } = useTheme();
  const { mode, colorTheme, isSidebarOpen } = useTheme();
  const { sidebarTheme, setSidebarTheme } = useSidebarTheme();
// State lokal untuk menu tema dan menu admin (dipisah dengan benar)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const getSidebarStyle = () => {
    switch (sidebarTheme) {
      case 'sidebar-slate':
        return 'bg-slate-900 text-slate-100 border-r border-slate-800';
      case 'sidebar-midnight':
        return 'bg-[#030712] text-indigo-200 border-r border-indigo-950';
      case 'sidebar-emerald':
        return 'bg-[#064e3b] text-emerald-100 border-r border-emerald-900';
      case 'sidebar-purple':
        return 'bg-[#3b0764] text-purple-100 border-r border-purple-900';
      case 'sidebar-dark':
        return 'bg-zinc-900 text-zinc-100 border-r border-zinc-800';
      case 'sidebar-navy':
      default:
        return 'bg-[#111827] text-white border-r border-gray-800';
    }
  };

  const handleMenuClick = () => {
    if (window.innerWidth < 1024 && typeof setIsSidebarOpen === 'function') {
      setIsSidebarOpen(false);
    }
  };

  const [openMenus, setOpenMenus] = useState({
    visitor: pathname.startsWith('/dashboard/add'),
    list: pathname.startsWith('/dashboard/list'),
    report: pathname.startsWith('/dashboard/report'),
    notifications: pathname.startsWith('/dashboard/notifications'),
    setting: pathname.startsWith('/dashboard/setting'),
  });

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const getLinkStyle = (path) => {
    const isActive = pathname === path;
    if (isActive) {
      return "flex items-center px-4 py-3 rounded-xl text-sm font-medium bg-[#2E4053] text-white shadow-md transition-all";
    }
    return "flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all";
  };

  const getSubLinkStyle = (path) => {
    const isActive = pathname === path;
    return `block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      isActive ? 'bg-[#2E4053] text-white' : 'text-slate-400 hover:text-white hover:bg-[#253644]/50'
    }`;
  };

  return (
<aside className={`fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 flex flex-col justify-between ${getSidebarStyle()} ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
<div className="p-6 flex items-center justify-between relative z-50">
  <h1 className="text-2xl font-bold tracking-wider text-white italic">
    Data-save
  </h1>

  {/* Tombol Close Khusus Mobile */}
{/* Tombol Close Khusus Mobile */}
{/* Tombol Close Khusus Mobile */}
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    if (typeof setIsSidebarOpen === 'function') {
      setIsSidebarOpen(false);
    }
  }}
  onTouchEnd={(e) => {
    e.stopPropagation();
    if (typeof setIsSidebarOpen === 'function') {
      setIsSidebarOpen(false);
    }
  }}
  className="lg:hidden p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-lg transition-all cursor-pointer pointer-events-auto touch-manipulation"
  aria-label="Tutup Sidebar"
>
  <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>
</div>

      {/* Menu Navigasi */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <Link 
          href="/dashboard" 
          className={getLinkStyle('/dashboard')}
          onClick={handleMenuClick}
        >
          <span className="mr-3">📊</span> Dashboard
        </Link>
        
        {/* 1. Add Data */}
        <div>
          <button
            onClick={() => toggleMenu('visitor')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center">
              <span className="mr-3">➕</span> Add Data
            </div>
            <span className={`text-xs transform transition-transform duration-200 ${openMenus.visitor ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          
          {openMenus.visitor && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <Link href="/dashboard/add/form" className={getSubLinkStyle('/dashboard/add/form')} onClick={handleMenuClick}>
                File manager
              </Link>
              <Link href="/dashboard/add/image" className={getSubLinkStyle('/dashboard/add/image')} onClick={handleMenuClick}>
                Manager image
              </Link>
              <Link href="/dashboard/add/music" className={getSubLinkStyle('/dashboard/add/music')} onClick={handleMenuClick}>
                Manager Music
              </Link>
              <Link href="/dashboard/add/video" className={getSubLinkStyle('/dashboard/add/video')} onClick={handleMenuClick}>
                Manager Video
              </Link>
            </div>
          )}
        </div>

        {/* 2. Url browser */}
        <div>
          <button
            onClick={() => toggleMenu('list')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center">
              <span className="mr-3">📋</span> Url browser
            </div>
            <span className={`text-xs transform transition-transform duration-200 ${openMenus.list ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          {openMenus.list && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <Link href="/dashboard/list/active" className={getSubLinkStyle('/dashboard/list/active')} onClick={handleMenuClick}>
                Link 1
              </Link>
              <Link href="/dashboard/list/history" className={getSubLinkStyle('/dashboard/list/history')} onClick={handleMenuClick}>
                Link 2
              </Link>
              <Link href="/dashboard/list/history" className={getSubLinkStyle('/dashboard/list/history')} onClick={handleMenuClick}>
                Link 3
              </Link>
            </div>
          )}
        </div>

        {/* 3. Report */}
        <div>
          <button
            onClick={() => toggleMenu('report')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center">
              <span className="mr-3">📈</span> Report
            </div>
            <span className={`text-xs transform transition-transform duration-200 ${openMenus.report ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          {openMenus.report && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <Link href="/dashboard/report/editor" className={getSubLinkStyle('/dashboard/report/editor')} onClick={handleMenuClick}>
                Daily Summary
              </Link>
              <Link href="/dashboard/report/monthly" className={getSubLinkStyle('/dashboard/report/monthly')} onClick={handleMenuClick}>
                Monthly Report
              </Link>
            </div>
          )}
        </div>

        {/* 4. Notifications */}
        <div>
          <button
            onClick={() => toggleMenu('notifications')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center">
              <span className="mr-3">🔔</span> Notifications
            </div>
            <span className={`text-xs transform transition-transform duration-200 ${openMenus.notifications ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          {openMenus.notifications && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <Link href="/dashboard/notifications/unread" className={getSubLinkStyle('/dashboard/notifications/unread')} onClick={handleMenuClick}>
                Unread Alerts
              </Link>
              <Link href="/dashboard/notifications/settings" className={getSubLinkStyle('/dashboard/notifications/settings')} onClick={handleMenuClick}>
                Alert Preferences
              </Link>
            </div>
          )}
        </div>

        {/* 5. Setting */}
        <div>
          <button
            onClick={() => toggleMenu('setting')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center">
              <span className="mr-3">⚙️</span> Setting
            </div>
            <span className={`text-xs transform transition-transform duration-200 ${openMenus.setting ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          {openMenus.setting && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <Link href="/dashboard/setting/profile" className={getSubLinkStyle('/dashboard/setting/profile')} onClick={handleMenuClick}>
                Profile
              </Link>
              <Link href="/dashboard/setting/others" className={getSubLinkStyle('/dashboard/setting/others')} onClick={handleMenuClick}>
                Lain-lain
              </Link>
            </div>
          )}
        </div>

        <Link href="/logout" className={getLinkStyle('/logout')} onClick={handleMenuClick}>
          <span className="mr-3">🚪</span> Login/Logout
        </Link>
      </nav>













{/* BAGIAN ATAS: Nama Admin & Tombol Setting dengan Dropdown */}
        <div className="p-6 flex flex-col space-y-6 relative">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 relative">
            
            {/* Info Nama Admin */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">
                A
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">Super Admin</h3>
                <span className="text-[10px] text-emerald-400 font-medium">● Online</span>
              </div>
            </div>

            {/* Tombol Setting dengan Toggle Dropdown */}
            <button
              type="button"
              onClick={() => {
                setIsAdminMenuOpen(!isAdminMenuOpen);
                setIsThemeMenuOpen(false); // Menutup menu tema jika sedang terbuka
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer flex-shrink-0"
              title="Pengaturan Admin"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

{/* DROPDOWN MENU PENGATURAN ADMIN */}
{isAdminMenuOpen && (
  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900/95 backdrop-blur-md rounded-xl border border-white/15 shadow-2xl z-50 flex flex-col space-y-1">
    
    {/* Halaman Profil Akun */}
    <Link 
      href="/admin/profile"
      onClick={() => setIsAdminMenuOpen(false)}
      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-slate-200 transition-all flex items-center space-x-2"
    >
      <span>👤 Profil Akun</span>
    </Link>

    {/* Halaman Keamanan */}
    <Link 
      href="/admin/security"
      onClick={() => setIsAdminMenuOpen(false)}
      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-slate-200 transition-all flex items-center space-x-2"
    >
      <span>🔒 Keamanan & Sandi</span>
    </Link>

    <div className="border-t border-white/10 my-1"></div>

    {/* Tombol Logout (Tetap Button untuk Panggil Fungsi Logout/API) */}
    <button 
      onClick={() => { 
        // Panggil fungsi logout Anda di sini (misal: supabase.auth.signOut())
        setIsAdminMenuOpen(false); 
      }}
      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-red-500/20 text-red-400 transition-all flex items-center space-x-2 cursor-pointer"
    >
      <span>🚪 Keluar (Logout)</span>
    </button>
  </div>
)}

          </div>

          {/* Navigasi menu lainnya di sini */}
        </div>






      

      {/* BAGIAN BAWAH: Tombol Toggle & Menu Pilihan Tema Sidebar */}
      <div className="p-4 m-4 bg-white/5 rounded-xl border border-white/10 relative">
        
        {/* Tombol Toggle Utama untuk Membuka/Menutup Pilihan Tema */}
        <button
          type="button"
          onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium transition-all cursor-pointer"
        >
          <span>🎨  Tema </span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isThemeMenuOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Panel Pilihan Tema yang Muncul Hanya Saat isThemeMenuOpen bernilai true */}
        {isThemeMenuOpen && (
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-col space-y-2 animate-fadeIn">
            <span className="text-[10px] text-slate-300 uppercase tracking-wider">Pilih Warna Sidebar:</span>
            
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                onClick={() => { setSidebarTheme('sidebar-navy');  }} 
                className={`px-2 py-1.5 text-[10px] rounded bg-gray-900 text-white border ${sidebarTheme === 'sidebar-navy' ? 'border-white ring-1 ring-white' : 'border-transparent'}`}
              >
                Navy
              </button>
              <button 
                onClick={() => { setSidebarTheme('sidebar-slate');  }} 
                className={`px-2 py-1.5 text-[10px] rounded bg-slate-800 text-white border ${sidebarTheme === 'sidebar-slate' ? 'border-white ring-1 ring-white' : 'border-transparent'}`}
              >
                Slate
              </button>
              <button 
                onClick={() => { setSidebarTheme('sidebar-emerald');  }} 
                className={`px-2 py-1.5 text-[10px] rounded bg-emerald-900 text-white border ${sidebarTheme === 'sidebar-emerald' ? 'border-white ring-1 ring-white' : 'border-transparent'}`}
              >
                Emerald
              </button>
              <button 
                onClick={() => { setSidebarTheme('sidebar-purple'); }} 
                className={`px-2 py-1.5 text-[10px] rounded bg-purple-900 text-white border ${sidebarTheme === 'sidebar-purple' ? 'border-white ring-1 ring-white' : 'border-transparent'}`}
              >
                Purple
              </button>
            </div>
          </div>
        )}

      </div>

    </aside>
  );
}