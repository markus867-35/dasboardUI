'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiVideo, FiUpload, FiTrash2, FiSearch, 
  FiGrid, FiList, FiX, FiPlay, FiFolder, FiFolderPlus, FiSkipBack,FiEdit2, FiSkipForward ,FiMove, FiArrowLeft 
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
  const { mode, colorTheme, getThemeClasses } = useTheme();
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | number | 'all'>('all');
  const [modalSize, setModalSize] = useState<'normal' | 'small' | 'large'>('normal');
const [isDragging, setIsDragging] = useState(false);
const [position, setPosition] = useState({ x: 0, y: 0 });
const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
const [editingFolderId, setEditingFolderId] = useState<string | number | null>(null);
const [editedFolderName, setEditedFolderName] = useState('');
const [videoDimensions, setVideoDimensions] = useState({ width: 700, height: 500 });
const [editingVideoId, setEditingVideoId] = useState<string | number | null>(null);
const [editedVideoName, setEditedVideoName] = useState('');
const [youtubeInputUrl, setYoutubeInputUrl] = useState('');



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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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

const handleUpdateFolder = async (id: string | number) => {
  if (!editedFolderName.trim()) return;

  try {
    const { error } = await supabase
      .from('video_folders')
      .update({ name: editedFolderName.trim() })
      .eq('id', id);

    if (error) throw error;
    
    // Perbarui state lokal dengan benar
    setFolders(folders.map(f => f.id === id ? { ...f, name: editedFolderName.trim() } : f));
    setEditingFolderId(null);
  } catch (error: any) {
    console.error('Gagal mengubah nama folder:', error);
    alert('Gagal mengubah nama folder.');
  }
};




  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, dragStart]);


  // Letakkan useEffect ini di tingkat atas komponen utama FileVideoPage (bukan di dalam modal)
useEffect(() => {
  if (!activeVideo) return;

  // Buat objek video sementara di memori untuk membaca ukuran aslinya secara instan
  const tempVideo = document.createElement('video');
  tempVideo.src = activeVideo.url;
  
  tempVideo.onloadedmetadata = () => {
    const vWidth = tempVideo.videoWidth;
    const vHeight = tempVideo.videoHeight;
    
    if (!vWidth || !vHeight) return;

    const maxWidth = window.innerWidth * 0.85;
    const maxHeight = window.innerHeight * 0.85;
    
    let width = vWidth;
    let height = vHeight;
    
    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (maxHeight / height) * width;
      height = maxHeight;
    }
    
    setVideoDimensions({ width: Math.round(width), height: Math.round(height + 110) });
  };
}, [activeVideo]);


const handleUpdateVideoName = async (id: string | number) => {
  if (!editedVideoName.trim()) {
    setEditingVideoId(null);
    return;
  }

  try {
    const { error } = await supabase
      .from('video_tracks') // Sesuaikan dengan nama tabel database Anda (misal: video_tracks atau music_tracks)
      .update({ name: editedVideoName.trim() })
      .eq('id', id);

    if (error) throw error;

    // Perbarui state lokal agar langsung berubah tanpa perlu refresh
    setVideoList(videoList.map(v => v.id === id ? { ...v, name: editedVideoName.trim() } : v));
    setEditingVideoId(null);
    setEditedVideoName('');
  } catch (error: any) {
    console.error('Gagal mengubah nama video:', error);
    alert('Terjadi kesalahan saat mengubah nama video.');
  }
};


