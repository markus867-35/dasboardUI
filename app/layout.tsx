import type { Metadata } from 'next';
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}