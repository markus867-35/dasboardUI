import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold text-amber-400 mb-4">
        Selamat Datang di Admin Panel Amoni
      </h1>
      <p className="text-slate-300 mb-8 max-w-md">
        Sistem manajemen data pribadi berbasis Next.js dan Tailwind CSS dengan tema gelap kustom.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all"
      >
        Masuk ke Dashboard Admin &rarr;
      </Link>
    </div>
  );
}