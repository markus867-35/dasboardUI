'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSize] = useState('default');

  useEffect(() => {
    const savedSize = localStorage.getItem('global_font_size');
    if (savedSize) {
      setFontSize(savedSize);
      applyFontSize(savedSize);
    }
  }, []);

  const applyFontSize = (size) => {
    if (typeof window === 'undefined') return;
    const htmlElement = document.documentElement;
    
    // Skala persentase root (100% = 16px)
    const scales = {
      default: '100%', // 16px
      medium: '112.5%', // 18px
      small: '87.5%',  // 14px
      mini: '75%',     // 12px
    };

    htmlElement.style.fontSize = scales[size] || '100%';
  };

  const changeFontSize = (size) => {
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

export const useFontSize = () => useContext(FontSizeContext);