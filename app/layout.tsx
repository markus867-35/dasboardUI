import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/app/context/ThemeContext'; // Sesuaikan path import jika berbeda

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en">
      <body className={inter.className}>
        {/* Bungkus dengan ThemeProvider agar semua halaman (termasuk /login) bisa akses useTheme() */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}