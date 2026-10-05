'use client';
import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "@/app/context/ThemeContext";
import { TabProvider } from "@/app/context/TabContext";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import TagsView from "@/app/components/TagsView";
import { FontSizeProvider, useFontSize, FontSizeContextType } from '@/app/context/FontSizeContext';
import { LanguageProvider } from "@/app/context/LanguageContext";
import { SidebarThemeProvider } from '@/app/context/SidebarThemeContext';
import { useRouter } from "next/navigation";

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { isSidebarOpen, setIsSidebarOpen } = useTheme();
  const { fontSize } = useFontSize() as FontSizeContextType;
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Pastikan sesi login aman saat di-refresh
    const adminId = localStorage.getItem('adminId');
    if (!adminId) {
      router.push('/login');
    } else {
      setIsAuthReady(true);
    }

    if (window.innerWidth < 1024 && typeof setIsSidebarOpen === 'function') {
      setIsSidebarOpen(false);
    }
  }, [setIsSidebarOpen, router]);

  // Tampilkan loading sebentar saat proses sinkronisasi refresh agar tidak crash
  if (!isAuthReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#142028] text-white">
        <p>Memuat ulang sesi...</p>
      </div>
    );
  }

  return (
    <TabProvider>
      <div className={`flex min-h-screen w-full relative ${fontSize}`}>
        {/* BACKDROP MOBILE */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 lg:hidden cursor-pointer backdrop-blur-xs transition-opacity"
            aria-label="Tutup sidebar"
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar />
        </aside>

        {/* Konten Utama */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ml-0 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
          <Header />
          <TagsView />
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full box-border">{children}</main>
        </div>
      </div>
    </TabProvider>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider> 
      <FontSizeProvider>
        <ThemeProvider>
          <SidebarThemeProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
          </SidebarThemeProvider>
        </ThemeProvider>
      </FontSizeProvider>
    </LanguageProvider>
  );
}