const handleSaveYouTubeLink = async () => {
  if (!youtubeInputUrl) return;
  setUploading(true);

  try {
    // Simpan ke Supabase database (bukan storage)
    const { error } = await supabase
      .from('video_tracks')
      .insert([
        { 
          name: 'Video YouTube', 
          url: youtubeInputUrl, // Link YouTube masuk ke kolom url
          size: 'YouTube',
          folder_id: selectedFolderId === 'all' ? null : selectedFolderId,
          date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        }
      ]);

    if (error) throw error;

    alert('Link video berhasil ditambahkan!');
    setYoutubeInputUrl('');
    // Panggil ulang fungsi fetch data video Anda di sini agar galeri ter-refresh
  } catch (error: any) {
    console.error('Gagal menyimpan:', error.message);
  } finally {
    setUploading(false);
  }
};

  
  return (
    <div className="p-0 space-y-6 max-w-[1700px] mx-auto">
      
      {/* HEADER & TOOLBAR */}
      <div className={`p-5 rounded-2xl border transition-colors ${getCardStyle()}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              File Video <span className="text-xs font-normal opacity-60">/ Pustaka Video & Rekaman </span>
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
<div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-700/20">
  {/* Kontainer dengan horizontal scroll di mobile dan wrap normal di desktop */}
  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap">
    
    <button 
      onClick={() => setSelectedFolderId('all')}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 transition ${
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
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 transition ${
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
      <form onSubmit={handleCreateFolder} className="flex items-center gap-1 shrink-0">
        <input 
          type="text" 
          placeholder="Nama folder..." 
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className={`px-3 py-1.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
          autoFocus
        />
        <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-xl font-medium shrink-0">Buat</button>
        <button type="button" onClick={() => setIsCreatingFolder(false)} className="px-2 py-1.5 text-xs opacity-60 shrink-0">Batal</button>
      </form>
    ) : (
      <button 
        onClick={() => setIsCreatingFolder(true)}
        className={`px-3 py-1.5 rounded-xl border border-dashed text-xs font-medium flex items-center gap-1.5 shrink-0 transition ${mode === 'light' ? 'border-slate-300 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-800/50'}`}
      >
        <FiFolderPlus size={14} className="text-blue-500" />
        <span>Folder Baru</span>
      </button>
    )}
  </div>
</div>




