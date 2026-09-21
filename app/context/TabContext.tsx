'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const TabContext = createContext();

export function TabProvider({ children }) {
  // 1. Ambil data awal dari localStorage jika ada, agar tidak hilang saat berpindah halaman
  const [tabs, setTabs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_tabs');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return [{ name: 'Dashboard', path: '/dashboard' }];
  });

  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      const segments = pathname.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1] || 'Dashboard';
      const formattedName = lastSegment
        .replace(/-/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase());

      const customNames = {
        'form': 'File Manager',
        'image': 'Manager Image',
        'music': 'Manager Music',
        'video': 'Manager Video',
        'active': 'Link 1',
        'history': 'Link 2',
        'game': 'Link 3',
        'daily': 'Daily Summary',
        'monthly': 'Monthly Report',
        'unread': 'Unread Alerts',
        'settings': 'Alert Preferences',
        'profile': 'Profile',
        'others': 'Lain-lain',
      };

      const tabName = customNames[lastSegment] || formattedName;

      setTabs((prevTabs) => {
        // Cek apakah tab sudah ada berdasarkan path-nya
        const exists = prevTabs.some((tab) => tab.path === pathname);
        if (!exists) {
          const updatedTabs = [...prevTabs, { name: tabName, path: pathname }];
          localStorage.setItem('app_tabs', JSON.stringify(updatedTabs));
          return updatedTabs;
        }
        return prevTabs;
      });
    }
  }, [pathname]);

  const removeTab = (path, e) => {
    e.stopPropagation();
    setTabs((prevTabs) => {
      if (prevTabs.length <= 1) return prevTabs;
      const updatedTabs = prevTabs.filter((tab) => tab.path !== path);
      localStorage.setItem('app_tabs', JSON.stringify(updatedTabs));
      return updatedTabs;
    });
  };

  return (
    <TabContext.Provider value={{ tabs, removeTab }}>
      {children}
    </TabContext.Provider>
  );
}

export const useTabs = () => useContext(TabContext);