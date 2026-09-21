'use client';
import { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'dark' | 'light';
type ColorTheme = 'navy' | 'indigo' | 'emerald';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('navy');
  
  // 1. Definisikan state isSidebarOpen di sini
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Ambil data dari localStorage saat pertama kali dimuat di browser
  useEffect(() => {
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

  // Bungkus fungsi setColorTheme agar otomatis menyimpan ke localStorage
  const handleSetColorTheme = (theme: ColorTheme) => {
    setColorTheme(theme);
    localStorage.setItem('app_color_theme', theme);
  };

  // 2. Perbaiki fungsi toggleSidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Kamus warna latar belakang berdasarkan tema yang dipilih
  const getThemeClasses = () => {
    if (mode === 'light') {
      return {
        bgMain: 'bg-slate-100 text-slate-800',
        bgSidebar: 'bg-white text-slate-700 border-r border-slate-200',
        bgCard: 'bg-white text-slate-800 border border-slate-200 shadow-sm',
      };
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
      case 'navy':
      default:
        return {
          bgMain: 'bg-[#222D3D] text-white',
          bgSidebar: 'bg-[#1B2A35] text-slate-300 border-r border-slate-700/50',
          bgCard: 'bg-white text-slate-800 shadow-lg',
        };
    }
  };

  return (
    // 3. Masukkan isSidebarOpen dan toggleSidebar ke dalam value Provider
    <ThemeContext.Provider value={{ mode, toggleMode, colorTheme, setColorTheme: handleSetColorTheme, isSidebarOpen, toggleSidebar, setIsSidebarOpen }}>
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