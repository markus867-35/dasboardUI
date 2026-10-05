'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext<any>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState('dark');
  const [colorTheme, setColorTheme] = useState('navy');
  const [mounted, setMounted] = useState(false);

  // Jalankan pembacaan localStorage HANYA setelah komponen terpasang di klien
  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem('theme_mode');
    const savedColor = localStorage.getItem('color_theme');
    if (savedMode) setMode(savedMode);
    if (savedColor) setColorTheme(savedColor);
  }, []);

  // Mencegah render tema mentah di server yang memicu Error #418
  if (!mounted) {
    return <>{children}</>; 
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);