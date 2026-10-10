'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiMusic, FiUpload, FiTrash2, FiSearch, 
  FiGrid, FiList, FiX, FiPlay, FiPause, FiDisc, FiDownload, FiLink, FiSave,
  FiFolder, FiFolderPlus, FiEdit2, FiMove, FiChevronRight, FiArrowLeft,
  FiSkipBack, FiSkipForward, FiFastForward, FiRewind
} from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

interface MusicItem {
  id: string | number;
  name: string;
  artist: string;
  duration: string;
  url: string;
  size: string;
  date: string;
  folder_id?: string | number | null;
}

interface FolderItem {
  id: string | number;
  name: string;
}

export default function FileMusicPage() {
  const { mode } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | number | 'all'>('all');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // State untuk Input Link Audio URL
  const [audioUrlInput, setAudioUrlInput] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);

  // State untuk Manajemen Folder
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | number | null>(null);
  const [editedFolderName, setEditedFolderName] = useState('');

  // State untuk Modal Pindah Folder Musik
  const [movingTrack, setMovingTrack] = useState<MusicItem | null>(null);
  
  // State Pemutar Musik Aktif
  const [activeAudio, setActiveAudio] = useState<MusicItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // State Khusus Pop-up (HANYA AKTIF SAAT IKON DIKLIK)
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  useEffect(() => {
    fetchFoldersAndMusic();
  }, []);

  const fetchFoldersAndMusic = async () => {
    try {
      setLoading(true);
      const { data: folderData, error: folderError } = await supabase
        .from('music_folders')
        .select('*')
        .order('id', { ascending: true });

      if (folderError) throw folderError;
      if (folderData) setFolders(folderData);

      const { data: trackData, error: trackError } = await supabase
        .from('music_tracks')
        .select('*')
        .order('id', { ascending: false });

      if (trackError) throw trackError;
      if (trackData) setMusicList(trackData);
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
        .from('music_folders')
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

  const handleUpdateFolder = async (id: string | number) => {
    if (!editedFolderName.trim()) return;

    try {
      const { error } = await supabase
        .from('music_folders')
        .update({ name: editedFolderName.trim() })
        .eq('id', id);

      if (error) throw error;
      setFolders(folders.map(f => f.id === id ? { ...f, name: editedFolderName.trim() } : f));
      setEditingFolderId(null);
    } catch (error) {
      console.error('Gagal mengubah nama folder:', error);
      alert('Gagal mengubah nama folder.');
    }
  };

  const handleDeleteFolder = async (id: string | number) => {
    if (!confirm('Hapus folder ini? Musik di dalamnya akan dipindahkan ke "Semua Musik".')) return;

    try {
      await supabase.from('music_tracks').update({ folder_id: null }).eq('folder_id', id);
      const { error } = await supabase.from('music_folders').delete().eq('id', id);
      if (error) throw error;

      setFolders(folders.filter(f => f.id !== id));
      setMusicList(musicList.map(m => m.folder_id === id ? { ...m, folder_id: null } : m));
      if (selectedFolderId === id) setSelectedFolderId('all');
    } catch (error) {
      console.error('Gagal menghapus folder:', error);
      alert('Gagal menghapus folder.');
    }
  };

  const handleMoveTrackToFolder = async (trackId: string | number, targetFolderId: string | number | null) => {
    try {
      const { error } = await supabase.from('music_tracks').update({ folder_id: targetFolderId }).eq('id', trackId);
      if (error) throw error;
      setMusicList(musicList.map(m => m.id === trackId ? { ...m, folder_id: targetFolderId } : m));
      setMovingTrack(null);
    } catch (error) {
      console.error('Gagal memindahkan lagu:', error);
      alert('Gagal memindahkan lagu ke folder.');
    }
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('music-files').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: publicURLData } = supabase.storage.from('music-files').getPublicUrl(fileName);
      const formattedDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

      const newTrack = {
        name: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Unknown Artist',
        duration: '--:--',
        url: publicURLData.publicUrl,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: formattedDate,
        folder_id: selectedFolderId === 'all' ? null : selectedFolderId
      };

      const { data, error: insertError } = await supabase.from('music_tracks').insert([newTrack]).select();
      if (insertError) throw insertError;
      if (data) setMusicList([data[0], ...musicList]);
    } catch (error) {
      console.error('Gagal mengupload musik:', error);
      alert('Terjadi kesalahan saat mengupload musik.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioUrlInput.trim()) return alert('Silakan masukkan link audio!');

    try {
      setSavingUrl(true);
      const formattedDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      const urlObj = new URL(audioUrlInput);
      const defaultName = urlObj.pathname.split('/').pop() || 'External Audio Track';

      const newTrack = {
        name: decodeURIComponent(defaultName.replace(/\.[^/.]+$/, "")),
        artist: urlObj.hostname,
        duration: '--:--',
        url: audioUrlInput.trim(),
        size: 'Streaming',
        date: formattedDate,
        folder_id: selectedFolderId === 'all' ? null : selectedFolderId
      };

      const { data, error } = await supabase.from('music_tracks').insert([newTrack]).select();
      if (error) throw error;
      if (data) {
        setMusicList([data[0], ...musicList]);
        setAudioUrlInput('');
      }
    } catch (error) {
      console.error('Gagal menyimpan link:', error);
      alert('URL tidak valid.');
    } finally {
      setSavingUrl(false);
    }
  };

  const handleDeleteMusic = async (id: string | number, fileUrl: string) => {
    if (!confirm('Hapus musik ini?')) return;
    try {
      await supabase.from('music_tracks').delete().eq('id', id);
      if (activeAudio?.id === id) {
        audioRef.current?.pause();
        setActiveAudio(null);
        setIsPlaying(false);
        setIsPopupOpen(false);
      }
      setMusicList(musicList.filter(item => item.id !== id));
    } catch (error) {
      console.error('Gagal menghapus musik:', error);
    }
  };

  // Memutar / Menjedakan Lagu tanpa Membuka Pop-up
  const togglePlayAudio = (item: MusicItem) => {
    if (activeAudio?.id === item.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(err => console.log(err));
        setIsPlaying(true);
      }
    } else {
      setActiveAudio(item);
      setIsPlaying(true);
    }
  };

  // HANYA MEMUNCULKAN POP-UP KETIKA IKON MUSIK DIKLIK EKSPLISIT
  const handleIconClickOpenPopup = (item: MusicItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAudio(item);
    setIsPlaying(true);
    setIsPopupOpen(true); // Membuka pop-up khusus klik ikon
  };

  // Lagu Otomatis Mengganti Selanjutnya Tanpa Buka Pop-up
  const handleNextTrack = () => {
    if (!activeAudio || filteredMusic.length === 0) return;
    const currentIndex = filteredMusic.findIndex(m => m.id === activeAudio.id);
    const nextIndex = (currentIndex + 1) % filteredMusic.length;
    setActiveAudio(filteredMusic[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    if (!activeAudio || filteredMusic.length === 0) return;
    const currentIndex = filteredMusic.findIndex(m => m.id === activeAudio.id);
    const prevIndex = (currentIndex - 1 + filteredMusic.length) % filteredMusic.length;
    setActiveAudio(filteredMusic[prevIndex]);
    setIsPlaying(true);
  };

  const skipTime = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(Math.max(audioRef.current.currentTime + amount, 0), duration);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    if (activeAudio && audioRef.current) {
      audioRef.current.load();
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [activeAudio]);

  const filteredMusic = musicList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolderId === 'all' 
      ? (item.folder_id === null || item.folder_id === undefined) 
      : item.folder_id === selectedFolderId;

    return matchesSearch && matchesFolder;
  });

  const currentFolderName = selectedFolderId === 'all' ? 'Semua Musik' : folders.find(f => f.id === selectedFolderId)?.name || 'Folder';

  return (
    <div className="p-6 space-y-6 relative">
      
      {/* HEADER & TOOLBAR */}
      <div className={`p-5 rounded-2xl border transition-colors ${getCardStyle()}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              File Music <span className="text-xs font-normal opacity-60">/ Pustaka Audio Supabase</span>
            </h1>
            <p className="text-xs opacity-70 mt-0.5">Kelola berkas audio, folder, dan trek musik latar.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`flex items-center px-3 py-2 rounded-xl border ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'} w-full md:w-64`}>
              <FiSearch className="opacity-50 mr-2" />
              <input 
                type="text" 
                placeholder="Cari musik..." 
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
            <FiMusic size={14} />
            <span>Semua Musik ({musicList.length})</span>
          </button>

          {folders.map(folder => {
            const isSelected = selectedFolderId === folder.id;
            const count = musicList.filter(m => m.folder_id === folder.id).length;
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

        {/* AREA UPLOAD & LINK */}
        <div className="mt-6 pt-6 border-t border-slate-700/20 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${mode === 'light' ? 'border-slate-300 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-800/50'}`}>
            <FiUpload className="text-blue-500 text-xl shrink-0" />
            <div className="text-left overflow-hidden">
              <p className="text-xs font-semibold truncate">{uploading ? 'Mengunggah...' : `Upload ke Folder: "${currentFolderName}"`}</p>
              <p className="text-[10px] opacity-60">Pilih file audio (.mp3, .wav)</p>
            </div>
            <input type="file" accept="audio/*" onChange={handleMusicUpload} disabled={uploading} className="hidden" />
          </label>

          <form onSubmit={handleUrlSubmit} className={`flex flex-col justify-center p-4 rounded-xl border-2 border-dashed ${mode === 'light' ? 'border-slate-300 bg-slate-50/50' : 'border-slate-700 bg-slate-800/20'}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <FiLink className="text-indigo-500 shrink-0" size={14} />
              <span className="text-xs font-semibold">Simpan Link Audio ke: "{currentFolderName}"</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="url" 
                placeholder="https://contoh.com/audio.mp3"
                value={audioUrlInput}
                onChange={(e) => setAudioUrlInput(e.target.value)}
                disabled={savingUrl}
                className={`flex-grow px-3 py-2 rounded-lg border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              />
              <button type="submit" disabled={savingUrl} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium shrink-0">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      {/* AREA UTAMA KONTEN */}
      <div className={`min-h-[400px] p-6 rounded-2xl border transition-all ${getCardStyle()}`}>
        
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {selectedFolderId !== 'all' && (
              <button 
                onClick={() => setSelectedFolderId('all')}
                className="p-1.5 rounded-lg bg-slate-500/20 hover:bg-slate-500/30 transition text-xs flex items-center gap-1"
              >
                <FiArrowLeft size={14} /> Kembali
              </button>
            )}
            <h2 className="text-sm font-bold">
              {selectedFolderId === 'all' ? 'Daftar Folder & Musik' : `Folder: ${currentFolderName}`}
            </h2>
          </div>
          <span className="text-xs opacity-60">{filteredMusic.length} Trek Musik</span>
        </div>

        {/* FOLDER DAFTAR + KOTAK PEMUTAR KANAN */}
        {selectedFolderId === 'all' && (
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bagian Kiri: Folder */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold opacity-60 mb-3 uppercase tracking-wider">Folder Anda</h3>
              {folders.length === 0 ? (
                <div className="text-xs opacity-50 py-4">Belum ada folder.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {folders.map(folder => {
                    const count = musicList.filter(m => m.folder_id === folder.id).length;
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
              )}
            </div>

            {/* Bagian Kanan: KOTAK PANEL MIN PLAYER UTAMA */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between shadow-inner ${
              mode === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0f172a]/60 border-slate-700/80'
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-700/20">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <FiDisc className="text-blue-500 animate-spin" size={14} /> Pemutar Musik Aktif
                </span>
                <span className="text-[10px] opacity-60">{activeAudio ? activeAudio.name : 'Standby'}</span>
              </div>

              {activeAudio ? (
                <div className="py-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow ${isPlaying ? 'animate-pulse' : ''}`}>
                      <FiDisc size={22} className={isPlaying ? 'animate-spin' : ''} />
                    </div>
                    <div className="truncate flex-grow">
                      <h4 className="text-xs font-bold truncate">{activeAudio.name}</h4>
                      <p className="text-[10px] opacity-60 truncate">{activeAudio.artist}</p>
                    </div>
                  </div>

                  {/* Progress Bar & Durasi */}
                  <div className="space-y-1">
                    <input 
                      type="range" 
                      min={0} 
                      max={duration || 100} 
                      value={currentTime} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCurrentTime(val);
                        if (audioRef.current) audioRef.current.currentTime = val;
                      }}
                      className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] opacity-60">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Tombol Kontrol Langsung di Kotak */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button onClick={handlePrevTrack} className="p-2 rounded-full bg-slate-500/20 hover:bg-slate-500/30 transition" title="Sebelumnya">
                      <FiSkipBack size={14} />
                    </button>
                    <button onClick={() => skipTime(-10)} className="px-2 py-1 rounded-lg bg-slate-500/20 hover:bg-slate-500/30 text-[10px] font-semibold" title="Mundur 10s">
                      -10s
                    </button>
                    <button 
                      onClick={() => togglePlayAudio(activeAudio)} 
                      className="p-3 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 transition"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} className="ml-0.5" />}
                    </button>
                    <button onClick={() => skipTime(10)} className="px-2 py-1 rounded-lg bg-slate-500/20 hover:bg-slate-500/30 text-[10px] font-semibold" title="Maju 10s">
                      +10s
                    </button>
                    <button onClick={handleNextTrack} className="p-2 rounded-full bg-slate-500/20 hover:bg-slate-500/30 transition" title="Selanjutnya">
                      <FiSkipForward size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center opacity-60 text-xs">
                  <FiMusic size={28} className="mb-2 opacity-40" />
                  <p>Belum ada musik diputar.<br/>Klik lagu untuk memutar langsung.</p>
                </div>
              )}

              {/* Selector Kecepatan di Kotak */}
              <div className="border-t pt-2 border-slate-700/20 flex items-center justify-between">
                <span className="text-[10px] opacity-60">Kecepatan:</span>
                <div className="flex gap-1">
                  {[1, 1.25, 1.5, 2].map(speed => (
                    <button 
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${playbackSpeed === speed ? 'bg-blue-600 text-white' : 'bg-slate-500/10 hover:bg-slate-500/20'}`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        <div className="border-b border-slate-700/20 my-6"></div>

        <h3 className="text-xs font-semibold opacity-60 mb-3 uppercase tracking-wider">
          {selectedFolderId === 'all' ? 'Semua Berkas Musik' : `Musik dalam "${currentFolderName}"`}
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-xs opacity-60">Memuat data...</div>
        ) : filteredMusic.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 opacity-50 text-xs">
            <FiMusic size={36} className="mb-2" />
            <p>Tidak ada berkas musik di sini.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMusic.map((item) => {
              const isCurrent = activeAudio?.id === item.id && isPlaying;
              return (
                <div 
                  key={item.id} 
                  className={`group flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition relative ${
                    isCurrent ? 'border-blue-500 bg-blue-500/10' : mode === 'light' ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-800 bg-[#0f172a]/50 hover:bg-slate-800/50'
                  }`}
                >
                  {/* KLIK IKON MUSIK -> HANYA DENGAN INI POP-UP MUNCUL */}
                  <button 
                    onClick={(e) => handleIconClickOpenPopup(item, e)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow transition transform group-hover:scale-105 ${isCurrent ? 'bg-blue-600 animate-pulse' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}
                    title="Klik untuk membuka Pop-up Pemutar Musik"
                  >
                    {isCurrent ? <FiPause size={16} /> : <FiMusic size={16} />}
                  </button>

                  {/* KLIK NAMA LAGU -> MEMUTAR LAGU DI KOTAK KANAN TANPA MEMBUKA POP-UP */}
                  <div className="flex flex-col overflow-hidden flex-grow" onClick={() => togglePlayAudio(item)}>
                    <span className="text-xs font-bold truncate w-full" title={item.name}>{item.name}</span>
                    <span className="text-[10px] opacity-60 truncate w-full">{item.artist}</span>
                  </div>

                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={(e) => { e.stopPropagation(); setMovingTrack(item); }} className="p-1.5 bg-black/50 hover:bg-indigo-600 text-white rounded-lg" title="Pindah Folder">
                      <FiMove size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteMusic(item.id, item.url); }} className="p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-lg" title="Hapus">
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700/20 opacity-60">
                  <th className="pb-3 w-10">Icon</th>
                  <th className="pb-3">Judul Trek</th>
                  <th className="pb-3">Artis</th>
                  <th className="pb-3">Tanggal</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10">
                {filteredMusic.map((item) => {
                  const isCurrent = activeAudio?.id === item.id && isPlaying;
                  return (
                    <tr key={item.id} className={`hover:bg-black/5 dark:hover:bg-white/5 transition ${isCurrent ? 'bg-blue-500/5' : ''}`}>
                      <td className="py-2.5">
                        {/* KLIK IKON MUSIK -> HANYA DENGAN INI POP-UP MUNCUL */}
                        <button 
                          onClick={(e) => handleIconClickOpenPopup(item, e)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-white transition ${isCurrent ? 'bg-blue-600' : 'bg-slate-700 hover:bg-blue-600'}`}
                          title="Klik untuk membuka Pop-up Pemutar Musik"
                        >
                          {isCurrent ? <FiPause size={12} /> : <FiMusic size={12} />}
                        </button>
                      </td>
                      <td className="py-2.5 font-bold truncate max-w-xs cursor-pointer" onClick={() => togglePlayAudio(item)}>{item.name}</td>
                      <td className="py-2.5 opacity-70 truncate max-w-[150px] cursor-pointer" onClick={() => togglePlayAudio(item)}>{item.artist}</td>
                      <td className="py-2.5 opacity-70">{item.date}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={(e) => { e.stopPropagation(); setMovingTrack(item); }} className="p-1.5 hover:text-indigo-500"><FiMove size={13} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteMusic(item.id, item.url); }} className="p-1.5 hover:text-red-500"><FiTrash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POP-UP MODAL PEMUTAR MUSIK (HANYA MUNCUL KETIKA IKON DIKLIK EKSPLISIT) */}
      {isPopupOpen && activeAudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl flex flex-col items-center text-center gap-4 relative ${
            mode === 'light' ? 'bg-white text-slate-800' : 'bg-[#16222A] text-slate-100 border-slate-700'
          }`}>
            
            {/* Tombol Tutup Pop-up */}
            <button 
              onClick={() => setIsPopupOpen(false)} 
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-500/20 opacity-70 hover:opacity-100 transition"
            >
              <FiX size={18} />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Pemutar Musik Pop-up</span>

            {/* Disk Album Visual */}
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl my-1 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border-2 border-white/20">
                <FiDisc size={16} />
              </div>
            </div>

            {/* Info Musik */}
            <div className="w-full px-2">
              <h3 className="text-sm font-bold truncate" title={activeAudio.name}>
                {activeAudio.name}
              </h3>
              <p className="text-xs opacity-60 truncate mt-0.5">
                {activeAudio.artist}
              </p>
            </div>

            {/* Progress Bar & Durasi */}
            <div className="w-full space-y-1">
              <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={currentTime} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTime(val);
                  if (audioRef.current) audioRef.current.currentTime = val;
                }}
                className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] opacity-60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Tombol Kontrol: Prev, Rewind 10s, Play/Pause, Fast Forward 10s, Next */}
            <div className="flex items-center justify-center gap-3 my-1">
              <button onClick={handlePrevTrack} className="p-2.5 rounded-full bg-slate-500/20 hover:bg-slate-500/30 transition text-slate-300 dark:text-slate-200" title="Lagu Sebelumnya">
                <FiSkipBack size={16} />
              </button>

              <button onClick={() => skipTime(-10)} className="p-2.5 rounded-full bg-slate-500/20 hover:bg-slate-500/30 transition text-xs font-bold" title="Mundur 10 Detik">
                -10s
              </button>

              <button 
                onClick={() => togglePlayAudio(activeAudio)} 
                className="p-3.5 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} className="ml-0.5" />}
              </button>

              <button onClick={() => skipTime(10)} className="p-2.5 rounded-full bg-slate-500/20 hover:bg-slate-500/30 transition text-xs font-bold" title="Maju 10 Detik">
                +10s
              </button>

              <button onClick={handleNextTrack} className="p-2.5 rounded-full bg-slate-500/20 hover:bg-slate-500/30 transition text-slate-300 dark:text-slate-200" title="Lagu Selanjutnya">
                <FiSkipForward size={16} />
              </button>
            </div>

            {/* Selector Kecepatan */}
            <div className="w-full border-t border-slate-700/20 pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold opacity-60">Kecepatan Musik:</span>
                <span className="text-xs font-bold text-blue-500">{playbackSpeed}x</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => changeSpeed(speed)}
                    className={`py-1 rounded-lg text-[10px] font-semibold transition ${playbackSpeed === speed ? 'bg-blue-600 text-white' : 'bg-slate-500/10 hover:bg-slate-500/20'}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL PINDAH FOLDER */}
      {movingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl ${mode === 'light' ? 'bg-white text-slate-800' : 'bg-[#16222A] text-slate-100 border-slate-700'}`}>
            <h3 className="text-sm font-bold mb-1">Pindahkan Berkas Musik</h3>
            <p className="text-xs opacity-60 mb-4 truncate">Pilih folder tujuan untuk: <b>{movingTrack.name}</b></p>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              <button 
                onClick={() => handleMoveTrackToFolder(movingTrack.id, null)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${!movingTrack.folder_id ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/10'}`}
              >
                <span>Tanpa Folder (Semua Musik)</span>
              </button>
              {folders.map(folder => (
                <button 
                  key={folder.id}
                  onClick={() => handleMoveTrackToFolder(movingTrack.id, folder.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${movingTrack.folder_id === folder.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/10'}`}
                >
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setMovingTrack(null)} className="px-4 py-2 bg-slate-500/20 rounded-xl text-xs font-medium">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* ELEMENT AUDIO UTAMA (OTOMATIS BERPINDAH KE LAGU BERIKUTNYA) */}
      {activeAudio && (
        <audio 
          ref={audioRef} 
          src={activeAudio.url} 
          onEnded={handleNextTrack} 
          onPlay={() => setIsPlaying(true)} 
          onPause={() => setIsPlaying(false)} 
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      )}

    </div>
  );
}