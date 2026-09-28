'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiShare2, FiPlus, FiTrash2, FiExternalLink, FiGlobe, 
  FiInstagram, FiTwitter, FiYoutube, FiFacebook, FiLinkedin, FiGithub 
} from 'react-icons/fi';

interface SocialItem {
  id: string;
  platform: string;
  username: string;
  url: string;
  iconType: string;
}

export default function SocialMediaPage() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  // State daftar medsos
  const [socials, setSocials] = useState<SocialItem[]>([
    { id: '1', platform: 'Instagram', username: '@markussuperhoki', url: 'https://instagram.com', iconType: 'instagram' },
    { id: '2', platform: 'YouTube', username: 'Superhoki Official', url: 'https://youtube.com', iconType: 'youtube' },
    { id: '3', platform: 'GitHub', username: 'markussuperhoki', url: 'https://github.com', iconType: 'github' },
    { id: '4', platform: 'Twitter / X', username: '@superhoki_dev', url: 'https://twitter.com', iconType: 'twitter' },
  ]);

  // State form input untuk menambah medsos baru
  const [newPlatform, setNewPlatform] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Fungsi menambah medsos
  const handleAddSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform || !newUsername || !newUrl) return;

    const newItem: SocialItem = {
      id: Date.now().toString(),
      platform: newPlatform,
      username: newUsername,
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      iconType: newPlatform.toLowerCase(),
    };

    setSocials([...socials, newItem]);
    setNewPlatform('');
    setNewUsername('');
    setNewUrl('');
  };

  // Fungsi menghapus medsos
  const handleDelete = (id: string) => {
    setSocials(socials.filter(s => s.id !== id));
  };

  // Helper untuk memilih ikon berdasarkan platform
  const getPlatformIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('instagram')) return <FiInstagram size={20} className="text-pink-500" />;
    if (t.includes('youtube')) return <FiYoutube size={20} className="text-red-500" />;
    if (t.includes('twitter') || t.includes('x')) return <FiTwitter size={20} className="text-sky-400" />;
    if (t.includes('facebook')) return <FiFacebook size={20} className="text-blue-600" />;
    if (t.includes('linkedin')) return <FiLinkedin size={20} className="text-blue-500" />;
    if (t.includes('github')) return <FiGithub size={20} className="text-purple-400" />;
    return <FiGlobe size={20} className="text-indigo-400" />;
  };

  return (
    <div className={`max-w-10xl mx-auto p-6 my-8 rounded-2xl border shadow-xl transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      
      {/* Header Halaman */}
      <div className={`flex items-center justify-between mb-8 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-500 border border-indigo-500/20">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM TAMBAH MEDSOS (Kolom Kiri - 5 Grid) */}
        <div className="lg:col-span-5">
          <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-sm font-bold uppercase tracking-wider opacity-75">Tambah Media Sosial Baru</h2>

            <form onSubmit={handleAddSocial} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1.5 font-semibold">Nama Platform</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Instagram, TikTok, Facebook"
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
                  placeholder="https://instagram.com/ username"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg transition"
              >
                <FiPlus size={16} /> Tambahkan Medsos
              </button>
            </form>
          </div>
        </div>

        {/* DAFTAR KARTU MEDSOS (Kolom Kanan - 7 Grid) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider opacity-75">Daftar Tautan Medsos ({socials.length})</h2>
          </div>

          {socials.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-800 opacity-50' : 'bg-white border-slate-200 opacity-60'}`}>
              <p className="text-xs">Belum ada media sosial yang ditambahkan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socials.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all group hover:border-indigo-500/50 shadow-sm ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                        {getPlatformIcon(item.platform)}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold">{item.platform}</h3>
                        <p className="text-[11px] opacity-60">{item.username}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:text-rose-500 transition"
                      title="Hapus"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                  {/* Tombol Klik Tautan Medsos */}
                  <div className="pt-2 border-t border-slate-700/20 flex items-center justify-between">
                    <span className="text-[10px] font-mono truncate max-w-[150px] opacity-50">{item.url}</span>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 transition shadow-sm"
                    >
                      Kunjungi <FiExternalLink size={12} />
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