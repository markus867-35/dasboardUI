'use client';
import { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'dark' | 'light';
type ColorTheme = 
  | 'navy' 
  | 'indigo' 
  | 'emerald' 
  | 'slate' 
  | 'midnight' 
  | 'purple' 
  | 'rose' 
  | 'amber' 
  | 'cyan' 
  | 'red' 
  | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  getThemeClasses: () => { bgMain: string; bgSidebar: string; bgCard: string };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('navy');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem('app_mode') as ThemeMode;
    const savedTheme = localStorage.getItem('app_color_theme') as ColorTheme;

    if (savedMode) setMode(savedMode);
    if (savedTheme) setColorTheme(savedTheme);
  }, []);

  const toggleMode = () => {
    setMode((prev) => {
      const nextMode = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('app_mode', nextMode);
      return nextMode;
    });
  };

  const handleSetColorTheme = (theme: ColorTheme) => {
    setColorTheme(theme);
    localStorage.setItem('app_color_theme', theme);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

 const getThemeClasses = () => {
    if (mode === 'light') {
      switch (colorTheme) {
        case 'indigo':
          return {
            bgMain: 'bg-indigo-50/80 text-slate-900',
            bgSidebar: 'bg-white text-indigo-950 border-r border-indigo-100',
            bgCard: 'bg-white text-slate-900 border border-indigo-100 shadow-sm',
          };
        case 'emerald':
          return {
            bgMain: 'bg-emerald-50/80 text-slate-900',
            bgSidebar: 'bg-white text-emerald-950 border-r border-emerald-100',
            bgCard: 'bg-white text-slate-900 border border-emerald-100 shadow-sm',
          };
        case 'purple':
          return {
            bgMain: 'bg-purple-50/80 text-slate-900',
            bgSidebar: 'bg-white text-purple-950 border-r border-purple-100',
            bgCard: 'bg-white text-slate-900 border border-purple-100 shadow-sm',
          };
        case 'rose':
          return {
            bgMain: 'bg-rose-50/80 text-slate-900',
            bgSidebar: 'bg-white text-rose-950 border-r border-rose-100',
            bgCard: 'bg-white text-slate-900 border border-rose-100 shadow-sm',
          };
        case 'amber':
          return {
            bgMain: 'bg-amber-50/80 text-slate-900',
            bgSidebar: 'bg-white text-amber-950 border-r border-amber-100',
            bgCard: 'bg-white text-slate-900 border border-amber-100 shadow-sm',
          };
        case 'cyan':
          return {
            bgMain: 'bg-cyan-50/80 text-slate-900',
            bgSidebar: 'bg-white text-cyan-950 border-r border-cyan-100',
            bgCard: 'bg-white text-slate-900 border border-cyan-100 shadow-sm',
          };
        case 'red':
          return {
            bgMain: 'bg-red-50/80 text-slate-900',
            bgSidebar: 'bg-white text-red-950 border-r border-red-100',
            bgCard: 'bg-white text-slate-900 border border-red-100 shadow-sm',
          };
        case 'slate':
        case 'midnight':
        case 'dark':
          return {
            bgMain: 'bg-slate-200 text-slate-900', // 👈 Warna latar belakang lebih tegas untuk slate terang
            bgSidebar: 'bg-slate-300 text-slate-900 border-r border-slate-300',
            bgCard: 'bg-white text-slate-900 border border-slate-300 shadow-sm',
          };
        case 'navy':
        default:
          return {
            bgMain: 'bg-slate-50 text-slate-900',
            bgSidebar: 'bg-white text-slate-900 border-r border-slate-200',
            bgCard: 'bg-white text-slate-900 border border-slate-200 shadow-sm',
          };
      }
    }

    switch (colorTheme) {
      case 'indigo':
        return {
          bgMain: 'bg-[#1e1b4b] text-white',
          bgSidebar: 'bg-[#312e81] text-slate-200 border-r border-indigo-900',
          bgCard: 'bg-[#3730a3] text-white shadow-xl',
        };
      case 'emerald':
        return {
          bgMain: 'bg-[#064e3b] text-white',
          bgSidebar: 'bg-[#065f46] text-slate-200 border-r border-emerald-900',
          bgCard: 'bg-[#047857] text-white shadow-xl',
        };
      case 'slate':
        return {
          bgMain: 'bg-slate-950 text-white',
          bgSidebar: 'bg-slate-900 text-slate-100 border-r border-slate-800',
          bgCard: 'bg-slate-900 text-white shadow-xl border border-slate-800',
        };
      case 'midnight':
        return {
          bgMain: 'bg-[#020617] text-white',
          bgSidebar: 'bg-[#030712] text-indigo-200 border-r border-indigo-950',
          bgCard: 'bg-[#0f172a] text-white shadow-xl',
        };
      case 'purple':
        return {
          bgMain: 'bg-[#2e1065] text-white',
          bgSidebar: 'bg-[#3b0764] text-purple-100 border-r border-purple-900',
          bgCard: 'bg-[#581c87] text-white shadow-xl',
        };
      case 'rose':
        return {
          bgMain: 'bg-[#4c0519] text-white',
          bgSidebar: 'bg-[#881337] text-rose-100 border-r border-rose-900',
          bgCard: 'bg-[#9f1239] text-white shadow-xl',
        };
      case 'amber':
        return {
          bgMain: 'bg-[#451a03] text-white',
          bgSidebar: 'bg-[#78350f] text-amber-100 border-r border-amber-900',
          bgCard: 'bg-[#92400e] text-white shadow-xl',
        };
      case 'cyan':
        return {
          bgMain: 'bg-[#082f49] text-white',
          bgSidebar: 'bg-[#083344] text-cyan-100 border-r border-cyan-900',
          bgCard: 'bg-[#0e7490] text-white shadow-xl',
        };
      case 'red':
        return {
          bgMain: 'bg-[#450a0a] text-white',
          bgSidebar: 'bg-[#7f1d1d] text-red-100 border-r border-red-900',
          bgCard: 'bg-[#991b1b] text-white shadow-xl',
        };
      case 'dark':
        return {
          bgMain: 'bg-black text-white',
          bgSidebar: 'bg-zinc-900 text-zinc-100 border-r border-zinc-800',
          bgCard: 'bg-zinc-900 text-white shadow-xl border border-zinc-800',
        };
      case 'navy':
      default:
        return {
          bgMain: 'bg-[#222D3D] text-white',
          bgSidebar: 'bg-[#1B2A35] text-slate-300 border-r border-slate-700/50',
          bgCard: 'bg-[#1B2A35] text-white shadow-lg border border-slate-700/40',
        };
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, colorTheme, setColorTheme: handleSetColorTheme, isSidebarOpen, toggleSidebar, setIsSidebarOpen, getThemeClasses }}>
      <div className={`${getThemeClasses().bgMain} min-h-screen transition-colors duration-300`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme harus digunakan di dalam ThemeProvider');
  return context;
}