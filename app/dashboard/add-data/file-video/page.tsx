'use client';
import { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiVideo, FiUpload, FiTrash2, FiSearch, 
  FiGrid, FiList, FiX, FiPlay, FiFilm 
} from 'react-icons/fi';

interface VideoItem {
  id: string;
  name: string;
  duration: string;
  url: string; // URL file video
  size: string;
  date: string;
  dimension?: string;
}

const initialVideos: VideoItem[] = [
  { id: '1', name: 'Next.js 15 Full Course Tutorial', duration: '12:45', url: 'https://www.w3schools.com/html/mov_bbb.mp4', size: '45.2 MB', date: '22 Sep 2026', dimension: '1920x1080' },
  { id: '2', name: 'Supabase Realtime Database Demo', duration: '08:20', url: 'https://www.w3schools.com/html/mov_bbb.mp4', size: '28.6 MB', date: '21 Sep 2026', dimension: '1280x720' },
  { id: '3', name: 'Tailwind CSS UI Animation Showcase', duration: '04:15', url: 'https://www.w3schools.com/html/mov_bbb.mp4', size: '15.4 MB', date: '20 Sep 2026', dimension: '1920x1080' },
  { id: '4', name: 'Python Web Scraping Automation', duration: '15:30', url: 'https://www.w3schools.com/html/mov_bbb.mp4', size: '62.1 MB', date: '19 Sep 2026', dimension: '1280x720' },
];

export default function FileVideoPage() {
  const { mode } = useTheme();
  const [videoList, setVideoList] = useState<VideoItem[]>(initialVideos);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  // Handler Upload Berkas Video Lokal
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const videoUrl = URL.createObjectURL(file);

      const newVideo: VideoItem = {
        id: Date.now().toString(),
        name: file.name,
        duration: '--:--',
        url: videoUrl,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: 'Baru saja',
        dimension: 'Original'
      };

      setVideoList([newVideo, ...videoList]);
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
              File Video <span className="text-xs font-normal opacity-60">/ Pustaka Video & Rekaman</span>
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
              <p className="text-xs font-semibold">Upload Video Baru</p>
              <p className="text-[10px] opacity-60">Pilih file video (.mp4, .mkv, .webm, .mov)</p>
            </div>
            <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* AREA TAMPILAN GALERI VIDEO */}
      <div className={`min-h-[400px] p-6 rounded-2xl border transition-all ${getCardStyle()}`}>
        <div className="mb-4 text-xs opacity-70 font-medium">
          <span>Total Koleksi Video: {filteredVideos.length} Berkas</span>
        </div>

        {filteredVideos.length === 0 ? (
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
                          setVideoList(videoList.filter(v => v.id !== item.id)); 
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
              <p className="text-[10px] opacity-60">Ukuran: {activeVideo.size} • Resolusi: {activeVideo.dimension} • {activeVideo.date}</p>
            </div>

            {/* Elemen Video Player Utama yang Diperbaiki */}
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
                onClick={() => {
                  setVideoList(videoList.filter(v => v.id !== activeVideo.id));
                  setActiveVideo(null);
                }}
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