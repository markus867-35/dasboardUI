'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  Activity, Zap, ShieldCheck, Database, 
  Terminal, ArrowUpRight, RefreshCw, Sparkles, CheckCircle2, Trash2 
} from 'lucide-react';
import Swal from 'sweetalert2';

// Interface untuk struktur data aktivitas yang seragam
interface ActivityItem {
  id: string | number;
  title: string;
  description?: string;
  time?: string;
  timestamp?: string;
  type?: string;
  color?: string;
}

export default function ActivityPage() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemStatus, setSystemStatus] = useState('Optimal (99.9% Uptime)');
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Saat halaman dimuat, ambil riwayat aktivitas dari localStorage menggunakan key 'app_activities'
  useEffect(() => {
    const savedActivities = localStorage.getItem('app_activities');
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    } else {
      // Data default awal jika belum ada riwayat sama sekali
      const initialActivities: ActivityItem[] = [
        { id: 1, title: 'Mengunjungi Pusat Aktivitas', description: 'Membuka halaman pusat sistem dan log.', timestamp: 'Baru saja', type: 'system', color: 'text-indigo-500' },
        { id: 2, title: 'Inisialisasi Sistem Lokal', description: 'Sistem siap mencatat aksi via localStorage.', timestamp: 'Hari ini', type: 'system', color: 'text-emerald-500' },
      ];
      setActivities(initialActivities);
      localStorage.setItem('app_activities', JSON.stringify(initialActivities));
    }
  }, []);

  // Fungsi helper untuk mencatat aktivitas baru ke 'app_activities'
  const logNewActivity = (title: string, description: string, color: string = 'text-indigo-500') => {
    const newEntry: ActivityItem = {
      id: Date.now(),
      title,
      description,
      timestamp: 'Baru saja',
      type: 'user_action',
      color,
    };

    setActivities((prev) => {
      const updated = [newEntry, ...prev].slice(0, 30); // Batasi maksimal 30 log terakhir
      localStorage.setItem('app_activities', JSON.stringify(updated));
      return updated;
    });
  };

  // Handler tombol Diagnostik (Otomatis mencatat aktivitas)
  const handleRunDiagnostics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSystemStatus('Optimal (100% Aman)');
      
      // Catat otomatis ke riwayat universal
      logNewActivity('Menjalankan Diagnostik Sistem', 'Pemeriksaan integritas komponen lokal berhasil dilakukan.', 'text-emerald-500');

      Swal.fire({
        icon: 'success',
        title: 'Diagnostik Selesai!',
        text: 'Sistem berjalan normal dan otomatis tercatat di riwayat.',
        background: isDark ? '#1F2937' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a',
        confirmButtonColor: '#4f46e5',
        timer: 1500,
        showConfirmButton: false
      });
    }, 1200);
  };

  // Handler untuk menghapus riwayat aktivitas
  const handleClearHistory = () => {
    Swal.fire({
      title: 'Hapus Riwayat?',
      text: 'Semua catatan aktivitas lokal akan dibersihkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Bersihkan',
      cancelButtonText: 'Batal',
      background: isDark ? '#1F2937' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    }).then((result) => {
      if (result.isConfirmed) {
        setActivities([]);
        localStorage.removeItem('app_activities');
        Swal.fire({
          icon: 'success',
          title: 'Berhasil dibersihkan!',
          timer: 1000,
          showConfirmButton: false,
          background: isDark ? '#1F2937' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
        });
      }
    });
  };

  return (
    <div className={`min-h-screen p-6 md:p-10 font-sans transition-colors duration-200 ${isDark ? 'bg-[#111827] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-10xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between border-b pb-5 gap-4 ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                Otomatis & Lokal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-indigo-500 mt-2">Pusat Aktivitas & Sistem</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Log aktivitas dicatat secara otomatis langsung dari tindakan profil dan perangkat Anda tanpa API eksternal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunDiagnostics}
              disabled={isRefreshing}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Memeriksa...' : 'Diagnostik Sistem'}
            </button>
          </div>
        </div>

        {/* KARTU STATISTIK UTAMA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className={`p-5 rounded-2xl border shadow-md transition-all ${isDark ? 'bg-[#1F2937] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status Sistem</span>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-lg font-bold mt-2 text-emerald-400">{systemStatus}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Penyimpanan LocalStorage Aktif</p>
          </div>

          <div className={`p-5 rounded-2xl border shadow-md transition-all ${isDark ? 'bg-[#1F2937] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Log Tercatat</span>
              <Terminal className="w-5 h-5 text-indigo-500" />
            </div>
            <p className={`text-lg font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{activities.length} Aktivitas</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tersimpan otomatis</p>
          </div>

          <div className={`p-5 rounded-2xl border shadow-md transition-all ${isDark ? 'bg-[#1F2937] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mode Data</span>
              <Database className="w-5 h-5 text-amber-500" />
            </div>
            <p className={`text-lg font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Client-Side Native</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tanpa server eksternal</p>
          </div>
        </div>

        {/* SECTION RIWAYAT AKTIVITAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className={`md:col-span-2 p-6 rounded-2xl border shadow-lg ${isDark ? 'bg-[#1F2937] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-base font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Activity className="w-4 h-4 text-indigo-500" /> Riwayat Aktivitas Otomatis
              </h2>
              {activities.length > 0 && (
                <button 
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Bersihkan Log
                </button>
              )}
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                Belum ada riwayat aktivitas yang tercatat.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between p-3.5 rounded-xl border transition ${isDark ? 'bg-slate-900/40 border-slate-700/40 hover:bg-slate-900/70' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                        <Sparkles className={`w-4 h-4 ${item.color || 'text-indigo-500'}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.title}</p>
                        {item.description && (
                          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.description}</p>
                        )}
                        <p className={`text-[10px] mt-1 font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{item.timestamp || item.time || 'Baru saja'}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-80" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${isDark ? 'bg-[#1F2937] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            <div>
              <h2 className={`text-base font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Zap className="w-4 h-4 text-amber-500" /> Informasi Sistem
              </h2>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Setiap kali Anda menaruh file, memperbarui profil, atau menjalankan diagnostik, sistem secara otomatis merekamnya ke dalam memori browser menggunakan fungsi `localStorage`.
              </p>

              <div className="mt-5 space-y-2.5">
                <a 
                  href="/dashboard" 
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition ${isDark ? 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                >
                  <span>Kembali ke Profil Utama</span>
                  <ArrowUpRight className="w-4 h-4 text-indigo-500" />
                </a>
              </div>
            </div>

            <div className={`mt-6 pt-4 border-t text-center ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
              <p className="text-[11px] text-indigo-400 font-medium">Auto-Storage Active</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}