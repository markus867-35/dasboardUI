'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiVideo, FiUpload, FiTrash2, FiSearch, 
  FiGrid, FiList, FiX, FiPlay, FiFilm 
} from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

interface VideoItem {
  id: string | number;
  name: string;
  duration: string;
  url: string;
  size: string;
  date: string;
  dimension?: string;
}

export default function FileVideoPage() {
  const { mode } = useTheme();
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  useEffect(() => {
    fetchVideosFromSupabase();
  }, []);

  const fetchVideosFromSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('video_tracks')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) setVideoList(data);
    } catch (error) {
      console.error('Gagal memuat video:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler Upload Berkas Video ke Supabase Storage & Database
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload file ke Supabase Storage (Bucket: video-files)
      const { error: uploadError } = await supabase.storage
        .from('video-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Ambil Public URL dari file yang di-upload
      const { data: publicURLData } = supabase.storage
        .from('video-files')
        .getPublicUrl(filePath);

      const formattedDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

const newVideo = {
        id: Date.now(), // <-- Tambahkan baris ini agar id selalu terisi otomatis
        name: file.name.replace(/\.[^/.]+$/, ""),
        duration: '--:--',
        url: publicURLData.publicUrl,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: formattedDate,
        dimension: 'Original'
      };
      // 3. Simpan metadata ke tabel Supabase (Tabel: video_tracks)
      const { data, error: insertError } = await supabase
        .from('video_tracks')
        .insert([newVideo])
        .select();

      if (insertError) throw insertError;
      if (data) setVideoList([data[0], ...videoList]);
    } catch (error: any) {
      console.error('Gagal mengupload video:', error);
      alert(`Terjadi kesalahan saat mengupload video: ${error.message || error}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (id: string | number, fileUrl: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus video ini?')) return;

    try {
      // 1. Hapus dari database
      const { error } = await supabase
        .from('video_tracks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 2. Hapus file fisik dari Supabase Storage jika itu dari bucket internal
      try {
        if (fileUrl.includes('/video-files/')) {
          const urlParts = fileUrl.split('/video-files/');
          if (urlParts.length > 1) {
            await supabase.storage.from('video-files').remove([urlParts[1]]);
          }
        }
      } catch (storageErr) {
        console.warn('Penghapusan file storage dilewati:', storageErr);
      }

      if (activeVideo?.id === id) {
        setActiveVideo(null);
      }
      setVideoList(videoList.filter(item => item.id !== id));
    } catch (error) {
      console.error('Gagal menghapus video:', error);
      alert('Gagal menghapus video dari database.');
    }
  };

  const filteredVideos = videoList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 relative">
      
      {/* HEADER & TOOLBAR */}
      <div className={`p-5 rounded-2xl border transition-colors ${getCardStyle()}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              File Video <span className="text-xs font-normal opacity-60">/ Pustaka Video & Rekaman Supabase</span>
            </h1>
            <p className="text-xs opacity-70 mt-0.5">
              Kelola video tutorial, dokumentasi layar, dan arsip media visual Anda.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`flex items-center px-3 py-2 rounded-xl border ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'} w-full md:w-64`}>
              <FiSearch className="opacity-50 mr-2" />
              <input 
                type="text" 
                placeholder="Cari berkas video..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full"
              />
            </div>
            <div className="flex border rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'opacity-60'}`}><FiGrid size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'opacity-60'}`}><FiList size={16} /></button>
            </div>
          </div>
        </div>

        {/* INPUT UPLOAD VIDEO */}
        <div className="mt-6 pt-6 border-t border-slate-700/20">
          <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${mode === 'light' ? 'border-slate-300 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-800/50'}`}>
            <FiUpload className="text-blue-500 text-xl" />
            <div className="text-left">
              <p className="text-xs font-semibold">
                {uploading ? 'Mengunggah Video ke Supabase...' : 'Upload Video Baru (.mp4, .mkv, .webm, .mov)'}
              </p>
              <p className="text-[10px] opacity-60">Langsung simpan ke Supabase Storage</p>
            </div>
            <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      {/* AREA TAMPILAN GALERI VIDEO */}
      <div className={`min-h-[400px] p-6 rounded-2xl border transition-all ${getCardStyle()}`}>
        <div className="mb-4 text-xs opacity-70 font-medium">
          <span>Total Koleksi Video: {filteredVideos.length} Berkas</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-xs opacity-60">Memuat data video dari Supabase...</div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 text-xs">
            <FiVideo size={48} className="mb-2" />
            <p>Tidak ada berkas video yang ditemukan.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredVideos.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setActiveVideo(item)}
                className="group flex flex-col rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-transparent hover:border-blue-500/40 cursor-pointer transition relative"
              >
                {/* Thumbnail / Box Video Cover */}
                <div className="h-40 w-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                  <FiFilm className="text-white/20 absolute" size={64} />
                  
                  {/* Tombol Play Hover */}
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center z-20 shadow-lg transform transition group-hover:scale-110">
                    <FiPlay size={20} className="ml-0.5" />
                  </div>

                  <span className="absolute bottom-2 right-2 z-20 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {item.duration}
                  </span>
                </div>

                {/* Keterangan */}
                <div className="p-3 flex flex-col justify-between flex-grow">
                  <span className="text-xs font-bold truncate w-full" title={item.name}>{item.name}</span>
                  <div className="flex justify-between items-center text-[10px] opacity-50 mt-2">
                    <span>{item.size}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700/20 opacity-60">
                  <th className="pb-3 font-semibold w-10">#</th>
                  <th className="pb-3 font-semibold">Nama Berkas</th>
                  <th className="pb-3 font-semibold">Durasi</th>
                  <th className="pb-3 font-semibold">Ukuran</th>
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10">
                {filteredVideos.map((item, index) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setActiveVideo(item)}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                  >
                    <td className="py-3 font-mono opacity-50">{index + 1}</td>
                    <td className="py-3 font-bold flex items-center gap-2 truncate max-w-xs">
                      <FiPlay className="text-blue-500 shrink-0" size={12} />
                      <span className="truncate">{item.name}</span>
                    </td>
                    <td className="py-3 opacity-70">{item.duration}</td>
                    <td className="py-3 opacity-70">{item.size}</td>
                    <td className="py-3 opacity-70">{item.date}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleDeleteVideo(item.id, item.url); 
                        }}
                        className="p-1.5 hover:text-red-500 transition opacity-60 hover:opacity-100"
                        title="Hapus"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

     {/* MODAL PEMUTAR VIDEO (VIDEO PLAYER) */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className={`w-full max-w-3xl rounded-2xl p-5 border shadow-2xl relative flex flex-col ${mode === 'light' ? 'bg-white text-slate-900 border-slate-200' : 'bg-[#16222A] text-slate-100 border-slate-700'}`}>
            
            {/* Tombol Tutup */}
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
            >
              <FiX size={18} />
            </button>

            <div className="mb-3">
              <h2 className="text-sm font-bold truncate pr-10">{activeVideo.name}</h2>
              <p className="text-[10px] opacity-60">Ukuran: {activeVideo.size} • Resolusi: {activeVideo.dimension || 'Original'} • {activeVideo.date}</p>
            </div>

            {/* Elemen Video Player Utama */}
            <div className="w-full bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
              <video 
                src={activeVideo.url} 
                controls 
                autoPlay
                className="w-full max-h-[60vh] object-contain"
              />
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-700/20">
              <button 
                onClick={() => handleDeleteVideo(activeVideo.id, activeVideo.url)}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition flex items-center gap-1.5"
              >
                <FiTrash2 size={14} /> Hapus Video
              </button>

              <button 
                onClick={() => setActiveVideo(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                Tutup Pemutar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}