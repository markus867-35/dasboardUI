'use client';
import { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import Swal from 'sweetalert2';
import { 
  FiLink, FiPlus, FiTrash2, FiSearch, 
  FiExternalLink, FiCopy, FiCheck, FiGlobe, 
  FiMaximize2, FiGrid, FiList 
} from 'react-icons/fi';

interface UrlItem {
  id: string;
  title: string;
  url: string;
  category: string;
  date: string;
}

const initialUrls: UrlItem[] = [
  { id: '1', title: 'Next.js 15 Official Documentation', url: 'https://nextjs.org/docs', category: 'Documentation', date: '22 Sep 2026' },
  { id: '2', title: 'Supabase Dashboard & API', url: 'https://supabase.com/dashboard', category: 'Database', date: '21 Sep 2026' },
  { id: '3', title: 'Tailwind CSS v4 Utility Classes', url: 'https://tailwindcss.com', category: 'Design', date: '20 Sep 2026' },
  { id: '4', title: 'GitHub Repository Dashboard', url: 'https://github.com', category: 'Development', date: '19 Sep 2026' },
];

export default function FileUrlPage() {
  const { mode } = useTheme();
  const [urlList, setUrlList] = useState<UrlItem[]>(initialUrls);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk pengubah tampilan (Grid / List)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  const getWebsiteThumbnail = (url: string) => {
    return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
  };

  const handleImageClick = (item: UrlItem) => {
    const imageUrl = getWebsiteThumbnail(item.url);
    
    Swal.fire({
      title: `<span style="font-size: 16px; font-weight: bold;">${item.title}</span>`,
      html: `
        <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
          <img src="${imageUrl}" alt="${item.title}" style="width: 100%; max-height: 350px; object-fit: contain; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" />
          <a href="${item.url}" target="_blank" style="color: #3b82f6; font-size: 12px; text-decoration: underline; word-break: break-all;">${item.url}</a>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      background: mode === 'light' ? '#ffffff' : '#16222A',
      color: mode === 'light' ? '#1e293b' : '#f1f5f9',
      customClass: {
        popup: 'rounded-2xl border shadow-2xl p-5',
      }
    });
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newItem: UrlItem = {
      id: Date.now().toString(),
      title: newTitle.trim() || formattedUrl,
      url: formattedUrl,
      category: newCategory,
      date: 'Baru saja'
    };

    setUrlList([newItem, ...urlList]);
    setNewTitle('');
    setNewUrl('');
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUrls = urlList.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 relative">
      
      {/* HEADER & FORM INPUT URL */}
      <div className={`p-5 rounded-2xl border transition-colors ${getCardStyle()}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              Daftar URL <span className="text-xs font-normal opacity-60">/ Pustaka Tautan & Bookmark</span>
            </h1>
            <p className="text-xs opacity-70 mt-0.5">
              Simpan, kelola, dan akses tautan penting proyek atau referensi Anda dengan cepat.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`flex items-center px-3 py-2 rounded-xl border ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'} w-full md:w-64`}>
              <FiSearch className="opacity-50 mr-2" />
              <input 
                type="text" 
                placeholder="Cari tautan..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full"
              />
            </div>

            {/* TOGGLE VIEW MODE (GRID / LIST) */}
            <div className={`flex items-center p-1 rounded-xl border ${mode === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-[#0f172a] border-slate-700'} shrink-0`}>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'}`}
                title="Grid View"
              >
                <FiGrid size={14} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'}`}
                title="List View"
              >
                <FiList size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* FORM TAMBAH URL BARU */}
        <form onSubmit={handleAddUrl} className="pt-4 border-t border-slate-700/20 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="block text-[10px] font-semibold opacity-70 mb-1">Judul / Keterangan Tautan</label>
            <input 
              type="text" 
              placeholder="Contoh: Dashboard API Supabase" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-none transition ${mode === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-[#0f172a] border-slate-700 focus:border-blue-500'}`}
            />
          </div>

          <div className="md:col-span-5">
            <label className="block text-[10px] font-semibold opacity-70 mb-1">Tempel Tautan (Paste URL)</label>
            <input 
              type="text" 
              placeholder="https://example.com" 
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
              className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-none transition ${mode === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-[#0f172a] border-slate-700 focus:border-blue-500'}`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-semibold opacity-70 mb-1">Kategori</label>
            <select 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-none transition ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'}`}
            >
              <option value="General">General</option>
              <option value="Documentation">Documentation</option>
              <option value="Database">Database</option>
              <option value="Design">Design</option>
              <option value="Development">Development</option>
            </select>
          </div>

          <div className="md:col-span-1 flex items-end">
            <button 
              type="submit" 
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition shadow-md"
            >
              <FiPlus size={16} /> Simpan
            </button>
          </div>
        </form>
      </div>

      {/* AREA DAFTAR URL TERSIMPAN */}
      <div className={`min-h-[400px] p-6 rounded-2xl border transition-all ${getCardStyle()}`}>
        <div className="mb-4 text-xs opacity-70 font-medium">
          <span>Total Tautan Tersimpan: {filteredUrls.length} URL</span>
        </div>

        {filteredUrls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 text-xs">
            <FiLink size={48} className="mb-2" />
            <p>Belum ada tautan atau URL yang ditemukan.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-3"}>
            {filteredUrls.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-xl border flex gap-4 items-center transition hover:border-blue-500/50 ${
                  mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a]/60 border-slate-800'
                }`}
              >
                {/* Kotak Gambar Pratinjau (Thumbnail Website) yang Bisa Diklik */}
                <div 
                  onClick={() => handleImageClick(item)}
                  className="w-24 h-24 rounded-xl bg-black/10 dark:bg-white/5 shrink-0 overflow-hidden border border-slate-700/20 relative flex items-center justify-center cursor-pointer group"
                  title="Klik untuk memperbesar gambar"
                >
                  <img 
                    src={getWebsiteThumbnail(item.url)} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <FiMaximize2 size={16} />
                  </div>
                </div>

                {/* Informasi Konten URL */}
                <div className="flex flex-col justify-between flex-grow min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xs font-bold truncate" title={item.title}>{item.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-medium shrink-0">
                        {item.category}
                      </span>
                    </div>

                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[11px] text-blue-500 hover:underline truncate block mt-1 flex items-center gap-1"
                    >
                      <FiGlobe size={12} className="shrink-0" />
                      <span className="truncate">{item.url}</span>
                    </a>
                  </div>

                  <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-700/10 text-[10px] opacity-60">
                    <span>{item.date}</span>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleCopyLink(item.url, item.id)}
                        className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-blue-600 hover:text-white transition flex items-center gap-1 font-medium"
                        title="Salin Tautan"
                      >
                        {copiedId === item.id ? <FiCheck size={12} className="text-green-500" /> : <FiCopy size={12} />}
                        <span>{copiedId === item.id ? 'Tersalin' : 'Salin'}</span>
                      </button>

                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1 font-medium"
                        title="Buka Tautan"
                      >
                        <FiExternalLink size={12} />
                        <span>Buka</span>
                      </a>

                      <button 
                        onClick={() => setUrlList(urlList.filter(u => u.id !== item.id))}
                        className="p-1 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition opacity-70 hover:opacity-100"
                        title="Hapus"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}