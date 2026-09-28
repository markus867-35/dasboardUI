"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import Link from 'next/link';
import { FiSearch, FiGlobe, FiDollarSign, FiRefreshCw, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CurrencyItem {
  id?: string;
  country: string;
  currency: string;
  code: string;
  symbol: string;
  region: string;
}

const defaultCurrencies: CurrencyItem[] = [
  { country: 'Indonesia', currency: 'Indonesian Rupiah', code: 'IDR', symbol: 'Rp', region: 'Asia' },
  { country: 'Malaysia', currency: 'Malaysian Ringgit', code: 'MYR', symbol: 'RM', region: 'Asia' },
  { country: 'Singapura', currency: 'Singapore Dollar', code: 'SGD', symbol: 'S$', region: 'Asia' },
  { country: 'Amerika Serikat', currency: 'United States Dollar', code: 'USD', symbol: '$', region: 'North America' },
  { country: 'Jepang', currency: 'Japanese Yen', code: 'JPY', symbol: '¥', region: 'Asia' },
  { country: 'Zona Eropa', currency: 'Euro', code: 'EUR', symbol: '€', region: 'Europe' },
  { country: 'Australia', currency: 'Australian Dollar', code: 'AUD', symbol: 'AU$', region: 'Oceania' },
];

interface WorldCurrenciesProps {
  initialDarkMode?: boolean;
}

export default function WorldCurrencies({ initialDarkMode }: WorldCurrenciesProps) {
  const [currenciesData, setCurrenciesData] = useState<CurrencyItem[]>(defaultCurrencies);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  
  const [internalIsDark, setInternalIsDark] = useState(false);
  
  // Ambil dari context tema dashboard Anda
  const themeContext = useTheme() as any;
  const mode = themeContext?.mode || themeContext?.theme; 
  
  // Penentuan status isDark secara reaktif (menggabungkan Context, Props, & DOM mutation/localStorage)
  const isDark = mode 
    ? (mode === 'dark' || themeContext?.isDarkMode === true)
    : (initialDarkMode !== undefined ? initialDarkMode : internalIsDark);

  const [idrAmount, setIdrAmount] = useState<number | string>(100000);
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [loadingRates, setLoadingRates] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CurrencyItem>({
    country: '',
    currency: '',
    code: '',
    symbol: '',
    region: 'Asia',
  });

  const regions = ['All', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Middle East', 'Africa'];

  // Deteksi mutasi kelas 'dark' pada HTML/Body atau localStorage jika context tidak terdeteksi langsung
  useEffect(() => {
    const checkTheme = () => {
      const localTheme = localStorage.getItem('theme') || localStorage.getItem('darkMode');
      const isLocalDark = localTheme === 'dark' || localTheme === 'true';

      const dashboardContainer = document.querySelector('.dashboard-container, [data-theme], .main-layout');
      const hasDarkClass = 
        document.documentElement.classList.contains('dark') || 
        document.body.classList.contains('dark') ||
        document.body.getAttribute('data-theme') === 'dark' ||
        (dashboardContainer && dashboardContainer.classList.contains('dark'));
      
      setInternalIsDark(isLocalDark || !!hasDarkClass);
    };

    checkTheme();
    
    // Observer untuk mendeteksi perubahan kelas secara real-time saat tombol tema diklik di header
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    
    window.addEventListener('storage', checkTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', checkTheme);
    };
  }, []);

  // Fetch Data dari Supabase & Live Rates
  useEffect(() => {
    async function fetchDataAndRates() {
      try {
        setLoadingData(true);
        const { data, error } = await supabase.from('currencies').select('*');
        if (!error && data && data.length > 0) {
          setCurrenciesData(data);
        }
      } catch (err) {
        console.error('Gagal mengambil data dari Supabase:', err);
      } finally {
        setLoadingData(false);
      }

      try {
        setLoadingRates(true);
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data && data.rates) {
          setRates(data.rates);
        }
      } catch (err) {
        console.error('Gagal memuat kurs mata uang:', err);
      } finally {
        setLoadingRates(false);
      }
    }
    fetchDataAndRates();
  }, []);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country || !formData.code || !formData.currency) {
      alert('Mohon lengkapi data form!');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('currencies')
          .update({
            country: formData.country,
            currency: formData.currency,
            code: formData.code.toUpperCase(),
            symbol: formData.symbol,
            region: formData.region,
          })
          .eq('id', editingId);

        if (error) throw error;
        setCurrenciesData(currenciesData.map(item => item.id === editingId ? { ...formData, id: editingId, code: formData.code.toUpperCase() } : item));
      } else {
        const { data, error } = await supabase
          .from('currencies')
          .insert([{
            country: formData.country,
            currency: formData.currency,
            code: formData.code.toUpperCase(),
            symbol: formData.symbol,
            region: formData.region,
          }])
          .select();

        if (error) throw error;
        if (data) {
          setCurrenciesData([...currenciesData, data[0]]);
        }
      }
      closeModal();
    } catch (err: any) {
      console.error('Gagal menyimpan ke Supabase:', err);
      alert('Gagal menyimpan data: ' + err.message);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm('Apakah Anda yakin ingin menghapus mata uang ini?')) {
      try {
        const { error } = await supabase.from('currencies').delete().eq('id', id);
        if (error) throw error;
        setCurrenciesData(currenciesData.filter(item => item.id !== id));
      } catch (err: any) {
        console.error('Gagal menghapus data:', err);
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const openModalForEdit = (item: CurrencyItem) => {
    setEditingId(item.id || null);
    setFormData(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ country: '', currency: '', code: '', symbol: '', region: 'Asia' });
  };

  const convertFromIDR = (targetCode: string) => {
    if (!rates['IDR'] || !rates[targetCode]) return '...';
    const amountNum = Number(idrAmount) || 0;
    const amountInUSD = amountNum / rates['IDR'];
    const converted = amountInUSD * rates[targetCode];
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: targetCode === 'JPY' || targetCode === 'KRW' ? 0 : 2,
    }).format(converted);
  };

  const filteredCurrencies = useMemo(() => {
    return currenciesData.filter((item) => {
      const matchesSearch =
        item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = selectedRegion === 'All' || item.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [currenciesData, searchQuery, selectedRegion]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Header Title & Tombol Tambah */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <h1 className={`text-2xl md:text-3xl font-extrabold flex items-center gap-3 ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
              <FiGlobe /> Directory & World Currency Exchange Rates
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Kelola data mata uang manual yang terhubung langsung ke database Supabase.
            </p>
          </div>
          <div className="flex items-center gap-3">
<Link href="/dashboard/global/currencies/add">
  <span className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md transition cursor-pointer inline-flex">
    <FiPlus /> Tambah Mata Uang
  </span>
</Link>
            <div className={`px-4 py-2.5 rounded-xl text-sm border shadow-sm ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
              Total: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{currenciesData.length}</strong>
            </div>
          </div>
        </div>

        {/* --- LIVE KONVERTER RUPIAH --- */}
        <div className={`border rounded-2xl p-6 mb-10 shadow-xl transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-800/60 border-slate-700/80' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'}`}>
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-4 ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <FiRefreshCw className={`text-sky-500 ${loadingRates ? 'animate-spin' : ''}`} /> 
                Live Konverter Rupiah (IDR)
              </h2>
            </div>
            <div className="w-full md:w-auto">
              <label className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nominal (IDR):</label>
              <input
                type="number"
                value={idrAmount}
                onChange={(e) => setIdrAmount(e.target.value)}
                className={`border rounded-xl px-4 py-2 font-mono font-bold focus:outline-none focus:border-sky-500 w-full md:w-48 transition ${isDark ? 'bg-slate-900 border-slate-700 text-sky-400' : 'bg-white border-slate-300 text-sky-600'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {['USD', 'AUD', 'SGD', 'EUR', 'GBP', 'JPY'].map((code) => (
              <div key={code} className={`border rounded-xl p-3.5 flex flex-col justify-between transition ${isDark ? 'bg-slate-900/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{code}</span>
                <div className={`mt-3 pt-2 border-t text-sm font-mono font-bold truncate ${isDark ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'}`}>
                  {loadingRates ? '...' : convertFromIDR(code)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- PENCARIAN & FILTER --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <span className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <FiSearch size={18} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan negara, mata uang, atau kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition shadow-sm ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600'}`}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-sm ${selectedRegion === region ? 'bg-sky-600 text-white shadow-sky-600/30' : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'}`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* --- GRID KARTU DIREKTORI --- */}
        {filteredCurrencies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCurrencies.map((item) => (
              <div key={item.id || item.code} className={`border rounded-2xl p-5 transition duration-200 hover:shadow-lg flex flex-col justify-between ${isDark ? 'bg-slate-800/60 border-slate-700/70 hover:border-sky-500/50' : 'bg-white border-slate-200 hover:border-sky-400 shadow-sm'}`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${isDark ? 'bg-slate-700/60 text-sky-400 border-slate-600/50' : 'bg-sky-50 text-sky-700 border-sky-100'}`}>
                      {item.region}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openModalForEdit(item)} className={`p-1.5 rounded-lg border transition ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`} title="Edit">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className={`p-1.5 rounded-lg border transition ${isDark ? 'bg-rose-900/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/60' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'}`} title="Hapus">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{item.country}</h3>
                  <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.currency} ({item.code})</p>
                </div>

                <div className={`mt-5 pt-3 border-t flex justify-between items-center text-xs ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Estimasi Rp 100rb:</span>
                  <span className={`font-mono px-2.5 py-1 rounded font-semibold border ${isDark ? 'bg-slate-900 text-sky-400 border-slate-800' : 'bg-slate-100 text-sky-600 border-slate-200'}`}>
                    {loadingRates ? '...' : `${item.symbol} ${convertFromIDR(item.code)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 border rounded-2xl ${isDark ? 'bg-slate-800/30 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <FiDollarSign className="mx-auto text-slate-400 text-5xl mb-3" />
            <p className={`font-medium text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mata uang tidak ditemukan</p>
          </div>
        )}

       

      </div>
    </div>
  );
}