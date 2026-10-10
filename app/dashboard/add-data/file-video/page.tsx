'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiVideo, FiUpload, FiTrash2, FiSearch, 
  FiGrid, FiList, FiX, FiPlay, FiFolder, FiFolderPlus, FiMove, FiArrowLeft 
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
  folder_id?: string | number | null;
}

interface FolderItem {
  id: string | number;
  name: string;
}

export default function FileVideoPage() {
  const { mode } = useTheme();
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | number | 'all'>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // State untuk Manajemen Folder
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // State untuk Modal Pindah Folder Video
  const [movingVideo, setMovingVideo] = useState<VideoItem | null>(null);

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  useEffect(() => {
    fetchFoldersAndVideos();
  }, []);

  const fetchFoldersAndVideos = async () => {
    try {
      setLoading(true);
      const { data: folderData, error: folderError } = await supabase
        .from('video_folders')
        .select('*')
        .order('id', { ascending: true });

      if (folderError) throw folderError;
      if (folderData) setFolders(folderData);

      const { data: trackData, error: trackError } = await supabase
        .from('video_tracks')
        .select('*')
        .order('id', { ascending: false });

      if (trackError) throw trackError;
      if (trackData) setVideoList(trackData);
    } catch (error) {
      console.error('Gagal memuat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('video_folders')
        .insert([{ name: newFolderName.trim() }])
        .select();

      if (error) throw error;
      if (data) {
        setFolders([...folders, data[0]]);
        setNewFolderName('');
        setIsCreatingFolder(false);
      }
    } catch (error) {
      console.error('Gagal membuat folder:', error);
      alert('Gagal membuat folder baru.');
    }
  };

  const handleDeleteFolder = async (id: string | number) => {
    if (!confirm('Hapus folder ini? Video di dalamnya akan dipindahkan ke "Semua Video".')) return;

    try {
      await supabase.from('video_tracks').update({ folder_id: null }).eq('folder_id', id);
      const { error } = await supabase.from('video_folders').delete().eq('id', id);
      if (error) throw error;

      setFolders(folders.filter(f => f.id !== id));
      setVideoList(videoList.map(v => v.folder_id === id ? { ...v, folder_id: null } : v));
      if (selectedFolderId === id) setSelectedFolderId('all');
    } catch (error) {
      console.error('Gagal menghapus folder:', error);
      alert('Gagal menghapus folder.');
    }
  };

  const handleMoveVideoToFolder = async (videoId: string | number, targetFolderId: string | number | null) => {
    try {
      const { error } = await supabase.from('video_tracks').update({ folder_id: targetFolderId }).eq('id', videoId);
      if (error) throw error;
      setVideoList(videoList.map(v => v.id === videoId ? { ...v, folder_id: targetFolderId } : v));
      setMovingVideo(null);
    } catch (error) {
      console.error('Gagal memindahkan video:', error);
      alert('Gagal memindahkan video ke folder.');
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
        id: Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        duration: '--:--',
        url: publicURLData.publicUrl,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: formattedDate,
        dimension: 'Original',
        folder_id: selectedFolderId === 'all' ? null : selectedFolderId
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

const filteredVideos = videoList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Jika di "Semua Video", tampilkan video yang folder_id-nya null, undefined, atau kosong ("")
    const matchesFolder = selectedFolderId === 'all' 
      ? (item.folder_id === null || item.folder_id === undefined || item.folder_id === '') 
      : item.folder_id === selectedFolderId;

    return matchesSearch && matchesFolder;
  });

  const currentFolderName = selectedFolderId === 'all' ? 'Semua Video' : folders.find(f => f.id === selectedFolderId)?.name || 'Folder';

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
            <div className="flex border rounded-xl overflow-hidden shrink-0">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'opacity-60'}`}><FiGrid size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'opacity-60'}`}><FiList size={16} /></button>
            </div>
          </div>
        </div>

        {/* TAB NAVIGASI FOLDER DI ATAS */}
        <div className="mt-6 pt-5 border-t border-slate-700/20 flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setSelectedFolderId('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition ${
              selectedFolderId === 'all' ? 'bg-blue-600 text-white shadow' : mode === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <FiVideo size={14} />
            <span>Semua Video ({videoList.filter(v => v.folder_id === null || v.folder_id === undefined).length})</span>
          </button>

          {folders.map(folder => {
            const isSelected = selectedFolderId === folder.id;
            const count = videoList.filter(v => v.folder_id === folder.id).length;
            return (
              <button 
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition ${
                  isSelected ? 'bg-blue-600 text-white shadow' : mode === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <FiFolder size={14} />
                <span>{folder.name} ({count})</span>
              </button>
            );
          })}

          {/* Tombol Buat Folder */}
          {isCreatingFolder ? (
            <form onSubmit={handleCreateFolder} className="flex items-center gap-1">
              <input 
                type="text" 
                placeholder="Nama folder..." 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
                autoFocus
              />
              <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-xl font-medium">Buat</button>
              <button type="button" onClick={() => setIsCreatingFolder(false)} className="px-2 py-1.5 text-xs opacity-60">Batal</button>
            </form>
          ) : (
            <button 
              onClick={() => setIsCreatingFolder(true)}
              className={`px-3 py-1.5 rounded-xl border border-dashed text-xs font-medium flex items-center gap-1.5 transition ${mode === 'light' ? 'border-slate-300 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-800/50'}`}
            >
              <FiFolderPlus size={14} className="text-blue-500" />
              <span>Folder Baru</span>
            </button>
          )}
        </div>

        {/* INPUT UPLOAD VIDEO */}
        <div className="mt-6 pt-6 border-t border-slate-700/20">
          <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${mode === 'light' ? 'border-slate-300 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-800/50'}`}>
            <FiUpload className="text-blue-500 text-xl" />
            <div className="text-left">
              <p className="text-xs font-semibold">
                {uploading ? 'Mengunggah Video ke Supabase...' : `Upload Video ke: "${currentFolderName}"`}
              </p>
              <p className="text-[10px] opacity-60">Langsung simpan ke Supabase Storage</p>
            </div>
            <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      {/* AREA TAMPILAN GALERI VIDEO */}
      <div className={`min-h-[400px] p-6 rounded-2xl border transition-all ${getCardStyle()}`}>
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {selectedFolderId !== 'all' && (
              <button 
                onClick={() => setSelectedFolderId('all')}
                className="p-1.5 rounded-lg bg-slate-500/25 hover:bg-slate-500/40 transition text-xs flex items-center gap-1 font-medium"
              >
                <FiArrowLeft size={14} /> Kembali
              </button>
            )}
            <h2 className="text-sm font-bold">
              {selectedFolderId === 'all' ? 'Daftar Folder & Video Utama' : `Folder: ${currentFolderName}`}
            </h2>
          </div>
          <span className="text-xs opacity-60">{filteredVideos.length} Berkas Video</span>
        </div>

        {/* JIKA DI 'SEMUA VIDEO', TAMPILKAN KARTU FOLDER DI ATAS */}
        {selectedFolderId === 'all' && folders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-semibold opacity-60 mb-3 uppercase tracking-wider">Folder Anda</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {folders.map(folder => {
                const count = videoList.filter(v => v.folder_id === folder.id).length;
                return (
                  <div 
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`group p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      mode === 'light' ? 'border-slate-200 bg-slate-50 hover:bg-slate-100' : 'border-slate-800 bg-[#0f172a]/40 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                        <FiFolder size={20} />
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold truncate group-hover:text-blue-400 transition">{folder.name}</h4>
                        <p className="text-[10px] opacity-60">{count} Item</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} 
                        className="p-1 hover:text-red-400" title="Hapus Folder"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-b border-slate-700/20 my-6"></div>
          </div>
        )}

        <h3 className="text-xs font-semibold opacity-60 mb-3 uppercase tracking-wider">
          {selectedFolderId === 'all' ? 'Berkas Video Tanpa Folder' : `Video dalam "${currentFolderName}"`}
        </h3>

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
                {/* Thumbnail / Box Video Cover dengan Pratinjau Frame */}
                <div className="h-40 w-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
                  <video 
                    src={`${item.url}#t=0.001`}
                    preload="metadata"
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                  
                  {/* Tombol Aksi di Mode Grid (Sudut Kanan Atas) */}
                  <div className="absolute top-2 right-2 z-30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setMovingVideo(item); 
                      }}
                      className="p-2 rounded-full bg-black/60 text-white hover:bg-indigo-600 shadow-md"
                      title="Pindah Folder"
                    >
                      <FiMove size={13} />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteVideo(item.id, item.url); 
                      }}
                      className="p-2 rounded-full bg-black/60 text-white hover:bg-red-600 shadow-md"
                      title="Hapus Video"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>

                  {/* Tombol Play Hover */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform transition group-hover:scale-110">
                      <FiPlay size={20} className="ml-0.5" />
                    </div>
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
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setMovingVideo(item); 
                          }}
                          className="p-1.5 hover:text-indigo-500 transition opacity-60 hover:opacity-100"
                          title="Pindah Folder"
                        >
                          <FiMove size={13} />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleDeleteVideo(item.id, item.url); 
                          }}
                          className="p-1.5 hover:text-red-500 transition opacity-60 hover:opacity-100"
                          title="Hapus"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PINDAH FOLDER */}
      {movingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl ${mode === 'light' ? 'bg-white text-slate-800' : 'bg-[#16222A] text-slate-100 border-slate-700'}`}>
            <h3 className="text-sm font-bold mb-1">Pindahkan Berkas Video</h3>
            <p className="text-xs opacity-60 mb-4 truncate">Pilih folder tujuan untuk: <b>{movingVideo.name}</b></p>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              <button 
                onClick={() => handleMoveVideoToFolder(movingVideo.id, null)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${!movingVideo.folder_id ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/10'}`}
              >
                <span>Tanpa Folder (Semua Video)</span>
              </button>
              {folders.map(folder => (
                <button 
                  key={folder.id}
                  onClick={() => handleMoveVideoToFolder(movingVideo.id, folder.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${movingVideo.folder_id === folder.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/10'}`}
                >
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setMovingVideo(null)} className="px-4 py-2 bg-slate-500/20 rounded-xl text-xs font-medium">Batal</button>
            </div>
          </div>
        </div>
      )}

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
              <p className="text-[10px] opacity-60">
                Ukuran: {activeVideo.size} | Resolusi: {activeVideo.dimension || 'Original'} | Tanggal: {activeVideo.date}
              </p>
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