{/* INPUT LINK YOUTUBE (MENGGANTIKAN UPLOAD FILE SUPABASE) */}
<div className="mt-6 pt-6 border-t border-slate-700/20">
  <div className={`p-4 rounded-xl border-2 border-dashed transition ${mode === 'light' ? 'border-slate-300 bg-slate-50' : 'border-slate-700 bg-slate-800/50'}`}>
    <div className="flex items-center gap-3 mb-2">
      <FiUpload className="text-blue-500 text-xl shrink-0" />
      <div>
        <p className="text-xs font-semibold">
          Tambah Video ke Folder: "{currentFolderName}"
        </p>
        <p className="text-[10px] opacity-60">
          Masukkan link YouTube (Unlisted/Publik) untuk menghemat kuota Supabase.
        </p>
      </div>
    </div>

    {/* Form Input untuk Link YouTube */}
    <div className="flex gap-2 mt-3">
      <input 
        type="text" 
        placeholder="Tempel link YouTube di sini (cth: https://youtu.be/...)" 
        value={youtubeInputUrl}
        onChange={(e) => setYoutubeInputUrl(e.target.value)}
        className={`flex-1 px-3 py-2 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
      />
      <button 
        type="button"
        onClick={handleSaveYouTubeLink} // Fungsi untuk menyimpan ke tabel video_tracks
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl font-medium shrink-0 transition"
      >
        {uploading ? 'Menyimpan...' : 'Simpan Video'}
      </button>
    </div>
  </div>
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
    
    {/* Diubah menjadi flex horizontal scroll di mobile dan grid kembali di layar sm ke atas */}
    <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-2 sm:overflow-visible scrollbar-none">
      {folders.map(folder => {
        const count = videoList.filter(v => v.folder_id === folder.id).length;
        const isEditing = editingFolderId === folder.id;

        return (
          <div 
            key={folder.id}
            onClick={() => {
              if (!isEditing) setSelectedFolderId(folder.id);
            }}
            className={`group p-4 rounded-xl border cursor-pointer transition flex items-center justify-between shrink-0 w-[240px] sm:w-auto ${
              mode === 'light' ? 'border-slate-200 bg-slate-50 hover:bg-slate-100' : 'border-slate-800 bg-[#0f172a]/40 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden w-full">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <FiFolder size={20} />
              </div>

              <div className="truncate w-full">
                {isEditing ? (
                  /* FORM INPUT SAAT DI-EDIT */
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="text" 
                      value={editedFolderName}
                      onChange={(e) => setEditedFolderName(e.target.value)}
                      className={`w-full px-2 py-1 rounded border text-xs outline-none ${
                        mode === 'light' ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                      autoFocus
                    />
                    <button 
                      onClick={() => handleUpdateFolder(folder.id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-medium shrink-0"
                    >
                      Simpan
                    </button>
                    <button 
                      onClick={() => setEditingFolderId(null)}
                      className="px-1.5 py-1 text-[10px] opacity-60 hover:opacity-100 shrink-0"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  /* TAMPILAN NORMAL NAMA FOLDER */
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between group/name">
                    <div className="truncate">
                      <h4 
                        onClick={() => setSelectedFolderId(folder.id)}
                        className="text-xs font-bold truncate group-hover:text-blue-400 transition"
                      >
                        {folder.name}
                      </h4>
                      <p className="text-[10px] opacity-60">{count} Item</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TOMBOL AKSI EDIT & HAPUS (MUNCUL SAAT HOVER) */}
            {!isEditing && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditingFolderId(folder.id); 
                    setEditedFolderName(folder.name); 
                  }} 
                  className="p-1 hover:text-blue-400" 
                  title="Edit Nama Folder"
                >
                  <FiEdit2 size={13} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} 
                  className="p-1 hover:text-red-400" 
                  title="Hapus Folder"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
    <div className="border-b border-slate-700/20 my-6"></div>
  </div>
)}











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
               {/* Thumbnail / Box Video Cover dengan Pengecekan YouTube */}
<div className="h-40 w-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
  {item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be')) ? (
    // Jika link YouTube, tampilkan thumbnail embed atau iframe kecil
    <div className="w-full h-full relative pointer-events-none">
      <iframe
        src={`https://www.youtube.com/embed/${
          item.url.includes('/shorts/') 
            ? item.url.split('/shorts/')[1]?.split('?')[0] 
            : item.url.split('v=')[1]?.split('&')[0]
        }?controls=0&disablekb=1&modestbranding=1`}
        className="w-full h-full scale-125 object-cover"
        title={item.name}
      />
    </div>
  ) : (
    // Jika file video biasa dari Supabase Storage
    <video 
      src={`${item.url}#t=0.001`}
      preload="metadata"
      muted
      playsInline
      className="w-full h-full object-cover"
    />
  )}

  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
  
  {/* Tombol Aksi di Mode Grid (Sudut Kanan Atas) */}
  <div className="absolute top-2 right-2 z-30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
    <button 
      onClick={(e) => { 
        e.stopPropagation(); 
        setEditingVideoId(item.id);
        setEditedVideoName(item.name);
      }} 
      className="p-2 rounded-full bg-black/60 text-white hover:bg-blue-600 shadow-md"
      title="Ubah Nama"
    >
      <FiEdit2 size={13} />
    </button>
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

                {/* Keterangan & Form Edit Nama */}
                <div className="p-3 flex flex-col justify-between flex-grow">
                  {editingVideoId === item.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="text"
                        value={editedVideoName}
                        onChange={(e) => setEditedVideoName(e.target.value)}
                        className="px-2 py-1 text-xs border rounded bg-slate-800 text-white outline-none w-full"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleUpdateVideoName(item.id)}
                        className="px-2 py-1 bg-blue-600 text-white text-[10px] rounded shrink-0"
                      >
                        Simpan
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold truncate w-full" title={item.name}>{item.name}</span>
                  )}

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
                    <td className="py-3 font-bold truncate max-w-xs">
                      {editingVideoId === item.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="text"
                            value={editedVideoName}
                            onChange={(e) => setEditedVideoName(e.target.value)}
                            className="px-2 py-1 text-xs border rounded bg-slate-800 text-white outline-none w-full"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleUpdateVideoName(item.id)}
                            className="px-2 py-1 bg-blue-600 text-white text-[10px] rounded shrink-0"
                          >
                            Simpan
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 truncate">
                          <FiPlay className="text-blue-500 shrink-0" size={12} />
                          <span className="truncate">{item.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 opacity-70">{item.duration}</td>
                    <td className="py-3 opacity-70">{item.size}</td>
                    <td className="py-3 opacity-70">{item.date}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingVideoId(item.id);
                            setEditedVideoName(item.name);
                          }} 
                          className="p-1.5 hover:text-blue-500 transition opacity-60 hover:opacity-100"
                          title="Ubah Nama"
                        >
                          <FiEdit2 size={13} />
                        </button>
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











