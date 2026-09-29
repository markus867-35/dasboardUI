'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { 
  FiUpload, FiLink, FiSearch, FiGrid, FiList, 
  FiImage, FiTrash2, FiX, FiCheck, FiExternalLink, FiCopy, FiPlus 
} from 'react-icons/fi';

interface GifItem {
  id: string;
  url: string;
  name: string;
}

export default function GifManagerPage() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  

  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State untuk input URL baru
  const [urlInput, setUrlInput] = useState('');
  const [urlNameInput, setUrlNameInput] = useState('');

  const [selectedGif, setSelectedGif] = useState<GifItem | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Ambil data dari Supabase saat komponen dimuat
  useEffect(() => {
    fetchGifs();
  }, []);

  const fetchGifs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gifs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setGifs(data);
    } catch (error) {
      console.error('Gagal mengambil data GIF:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Upload file lokal ke Supabase Storage (atau simpan URL blob-nya / langsung ke database)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileName = `${Date.now()}-${file.name}`;

    try {
      // Opsi A: Jika Anda menggunakan Supabase Storage untuk upload file fisik
      /*
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gifs-bucket') // Ganti dengan nama bucket storage Anda
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gifs-bucket')
        .getPublicUrl(fileName);
      */

      // Opsi B: Untuk pengujian cepat (simpan URL lokal sementara atau konversi), 
      // namun idealnya file di-upload ke Supabase Storage seperti di atas.
      const localUrl = URL.createObjectURL(file); 

      const newGifData = {
        name: file.name,
        url: localUrl, // Ganti dengan `publicUrl` jika menggunakan Supabase Storage
      };

      const { data, error } = await supabase
        .from('gifs')
        .insert([newGifData])
        .select();

      if (error) throw error;

      if (data) {
        setGifs([data[0], ...gifs]);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Gagal mengupload GIF:', error);
      alert('Terjadi kesalahan saat mengupload GIF.');
    }
  };

  // 3. Simpan GIF via input Link URL ke Supabase
  const handleAddUrlGif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const formattedName = urlNameInput.trim() 
      ? (urlNameInput.endsWith('.gif') ? urlNameInput : `${urlNameInput}.gif`) 
      : `GIF-${Date.now()}.gif`;

    try {
      const newGifData = {
        name: formattedName,
        url: urlInput.trim(),
      };

      const { data, error } = await supabase
        .from('gifs')
        .insert([newGifData])
        .select();

      if (error) throw error;

      if (data) {
        setGifs([data[0], ...gifs]);
        setUrlInput('');
        setUrlNameInput('');
      }
    } catch (error) {
      console.error('Gagal menyimpan URL GIF:', error);
      alert('Gagal menyimpan ke database.');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 4. Hapus data dari Supabase
  const handleDeleteGif = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('gifs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGifs(gifs.filter((item) => item.id !== id));
      if (selectedGif?.id === id) setSelectedGif(null);
    } catch (error) {
      console.error('Gagal menghapus GIF:', error);
      alert('Gagal menghapus data.');
    }
  };

  const filteredGifs = gifs.filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`p-6 space-y-6 max-w-10xl mx-auto min-h-screen transition-colors ${
      isDark ? 'text-slate-100 bg-slate-950' : 'text-slate-800 bg-white'
    }`}>
      
      {/* 1. KOTAK HEADER UTAMA HALAMAN */}
      <div className={`p-6 border rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#16222A] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>GIF Manager</span>
            <span>/</span>
            <span>Galeri Media</span>
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Kelola animasi GIF, aset visual, dan dokumentasi gambar Anda secara responsif.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <FiSearch className="w-4 h-4" />
            </span>
            <input 
              type="text"
              placeholder="Cari GIF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full sm:w-64 pl-9 pr-4 py-2 text-xs border rounded-xl outline-none focus:border-blue-500 transition-all ${
                isDark 
                  ? 'border-slate-700 bg-[#1e2d38] text-slate-100' 
                  : 'border-slate-200 bg-slate-50 text-slate-800'
              }`}
            />
          </div>

          <div className={`flex items-center p-1 rounded-xl border ${
            isDark ? 'bg-[#1e2d38] border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. KOTAK AKSI: UPLOAD LOKAL & SIMPAN DARI LINK URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Kotak 1: Upload Lokal */}
        <input 
          type="file" 
          accept="image/gif" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          id="upload-gif-input" 
        />
        <label 
          htmlFor="upload-gif-input"
          className={`p-6 border border-dashed rounded-2xl flex items-center justify-center gap-3 cursor-pointer transition-all group shadow-xs ${
            isDark 
              ? 'border-slate-700 bg-[#16222A] hover:border-blue-500' 
              : 'border-slate-300 bg-white hover:border-blue-500'
          }`}
        >
          <div className={`p-2.5 rounded-xl group-hover:scale-105 transition-transform ${
            isDark ? 'bg-blue-950/40 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            <FiUpload className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Upload GIF dari Lokal</div>
            <div className="text-[11px] text-slate-400">Pilih file format .gif</div>
          </div>
        </label>

        {/* Kotak 2: Simpan GIF via Link URL */}
        <form 
          onSubmit={handleAddUrlGif}
          className={`p-5 border rounded-2xl flex flex-col justify-between gap-3 shadow-xs ${
            isDark ? 'border-slate-700 bg-[#16222A]' : 'border-slate-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              isDark ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <FiLink className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Tambah GIF dari Link URL</div>
              <div className="text-[11px] text-slate-400">Masukkan tautan langsung file GIF</div>
            </div>
          </div>

          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Nama GIF (opsional, cth: Animasi.gif)"
              value={urlNameInput}
              onChange={(e) => setUrlNameInput(e.target.value)}
              className={`w-full px-3 py-1.5 text-xs border rounded-lg outline-none transition-all ${
                isDark 
                  ? 'border-slate-700 bg-[#1e2d38] text-slate-100 placeholder:text-slate-500 focus:border-emerald-500' 
                  : 'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500'
              }`}
            />
            <div className="flex gap-2">
              <input 
                type="url" 
                required
                placeholder="https://contoh.com/gambar.gif"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className={`w-full px-3 py-1.5 text-xs border rounded-lg outline-none transition-all ${
                  isDark 
                    ? 'border-slate-700 bg-[#1e2d38] text-slate-100 placeholder:text-slate-500 focus:border-emerald-500' 
                    : 'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
              >
                <FiPlus className="w-3.5 h-3.5" /> Simpan
              </button>
            </div>
          </div>
        </form>

      </div>

      {/* 3. PANEL DAFTAR KOLEKSI GIF */}
      <div className={`p-6 border rounded-2xl shadow-xs space-y-4 min-h-[350px] flex flex-col ${
        isDark ? 'bg-[#16222A] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`text-xs font-medium pb-3 border-b ${
          isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-500 border-slate-100'
        }`}>
          Total Koleksi: {filteredGifs.length} GIF
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 py-20">
            <span>Memuat data dari database...</span>
          </div>
        ) : filteredGifs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-xs text-slate-400 py-20 space-y-2">
            <FiImage className="w-8 h-8 opacity-40" />
            <span>Belum ada GIF yang tersimpan atau ditemukan.</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
            {filteredGifs.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedGif(item)}
                className={`group relative border rounded-xl overflow-hidden shadow-xs hover:border-blue-500 transition-all cursor-pointer flex flex-col ${
                  isDark ? 'bg-[#1e2d38] border-slate-700/70' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`w-full h-36 overflow-hidden relative flex items-center justify-center ${
                  isDark ? 'bg-slate-900' : 'bg-slate-200'
                }`}>
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button
                    onClick={(e) => handleDeleteGif(e, item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className={`p-2.5 text-xs font-medium truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {filteredGifs.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedGif(item)}
                className={`flex items-center justify-between p-3 border rounded-xl hover:border-blue-500 transition-all cursor-pointer group ${
                  isDark ? 'bg-[#1e2d38] border-slate-700/70' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {item.name}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteGif(e, item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Hapus"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. MODAL POPUP DETAIL GIF */}
      {selectedGif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className={`border rounded-2xl max-w-lg w-full p-6 shadow-xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#16222A] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <button 
              onClick={() => { setSelectedGif(null); setIsCopied(false); }}
              className={`absolute top-4 right-4 p-2 text-slate-400 transition-colors ${
                isDark ? 'hover:text-slate-200' : 'hover:text-slate-700'
              }`}
            >
              <FiX className="w-5 h-5" />
            </button>

            <div>
              <h3 className={`text-sm font-bold truncate pr-6 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                {selectedGif.name}
              </h3>
              <p className="text-[11px] text-slate-400">Pratinjau detail GIF</p>
            </div>

            <div className={`w-full h-64 rounded-xl overflow-hidden flex items-center justify-center border ${
              isDark ? 'bg-[#1e2d38] border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <img src={selectedGif.url} alt={selectedGif.name} className="max-h-full max-w-full object-contain" />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-400">URL GIF</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={selectedGif.url}
                  className={`w-full px-3 py-2 text-xs border rounded-lg outline-none select-all ${
                    isDark ? 'bg-[#1e2d38] border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                />
                <a 
                  href={selectedGif.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`p-2.5 border rounded-lg transition-colors ${
                    isDark ? 'border-slate-700 hover:bg-[#253644] text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                  }`}
                  title="Buka Tab Baru"
                >
                  <FiExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <button
              onClick={() => handleCopyUrl(selectedGif.url)}
              className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isCopied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isCopied ? <><FiCheck className="w-4 h-4" /> Link Berhasil Disalin!</> : <><FiCopy className="w-4 h-4" /> Salin URL GIF</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}