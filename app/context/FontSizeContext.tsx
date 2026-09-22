'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FontSizeContextType {
  fontSize: string;
  changeFontSize: (size: string) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<string>('default');

  const applyFontSize = (size: string) => {
    if (typeof window === 'undefined') return;
    const htmlElement = document.documentElement;
    
    // Berikan tipe Record<string, string> agar aman diindeks oleh string
    const scales: Record<string, string> = {
      default: '100%', // 16px
      medium: '112.5%', // 18px
      small: '87.5%',  // 14px
      mini: '75%',     // 12px
    };

    htmlElement.style.fontSize = scales[size] || '100%';
  };

  useEffect(() => {
    const savedSize = localStorage.getItem('global_font_size');
    if (savedSize) {
      setFontSize(savedSize);
      applyFontSize(savedSize);
    }
  }, []);

  const changeFontSize = (size: string) => {
    setFontSize(size);
    localStorage.setItem('global_font_size', size);
    applyFontSize(size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, changeFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize(): FontSizeContextType {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}