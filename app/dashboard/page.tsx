'use client';
import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/app/context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, LabelList } from 'recharts';
import { supabase } from '@/lib/supabase';

// 🚀 TAMBAHKAN INTERFACE INI DI SINI AGAR TIDAK ERROR "Cannot find name 'ActivityItem'"
export interface ActivityItem {
  id?: any;
  name?: string;
  email?: string;
  ip_address?: string;
  status?: string;
  logged_in_at?: string;
  logged_out_at?: string | null;
  // Tambahkan properti untuk aktivitas lokal/sistem di bawah ini:
  nama?: string;
  title?: string;
  description?: string;
  timestamp?: string;
  type?: string;
  color?: string;
}

interface AnimatedCounterProps {
  value: number | string;
}



function AnimatedCounter({ value }: AnimatedCounterProps) {
  const [count, setCount] = useState<number>(0);
  const target = parseInt(String(value), 10) || 0;

  useEffect(() => {
    let start = 0;
    const duration = 3000; 
    const incrementTime = 20; 
    const steps = duration / incrementTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{Number(count).toLocaleString('id-ID')}</span>;
}

// ==========================================
// HALAMAN UTAMA DASHBOARD
// ==========================================
export default function DashboardPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [recentVisitors, setRecentVisitors] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActivityItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
const [stats, setStats] = useState({
    totalVideo: 0,
    totalFile: 0,
    totalMusic: 0,
    totalGambar: 0,
    totalUangMasuk: 0,
    totalUangKeluar: 0,
    totalStokBarang: 0,
    totalData: 0,
  });

// State untuk filter tanggal Active Sessions
const [sessionFilterDate, setSessionFilterDate] = useState<string>(
  new Date().toISOString().split('T')[0] // Default: Tanggal hari ini (YYYY-MM-DD)
);


// Jalankan fetch saat komponen pertama kali dimuat atau saat sessionFilterDate berubah
  useEffect(() => {
    fetchActiveSessionsByDate(sessionFilterDate);
  }, [sessionFilterDate]);

  async function fetchActiveSessionsByDate(selectedDate: string) {
    const startOfDay = `${selectedDate}T00:00:00`;
    const endOfDay = `${selectedDate}T23:59:59`;

    const { data: sessionRes, error: sessionErr } = await supabase
      .from('login_sessions')
      .select('id, name, email, ip_address, status, logged_in_at, logged_out_at')
      .in('status', ['Aktif Bekerja', 'Offline'])
      .gte('logged_in_at', startOfDay) // Filter berdasarkan waktu login pada tanggal tersebut
      .lte('logged_in_at', endOfDay)
      .order('logged_in_at', { ascending: false });

    if (!sessionErr && sessionRes) {
      const formattedSessions: ActivityItem[] = sessionRes.map((admin) => ({
        id: admin.id,
        name: admin.name || 'Tanpa Nama',      
        email: admin.email || 'Tidak ada email', 
        ip_address: admin.ip_address || '192.168.1.15', 
        status: admin.status || 'Aktif Bekerja',
        logged_in_at: admin.logged_in_at,
        logged_out_at: admin.logged_out_at || '-',
      }));
      setActiveSessions(formattedSessions);
    } else {
      console.error('Gagal mengambil sesi:', sessionErr);
    }
  }



  const [filterDate, setFilterDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
    // 3. useEffect di level teratas (TIDAK di dalam if atau fungsi lain)
// Panggil fungsi ini saat pertama kali load atau saat filterDate berubah
  useEffect(() => {
    fetchActivitiesByDate(filterDate);
  }, [filterDate]);

  async function fetchActivitiesByDate(selectedDate: string) {
    // Buat rentang waktu dari jam 00:00:00 sampai 23:59:59 pada tanggal yang dipilih
    const startOfDay = `${selectedDate}T00:00:00`;
    const endOfDay = `${selectedDate}T23:59:59`;

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Map data Supabase agar sesuai dengan format tampilan tabel (timestamp, dll)
      const formatted = data.map((item: any) => ({
        ...item,
        // Format tanggal/waktu dari Supabase agar rapi ditampilkan di kolom waktu
        timestamp: new Date(item.created_at).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      }));
      setActivities(formatted);
    } else {
      console.error('Gagal mengambil riwayat:', error);
    }
  }


  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isMounted, setIsMounted] = useState(false);
  const { mode, colorTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    setIsLoaded(true);
    
    // Cek sesi admin
    const adminId = localStorage.getItem('adminId');
    if (!adminId) {
      window.location.href = '/login';
      return;
    }

    // Ambil data dari Supabase
    fetchDashboardData();
  }, []);


