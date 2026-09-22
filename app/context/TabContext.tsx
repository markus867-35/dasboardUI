'use client';
import { createContext, useContext, useState, useEffect, ReactNode, MouseEvent } from 'react';
import { usePathname } from 'next/navigation';

interface TabItem {
  name: string;
  path: string;
}

interface TabContextType {
  tabs: TabItem[];
  removeTab: (path: string, e: MouseEvent) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  // 1. Ambil data awal dari localStorage jika ada, agar tidak hilang saat berpindah halaman
  const [tabs, setTabs] = useState<TabItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_tabs');
      if (saved) {
        try { 
          return JSON.parse(saved); 
        } catch { 
          /* ignore */ 
        }
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
        .replace(/^\w/, (c: string) => c.toUpperCase());

      // Berikan tipe Record<string, string> agar aman diakses dengan indeks string
      const customNames: Record<string, string> = {
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

      setTabs((prevTabs: TabItem[]) => {
        // Cek apakah tab sudah ada berdasarkan path-nya
        const exists = prevTabs.some((tab: TabItem) => tab.path === pathname);
        if (!exists) {
          const updatedTabs = [...prevTabs, { name: tabName, path: pathname }];
          localStorage.setItem('app_tabs', JSON.stringify(updatedTabs));
          return updatedTabs;
        }
        return prevTabs;
      });
    }
  }, [pathname]);

  const removeTab = (path: string, e: MouseEvent) => {
    e.stopPropagation();
    setTabs((prevTabs: TabItem[]) => {
      if (prevTabs.length <= 1) return prevTabs;
      const updatedTabs = prevTabs.filter((tab: TabItem) => tab.path !== path);
      localStorage.setItem('app_tabs', JSON.stringify(updatedTabs));
      return updatedTabs;
    });
  };

  return (
    <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap py-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-500/20 hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/40 [&::-webkit-scrollbar-thumb]:rounded-full">
    <TabContext.Provider value={{ tabs, removeTab }}>
      {children}
    </TabContext.Provider>
    </div>
  );
}

export function useTabs(): TabContextType {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
}