import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from "@/app/context/ThemeContext";
import { LanguageProvider } from "@/app/context/LanguageContext";
import { FontSizeProvider } from '@/app/context/FontSizeContext';
import { SidebarThemeProvider } from '@/app/context/SidebarThemeContext';

export const metadata: Metadata = {
  title: 'Data-save-Markus',
  description: 'Aplikasi Dashboard & Manajemen Data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased bg-[#142028] text-white">
        {/* Bungkus di Root Layout agar /login dan halaman lain tidak error missing Provider */}
        <LanguageProvider> 
          <FontSizeProvider>
            <ThemeProvider>
              <SidebarThemeProvider>
                {children}
              </SidebarThemeProvider>
            </ThemeProvider>
          </FontSizeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}