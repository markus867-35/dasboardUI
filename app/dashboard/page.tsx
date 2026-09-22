'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const visitorData = [
  { date: 'Sep 15', registrasi: 20 },
  { date: 'Sep 16', registrasi: 30 },
  { date: 'Sep 17', registrasi: 13 },
  { date: 'Sep 18', registrasi: 29 },
  { date: 'Sep 19', registrasi: 32 },
  { date: 'Sep 20', registrasi: 21 },
  { date: 'Sep 21', registrasi: 15 },
];

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

interface NewsItem {
  source: string;
  link: string;
  title: string;
  snippet: string;
  date: string;
  image?: string;
}

// ==========================================
// KODE KOMPONEN NEWS WIDGET (DILENGKAPI)
// ==========================================
function NewsWidget() {
  const { mode, colorTheme } = useTheme();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news');
        const json = await res.json();
        if (json.success) {
          setNews(json.data);
        }
      } catch (error) {
        console.error("Gagal mengambil berita:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const getWidgetCardStyle = () => {
    if (mode === 'light') {
      switch (colorTheme) {
        case 'indigo': return 'bg-indigo-100 text-indigo-950 border border-indigo-300 shadow-md';
        case 'emerald': return 'bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-md';
        case 'navy':
        default: return 'bg-slate-200 text-slate-900 border border-slate-300 shadow-md';
      }
    } else {
      switch (colorTheme) {
        case 'indigo': return 'bg-[#3730a3] text-white shadow-xl border border-indigo-700/50';
        case 'emerald': return 'bg-[#047857] text-white shadow-xl border border-emerald-700/50';
        case 'navy':
        default: return 'bg-[#1B2A35] text-white shadow-xl border border-slate-700/60';
      }
    }
  };

  return (
    <div className={`w-full rounded-2xl p-4 sm:p-6 box-border transition-all duration-300 ${getWidgetCardStyle()}`}>
      <h3 className="text-lg font-bold mb-6 border-b pb-3 border-black/10 dark:border-white/10">
        📰 Berita Terkini & Informasi Terkait
      </h3>

      {loading ? (
        <p className="text-xs opacity-70 animate-pulse">Memuat berita...</p>
      ) : news.length === 0 ? (
        <p className="text-xs opacity-70">Tidak ada berita tersedia.</p>
      ) : (
        <div className="space-y-6">
          {news.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-black/5 dark:border-white/10 last:border-none last:pb-0"
            >
              {/* Bagian Teks Berita di Kiri */}
              <div className="space-y-1.5 flex-1">
                <div className="text-[11px] font-medium opacity-70 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                  <span>{item.source}</span>
                </div>

                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-sm sm:text-base font-semibold hover:underline line-clamp-2 ${
                    mode === 'light' ? 'text-blue-600' : 'text-[#93c5fd]'
                  }`}
                >
                  {item.title}
                </a>

                <p className="text-xs line-clamp-2 leading-relaxed opacity-80">
                  {item.snippet}
                </p>

                <div className="text-[11px] opacity-60 pt-1">
                  {item.date}
                </div>
              </div>

              {/* Gambar Thumbnail di Kanan */}
              {item.image && (
                <div className="w-24 h-24 sm:w-28 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-white/20 shadow-md">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




// ==========================================
// HALAMAN UTAMA DASHBOARD
// ==========================================
export default function DashboardPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { mode, colorTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

useEffect(() => {
    // 2. Ubah isLoaded menjadi true agar animasi fade-in berjalan
    setIsLoaded(true);
    setChartData(visitorData);
  }, []);
useEffect(() => {
    setIsMounted(true);
  }, []);
  

  const getCardStyle = () => {
    if (mode === 'light') {
      switch (colorTheme) {
        case 'indigo': return 'bg-indigo-100 text-indigo-950 border border-indigo-300 shadow-md';
        case 'emerald': return 'bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-md';
        case 'navy':
        default: return 'bg-slate-200 text-slate-900 border border-slate-300 shadow-md';
      }
    } else {
      switch (colorTheme) {
        case 'indigo': return 'bg-[#3730a3] text-white shadow-xl border border-indigo-700/50';
        case 'emerald': return 'bg-[#047857] text-white shadow-xl border border-emerald-700/50';
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

  return (
    <div className="w-full max-w-full box-border space-y-6 px-3 sm:px-6 overflow-x-hidden">
      
      {/* 1. Barisan Kartu Statistik */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Visitors', value: '106551', icon: '👥' },
          { title: 'Checked-In', value: '23515', icon: '🏢' },
          { title: 'Checked-Out', value: '51235', icon: '🚪' },
          { title: 'Peak Visitor', value: '41571', icon: '📈' },
        ].map((item, idx) => (
          <div 
            key={idx} 
            style={{ transitionDelay: `${idx * 150}ms` }}
            className={`w-full p-5 rounded-2xl flex flex-col justify-between transition-all duration-1000 transform relative overflow-hidden box-border ${getCardStyle()} ${
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
            <div className="mt-4 opacity-40">
              <svg className="w-full h-4" viewBox="0 0 100 20" fill="none" preserveAspectRatio="none">
                <path d="M0 10 Q 25 0, 50 10 T 100 10" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
        ))}
      </div>







{/* 2. Bagian Grafik dengan Efek Muncul Satu-Satu */}
      <div 
        style={{ transitionDelay: '300ms' }}
        className={`w-full transition-all duration-1000 transform ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className={`w-full rounded-2xl p-4 sm:p-6 box-border transition-colors duration-300 ${getCardStyle()}`}>
          
          {/* Bagian 1: Judul dan Tombol (Muncul Duluan) */}
          <div 
            style={{ transitionDelay: '500ms' }}
            className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 transition-all duration-700 transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h3 className="text-lg font-bold">Registrasi 7 hari terakhir</h3>
            <div className={`flex space-x-1 text-xs p-1 rounded-xl ${mode === 'light' ? 'bg-black/5' : 'bg-white/10'}`}>
              <button className="px-3 py-1 rounded-lg bg-[#2E4053] text-white shadow">Week</button>
              <button className="px-3 py-1 rounded-lg opacity-70 hover:opacity-100">Month</button>
            </div>
          </div>

          {/* Bagian 2: Area Grafik (Muncul Terakhir dengan Efek Smooth) */}
          <div 
            style={{ transitionDelay: '800ms' }}
            className={`h-64 w-full overflow-hidden transition-all duration-1000 transform ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
<ResponsiveContainer width="100%" height="100%">
  <BarChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
    <XAxis dataKey="date" stroke={mode === 'light' ? '#475569' : '#94a3b8'} fontSize={12} />
    <YAxis stroke={mode === 'light' ? '#475569' : '#94a3b8'} fontSize={12} />
    <Tooltip 
      cursor={{ fill: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}
      contentStyle={{ 
        backgroundColor: mode === 'light' ? '#ffffff' : '#1B2A35', 
        borderColor: '#475569', 
        borderRadius: '8px', 
        color: mode === 'light' ? '#0f172a' : '#fff',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
      }} 
    />
<Bar 
  dataKey="registrasi" 
  fill="#3b82f6" 
  radius={[6, 6, 0, 0]} 
  isAnimationActive={true}
  animationDuration={2000}
  animationEasing="ease-out"
>
  <LabelList dataKey="registrasi" position="top" fill={mode === 'light' ? '#1e293b' : '#e2e8f0'} fontSize={11} />
</Bar>
  </BarChart>
</ResponsiveContainer>
          </div>

        </div>
      </div>





      {/* 3. Area Tabel Recent Visitor */}
      <div 
        style={{ transitionDelay: '800ms' }}
        className={`w-full rounded-2xl p-4 sm:p-6 box-border transition-all duration-1000 transform ${getCardStyle()} ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Recent Visitor</h3>
          <span className={`text-xs px-3 py-1 rounded-lg ${mode === 'light' ? 'text-slate-500 bg-black/5' : 'text-slate-200 bg-white/10'}`}>
            Filter By
          </span>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead>
              <tr className={`border-b ${mode === 'light' ? 'border-black/10 text-slate-600' : 'border-white/10 text-slate-300'}`}>
                <th className="pb-3 font-semibold">Visitor</th>
                <th className="pb-3 font-semibold">Host</th>
                <th className="pb-3 font-semibold">Check-In</th>
                <th className="pb-3 font-semibold">Check-Out</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Ph No.</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${mode === 'light' ? 'divide-black/5 text-slate-700' : 'divide-white/10 text-slate-200'}`}>
              <tr>
                <td className={`py-3 font-medium ${mode === 'light' ? 'text-slate-900' : 'text-white'}`}>John Smith</td>
                <td className="py-3">Jane Doe</td>
                <td className="py-3">Sept 10, 9:30 AM</td>
                <td className="py-3">Sept 10, 1:30 PM</td>
                <td className="py-3">johno@gmail.com</td>
                <td className="py-3">+147855898</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Bagian Widget Berita */}
      <div 
        style={{ transitionDelay: '1000ms' }}
        className={`w-full transition-all duration-1000 transform ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <NewsWidget />
      </div>

    </div>
  );
}