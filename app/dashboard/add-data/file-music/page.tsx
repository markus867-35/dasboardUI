'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiMusic, FiUpload, FiTrash2, FiSearch, 
  FiGrid, FiList, FiX, FiPlay, FiPause, FiDisc, FiDownload, FiLink, FiSave 
} from 'react-icons/fi';
import { supabase } from '@/lib/supabase'; // Sesuaikan path supabase client Anda

interface MusicItem {
  id: string | number;
  name: string;
  artist: string;
  duration: string;
  url: string;
  size: string;
  date: string;
}

export default function FileMusicPage() {
  const { mode } = useTheme();
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // State untuk Input Link Audio URL
  const [audioUrlInput, setAudioUrlInput] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);
  
  // State untuk Pemutar Musik (Audio Player)
  const [activeAudio, setActiveAudio] = useState<MusicItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  // 1. Ambil Data dari Supabase saat komponen dimuat
  useEffect(() => {
    fetchMusicFromSupabase();
  }, []);

  const fetchMusicFromSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('music_tracks')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) setMusicList(data);
    } catch (error) {
      console.error('Gagal memuat musik:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handler Upload File Audio ke Supabase Storage & Database
  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file ke Supabase Storage (Bucket: music-files)
      const { error: uploadError } = await supabase.storage
        .from('music-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ambil Public URL dari file yang di-upload
      const { data: publicURLData } = supabase.storage
        .from('music-files')
        .getPublicUrl(filePath);

      const formattedDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      const newTrack = {
        name: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Unknown Artist',
        duration: '--:--',
        url: publicURLData.publicUrl,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: formattedDate
      };

      // Simpan metadata ke tabel database Supabase
      const { data, error: insertError } = await supabase
        .from('music_tracks')
        .insert([newTrack])
        .select();

      if (insertError) throw insertError;

      if (data) {
        setMusicList([data[0], ...musicList]);
      }
    } catch (error) {
      console.error('Gagal mengupload musik:', error);
      alert('Terjadi kesalahan saat mengupload musik.');
    } finally {
      setUploading(false);
    }
  };

  // 2b. Handler Simpan Musik Berdasarkan Link / URL
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioUrlInput.trim()) {
      alert('Silakan masukkan link audio terlebih dahulu!');
      return;
    }

    try {
      setSavingUrl(true);
      const formattedDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      // Mengambil nama file atau domain dari URL sebagai judul default
      const urlObj = new URL(audioUrlInput);
      const defaultName = urlObj.pathname.split('/').pop() || 'External Audio Track';

      const newTrack = {
        name: decodeURIComponent(defaultName.replace(/\.[^/.]+$/, "")),
        artist: urlObj.hostname,
        duration: '--:--',
        url: audioUrlInput.trim(),
        size: 'Streaming',
        date: formattedDate
      };

      const { data, error } = await supabase
        .from('music_tracks')
        .insert([newTrack])
        .select();

      if (error) throw error;

      if (data) {
        setMusicList([data[0], ...musicList]);
        setAudioUrlInput(''); // Reset input form
        alert('Link audio berhasil disimpan!');
      }
    } catch (error) {
      console.error('Gagal menyimpan link audio:', error);
      alert('Format URL tidak valid atau gagal disimpan ke database.');
    } finally {
      setSavingUrl(false);
    }
  };

  // 3. Hapus Musik dari Supabase (Database & Storage)
  const handleDeleteMusic = async (id: string | number, fileUrl: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus musik ini?')) return;

    try {
      const { error } = await supabase
        .from('music_tracks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Jika file berasal dari storage bucket internal, hapus filenya
      try {
        if (fileUrl.includes('/music-files/')) {
          const urlParts = fileUrl.split('/music-files/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabase.storage.from('music-files').remove([filePath]);
          }
        }
      } catch (storageErr) {
        console.warn('File fisik di storage gagal dihapus atau merupakan URL eksternal:', storageErr);
      }

      if (activeAudio?.id === id) {
        audioRef.current?.pause();
        setActiveAudio(null);
        setIsPlaying(false);
      }
      setMusicList(musicList.filter(item => item.id !== id));
    } catch (error) {
      console.error('Gagal menghapus musik:', error);
      alert('Gagal menghapus data musik.');
    }
  };

  // Toggle Play / Pause Audio
  const togglePlayAudio = (item: MusicItem) => {
    if (activeAudio?.id === item.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setActiveAudio(item);
      setIsPlaying(true);
      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    }
  };

  const filteredMusic = musicList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 relative">
      
      {/* HEADER & TOOLBAR */}
      <div className={`p-5 rounded-2xl border transition-colors ${getCardStyle()}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              File Music <span className="text-xs font-normal opacity-60">/ Pustaka Audio Supabase</span>
            </h1>
            <p className="text-xs opacity-70 mt-0.5">
              Kelola berkas audio dan trek musik latar yang tersimpan di Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`flex items-center px-3 py-2 rounded-xl border ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'} w-full md:w-64`}>
              <FiSearch className="opacity-50 mr-2" />
              <input 
                type="text" 
                placeholder="Cari musik atau artis..." 
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

        {/* AREA DUA KOLOM: UPLOAD FILE & INPUT LINK AUDIO */}
        <div className="mt-6 pt-6 border-t border-slate-700/20 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Kolom 1: Upload File Fisik ke Supabase */}
          <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${mode === 'light' ? 'border-slate-300 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-800/50'}`}>
            <FiUpload className="text-blue-500 text-xl shrink-0" />
            <div className="text-left overflow-hidden">
              <p className="text-xs font-semibold truncate">
                {uploading ? 'Mengunggah ke Supabase...' : 'Upload Musik Baru ke Supabase'}
              </p>
              <p className="text-[10px] opacity-60">Pilih file audio (.mp3, .wav, .aac, .ogg)</p>
            </div>
            <input type="file" accept="audio/*" onChange={handleMusicUpload} disabled={uploading} className="hidden" />
          </label>

          {/* Kolom 2: Input Link Audio & Tombol Simpan di Sampingnya */}
          <form onSubmit={handleUrlSubmit} className={`flex flex-col justify-center p-4 rounded-xl border-2 border-dashed ${mode === 'light' ? 'border-slate-300 bg-slate-50/50' : 'border-slate-700 bg-slate-800/20'}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <FiLink className="text-indigo-500 shrink-0" size={14} />
              <span className="text-xs font-semibold">Simpan dari Link Audio / URL</span>
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
              <button 
                type="submit" 
                disabled={savingUrl}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition"
              >
                <FiSave size={13} />
                <span>{savingUrl ? '...' : 'Simpan'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* AREA TAMPILAN DAFTAR MUSIK */}
      <div className={`min-h-[400px] p-6 rounded-2xl border transition-all ${getCardStyle()}`}>
        <div className="mb-4 text-xs opacity-70 font-medium flex justify-between items-center">
          <span>Total Trek: {filteredMusic.length} Audio</span>
          {activeAudio && (
            <span className="text-blue-500 flex items-center gap-1.5 animate-pulse">
              <FiDisc className="animate-spin" size={14} /> Sedang Diputar: {activeAudio.name}
            </span>
          )}
        </div>

       {loading ? (
          <div className="flex items-center justify-center h-64 text-xs opacity-60">Memuat data dari Supabase...</div>
        ) : filteredMusic.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 text-xs">
            <FiMusic size={48} className="mb-2" />
            <p>Tidak ada berkas musik yang ditemukan.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMusic.map((item) => {
              const isCurrent = activeAudio?.id === item.id && isPlaying;
              return (
                <div 
                  key={item.id} 
                  onClick={() => togglePlayAudio(item)}
                  className={`group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition relative ${
                    isCurrent 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : mode === 'light' ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-800 bg-[#0f172a]/50 hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md transition transform group-hover:scale-105 ${isCurrent ? 'bg-blue-600 animate-pulse' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                    {isCurrent ? <FiPause size={20} /> : <FiPlay size={20} className="ml-0.5" />}
                  </div>
                  <div className="flex flex-col overflow-hidden flex-grow">
                    <span className="text-xs font-bold truncate w-full" title={item.name}>{item.name}</span>
                    <span className="text-[11px] opacity-60 truncate w-full">{item.artist}</span>
                    <div className="flex justify-between items-center text-[10px] opacity-40 mt-1">
                      <span>{item.date}</span>
                      <span>{item.size}</span>
                    </div>
                  </div>

                  {/* Tombol Aksi (Download & Hapus) di Grid */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <a 
                      href={item.url} 
                      download={item.name} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()} 
                      className="p-1.5 bg-black/50 hover:bg-blue-600 text-white rounded-lg transition"
                      title="Download Musik"
                    >
                      <FiDownload size={13} />
                    </a>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteMusic(item.id, item.url); 
                      }}
                      className="p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-lg transition"
                      title="Hapus Musik"
                    >
                      <FiTrash2 size={13} />
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
                  <th className="pb-3 font-semibold w-12">Status</th>
                  <th className="pb-3 font-semibold">Judul Trek</th>
                  <th className="pb-3 font-semibold">Artis / Sumber</th>
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold">Ukuran</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10">
                {filteredMusic.map((item) => {
                  const isCurrent = activeAudio?.id === item.id && isPlaying;
                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => togglePlayAudio(item)}
                      className={`hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer ${isCurrent ? 'bg-blue-500/5' : ''}`}
                    >
                      <td className="py-3">
                        <button className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow ${isCurrent ? 'bg-blue-600' : 'bg-slate-700'}`}>
                          {isCurrent ? <FiPause size={14} /> : <FiPlay size={14} className="ml-0.5" />}
                        </button>
                      </td>
                      <td className="py-3 font-bold truncate max-w-xs">{item.name}</td>
                      <td className="py-3 opacity-70 truncate max-w-[150px]">{item.artist}</td>
                      <td className="py-3 opacity-70">{item.date}</td>
                      <td className="py-3 opacity-70">{item.size}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a 
                            href={item.url} 
                            download={item.name} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 hover:text-blue-500 transition opacity-60 hover:opacity-100"
                            title="Download"
                          >
                            <FiDownload size={14} />
                          </a>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleDeleteMusic(item.id, item.url); 
                            }}
                            className="p-1.5 hover:text-red-500 transition opacity-60 hover:opacity-100"
                            title="Hapus"
                          >
                            <FiTrash2 size={14} />
                          </button>
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

      {/* FIXED AUDIO PLAYER BAR DI BAGIAN BAWAH */}
      {activeAudio && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl p-4 rounded-2xl border shadow-2xl flex items-center justify-between gap-4 backdrop-blur-lg ${mode === 'light' ? 'bg-white/90 text-slate-900 border-slate-200' : 'bg-[#16222A]/90 text-slate-100 border-slate-700'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 animate-spin">
              <FiDisc size={20} />
            </div>
            <div className="truncate">
              <h4 className="text-xs font-bold truncate">{activeAudio.name}</h4>
              <p className="text-[10px] opacity-60 truncate">{activeAudio.artist}</p>
            </div>
          </div>

          <audio 
            ref={audioRef} 
            src={activeAudio.url} 
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls 
            className="h-8 max-w-[200px] sm:max-w-xs"
          />

          <button 
            onClick={() => {
              audioRef.current?.pause();
              setActiveAudio(null);
              setIsPlaying(false);
            }}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition shrink-0"
            title="Tutup Player"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

    </div>
  );
}