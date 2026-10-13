'use client';
import { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';

export interface MusicItem {
  id: string | number;
  name: string;
  artist: string;
  duration?: string;
  url: string;
  size?: string;
  date?: string;
  folder_id?: string | number | null;
}

interface MusicContextType {
  activeAudio: MusicItem | null;
  isPlaying: boolean;
  togglePlayAudio: (item: MusicItem) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [activeAudio, setActiveAudio] = useState<MusicItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      audioRef.current.src = activeAudio.url;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [activeAudio]);

  return (
    <MusicContext.Provider value={{ activeAudio, isPlaying, togglePlayAudio, audioRef }}>
      {children}
      {/* KUNCI UTAMA: Tag audio ditempatkan di Provider global ini */}
      <audio 
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
      />
    </MusicContext.Provider>
  );
}

export function useGlobalMusic() {
  const context = useContext(MusicContext);
  
  // Jika context belum ada, kembalikan objek default agar tidak crash
  if (!context) {
    return {
      activeAudio: null,
      isPlaying: false,
      togglePlayAudio: () => {},
      audioRef: { current: null },
    };
  }
  
  return context;
}