// 2. Fungsi untuk menambah aktivitas baru langsung ke Supabase
const addActivity = async (newAct: {
    nama: string;
    title: string;
    description: string;
    type?: string;
    color?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert([newAct])
        .select();

      if (error) {
        console.error('❌ Gagal insert ke Supabase:', error.message, error.details);
        alert('Gagal menyimpan aktivitas: ' + error.message);
        return;
      }

      if (data) {
        console.log('✅ Berhasil menyimpan:', data);
        setActivities((prev) => [data[0], ...prev]);
      }
    } catch (err) {
      console.error('❌ Error tak terduga:', err);
    }
  };


async function fetchDashboardData() {
    try {

      // 1. Ambil data Active Sessions langsung dari tabel login_sessions
      const { data: sessionRes, error: sessionErr } = await supabase
        .from('login_sessions')
        .select('id, name, email, ip_address, status, logged_in_at, logged_out_at')
        .in('status', ['Aktif Bekerja', 'Offline'])
        .order('logged_in_at', { ascending: false });

      if (!sessionErr && sessionRes) {
        const formattedSessions: ActivityItem[] = sessionRes.map((admin) => ({
          id: admin.id,
          name: admin.name || 'Tanpa Nama',      
          email: admin.email || 'Tidak ada email', 
          ip_address: admin.ip_address || '192.168.1.15', 
          status: admin.status || 'Aktif Bekerja',
          logged_in_at: admin.logged_in_at,
          logged_out_at: admin.logged_out_at || '-',
        }));
        setActiveSessions(formattedSessions);
      }

      // 2. Ambil data dari tabel-tabel utama secara parallel (untuk statistik & grafik mingguan otomatis)
      const [
        { data: videos },
        { data: files },
        { data: music },
        { data: images },
        { data: stockData },
        { data: txData },
        { data: monthRes, error: monthErr }
      ] = await Promise.all([
        supabase.from('video_tracks').select('created_at'),
        supabase.from('file_items').select('created_at'),
        supabase.from('music_tracks').select('created_at'),
        supabase.from('image_items').select('created_at'),
        supabase.from('online_shop_stock').select('stock'),
        supabase.from('transactions').select('type, amount'),
        supabase.from('product_trends_month').select('date, Desktops, Laptops, Mobiles').order('date', { ascending: true })
      ]);

      // 3. Hitung jumlah total item untuk Kartu Statistik
      const vCount = videos?.length || 0;
      const fCount = files?.length || 0;
      const mCount = music?.length || 0;
      const iCount = images?.length || 0;
      const calculatedTotalData = vCount + fCount + mCount + iCount;

      // 4. Hitung total penjumlahan stok barang
      let totalStokBarang = 0;
      if (stockData) {
        stockData.forEach((item: any) => {
          totalStokBarang += Number(item.stock) || 0;
        });
      }

      // 5. Hitung Uang Masuk dan Uang Keluar dari tabel transaksi
      let uangMasuk = 0;
      let uangKeluar = 0;

      if (txData) {
        txData.forEach((tx: any) => {
          const tipe = String(tx.type || '').toLowerCase();
          if (tipe === 'income' || tipe === 'masuk' || tipe === 'pemasukan') {
            uangMasuk += Number(tx.amount) || 0;
          } else if (tipe === 'expense' || tipe === 'keluar' || tipe === 'pengeluaran') {
            uangKeluar += Number(tx.amount) || 0;
          }
        });
      }

    // 1. Membuat kotak penyimpanan untuk 7 hari ke belakang (berisi tanggal & nama hari)
      const last7DaysMap: { [key: string]: { label: string; count: number } } = {};
      const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        const dayName = daysName[d.getDay()];

        last7DaysMap[dateKey] = {
          label: dayName,
          count: 0
        };
      }

      // 2. Mengambil semua data dan mencocokkannya ke tanggal yang tepat di masing-masing hari
      const allItems = [...(videos || []), ...(files || []), ...(music || []), ...(images || [])];
      
      allItems.forEach((item: any) => {
        if (item.created_at) {
          const itemDate = new Date(item.created_at);
          
          const year = itemDate.getFullYear();
          const month = String(itemDate.getMonth() + 1).padStart(2, '0');
          const day = String(itemDate.getDate()).padStart(2, '0');
          const itemDateKey = `${year}-${month}-${day}`;

          // Jika tanggal data di database cocok dengan salah satu dari 7 hari tersebut, tambahkan hitungannya di hari itu
          if (last7DaysMap[itemDateKey] !== undefined) {
            last7DaysMap[itemDateKey].count += 1;
          }
        }
      });

      // 3. Menampilkan hasilnya ke grafik sesuai urutan hari
      const generatedChartData = Object.keys(last7DaysMap).map((dateKey) => ({
        date: last7DaysMap[dateKey].label,
        total: last7DaysMap[dateKey].count,
      }));

      setChartData(generatedChartData);

      // 7. Grafik Bulanan dengan fallback aman jika tabel bulanan kosong
      if (!monthErr && monthRes && monthRes.length > 0) {
        setMonthData(monthRes);
      } else {
        setMonthData([
          { date: 'Jan', Desktops: 100, Laptops: 150, Mobiles: 200 },
          { date: 'Feb', Desktops: 120, Laptops: 170, Mobiles: 220 },
          { date: 'Mar', Desktops: 140, Laptops: 160, Mobiles: 250 },
          { date: 'Apr', Desktops: 180, Laptops: 200, Mobiles: 300 },
        ]);
      }

      // 8. Masukkan seluruh hasil perhitungan ke dalam state stats
      setStats({
        totalVideo: vCount,
        totalFile: fCount,
        totalMusic: mCount,
        totalGambar: iCount,
        totalUangMasuk: uangMasuk,
        totalUangKeluar: uangKeluar,
        totalStokBarang: totalStokBarang,
        totalData: calculatedTotalData,
      });

    } catch (error) {
      console.error('Gagal mengambil data dari Supabase:', error);
    }
  }

  // Pengecekan mounted (harus di bawah deklarasi hooks & fungsi)
  if (!isMounted) return null;
  

  const getCardStyle = () => {
    if (mode === 'light') {
      switch (colorTheme) {
        case 'indigo': return 'bg-indigo-100 text-indigo-950 border border-indigo-300 shadow-md';
        case 'emerald': return 'bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-md';
        case 'purple': return 'bg-purple-100 text-purple-950 border border-purple-300 shadow-md';
        case 'rose': return 'bg-rose-100 text-rose-950 border border-rose-300 shadow-md';
        case 'amber': return 'bg-amber-100 text-amber-950 border border-amber-300 shadow-md';
        case 'cyan': return 'bg-cyan-100 text-cyan-950 border border-cyan-300 shadow-md';
        case 'red': return 'bg-red-100 text-red-950 border border-red-300 shadow-md';
        case 'navy':
        default: return 'bg-slate-100 text-slate-900 border border-slate-300 shadow-md';
      }
    } else {
      switch (colorTheme) {
        case 'indigo': return 'bg-[#3730a3] text-white shadow-xl border border-indigo-700/50';
        case 'emerald': return 'bg-[#047857] text-white shadow-xl border border-emerald-700/50';
        case 'slate': return 'bg-slate-900 text-white shadow-xl border border-slate-800';
        case 'midnight': return 'bg-[#0f172a] text-white shadow-xl border border-indigo-950';
        case 'purple': return 'bg-[#581c87] text-white shadow-xl border border-purple-900';
        case 'rose': return 'bg-[#9f1239] text-white shadow-xl border border-rose-900';
        case 'amber': return 'bg-[#92400e] text-white shadow-xl border border-amber-900';
        case 'cyan': return 'bg-[#0e7490] text-white shadow-xl border border-cyan-900';
        case 'red': return 'bg-[#991b1b] text-white shadow-xl border border-red-900';
        case 'navy':
        default: return 'bg-[#1B2A35] text-white shadow-xl border border-slate-700/60';
      }
    }
  };

  const getCardSubText = () => {
    if (mode === 'light') {
      switch (colorTheme) {
        case 'indigo': return 'text-indigo-600';
        case 'emerald': return 'text-emerald-600';
        case 'navy':
        default: return 'text-slate-500';
      }
    }
    return 'text-slate-300';
  };

  const getIconBg = () => {
    if (mode === 'light') {
      switch (colorTheme) {
        case 'indigo': return 'bg-indigo-100 text-indigo-700';
        case 'emerald': return 'bg-emerald-100 text-emerald-700';
        case 'navy':
        default: return 'bg-slate-100 text-slate-800';
      }
    }
    return 'bg-white/10 text-white';
  };



