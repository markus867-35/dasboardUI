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

// --- BUAT GLOBAL MUSIC CONTEXT AGAR BISA DIKONTROL DARI HALAMAN MANAPUN ---
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
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function useGlobalMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useGlobalMusic harus digunakan di dalam MusicProvider');
  }
  return context;
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

  useEffect(() => {
    // Pastikan sesi login aman saat di-refresh
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

  // Tampilkan loading sebentar saat proses sinkronisasi refresh agar tidak crash
  if (!isAuthReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#142028] text-white">
        <p>Memuat ulang sesi...</p>
      </div>
    );
  }

  return (
    <MusicContext.Provider value={{ activeAudio, isPlaying, togglePlayAudio, audioRef }}>
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

          {/* ELEMEN AUDIO HTML5 GLOBAL (TIDAK AKAN HANCUR SAAT PINDAH HALAMAN) */}
          <audio 
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
          />
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