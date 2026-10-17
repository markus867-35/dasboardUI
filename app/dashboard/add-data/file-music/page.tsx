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


// Tambahkan deklarasi TypeScript untuk jendela YouTube global
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

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
  const { mode, colorTheme, getThemeClasses } = useTheme();
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
  const [audioTitleInput, setAudioTitleInput] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);



  useEffect(() => {
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }
}, []);


  const ytPlayerRef = useRef<any>(null);
  const [ytDuration, setYtDuration] = useState<number>(0);
  const [ytCurrentTime, setYtCurrentTime] = useState<number>(0);

// Inisialisasi & Pengaturan Audio/YouTube saat activeAudio berubah
useEffect(() => {
  if (!activeAudio) return;

  const isYT = activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be');

  if (isYT) {
    // Jika lagu baru adalah YouTube, pastikan audio lokal dimatikan
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    const videoId = activeAudio.url.split('youtu.be/')[1]?.split('?')[0] || activeAudio.url.split('watch?v=')[1]?.split('&')[0];
    if (!videoId) return;

    let timer: any;

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        // Hancurkan player lama jika sudah ada
        if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
          try { ytPlayerRef.current.destroy(); } catch (e) {}
        }

        ytPlayerRef.current = new window.YT.Player('youtube-player-hidden', {
          height: '0',
          width: '0',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
          },
          events: {
            onReady: (event: any) => {
              event.target.playVideo();
              setYtDuration(event.target.getDuration());
              setIsPlaying(true);
              timer = setInterval(() => {
                if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
                  setYtCurrentTime(ytPlayerRef.current.getCurrentTime());
                }
              }, 1000);
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                handleNextTrack();
              }
            }
          },
        });
      }
    };

    if (!window.YT) {
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      clearInterval(timer);
    };

  } else {
    // Jika lagu baru adalah audio lokal, hancurkan YouTube player agar suaranya mati
    if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
      try {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      } catch (e) {}
    }

    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }
}, [activeAudio]);

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
    if (!audioUrlInput.trim()) return alert('Silakan masukkan link audio atau YouTube!');

    try {
      setSavingUrl(true);
      const formattedDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      
      let finalUrl = audioUrlInput.trim();
      let trackName = 'External Audio Track';
      let artistName = 'Streaming';
      let trackSize = 'Streaming';

      // 🚀 Deteksi otomatis jika itu link YouTube (youtu.be atau youtube.com)
      if (finalUrl.includes('youtu.be') || finalUrl.includes('youtube.com')) {
        // Ambil Video ID dari URL YouTube untuk disematkan
        let videoId = '';
        if (finalUrl.includes('youtu.be/')) {
          videoId = finalUrl.split('youtu.be/')[1]?.split('?')[0];
        } else if (finalUrl.includes('watch?v=')) {
          videoId = finalUrl.split('watch?v=')[1]?.split('&')[0];
        }

        if (videoId) {
          trackName = `YouTube Music (${videoId})`; // Bisa diubah teksnya sesuai keinginan
          artistName = 'YouTube';
          trackSize = 'YouTube';
        }
      } else {
        const urlObj = new URL(finalUrl);
        trackName = decodeURIComponent(urlObj.pathname.split('/').pop() || 'External Audio Track');
        artistName = urlObj.hostname;
      }

      const newTrack = {
        name: trackName,
        artist: artistName,
        duration: '--:--',
        url: finalUrl,
        size: trackSize,
        date: formattedDate,
        folder_id: selectedFolderId === 'all' ? null : selectedFolderId
      };

      const { data, error } = await supabase.from('music_tracks').insert([newTrack]).select();
      if (error) throw error;
      if (data) {
        setMusicList([data[0], ...musicList]);
        setAudioUrlInput('');
        alert('Link berhasil ditambahkan!');
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
  const isTargetYT = item.size === 'YouTube' || item.url.includes('youtube.com') || item.url.includes('youtu.be');

  if (activeAudio?.id === item.id) {
    if (isPlaying) {
      if (!isTargetYT && audioRef.current) {
        audioRef.current.pause();
      } else if (isTargetYT && ytPlayerRef.current && ytPlayerRef.current.pauseVideo) {
        ytPlayerRef.current.pauseVideo();
      }
      setIsPlaying(false);
    } else {
      if (!isTargetYT && audioRef.current) {
        audioRef.current.play().catch(err => console.log(err));
      } else if (isTargetYT && ytPlayerRef.current && ytPlayerRef.current.playVideo) {
        ytPlayerRef.current.playVideo();
      }
      setIsPlaying(true);
    }
  } else {
    // Matikan audio lokal yang lama jika ada
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Hancurkan YouTube player lama jika ada
    if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
      try {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      } catch (e) {
        console.log(e);
      }
    }
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
    <div className="p-0 space-y-6 max-w-[1700px] mx-auto">
      
      {/* HEADER & TOOLBAR */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-colors ${getCardStyle()}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              File Music <span className="text-xs font-normal opacity-60">/ Audio </span>
            </h1>
            <p className="text-xs opacity-70 mt-0.5">Kelola berkas audio, folder, dan trek musik latar.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`flex items-center px-3 py-2 rounded-xl border ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'} w-full md:w-64`}>
              <FiSearch className="opacity-50 mr-2 shrink-0" />
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
<div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-700/20">
  {/* Kontainer dengan horizontal scroll di mobile dan wrap normal di desktop */}
  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap">
    
    <button 
      onClick={() => setSelectedFolderId('all')}
      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 transition ${
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
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 transition ${
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

        {/* AREA UPLOAD & LINK */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700/20 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`flex items-center justify-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${mode === 'light' ? 'border-slate-300 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-800/50'}`}>
            <FiUpload className="text-blue-500 text-xl shrink-0" />
            <div className="text-left overflow-hidden">
              <p className="text-xs font-semibold truncate">{uploading ? 'Mengunggah...' : `Upload ke Folder: "${currentFolderName}"`}</p>
              <p className="text-[10px] opacity-60">Pilih file audio (.mp3, .wav)</p>
            </div>
            <input type="file" accept="audio/*" onChange={handleMusicUpload} disabled={uploading} className="hidden" />
          </label>

<form onSubmit={async (e) => {
            e.preventDefault();
            if (!audioUrlInput.trim()) return alert('Silakan masukkan link audio atau YouTube!');

            try {
              setSavingUrl(true);
              const formattedDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
              
              let finalUrl = audioUrlInput.trim();
              let trackName = audioTitleInput.trim() || 'External Audio Track';
              let artistName = 'Streaming';
              let trackSize = 'Streaming';

              if (finalUrl.includes('youtu.be') || finalUrl.includes('youtube.com')) {
                let videoId = '';
                if (finalUrl.includes('youtu.be/')) {
                  videoId = finalUrl.split('youtu.be/')[1]?.split('?')[0];
                } else if (finalUrl.includes('watch?v=')) {
                  videoId = finalUrl.split('watch?v=')[1]?.split('&')[0];
                }

                if (videoId) {
                  // Jika judul manual kosong, gunakan format ID yang bersih
                  if (!audioTitleInput.trim()) {
                    trackName = `YouTube Audio (${videoId})`;
                  }
                  artistName = 'YouTube';
                  trackSize = 'YouTube';
                }
              } else {
                const urlObj = new URL(finalUrl);
                if (!audioTitleInput.trim()) {
                  trackName = decodeURIComponent(urlObj.pathname.split('/').pop() || 'External Audio Track');
                }
                artistName = urlObj.hostname;
              }

              const newTrack = {
                name: trackName,
                artist: artistName,
                duration: '--:--',
                url: finalUrl,
                size: trackSize,
                date: formattedDate,
                folder_id: selectedFolderId === 'all' ? null : selectedFolderId
              };

              const { data, error } = await supabase.from('music_tracks').insert([newTrack]).select();
              if (error) throw error;
              if (data) {
                setMusicList([data[0], ...musicList]);
                setAudioUrlInput('');
                setAudioTitleInput('');
                alert('Link berhasil ditambahkan!');
              }
            } catch (error) {
              console.error('Gagal menyimpan link:', error);
              alert('URL tidak valid.');
            } finally {
              setSavingUrl(false);
            }
          }} className={`flex flex-col gap-2 p-3.5 sm:p-4 rounded-xl border-2 border-dashed ${mode === 'light' ? 'border-slate-300 bg-slate-50/50' : 'border-slate-700 bg-slate-800/20'}`}>
            
            <div className="flex items-center gap-2">
              <FiLink className="text-indigo-500 shrink-0" size={14} />
              <span className="text-xs font-semibold truncate">Simpan Link Audio ke: "{currentFolderName}"</span>
            </div>

            {/* Input Judul Lagu (Opsional) */}
            <input 
              type="text" 
              placeholder="Judul Lagu (Opsional, misal: Musik Relax)"
              value={audioTitleInput}
              onChange={(e) => setAudioTitleInput(e.target.value)}
              disabled={savingUrl}
              className={`px-3 py-1.5 rounded-lg border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
            />

            <div className="flex items-center gap-2">
              <input 
                type="url" 
                placeholder="https://youtu.be/... atau link mp3"
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
        /* Diubah menjadi horizontal scroll di mobile dan grid kembali di komputer/tablet */
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-x-auto pb-2 sm:overflow-visible scrollbar-none">
          {folders.map(folder => {
            const count = musicList.filter(m => m.folder_id === folder.id).length;
            return (
              <div 
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`group p-3 sm:p-4 rounded-xl border cursor-pointer transition flex items-center justify-between shrink-0 w-[240px] sm:w-auto ${
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









  {/* Bagian Kanan / Bawah: PEMUTAR MUSIK */}
{/* Bagian Kanan / Bawah: PEMUTAR MUSIK */}
<div className={`
  /* Pengaturan Mobile: Melayang di bawah (fixed) */
  fixed bottom-0 left-0 right-0 z-40 p-2.5 px-4 rounded-t-2xl border-t shadow-2xl backdrop-blur-md flex items-center justify-between gap-3
  
  /* Pengaturan Desktop (md:): Kembali normal di dalam grid, tidak fixed lagi */
  md:static md:inset-auto md:w-full md:p-4 md:rounded-2xl md:border md:shadow-inner md:backdrop-blur-none md:flex-col md:justify-between
  
  ${mode === 'light' ? 'bg-white/95 border-slate-200' : 'bg-[#0f172a]/95 border-slate-700/80'}
`}>
  
  {/* TAMPILAN KHUSUS MOBILE (BAR RAMPING) */}
  <div className="flex md:hidden items-center justify-between w-full gap-3">
    <div className="flex items-center gap-2.5 overflow-hidden cursor-pointer flex-grow" onClick={() => activeAudio && setIsPopupOpen(true)}>
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
        <FiDisc size={16} />
      </div>
      <div className="overflow-hidden">
        <h4 className="text-xs font-bold truncate">{activeAudio ? activeAudio.name : 'Standby'}</h4>
        <p className="text-[10px] opacity-60 truncate">{activeAudio ? activeAudio.artist : 'Belum ada musik'}</p>
      </div>
    </div>

    {/* Kontrol Cepat Mobile */}
    <div className="flex items-center gap-2 shrink-0">
      <button 
        onClick={() => activeAudio && togglePlayAudio(activeAudio)} 
        className="p-2 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 transition"
      >
        {isPlaying ? <FiPause size={14} /> : <FiPlay size={14} className="ml-0.5" />}
      </button>
      <button 
        onClick={handleNextTrack} 
        className="p-2 rounded-full bg-slate-500/20 hover:bg-slate-500/30 transition"
      >
        <FiSkipForward size={14} />
      </button>
    </div>
  </div>






<div id="youtube-player-hidden" className="hidden"></div>

  {/* TAMPILAN KOTAK PANEL LENGKAP (HANYA MUNCUL DI DESKTOP / md:) */}
  <div className="hidden md:flex flex-col w-full">
    <div className="flex items-center justify-between border-b pb-2 border-slate-700/20">
      <span className="text-xs font-bold flex items-center gap-1.5">
        <FiDisc className="text-blue-500 animate-spin" size={14} /> Pemutar Musik Aktif
      </span>
      <span className="text-[10px] opacity-60 truncate max-w-[120px]">{activeAudio ? activeAudio.name : 'Standby'}</span>
    </div>

    {activeAudio ? (
      <div className="py-3 space-y-3 flex flex-col items-center text-center">




{/* Status Teks YouTube */}
{(activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be')) && (
  <div className="w-full flex flex-col items-center">
    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-medium mb-1">
      Streaming YouTube (Audio)
    </span>
  </div>
)}

{/* 2. TAMPILAN VISUAL KOTAK MUSIK BERPUTAR */}
<div 
  className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg my-1 border-2 border-white/40 transition-transform ${
    isPlaying ? 'animate-spin' : ''
  }`}
  style={{ animationDuration: '3s' }}
>
  <div className="w-8 h-8 rounded-lg bg-slate-900/40 border border-white/20 flex items-center justify-center">
    <FiDisc size={18} className="text-white" />
  </div>
</div>

<div className="w-full px-2">
  <h4 className="text-xs font-bold truncate w-full" title={activeAudio.name}>
    {activeAudio.name}
  </h4>
  <p className="text-[10px] opacity-60 truncate w-full mt-0.5">
    {activeAudio.artist}
  </p>
</div>

{/* Progress Bar & Durasi Universal (Mendukung YouTube API & Audio Lokal) */}
<div className="w-full space-y-1">
  <input 
    type="range" 
    min={0} 
    max={
      (activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be')) 
        ? (ytDuration || 100) 
        : (duration || 100)
    } 
    value={
      (activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be')) 
        ? ytCurrentTime 
        : currentTime
    } 
    onChange={(e) => {
      const val = Number(e.target.value);
      const isYT = activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be');
      
      if (isYT) {
        setYtCurrentTime(val);
        if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
          ytPlayerRef.current.seekTo(val, true);
        }
      } else {
        setCurrentTime(val);
        if (audioRef.current) {
          audioRef.current.currentTime = val;
        }
      }
    }}
    className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
  />
  <div className="flex justify-between text-[10px] opacity-60">
    <span>
      {formatTime(
        (activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be')) 
          ? ytCurrentTime 
          : currentTime
      )}
    </span>
    <span>
      {formatTime(
        (activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be')) 
          ? ytDuration 
          : duration
      )}
    </span>
  </div>
</div>

        {/* Tombol Kontrol */}
        <div className="flex items-center justify-center gap-2 pt-1 w-full">
          <button onClick={handlePrevTrack} className="p-2 rounded-full bg-slate-500/20 hover:bg-slate-500/30 transition" title="Sebelumnya">
            <FiSkipBack size={14} />
          </button>
          {activeAudio.size !== 'YouTube' && !activeAudio.url.includes('youtube.com') && !activeAudio.url.includes('youtu.be') && (
            <button onClick={() => skipTime(-10)} className="px-2 py-1 rounded-lg bg-slate-500/20 hover:bg-slate-500/30 text-[10px] font-semibold" title="Mundur 10s">
              -10s
            </button>
          )}
          <button 
            onClick={() => togglePlayAudio(activeAudio)} 
            className="p-3 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 transition"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} className="ml-0.5" />}
          </button>
          {activeAudio.size !== 'YouTube' && !activeAudio.url.includes('youtube.com') && !activeAudio.url.includes('youtu.be') && (
            <button onClick={() => skipTime(10)} className="px-2 py-1 rounded-lg bg-slate-500/20 hover:bg-slate-500/30 text-[10px] font-semibold" title="Maju 10s">
              +10s
            </button>
          )}
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

    {/* Selector Kecepatan */}
    <div className="border-t pt-2 border-slate-700/20 flex items-center justify-between">
      <span className="text-[10px] opacity-60">Kecepatan:</span>
      <div className="flex gap-1">
        {[1, 1.25, 1.5, 2].map(speed => (
          <button 
            key={speed}
            onClick={() => changeSpeed(speed)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
              playbackSpeed === speed ? 'bg-blue-600 text-white' : 'bg-slate-500/10 hover:bg-slate-500/20'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
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

{/* Kotak Album Visual yang Berputar Jelas */}
            <div 
              className={`w-15 h-15 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl my-1 border-2 border-white/40 ${
                isPlaying ? 'animate-spin' : ''
              }`} 
              style={{ animationDuration: '4s' }}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900/50 border border-white/20 flex items-center justify-center">
                <FiDisc size={20} className="text-white" />
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
                max={
                  (activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be')) 
                    ? (ytDuration || 100) 
                    : (duration || 100)
                } 
                value={
                  (activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be')) 
                    ? ytCurrentTime 
                    : currentTime
                } 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const isYT = activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be');
                  
                  if (isYT) {
                    setYtCurrentTime(val);
                    if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
                      ytPlayerRef.current.seekTo(val, true);
                    }
                  } else {
                    setCurrentTime(val);
                    if (audioRef.current) {
                      audioRef.current.currentTime = val;
                    }
                  }
                }}
                className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] opacity-60">
                <span>
                  {formatTime(
                    (activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be')) 
                      ? ytCurrentTime 
                      : currentTime
                  )}
                </span>
                <span>
                  {formatTime(
                    (activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be')) 
                      ? ytDuration 
                      : duration
                  )}
                </span>
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
{/* ELEMENT AUDIO UTAMA (Hanya aktif jika bukan YouTube) */}
{activeAudio && activeAudio.size !== 'YouTube' && (
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