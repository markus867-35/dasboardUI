'use client';
import "./globals.css";
import { ReactNode, useEffect } from "react";
import { ThemeProvider, useTheme } from "@/app/context/ThemeContext";
import { TabProvider } from "@/app/context/TabContext";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import TagsView from "@/app/components/TagsView";
import { FontSizeProvider, useFontSize, FontSizeContextType } from '@/app/context/FontSizeContext';
import { LanguageProvider } from "@/app/context/LanguageContext";
import { SidebarThemeProvider } from '@/app/context/SidebarThemeContext';

// Komponen internal untuk menangani efek responsif sidebar & ukuran font
function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { isSidebarOpen, setIsSidebarOpen } = useTheme();
  const { currentSizeClass } = useFontSize() as FontSizeContextType;

  useEffect(() => {
    if (window.innerWidth < 1024 && typeof setIsSidebarOpen === 'function') {
      setIsSidebarOpen(false);
    }
  }, [setIsSidebarOpen]);

  return (
    <TabProvider>
      <div className={`flex min-h-screen w-full relative ${currentSizeClass}`}>
        
        {/* BACKDROP / AREA KLIK PENUTUP DI MOBILE */}
        {isSidebarOpen && (
          <div 
            onClick={() => {
              if (typeof setIsSidebarOpen === 'function') {
                setIsSidebarOpen(false);
              }
            }}
            onTouchEnd={() => {
              if (typeof setIsSidebarOpen === 'function') {
                setIsSidebarOpen(false);
              }
            }}
            className="fixed inset-0 bg-black/60 z-50 lg:hidden cursor-pointer backdrop-blur-xs transition-opacity"
            aria-label="Tutup sidebar"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar />
        </aside>

        {/* Konten Utama */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ml-0 ${
            isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
          }`}
        >
          <Header />
          <TagsView />
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full box-border">{children}</main>
        </div>
      </div>
    </TabProvider>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased bg-[#142028] text-white">
        <LanguageProvider> 
          <FontSizeProvider>
            <ThemeProvider>
              <SidebarThemeProvider>
                {/* Diubah dari DashboardLayout menjadi DashboardLayoutContent */}
                <DashboardLayoutContent>{children}</DashboardLayoutContent>
              </SidebarThemeProvider>
            </ThemeProvider>
          </FontSizeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}