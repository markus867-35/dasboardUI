'use client';
import { ReactNode, useEffect, useState, useRef, createContext, useContext } from "react";
import { ThemeProvider, useTheme } from "@/app/context/ThemeContext";
import { TabProvider } from "@/app/context/TabContext";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import TagsView from "@/app/components/TagsView";
import { FontSizeProvider, useFontSize, FontSizeContextType } from '@/app/context/FontSizeContext';
import { LanguageProvider } from "@/app/context/LanguageContext";
import { SidebarThemeProvider } from '@/app/context/SidebarThemeContext';
import { useRouter } from "next/navigation";

// --- GLOBAL MUSIC CONTEXT YANG DIPERBARUI DENGAN DUKUNGAN YOUTUBE API ---
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

interface MusicContextType {
  activeAudio: MusicItem | null;
  isPlaying: boolean;
  togglePlayAudio: (item: MusicItem) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  // Tambahan state global untuk YouTube API
  ytPlayerRef: React.MutableRefObject<any>;
  ytDuration: number;
  ytCurrentTime: number;
  setYtCurrentTime: (val: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function useGlobalMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useGlobalMusic harus digunakan di dalam MusicProvider');
  }
  return context;
}

// Tambahan deklarasi global untuk tipe jendela YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { isSidebarOpen, setIsSidebarOpen } = useTheme();
  const { fontSize } = useFontSize() as FontSizeContextType;
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();

  // --- STATE PEMUTAR MUSIK GLOBAL ---
  const [activeAudio, setActiveAudio] = useState<MusicItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- STATE & REF YOUTUBE API GLOBAL ---
  const ytPlayerRef = useRef<any>(null);
  const [ytDuration, setYtDuration] = useState<number>(0);
  const [ytCurrentTime, setYtCurrentTime] = useState<number>(0);

  const togglePlayAudio = (item: MusicItem) => {
    const isYT = item.size === 'YouTube' || item.url.includes('youtube.com') || item.url.includes('youtu.be');
    
    if (activeAudio?.id === item.id) {
      if (isPlaying) {
        if (isYT && ytPlayerRef.current?.pauseVideo) {
          ytPlayerRef.current.pauseVideo();
        } else {
          audioRef.current?.pause();
        }
        setIsPlaying(false);
      } else {
        if (isYT && ytPlayerRef.current?.playVideo) {
          ytPlayerRef.current.playVideo();
        } else {
          audioRef.current?.play().catch(err => console.log(err));
        }
        setIsPlaying(true);
      }
    } else {
      setActiveAudio(item);
      setIsPlaying(true);
    }
  };

  // Efek penanganan Audio Lokal vs YouTube API
  useEffect(() => {
    if (!activeAudio) return;

    const isYT = activeAudio.size === 'YouTube' || activeAudio.url.includes('youtube.com') || activeAudio.url.includes('youtu.be');

    if (isYT) {
      // Pause audio lokal jika sedang memutar YouTube
      if (audioRef.current) audioRef.current.pause();

      let videoId = '';
      if (activeAudio.url.includes('youtu.be/')) {
        videoId = activeAudio.url.split('youtu.be/')[1]?.split('?')[0];
      } else if (activeAudio.url.includes('watch?v=')) {
        videoId = activeAudio.url.split('watch?v=')[1]?.split('&')[0];
      }

      if (!videoId) return;

      let timer: any;

      const initPlayer = () => {
        if (window.YT && window.YT.Player) {
          if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
            ytPlayerRef.current.destroy();
          }

          ytPlayerRef.current = new window.YT.Player('global-youtube-player', {
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
                setIsPlaying(true);
                setYtDuration(event.target.getDuration());
                
                timer = setInterval(() => {
                  if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
                    setYtCurrentTime(ytPlayerRef.current.getCurrentTime());
                  }
                }, 1000);
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  setIsPlaying(false);
                }
              }
            },
          });
        }
      };

      if (!window.YT) {
        // Load script YouTube API secara dinamis jika belum ada
        if (!document.getElementById('yt-api-script')) {
          const tag = document.createElement('script');
          tag.id = 'yt-api-script';
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }
        window.onYouTubeIframeAPIReady = initPlayer;
      } else {
        initPlayer();
      }

      return () => {
        if (timer) clearInterval(timer);
      };

    } else {
      // Hancurkan player YouTube jika beralih ke lagu lokal
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      setYtCurrentTime(0);
      setYtDuration(0);

      if (audioRef.current) {
        audioRef.current.src = activeAudio.url;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [activeAudio]);

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) {
      router.push('/login');
    } else {
      setIsAuthReady(true);
    }

    if (window.innerWidth < 1024 && typeof setIsSidebarOpen === 'function') {
      setIsSidebarOpen(false);
    }
  }, [setIsSidebarOpen, router]);

  if (!isAuthReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#142028] text-white">
        <p>Memuat ulang sesi...</p>
      </div>
    );
  }

  return (
    <MusicContext.Provider value={{ activeAudio, isPlaying, togglePlayAudio, audioRef, ytPlayerRef, ytDuration, ytCurrentTime, setYtCurrentTime }}>
      <TabProvider>
        <div className={`flex min-h-screen w-full relative ${fontSize}`}>
          {/* BACKDROP MOBILE */}
          {isSidebarOpen && (
            <div 
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden cursor-pointer backdrop-blur-xs transition-opacity"
              aria-label="Tutup sidebar"
            />
          )}

          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-70 w-64 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar />
          </aside>

          {/* Konten Utama */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ml-0 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
            <Header />
            <TagsView />
            <main className="flex-1 p-0 sm:p-3 overflow-y-auto w-full box-border">{children}</main>
          </div>

          {/* ELEMEN AUDIO HTML5 GLOBAL & WADAH YOUTUBE API TERSEMBUNYI */}
          <audio 
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
          />
          <div id="global-youtube-player" className="hidden"></div>
        </div>
      </TabProvider>
    </MusicContext.Provider>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider> 
      <FontSizeProvider>
        <ThemeProvider>
          <SidebarThemeProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
          </SidebarThemeProvider>
        </ThemeProvider>
      </FontSizeProvider>
    </LanguageProvider>
  );
}