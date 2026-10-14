'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import { 
  FiShare2, FiPlus, FiTrash2, FiEdit3, FiExternalLink, FiGlobe 
} from 'react-icons/fi';

interface SocialItem {
  id: string;
  platform: string;
  username: string;
  url: string;
  iconUrl: string;
}

export default function SocialMediaPage() {
  const router = useRouter();
  const { mode, colorTheme, getThemeClasses } = useTheme(); 
  const isDark = mode === 'dark';

  const [socials, setSocials] = useState<SocialItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State form input
  const [newPlatform, setNewPlatform] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIconUrl, setNewIconUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // 1. Ambil data dari Supabase saat halaman dimuat
  useEffect(() => {
    fetchSocials();
  }, []);

  const fetchSocials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_media') // Sesuaikan dengan nama tabel Anda di Supabase
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data) {
        // Mapping jika nama kolom di database berbeda (misal: icon_url menjadi iconUrl)
        const formattedData = data.map((item: any) => ({
          id: item.id.toString(),
          platform: item.platform,
          username: item.username,
          url: item.url,
          iconUrl: item.icon_url || 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png',
        }));
        setSocials(formattedData);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fungsi Submit (Simpan ke Supabase: Insert / Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform || !newUsername || !newUrl) return;

    const formattedUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    const iconFinal = newIconUrl.trim() !== '' ? newIconUrl : 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png';

    try {
      if (editingId) {
        // UPDATE ke Supabase
        const { error } = await supabase
          .from('social_media')
          .update({
            platform: newPlatform,
            username: newUsername,
            url: formattedUrl,
            icon_url: iconFinal,
          })
          .eq('id', editingId);

        if (error) throw error;

        // Update state lokal
        setSocials(socials.map(item => 
          item.id === editingId 
            ? { ...item, platform: newPlatform, username: newUsername, url: formattedUrl, iconUrl: iconFinal }
            : item
        ));
        setEditingId(null);
        Swal.fire('Berhasil!', 'Data berhasil diperbarui.', 'success');

      } else {
        // INSERT (Tambah Baru) ke Supabase
        const { data, error } = await supabase
          .from('social_media')
          .insert([
            {
              platform: newPlatform,
              username: newUsername,
              url: formattedUrl,
              icon_url: iconFinal,
            }
          ])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          const newItem: SocialItem = {
            id: data[0].id.toString(),
            platform: data[0].platform,
            username: data[0].username,
            url: data[0].url,
            iconUrl: data[0].icon_url,
          };
          setSocials([...socials, newItem]);
        }
        Swal.fire('Berhasil!', 'Media sosial berhasil ditambahkan.', 'success');
      }

      // Bersihkan form
      setNewPlatform('');
      setNewUsername('');
      setNewUrl('');
      setNewIconUrl('');

    } catch (error: any) {
      console.error('Error saving data:', error.message);
      Swal.fire('Gagal', error.message, 'error');
    }
  };

  // 3. Fungsi Hapus dari Supabase
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus tautan ini?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('social_media')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setSocials(socials.filter(s => s.id !== id));
        if (editingId === id) handleCancelEdit();

        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
      } catch (error: any) {
        console.error('Error deleting data:', error.message);
        Swal.fire('Gagal', error.message, 'error');
      }
    }
  };

  const handleEditClick = (item: SocialItem) => {
    setEditingId(item.id);
    setNewPlatform(item.platform);
    setNewUsername(item.username);
    setNewUrl(item.url);
    setNewIconUrl(item.iconUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewPlatform('');
    setNewUsername('');
    setNewUrl('');
    setNewIconUrl('');
  };

  const handleIconClick = (item: SocialItem) => {
    Swal.fire({
      title: `<span class="${isDark ? 'text-white' : 'text-slate-900'}">${item.platform}</span>`,
      html: `
        <div style="text-align: left; font-size: 13px;" class="${isDark ? 'text-slate-300' : 'text-slate-600'}">
          <p><strong>Akun:</strong> ${item.username}</p>
          <p style="margin-top: 8px; word-break: break-all;"><strong>Tautan:</strong> <a href="${item.url}" target="_blank" style="color: #6366f1;">${item.url}</a></p>
        </div>
      `,
      imageUrl: item.iconUrl,
      imageWidth: 60,
      imageHeight: 60,
      imageAlt: item.platform,
      background: isDark ? '#16222A' : '#ffffff',
      confirmButtonColor: '#6366f1',
      confirmButtonText: 'Tutup',
      customClass: {
        popup: 'rounded-2xl border ' + (isDark ? 'border-slate-700' : 'border-slate-200')
      }
    });
  };



const getCardStyle = () => {
    if (mode === 'light') {
      switch (colorTheme) {
        case 'indigo': return 'bg-indigo-100 text-indigo-950 border border-indigo-300 shadow-md';
        case 'emerald': return 'bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-md';
        case 'slate': 
        case 'midnight': 
        case 'dark': return 'bg-slate-200 text-slate-900 border border-slate-300 shadow-md';
        case 'purple': return 'bg-purple-100 text-purple-950 border border-purple-300 shadow-md';
        case 'rose': return 'bg-rose-100 text-rose-950 border border-rose-300 shadow-md';
        case 'amber': return 'bg-amber-100 text-amber-950 border border-amber-300 shadow-md';
        case 'cyan': return 'bg-cyan-100 text-cyan-950 border border-cyan-300 shadow-md';
        case 'red': return 'bg-red-100 text-red-950 border border-red-300 shadow-md';
        case 'navy':
        default: return 'bg-slate-100 text-slate-900 border border-slate-300 shadow-md';
      }
    } else {
      switch (colorTheme) {
        case 'indigo': return 'bg-[#3730a3] text-white shadow-xl border border-indigo-700/50';
        case 'emerald': return 'bg-[#047857] text-white shadow-xl border border-emerald-700/50';
        case 'slate': return 'bg-slate-900 text-white shadow-xl border border-slate-800';
        case 'midnight': return 'bg-[#0f172a] text-white shadow-xl border border-indigo-950';
        case 'purple': return 'bg-[#581c87] text-white shadow-xl border border-purple-900';
        case 'rose': return 'bg-[#9f1239] text-white shadow-xl border border-rose-900';
        case 'amber': return 'bg-[#92400e] text-white shadow-xl border border-amber-900';
        case 'cyan': return 'bg-[#0e7490] text-white shadow-xl border border-cyan-900';
        case 'red': return 'bg-[#991b1b] text-white shadow-xl border border-red-900';
        case 'dark': return 'bg-zinc-900 text-white shadow-xl border border-zinc-800';
        case 'navy':
        default: return 'bg-[#1B2A35] text-white shadow-xl border border-slate-700/60';
      }
    }
  };



return (
  <div className={`max-w-7xl mx-auto p-6 my-8 rounded-2xl border shadow-xl transition-colors duration-300 ${getCardStyle()} }`}>
    
    {/* Header Halaman */}
    <div className={`flex items-center justify-between mb-8 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 animate-spin-wheel">
          <FiShare2 size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Social Media Manager</h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Kelola, tambahkan, dan akses tautan media sosial Anda dengan cepat.
          </p>
        </div>
      </div>
    </div>

    {/* Ubah porsi grid utama: Form (4 Grid) & Daftar Medsos (8 Grid) agar muat 4 ke samping */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* FORM TAMBAH / EDIT MEDSOS (Kolom Kiri - 4 Grid) */}
      <div className="lg:col-span-4">
        <div className={`p-6 rounded-2xl border space-y-4 ${
          editingId ? (isDark ? 'bg-amber-950/20 border-amber-500/40' : 'bg-amber-50/50 border-amber-300') : (isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200')
        }`}>
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider opacity-75">
              {editingId ? '✏️ Edit Media Sosial' : 'Tambah Media Sosial Baru'}
            </h2>
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="text-[11px] text-rose-500 hover:underline font-semibold"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
            <div>
              <label className="block mb-1.5 font-semibold">Nama Platform</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Instagram, TikTok"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1.5 font-semibold">Username / Nama Akun</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: @namapengguna"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1.5 font-semibold">Tautan URL (Link)</label>
              <input 
                type="text" 
                required
                placeholder="https://instagram.com/username"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1.5 font-semibold">URL Icon Gambar (Opsional)</label>
              <input 
                type="text" 
                placeholder="https://example.com/icon.png"
                value={newIconUrl}
                onChange={(e) => setNewIconUrl(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white shadow-lg transition ${
                editingId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {editingId ? <FiEdit3 size={16} /> : <FiPlus size={16} />} 
              {editingId ? 'Simpan Perubahan' : 'Tambahkan Medsos'}
            </button>
          </form>
        </div>
      </div>

      {/* DAFTAR KARTU MEDSOS (Kolom Kanan - 8 Grid) */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider opacity-75">Daftar Tautan Medsos ({socials.length})</h2>
        </div>

        {socials.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-800 opacity-50' : 'bg-white border-slate-200 opacity-60'}`}>
            <p className="text-xs">Belum ada media sosial yang ditambahkan.</p>
          </div>
        ) : (
          /* DIUBAH KE 4 KOLOM (lg:grid-cols-4) AGAR BISA 4 KE SAMPING */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {socials.map((item) => (
              <div 
                key={item.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all group shadow-sm ${
                  editingId === item.id 
                    ? 'border-amber-500 bg-amber-500/5' 
                    : isDark ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => handleIconClick(item)}
                      className={`p-0 rounded-xl border transition hover:scale-105 cursor-pointer shadow-inner ${
                        isDark ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-slate-100 border-slate-200 hover:border-indigo-400'
                      }`}
                      title="Klik untuk melihat detail"
                    >
                      <img 
                        src={item.iconUrl} 
                        alt={item.platform} 
                        className="w-10 h-10 object-contain"
                        onError={(e)=>{
                          (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png';
                        }}
                      />
                    </button>

                    <div>
                      <h3 className="text-xs font-bold">{item.platform}</h3>
                      <p className="text-[11px] opacity-60">{item.username}</p>
                    </div>
                  </div>

                  {/* TOMBOL AKSI (EDIT & HAPUS) */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:text-amber-500 transition"
                      title="Edit"
                    >
                      <FiEdit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:text-rose-500 transition"
                      title="Hapus"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Tombol Klik Tautan Medsos */}
                <div className="pt-2 border-t border-slate-700/20 flex items-center justify-between">
                  <span className="text-[10px] font-mono truncate max-w-[100px] opacity-50">{item.url}</span>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 transition shadow-sm"
                  >
                    Kunjungi <FiExternalLink size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>

  </div>
);
}