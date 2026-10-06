'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiMusic, FiUpload, FiTrash2, FiSearch, 
  FiGrid, FiList, FiX, FiPlay, FiPause, FiDisc, FiDownload, FiLink, FiSave,
  FiFolder, FiFolderPlus, FiEdit2, FiMove, FiChevronRight, FiArrowLeft
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
  
  // State untuk Pemutar Musik (Audio Player)
  const [activeAudio, setActiveAudio] = useState<MusicItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
      }
      setMusicList(musicList.filter(item => item.id !== id));
    } catch (error) {
      console.error('Gagal menghapus musik:', error);
    }
  };

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

  useEffect(() => {
    if (activeAudio && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [activeAudio]);

const filteredMusic = musicList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Jika di "Semua Musik", hanya tampilkan lagu yang folder_id-nya null/kosong
    // Jika di folder spesifik, tampilkan lagu yang folder_id-nya sesuai dengan folder yang dipilih
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

      {/* AREA UTAMA KONTEN (MENAMPILKAN FOLDER CARD & MUSIK) */}
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

        {/* JIKA DI 'SEMUA MUSIK', TAMPILKAN KARTU FOLDER DI ATAS */}
        {selectedFolderId === 'all' && folders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-semibold opacity-60 mb-3 uppercase tracking-wider">Folder Anda</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
            <div className="border-b border-slate-700/20 my-6"></div>
          </div>
        )}

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
                  onClick={() => togglePlayAudio(item)}
                  className={`group flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition relative ${
                    isCurrent ? 'border-blue-500 bg-blue-500/10' : mode === 'light' ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-800 bg-[#0f172a]/50 hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow transition transform group-hover:scale-105 ${isCurrent ? 'bg-blue-600 animate-pulse' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                    {isCurrent ? <FiPause size={16} /> : <FiPlay size={16} className="ml-0.5" />}
                  </div>
                  <div className="flex flex-col overflow-hidden flex-grow">
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
                  <th className="pb-3 w-10">Status</th>
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
                    <tr key={item.id} onClick={() => togglePlayAudio(item)} className={`hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer ${isCurrent ? 'bg-blue-500/5' : ''}`}>
                      <td className="py-2.5">
                        <button className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${isCurrent ? 'bg-blue-600' : 'bg-slate-700'}`}>
                          {isCurrent ? <FiPause size={12} /> : <FiPlay size={12} className="ml-0.5" />}
                        </button>
                      </td>
                      <td className="py-2.5 font-bold truncate max-w-xs">{item.name}</td>
                      <td className="py-2.5 opacity-70 truncate max-w-[150px]">{item.artist}</td>
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

      {/* AUDIO PLAYER BAR */}
      {activeAudio && (
        <div className={`fixed z-40 shadow-2xl backdrop-blur-lg border ${mode === 'light' ? 'bg-white/95 text-slate-900 border-slate-200' : 'bg-[#16222A]/95 text-slate-100 border-slate-700'} bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl px-5 py-3 rounded-2xl flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3 overflow-hidden flex-grow min-w-0">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 ${isPlaying ? 'animate-spin' : ''}`}>
              <FiDisc size={20} />
            </div>
            <div className="truncate min-w-0">
              <h4 className="text-xs font-bold truncate">{activeAudio.name}</h4>
              <p className="text-[10px] opacity-60 truncate">{activeAudio.artist}</p>
            </div>
          </div>
          <audio ref={audioRef} src={activeAudio.url} onEnded={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} controls className="h-8 w-[200px] shrink-0" />
          <button onClick={() => { audioRef.current?.pause(); setActiveAudio(null); setIsPlaying(false); }} className="p-2 rounded-full hover:bg-black/10"><FiX size={16} /></button>
        </div>
      )}

    </div>
  );
}