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
  const [tabs, setTabs] = useState<TabItem[]>([
    { name: 'Dashboard', path: '/dashboard' }
  ]);

  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !pathname) return;
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'Dashboard';
    const formattedName = lastSegment
      .replace(/-/g, ' ')
      .replace(/^\w/, (c: string) => c.toUpperCase());

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
      return prevTabs.filter((tab: TabItem) => tab.path !== path);
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