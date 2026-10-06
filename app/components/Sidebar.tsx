'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Settings, Activity } from 'lucide-react'; // Tambahkan Activity di sini
import { usePathname } from 'next/navigation';
import Swal from 'sweetalert2';

import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTheme } from '@/app/context/ThemeContext';
import { useSidebarTheme } from '@/app/context/SidebarThemeContext'; // Sesuaikan path-nya
import { MouseEvent } from 'react'; // Pastikan MouseEvent sudah diimport
import { FiShare2, FiDatabase, FiBarChart2,FiGlobe,FiBell,FiSettings, FiLogOut,FiHome,FiGrid,FiPieChart,FiShield, FiUser } from 'react-icons/fi';


export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { mode, colorTheme, isSidebarOpen, setIsSidebarOpen } = useTheme();
  
  // 👇 Letakkan isDark di SINI (setelah useTheme dipanggil)
  const isDark = mode === 'dark';

  const { sidebarTheme, setSidebarTheme } = useSidebarTheme();
  
  // State lokal...
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



const handleLogout = () => {
    // Tutup menu dropdown terlebih dahulu
    setIsAdminMenuOpen(false);

    // Konfirmasi sebelum keluar
    Swal.fire({
      title: 'Keluar Akun?',
      text: 'Anda akan keluar dari sesi admin.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        // 👇 Hapus data adminId dari localStorage agar sesi benar-benar bersih
        localStorage.removeItem('adminId');
        
        // Atau jika ingin membersihkan seluruh localStorage:
        // localStorage.clear();

        // Arahkan ke halaman login
        router.push('/login');
      }
    });
  };





const ADMIN_ID = '11111111-1111-1111-1111-111111111111';
  
  // 1. Tambahkan state untuk menyimpan data admin
  const [adminData, setAdminData] = useState({
    name: 'memuat....',
    email: 'memuat....',
    avatar_url: null,
  });

  // 2. Tambahkan useEffect untuk fetch data dari Supabase
useEffect(() => {
    const fetchLoggedInAdmin = async () => {
      const currentAdminId = localStorage.getItem('adminId');
      if (!currentAdminId) return;

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('name, email, avatar_url')
          .eq('id', currentAdminId)
          .single();

        if (error) throw error;

        if (data) {
          setAdminData({
            name: data.name || 'Admin',
            email: data.email || '',
            avatar_url: data.avatar_url || '',
          });
        }
      } catch (err: any) {
        console.error('Gagal memuat info admin:', err.message);
      }
    };

    fetchLoggedInAdmin();
  }, []);



