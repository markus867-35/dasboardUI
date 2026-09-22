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
  const [isMounted, setIsMounted] = useState(false);
  
  // Saat refresh, tab selalu kembali bersih hanya dengan Dashboard (atau halaman aktif saat ini)
  const [tabs, setTabs] = useState<TabItem[]>([
    { name: 'Dashboard', path: '/dashboard' }
  ]);

  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    // Bagian localStorage.getItem('app_tabs') sengaja dihapus 
    // agar riwayat tab terhapus bersih setiap kali browser/halaman di-refresh.
  }, []);

 useEffect(() => {
    if (!isMounted || !pathname) return;

    // Cari tahu kata kunci mana yang ada di dalam URL path saat ini
    let tabName = 'Dashboard';
    let customNameKey = '';

    if (pathname.includes('countries')) customNameKey = 'countries';
    else if (pathname.includes('currencies')) customNameKey = 'currencies';
    else if (pathname.includes('directory')) customNameKey = 'directory';
    else if (pathname.includes('form')) customNameKey = 'form';
    else if (pathname.includes('image')) customNameKey = 'image';
    else if (pathname.includes('music')) customNameKey = 'music';
    else if (pathname.includes('video')) customNameKey = 'video';
    else if (pathname.includes('active')) customNameKey = 'active';
    else if (pathname.includes('history')) customNameKey = 'history';
    else if (pathname.includes('game')) customNameKey = 'game';
    else if (pathname.includes('daily')) customNameKey = 'daily';
    else if (pathname.includes('monthly')) customNameKey = 'monthly';
    else if (pathname.includes('unread')) customNameKey = 'unread';
    else if (pathname.includes('settings')) customNameKey = 'settings';
    else if (pathname.includes('profile')) customNameKey = 'profile';

    const customNames: Record<string, string> = {
      'countries': 'Country List',
      'currencies': 'Currencies',
      'directory': 'Name Directory',
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
    };

    if (customNameKey && customNames[customNameKey]) {
      tabName = customNames[customNameKey];
    } else {
      // Fallback jika tidak ada di kamus
      const segments = pathname.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1] || 'Dashboard';
      tabName = lastSegment.replace(/-/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase());
    }

    setTabs((prevTabs: TabItem[]) => {
      const exists = prevTabs.some((tab: TabItem) => tab.path === pathname);
      if (!exists) {
        return [...prevTabs, { name: tabName, path: pathname }];
      }
      return prevTabs;
    });
  }, [pathname, isMounted]);

  const removeTab = (path: string, e: MouseEvent) => {
    e.stopPropagation();
    setTabs((prevTabs: TabItem[]) => {
      if (prevTabs.length <= 1) return prevTabs;
      const updatedTabs = prevTabs.filter((tab: TabItem) => tab.path !== path);
      return updatedTabs;
    });
  };

  return (
    <TabContext.Provider value={{ tabs, removeTab }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabs(): TabContextType {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
}