{/* MODAL PEMUTAR VIDEO */}
{activeVideo && (() => {
  const currentVideoIndex = filteredVideos.findIndex(v => v.id === activeVideo.id);
  
  const handleNextVideo = () => {
    if (filteredVideos.length === 0) return;
    const nextIndex = (currentVideoIndex + 1) % filteredVideos.length;
    setActiveVideo(filteredVideos[nextIndex]);
  };

  const handlePrevVideo = () => {
    if (filteredVideos.length === 0) return;
    const prevIndex = (currentVideoIndex - 1 + filteredVideos.length) % filteredVideos.length;
    setActiveVideo(filteredVideos[prevIndex]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const vWidth = e.currentTarget.videoWidth;
    const vHeight = e.currentTarget.videoHeight;
    console.log("Resolusi Asli Video:", vWidth, vHeight);
    
    const maxWidth = window.innerWidth * 0.85;
    const maxHeight = window.innerHeight * 0.85;
    
    let width = vWidth;
    let height = vHeight;
    
    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (maxHeight / height) * width;
      height = maxHeight;
    }
    
    setVideoDimensions({ width: Math.round(width), height: Math.round(height + 110) });
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 pointer-events-none">
      <div 
        id="video-modal-container"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: modalSize === 'small' ? '320px' : modalSize === 'large' ? '95vw' : `${videoDimensions.width}px`,
          height: modalSize === 'small' ? '300px' : modalSize === 'large' ? '95vh' : `${videoDimensions.height}px`,
          resize: 'both',
          overflow: 'auto',
        }}
        className={`rounded-2xl p-4 border shadow-2xl relative flex flex-col pointer-events-auto select-none ${
          mode === 'light' ? 'bg-transparent text-slate-900 border-slate-200' : 'bg-transparent text-slate-100 border-slate-700'
        }`}
      >
        
        {/* AREA HEADER */}
        <div 
          onMouseDown={handleMouseDown}
          className="cursor-move flex items-center justify-between mb-2 pb-2 border-b border-slate-700/20 select-none shrink-0 relative z-30"
          title="Klik dan tahan di sini untuk menggeser jendela"
        >
          <div className="pr-20 overflow-hidden">
            <h2 className="text-xs font-bold truncate">{activeVideo.name}</h2>
            <p className="text-[9px] opacity-60">Geser jendela dari bagian atas ini</p>
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm p-1 rounded-full text-white shrink-0 relative z-30">
            <button 
              onClick={(e) => { e.stopPropagation(); setModalSize(modalSize === 'small' ? 'normal' : 'small'); }} 
              className="px-2 py-0.5 text-[10px] rounded hover:bg-white/20 transition cursor-pointer"
            >
              {modalSize === 'small' ? 'Restore' : 'Minimize'}
            </button>
            
            {/* Tombol Full Screen Browser */}
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                const modalElement = document.getElementById('video-modal-container');
                if (!document.fullscreenElement && modalElement) {
                  modalElement.requestFullscreen().catch((err: any) => {
                    console.error("Gagal masuk mode fullscreen:", err);
                  });
                } else {
                  document.exitFullscreen();
                }
              }} 
              className="px-2 py-0.5 text-[10px] rounded hover:bg-white/20 transition cursor-pointer"
            >
              Full Screen
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); setPosition({ x: 0, y: 0 }); setActiveVideo(null); }}
              className="p-1 rounded-full hover:bg-red-600 transition cursor-pointer"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>

        {/* ELEMEN VIDEO PLAYER UTAMA */}
        <div className="w-full flex-1 min-h-0 bg-transparent rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative group">
          <iframe
            src={`https://www.youtube.com/embed/${
              activeVideo.url.includes('/shorts/') 
                ? activeVideo.url.split('/shorts/')[1]?.split('?')[0] 
                : activeVideo.url.split('v=')[1]?.split('&')[0]
            }?autoplay=1&enablejsapi=1`}
            className="w-full h-full relative z-10"
            title={activeVideo.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          
          <button 
            onClick={handlePrevVideo} 
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition shadow-lg z-20"
            title="Video Sebelumnya"
          >
            <FiSkipBack size={20} />
          </button>
          <button 
            onClick={handleNextVideo} 
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition shadow-lg z-20"
            title="Video Selanjutnya"
          >
            <FiSkipForward size={20} />
          </button>
        </div>

        {/* TOMBOL NAVIGASI BAWAH */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-700/20 text-xs shrink-0 z-30">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handlePrevVideo}
              className="px-2.5 py-1 rounded-lg bg-slate-500/20 hover:bg-slate-500/30 transition flex items-center gap-1 text-[11px]"
            >
              <FiSkipBack size={12} /> Prev
            </button>
            <button 
              onClick={handleNextVideo}
              className="px-2.5 py-1 rounded-lg bg-slate-500/20 hover:bg-slate-500/30 transition flex items-center gap-1 text-[11px]"
            >
              Next <FiSkipForward size={12} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => handleDeleteVideo(activeVideo.id, activeVideo.url)}
              className="px-2.5 py-1 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition flex items-center gap-1 text-[11px]"
            >
              <FiTrash2 size={12} /> Hapus
            </button>

            <button 
              onClick={() => { setPosition({ x: 0, y: 0 }); setActiveVideo(null); }}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition text-[11px]"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
})()}

    </div>
  );
}