// Jika fungsi dipanggil saat item menu diklik dengan membawa parameter path
// Ubah fungsi Anda agar kompatibel dengan MouseEventHandler React
const handleMenuClick = (e?: MouseEvent<HTMLAnchorElement>, path?: string) => {
  if (window.innerWidth < 1024 && typeof setIsSidebarOpen === 'function') {
    setIsSidebarOpen(false);
  }
  // Jika Anda perlu menggunakan path atau event lainnya
};
const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
  visitor: pathname.startsWith('/dashboard/add'),
  
  list: pathname.startsWith('/dashboard/list') || 
        pathname.startsWith('/dashboard/countries') || 
        pathname.startsWith('/dashboard/currencies') || 
        pathname.startsWith('/dashboard/directory'),

  // TAMBAHKAN KATEGORI INI UNTUK AKTIVITAS & PROFIL
  activityCenter: pathname.startsWith('/activity') || pathname.startsWith('/profile'),

  report: pathname.startsWith('/dashboard/report'),
  shopping: pathname?.startsWith('/dashboard/produk'),
  medsos: pathname?.startsWith('/dashboard/sosmed'),
  otomotif: pathname.startsWith('/dashboard/otomotif'),
  setting: pathname.startsWith('/dashboard/setting'),
});

  const toggleMenu = (menuKey: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

// Tambahkan ': string' pada parameter path
  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return "flex items-center px-4 py-3 rounded-xl text-sm font-medium bg-[#2E4053] text-white shadow-md transition-all";
    }
    return "flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all";
  };

  // Tambahkan ': string' pada parameter path
  const getSubLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return `block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      isActive ? 'bg-[#2E4053] text-white' : 'text-slate-400 hover:text-white hover:bg-[#253644]/50'
    }`;
  };

  return (
<aside className={`fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 flex flex-col justify-between overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${getSidebarStyle()} ${
  // sisa kode Anda di sini
  // sisa kode Anda di sini
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
<div className="p-6 flex items-center justify-between relative z-50">
  <h1 className="text-3xl font-bold tracking-wider text-white italic">
    Data-save-Markus
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
      <nav className="flex-1  px-4 space-y-1.5 overflow-y-auto">
<Link 
  href="/dashboard" 
  className={getLinkStyle('/dashboard')} 
  onClick={handleMenuClick}
>
  <FiGrid size={18} className="mr-3" /> Dashboard
</Link>
        
        {/* 1. Add Data */}
        <div>
          <button
            onClick={() => toggleMenu('visitor')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[16px] font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
<div className="flex items-center gap-3">
  <FiDatabase size={18} /> 
  <span>Manager Data</span>
</div>
            <span className={`text-2xl transform transition-transform duration-200 ${openMenus.visitor ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          
          {openMenus.visitor && (
            <div className="pl-11 pr-2  py-1 space-y-2">
              <Link href="/dashboard/add-data/file-manager" className={getSubLinkStyle('/dashboard/add-data/file-manager')} onClick={handleMenuClick}>
                File manager
              </Link>
              <Link href="/dashboard/add-data/file-image" className={getSubLinkStyle('/dashboard/add-data/file-image')} onClick={handleMenuClick}>
                Manager image
              </Link>
              <Link href="/dashboard/add-data/file-music" className={getSubLinkStyle('/dashboard/add-data/file-music')} onClick={handleMenuClick}>
                Manager Music
              </Link>
              <Link href="/dashboard/add-data/file-video" className={getSubLinkStyle('/dashboard/add-data/file-video')} onClick={handleMenuClick}>
                Manager Video
              </Link>
              <Link href="/dashboard/add-data/file-ulr" className={getSubLinkStyle('/dashboard/add-data/file-ulr')} onClick={handleMenuClick}>
                Manager Url
              </Link>
                <Link href="/dashboard/add-data/manager-data" className={getSubLinkStyle('/dashboard/add-data/manager-data')} onClick={handleMenuClick}>
                Manager Data
              </Link>
            </div>
          )}
        </div>




        {/* 3. Report */}
        <div>
          <button
            onClick={() => toggleMenu('report')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[16px] font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
<div className="flex items-center gap-3">
  <FiBarChart2 size={18} /> 
  <span>Report</span>
</div>
            <span className={`text-2xl transform transition-transform duration-200 ${openMenus.report ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          {openMenus.report && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <Link href="/dashboard/report/editor" className={getSubLinkStyle('/dashboard/report/editor')} onClick={handleMenuClick}>
                Editor
              </Link>
              <Link href="/dashboard/report/icon" className={getSubLinkStyle('/dashboard/report/monthly')} onClick={handleMenuClick}>
                Icon
              </Link>
              <Link href="/dashboard/report/gif" className={getSubLinkStyle('/dashboard/report/gif')} onClick={handleMenuClick}>
                Gif
              </Link>
                <Link href="/dashboard/report/notepad" className={getSubLinkStyle('/dashboard/report/notepad')} onClick={handleMenuClick}>
                notepad
              </Link>
            </div>
          )}
        </div>




{/* 2. Global Atlas */}
        <div>
          <button
            onClick={(e) => {
              e.preventDefault();
              setOpenMenus(prev => ({ ...prev, list: !prev.list }));
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[16px] font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
<div className="flex items-center gap-3">
  <FiGlobe size={18} /> 
  <span>Global Atlas</span>
</div>
            <span className={`text-2xl transform transition-transform duration-200 ${openMenus.list ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          
{openMenus.list && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <Link 
                href="/dashboard/global/countries" 
                className={getSubLinkStyle('/dashboard/global/countries')}
              >
                Countries
              </Link>
              <Link 
                href="/dashboard/global/currencies" 
                className={getSubLinkStyle('/dashboard/globalcurrencies')}
              >
                Currencies
              </Link>
              <Link 
                href="/dashboard/global/name-directory" 
                className={getSubLinkStyle('/dashboard/global/name-directory')}
              >
                Name Directory
              </Link>
            </div>
          )}
        </div>









     
        <div>
          <button
            onClick={() => toggleMenu('shopping')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[16px] font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
<div className="flex items-center gap-3">
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="feather feather-shopping-cart"
  >
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
  <span>Shopping</span>
</div>
            <span className={`text-2xl transform transition-transform duration-200 ${openMenus.shopping ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          {openMenus.shopping && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <Link href="/dashboard/shoping/produk" className={getSubLinkStyle('/dashboard/shoping/produk')} onClick={handleMenuClick}>
                Produk
              </Link>
              <Link href="/dashboard/shoping/detail-produk" className={getSubLinkStyle('/dashboard/shoping/detail-produk"')} onClick={handleMenuClick}>
                Product detail
              </Link>
              <Link href="/dashboard/shoping/order" className={getSubLinkStyle('/dashboard/shoping/order')} onClick={handleMenuClick}>
                Orders
              </Link>
              <Link href="/dashboard/shoping/detail-order" className={getSubLinkStyle('/dashboard/shoping/detail-order')} onClick={handleMenuClick}>
               Detail Orders
              </Link>
              <Link href="/dashboard/shoping/shoping-cart" className={getSubLinkStyle('/dashboard/shoping/shoping-cart')} onClick={handleMenuClick}>
               Shopping Cart
              </Link>
            </div>
          )}
        </div>




        {/* 4. medsos */}
        <div>
          <button
            onClick={() => toggleMenu('medsos')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[16px] font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
<div className="flex items-center gap-3">
  <FiShare2 size={18} /> 
  <span>Medsos</span>
</div>
            <span className={`text-2xl transform transition-transform duration-200 ${openMenus.medsos ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          {openMenus.medsos && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <Link href="/dashboard/medsos" className={getSubLinkStyle('/dashboard/medsos')} onClick={handleMenuClick}>
                Sosmed
              </Link>
              <Link href="/dashboard/otomotif/settings" className={getSubLinkStyle('/dashboard/otomotif/settings')} onClick={handleMenuClick}>
                Setting
              </Link>
            </div>
          )}
        </div>






        {/* 4. otomotif */}
        <div>
          <button
            onClick={() => toggleMenu('otomotif')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[16px] font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
<div className="flex items-center gap-3">
  <FiBell size={18} /> 
  <span>Shoping-Otomotif</span>
</div>
            <span className={`text-2xl transform transition-transform duration-200 ${openMenus.otomotif ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          {openMenus.otomotif && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <Link href="/dashboard/otomotif/ban" className={getSubLinkStyle('/dashboard/otomotif/ban')} onClick={handleMenuClick}>
                Ban Motor
              </Link>
              <Link href="/dashboard/otomotif/settings" className={getSubLinkStyle('/dashboard/otomotif/settings')} onClick={handleMenuClick}>
                Alert Preferences
              </Link>
            </div>
          )}
        </div>


















        

        {/* 5. Setting */}
        <div>
          <button
            onClick={() => toggleMenu('setting')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[16px] font-medium hover:bg-[#253644] hover:text-white text-slate-300 transition-all cursor-pointer"
          >
<div className="flex items-center gap-3">
  <FiSettings size={18} /> 
  <span>Setting</span>
</div>
            <span className={`text-2xl transform transition-transform duration-200 ${openMenus.setting ? 'rotate-90' : ''}`}>
              &gt;
            </span>
          </button>
          {openMenus.setting && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <Link href="/dashboard/setting/profile" className={getSubLinkStyle('/dashboard/setting/profile')} onClick={handleMenuClick}>
                Profile
              </Link>
              <Link href="/dashboard/setting/activity" className={getSubLinkStyle('/dashboard/setting/activity')} onClick={handleMenuClick}>
                Lain-lain
              </Link>
            </div>
          )}
        </div>

<button 
      onClick={handleLogout}
      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-red-500/20 text-red-400 transition-all flex items-center space-x-2 cursor-pointer"
    >
      <FiLogOut size={16} /> 
      <span>🚪 Keluar (Logout)</span>
    </button>
      </nav>







































{/* BAGIAN ATAS: Nama Admin & Tombol Setting dengan Dropdown */}
<div className="p-6 flex flex-col space-y-6 relative">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative">
        
        {/* 1. Profil Pengguna (Menggunakan Data Dinamis dari Supabase) */}
        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center space-x-3 w-full">
          
          {/* Avatar Bulat (Bisa diklik untuk memunculkan SweetAlert) */}
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
            className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-base overflow-hidden shrink-0 border border-indigo-400 cursor-pointer group hover:opacity-90 transition"
            title="Klik untuk melihat foto"
          >
            {adminData.avatar_url ? (
              <img src={adminData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              adminData.name ? adminData.name.charAt(0).toUpperCase() : 'A'
            )}
          </div>

          {/* Nama, Email, dan Status Online */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{adminData.name}</p>
            <p className="text-xs text-slate-400 truncate">{adminData.email}</p>
            <span className="text-[10px] text-emerald-400 font-medium inline-block mt-0.5">● Online</span>
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
<Link 
  href="/dashboard/setting/profile"
  onClick={() => setIsAdminMenuOpen(false)}
  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-slate-200 transition-all flex items-center space-x-2"
>
  <FiUser size={16} /> 
  <span>Profil Akun</span>
</Link>

<Link 
  href="/dashboard/setting/change-password"
  onClick={() => setIsAdminMenuOpen(false)}
  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-slate-200 transition-all flex items-center space-x-2"
>
  <FiShield size={16} /> 
  <span>Keamanan & Sandi</span>
</Link>

        <div className="border-t border-white/10 my-1"></div>

<button 
      onClick={handleLogout}
      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-red-500/20 text-red-400 transition-all flex items-center space-x-2 cursor-pointer"
    >
      <FiLogOut size={16} /> 
      <span>🚪 Keluar (Logout)</span>
    </button>
      </div>
    )}

  </div>

{/* ========================================== */}
{/* AREA TANGGAL BUAT / REGISTRASI AKUN        */}
{/* ========================================== */}
<div className="px-1 text-[10px] text-slate-400 flex flex-col space-y-0.5">
  <div className="flex items-center space-x-1.5">
    <span className="opacity-75">📅</span>
    <span>Hari Ini: <strong className="text-slate-200">
      {new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}
    </strong></span>
  </div>
  
  {/* Tanggal Pembuatan / Bergabung */}
  <div className="flex items-center space-x-1 opacity-80 pl-1.5 text-[10px]">
    <span>Terdaftar Sejak: <strong>20 September 2026</strong></span> {/* Ganti dengan variabel tanggal dari database Anda */}
  </div>
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