'use client';
import { useState, useRef } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiMusic, FiUpload, FiTrash2, FiSearch, 
  FiGrid, FiList, FiX, FiPlay, FiPause, FiDisc 
} from 'react-icons/fi';

interface MusicItem {
  id: string;
  name: string;
  artist: string;
  duration: string;
  url: string; // URL file audio
  size: string;
  date: string;
}

const initialMusic: MusicItem[] = [
  { id: '1', name: 'Lo-Fi Chill Session', artist: 'Background Beats', duration: '3:45', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', size: '3.5 MB', date: '22 Sep 2026' },
  { id: '2', name: 'Cyberpunk Synthwave 2077', artist: 'Neon Runner', duration: '4:12', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', size: '4.1 MB', date: '21 Sep 2026' },
  { id: '3', name: 'Ambient Coding Space', artist: 'Dev Focus', duration: '6:00', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', size: '5.8 MB', date: '20 Sep 2026' },
  { id: '4', name: 'Acoustic Morning Vibe', artist: 'Coffee Break', duration: '2:55', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', size: '2.8 MB', date: '19 Sep 2026' },
];

export default function FileMusicPage() {
  const { mode } = useTheme();
  const [musicList, setMusicList] = useState<MusicItem[]>(initialMusic);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State untuk Pemutar Musik (Audio Player)
  const [activeAudio, setActiveAudio] = useState<MusicItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  // Handler Upload Berkas Musik Lokal
  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const audioUrl = URL.createObjectURL(file);

      const newMusic: MusicItem = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ""), // Hapus ekstensi file untuk nama
        artist: 'Unknown Artist',
        duration: '--:--',
        url: audioUrl,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: 'Baru saja'
      };

      setMusicList([newMusic, ...musicList]);
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
              File Music <span className="text-xs font-normal opacity-60">/ Pustaka Audio</span>
            </h1>
            <p className="text-xs opacity-70 mt-0.5">
              Kelola berkas audio, efek suara, dan trek musik latar Anda.
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

        {/* INPUT UPLOAD MUSIK */}
        <div className="mt-6 pt-6 border-t border-slate-700/20">
          <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${mode === 'light' ? 'border-slate-300 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-800/50'}`}>
            <FiUpload className="text-blue-500 text-xl" />
            <div className="text-left">
              <p className="text-xs font-semibold">Upload Musik Baru</p>
              <p className="text-[10px] opacity-60">Pilih file audio (.mp3, .wav, .aac, .ogg)</p>
            </div>
            <input type="file" accept="audio/*" onChange={handleMusicUpload} className="hidden" />
          </label>
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

        {filteredMusic.length === 0 ? (
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
                      <span>{item.duration}</span>
                      <span>{item.size}</span>
                    </div>
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
                  <th className="pb-3 font-semibold">Artis</th>
                  <th className="pb-3 font-semibold">Durasi</th>
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
                      <td className="py-3 opacity-70">{item.artist}</td>
                      <td className="py-3 opacity-70">{item.duration}</td>
                      <td className="py-3 opacity-70">{item.size}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if(activeAudio?.id === item.id) setActiveAudio(null);
                            setMusicList(musicList.filter(m => m.id !== item.id)); 
                          }}
                          className="p-1.5 hover:text-red-500 transition opacity-60 hover:opacity-100"
                          title="Hapus"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FIXED AUDIO PLAYER BAR DI BAGIAN BAWAH (JIKA ADA YANG DIPUTAR) */}
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

          {/* Elemen Audio HTML5 */}
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