const logActivity = (title: string, description: string, color = 'text-indigo-500', type = 'transaction') => {
  // 🚀 PAKSA LANGSUNG: Tidak pakai localStorage yang sering kosong, langsung tetapkan 'miakhalifa'
  const currentAdminName = 'miakhalifa';

  const newActivity = {
    id: Date.now(),
    nama: currentAdminName, // Pastikan properti nama terisi 'miakhalifa'
    title,
    description,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    type,
    color,
  };

  setActivities((prev) => {
    const updated = [newActivity, ...prev];
    localStorage.setItem('app_activities', JSON.stringify(updated));
    return updated;
  });
};




  
  return (
    <div className="w-full max-w-full box-border space-y-6 px-3 sm:px-6 overflow-x-hidden">
      
      {/* 1. Barisan Kartu Statistik */}
 {/* 1. Barisan Kartu Statistik */}
<div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {[
    { title: 'Total video', value: stats.totalVideo, icon: '🎬', href: '/dashboard/add-data/file-video' },
    { title: 'Total file', value: stats.totalFile, icon: '📁', href: '/dashboard/add-data/file-manager' },
    { title: 'Total music', value: stats.totalMusic, icon: '🎵', href: '/dashboard/add-data/file-music' },
    { title: 'Total gambar', value: stats.totalGambar, icon: '🖼️', href: '/dashboard/add-data/file-image' },
    { title: 'Total uang masuk', value: stats.totalUangMasuk, icon: '📥', href: '/dashboard/setting/finance' },
    { title: 'Total uang keluar', value: stats.totalUangKeluar, icon: '📤', href: '/dashboard/setting/finance' },
    { title: 'Total stok barang', value: stats.totalStokBarang, icon: '📦', href: '/dashboard/otomotif/ban' },
    { title: 'Total data', value: stats.totalData, icon: '📊', href: '/dashboard' },
  ].map((item, idx) => (
    <a 
      key={idx} 
      href={item.href} // Mengarahkan ke halaman masing-masing
      className={`w-full p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 transform relative overflow-hidden box-border cursor-pointer hover:scale-[1.02] ${getCardStyle()} ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${getCardSubText()}`}>{item.title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold mt-1">
            <AnimatedCounter value={item.value} />
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${getIconBg()}`}>
          {item.icon}
        </div>
      </div>
    </a>
  ))}
</div>




{/* 2. Bagian Grafik */}
      <div className={`w-full rounded-2xl p-4 sm:p-6 box-border transition-colors duration-300 ${getCardStyle()}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold">
            {viewMode === 'week' ? 'Total Data Masuk 7 Hari Terakhir ' : 'Product Trends By Month (Supabase)'}
          </h3>
          <div className={`flex space-x-1 text-xs p-1 rounded-xl ${mode === 'light' ? 'bg-black/5' : 'bg-white/10'}`}>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition-all shadow ${viewMode === 'week' ? 'bg-[#2E4053] text-white' : 'opacity-70'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition-all shadow ${viewMode === 'month' ? 'bg-[#2E4053] text-white' : 'opacity-70'}`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="h-64 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'week' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="date" stroke={mode === 'light' ? '#475569' : '#94a3b8'} fontSize={12} />
                <YAxis stroke={mode === 'light' ? '#475569' : '#94a3b8'} fontSize={12} />
                <Tooltip />
                {/* Diubah dari "registrasi" menjadi "total" */}
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="total" position="top" fill={mode === 'light' ? '#1e293b' : '#e2e8f0'} fontSize={11} />
                </Bar>
              </BarChart>
            ) : (
              <LineChart data={monthData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="date" stroke={mode === 'light' ? '#475569' : '#94a3b8'} fontSize={12} />
                <YAxis stroke={mode === 'light' ? '#475569' : '#94a3b8'} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="Desktops" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Laptops" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="Mobiles" stroke="#84cc16" strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Tabel Data dari Supabase */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
   {/* Admin Activity / Transaction Log Table */}
<div className={`w-full rounded-2xl p-4 sm:p-6 box-border ${getCardStyle()}`}>
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
    <div>
      <h3 className="text-lg font-bold">Riwayat Aktivitas & Transaksi Admin</h3>
      <p className="text-xs opacity-70">Menampilkan riwayat tanggal: {filterDate}</p>
    </div>

    {/* 🚀 INPUT FILTER TANGGAL */}
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        className={`px-3 py-1.5 rounded-lg text-xs border outline-none ${
          mode === 'light'
            ? 'bg-white border-black/10 text-slate-700'
            : 'bg-slate-900 border-white/10 text-slate-200'
        }`}
      />
      <span className={`text-xs px-3 py-1.5 rounded-lg ${mode === 'light' ? 'text-slate-500 bg-black/5' : 'text-slate-200 bg-white/10'}`}>
        Realtime Log
      </span>
    </div>
  </div>
  
  {/* Bagian <table> tetap sama seperti milikmu sebelumnya ... */}
  <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg border border-black/5 dark:border-white/5">
    <table className="w-full text-left text-sm min-w-[650px] border-collapse">
      <thead className={`sticky top-0 z-20 ${mode === 'light' ? 'bg-slate-100 shadow-sm' : 'bg-slate-800 shadow-sm'}`}>
        <tr className={`border-b ${mode === 'light' ? 'border-black/10 text-slate-600' : 'border-white/10 text-slate-300'}`}>
          <th className="p-3 font-semibold whitespace-nowrap">Admin</th>
          <th className="p-3 font-semibold whitespace-nowrap">Aksi / Transaksi</th>
          <th className="p-3 font-semibold whitespace-nowrap">Keterangan Detail</th>
          <th className="p-3 font-semibold whitespace-nowrap">Waktu</th>
        </tr>
      </thead>
      <tbody className={`divide-y ${mode === 'light' ? 'divide-black/5 text-slate-700' : 'divide-white/10 text-slate-200'}`}>
        {activities.length === 0 ? (
          <tr>
            <td colSpan={4} className="py-6 text-center opacity-70">
              Belum ada riwayat aktivitas atau transaksi pada tanggal {filterDate}.
            </td>
          </tr>
        ) : (
          activities.map((item, index) => (
            <tr key={index} className={mode === 'light' ? 'hover:bg-black/[2%]' : 'hover:bg-white/[2%]'}>
              <td className="px-4 py-3 text-sm font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  {item.nama || 'Admin'}
                </span>
              </td>
              <td className="p-3 whitespace-nowrap font-semibold">{item.title}</td>
              <td className="p-3 whitespace-nowrap text-xs opacity-90">{item.description}</td>
              <td className="p-3 whitespace-nowrap text-xs font-mono">{item.timestamp}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>






{/* Active Sessions Table */}
<div className={`w-full rounded-2xl p-4 sm:p-6 box-border ${getCardStyle()}`}>
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
    <div>
      <h3 className="text-lg font-bold">Active Sessions & History</h3>
      <p className="text-xs opacity-70">Menampilkan sesi tanggal: {sessionFilterDate}</p>
    </div>
    
    {/* 🚀 INPUT FILTER TANGGAL SESI */}
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={sessionFilterDate}
        onChange={(e) => setSessionFilterDate(e.target.value)}
        className={`px-3 py-1.5 rounded-lg text-xs border outline-none ${
          mode === 'light'
            ? 'bg-white border-black/10 text-slate-700'
            : 'bg-slate-900 border-white/10 text-slate-200'
        }`}
      />
      <span className={`text-xs px-3 py-1.5 rounded-lg ${mode === 'light' ? 'text-slate-500 bg-black/5' : 'text-slate-200 bg-white/10'}`}>
        Live View
      </span>
    </div>
  </div>
  
  {/* Kontainer tabel tetap sama seperti kodenya di atas */}
  <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg border border-black/5 dark:border-white/5">
    <table className="w-full text-left text-sm min-w-[700px] border-collapse">
      <thead className={`sticky top-0 z-20 ${mode === 'light' ? 'bg-slate-100 shadow-sm' : 'bg-slate-800 shadow-sm'}`}>
        <tr className={`border-b ${mode === 'light' ? 'border-black/10 text-slate-600' : 'border-white/10 text-slate-300'}`}>
          <th className="p-3 font-semibold whitespace-nowrap">User</th>
          <th className="p-3 font-semibold whitespace-nowrap">Email</th>
          <th className="p-3 font-semibold whitespace-nowrap">IP Address</th>
          <th className="p-3 font-semibold whitespace-nowrap">Waktu (Login / Logout)</th>
          <th className="p-3 font-semibold whitespace-nowrap">Status</th>
        </tr>
      </thead>
      <tbody className={`divide-y ${mode === 'light' ? 'divide-black/5 text-slate-700' : 'divide-white/10 text-slate-200'}`}>
        {activeSessions.length === 0 ? (
          <tr>
            <td colSpan={5} className="py-6 text-center opacity-70">
              Tidak ada sesi aktif atau riwayat pada tanggal {sessionFilterDate}.
            </td>
          </tr>
        ) : (
          activeSessions.map((session, index) => (
            <tr key={index} className={mode === 'light' ? 'hover:bg-black/[2%]' : 'hover:bg-white/[2%'}>
              <td className={`p-3 font-medium whitespace-nowrap ${mode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {session.name}
              </td>
              <td className="p-3 whitespace-nowrap">{session.email}</td>
              <td className="p-3 font-mono text-xs whitespace-nowrap">{session.ip_address}</td>
              <td className="p-3 text-xs whitespace-nowrap">
                <div className="text-slate-500 dark:text-slate-400">
                  In: {session.logged_in_at ? new Date(session.logged_in_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' }) : '-'}
                </div>
                {session.logged_out_at && (
                  <div className="text-red-400 dark:text-red-400 mt-0.5">
                    Out: {new Date(session.logged_out_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' })}
                  </div>
                )}
              </td>
              <td className="p-3 whitespace-nowrap">
                {session.status === 'Aktif Bekerja' ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {session.status}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    {session.status}
                  </span>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      </div>
    </div>
  );
}