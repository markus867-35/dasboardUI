'use client';
import { createContext, useContext, useState, useEffect } from 'react';

type SidebarTheme = 'sidebar-dark' | 'sidebar-navy' | 'sidebar-slate' | 'sidebar-midnight' | 'sidebar-emerald' | 'sidebar-purple'; // <-- Tambahkan tema baru di sini

interface SidebarThemeContextType {
  sidebarTheme: SidebarTheme;
  setSidebarTheme: (theme: SidebarTheme) => void;
}

const SidebarThemeContext = createContext<SidebarThemeContextType | undefined>(undefined);

export function SidebarThemeProvider({ children }: { children: React.ReactNode }) {
  const [sidebarTheme, setSidebarThemeState] = useState<SidebarTheme>('sidebar-navy');

  useEffect(() => {
    const savedSidebarTheme = localStorage.getItem('custom_sidebar_theme') as SidebarTheme;
    if (savedSidebarTheme) setSidebarThemeState(savedSidebarTheme);
  }, []);

  const setSidebarTheme = (theme: SidebarTheme) => {
    setSidebarThemeState(theme);
    localStorage.setItem('custom_sidebar_theme', theme);
  };

  return (
    <SidebarThemeContext.Provider value={{ sidebarTheme, setSidebarTheme }}>
      {children}
    </SidebarThemeContext.Provider>
  );
}

export function useSidebarTheme() {
  const context = useContext(SidebarThemeContext);
  if (!context) throw new Error('useSidebarTheme harus digunakan di dalam SidebarThemeProvider');
  return context;
}