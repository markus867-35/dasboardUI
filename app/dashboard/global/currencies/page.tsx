"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiGlobe, FiDollarSign, FiRefreshCw } from 'react-icons/fi';

interface CurrencyItem {
  country: string;
  currency: string;
  code: string;
  symbol: string;
  region: string;
}

// Data Mata Uang Seluruh Dunia
const currenciesData: CurrencyItem[] = [
  // Asia
  { country: 'Indonesia', currency: 'Indonesian Rupiah', code: 'IDR', symbol: 'Rp', region: 'Asia' },
  { country: 'Malaysia', currency: 'Malaysian Ringgit', code: 'MYR', symbol: 'RM', region: 'Asia' },
  { country: 'Singapura', currency: 'Singapore Dollar', code: 'SGD', symbol: 'S$', region: 'Asia' },
  { country: 'Amerika Serikat', currency: 'United States Dollar', code: 'USD', symbol: '$', region: 'North America' },
  { country: 'Jepang', currency: 'Japanese Yen', code: 'JPY', symbol: '¥', region: 'Asia' },
  { country: 'Tiongkok', currency: 'Chinese Yuan', code: 'CNY', symbol: '¥', region: 'Asia' },
  { country: 'Korea Selatan', currency: 'South Korean Won', code: 'KRW', symbol: '₩', region: 'Asia' },
  { country: 'Thailand', currency: 'Thai Baht', code: 'THB', symbol: '฿', region: 'Asia' },
  { country: 'Vietnam', currency: 'Vietnamese Dong', code: 'VND', symbol: '₫', region: 'Asia' },
  { country: 'Filipina', currency: 'Philippine Peso', code: 'PHP', symbol: '₱', region: 'Asia' },
  { country: 'India', currency: 'Indian Rupee', code: 'INR', symbol: '₹', region: 'Asia' },
  { country: 'Uni Emirat Arab', currency: 'UAE Dirham', code: 'AED', symbol: 'د.إ', region: 'Middle East' },
  { country: 'Arab Saudi', currency: 'Saudi Riyal', code: 'SAR', symbol: '﷼', region: 'Middle East' },
  { country: 'Qatar', currency: 'Qatari Riyal', code: 'QAR', symbol: 'ر.ق', region: 'Middle East' },
  { country: 'Israel', currency: 'Israeli New Shekel', code: 'ILS', symbol: '₪', region: 'Middle East' },
  { country: 'Turki', currency: 'Turkish Lira', code: 'TRY', symbol: '₺', region: 'Middle East / Europe' },
  { country: 'Hong Kong', currency: 'Hong Kong Dollar', code: 'HKD', symbol: 'HK$', region: 'Asia' },
  { country: 'Taiwan', currency: 'New Taiwan Dollar', code: 'TWD', symbol: 'NT$', region: 'Asia' },
  { country: 'Pakistan', currency: 'Pakistani Rupee', code: 'PKR', symbol: '₨', region: 'Asia' },
  { country: 'Bangladesh', currency: 'Bangladeshi Taka', code: 'BDT', symbol: '৳', region: 'Asia' },
  
  // Eropa
  { country: 'Zona Eropa', currency: 'Euro', code: 'EUR', symbol: '€', region: 'Europe' },
  { country: 'Britania Raya (UK)', currency: 'British Pound', code: 'GBP', symbol: '£', region: 'Europe' },
  { country: 'Swiss', currency: 'Swiss Franc', code: 'CHF', symbol: 'CHF', region: 'Europe' },
  { country: 'Swedia', currency: 'Swedish Krona', code: 'SEK', symbol: 'kr', region: 'Europe' },
  { country: 'Norwegia', currency: 'Norwegian Krone', code: 'NOK', symbol: 'kr', region: 'Europe' },
  { country: 'Denmark', currency: 'Danish Krone', code: 'DKK', symbol: 'kr', region: 'Europe' },
  { country: 'Polandia', currency: 'Polish Zloty', code: 'PLN', symbol: 'zł', region: 'Europe' },
  { country: 'Rusia', currency: 'Russian Ruble', code: 'RUB', symbol: '₽', region: 'Europe / Asia' },
  { country: 'Ukraina', currency: 'Ukrainian Hryvnia', code: 'UAH', symbol: '₴', region: 'Europe' },
  { country: 'Ceko', currency: 'Czech Koruna', code: 'CZK', symbol: 'Kč', region: 'Europe' },
  { country: 'Hungaria', currency: 'Hungarian Forint', code: 'HUF', symbol: 'Ft', region: 'Europe' },
  { country: 'Rumania', currency: 'Romanian Leu', code: 'RON', symbol: 'lei', region: 'Europe' },

  // Amerika Utara & Selatan
  { country: 'Kanada', currency: 'Canadian Dollar', code: 'CAD', symbol: 'CA$', region: 'North America' },
  { country: 'Meksiko', currency: 'Mexican Peso', code: 'MXN', symbol: 'Mex$', region: 'North America' },
  { country: 'Brasil', currency: 'Brazilian Real', code: 'BRL', symbol: 'R$', region: 'South America' },
  { country: 'Argentina', currency: 'Argentine Peso', code: 'ARS', symbol: '$', region: 'South America' },
  { country: 'Chili', currency: 'Chilean Peso', code: 'CLP', symbol: '$', region: 'South America' },
  { country: 'Kolombia', currency: 'Colombian Peso', code: 'COP', symbol: '$', region: 'South America' },
  { country: 'Peru', currency: 'Sol', code: 'PEN', symbol: 'S/', region: 'South America' },

  // Oseania
  { country: 'Australia', currency: 'Australian Dollar', code: 'AUD', symbol: 'AU$', region: 'Oceania' },
  { country: 'Selandia Baru', currency: 'New Zealand Dollar', code: 'NZD', symbol: 'NZ$', region: 'Oceania' },
  { country: 'Fiji', currency: 'Fijian Dollar', code: 'FJD', symbol: 'FJ$', region: 'Oceania' },

  // Afrika
  { country: 'Afrika Selatan', currency: 'South African Rand', code: 'ZAR', symbol: 'R', region: 'Africa' },
  { country: 'Mesir', currency: 'Egyptian Pound', code: 'EGP', symbol: 'E£', region: 'Africa' },
  { country: 'Nigeria', currency: 'Nigerian Naira', code: 'NGN', symbol: '₦', region: 'Africa' },
  { country: 'Kenya', currency: 'Kenyan Shilling', code: 'KES', symbol: 'KSh', region: 'Africa' },
  { country: 'Maroko', currency: 'Moroccan Dirham', code: 'MAD', symbol: 'MAD', region: 'Africa' },
];

export default function WorldCurrencies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [isDark, setIsDark] = useState(false);
  
  // State untuk Konverter Kurs
  const [idrAmount, setIdrAmount] = useState<number | string>(100000);
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [loadingRates, setLoadingRates] = useState(true);

  const regions = ['All', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Middle East', 'Africa'];

  // Mendeteksi perubahan tema secara otomatis (mendukung class 'dark' pada HTML/Body atau elemen lain)
  useEffect(() => {
    const checkTheme = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark') || 
                           document.body.classList.contains('dark') ||
                           !!document.querySelector('.dark');
      setIsDark(hasDarkClass);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Mengambil data nilai tukar live gratis (basis USD)
  useEffect(() => {
    async function fetchRates() {
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
    fetchRates();
  }, []);

  // Fungsi untuk konversi dari IDR ke mata uang lain
  const convertFromIDR = (targetCode: string) => {
    if (!rates['IDR'] || !rates[targetCode]) return '...';
    const amountNum = Number(idrAmount) || 0;
    const amountInUSD = amountNum / rates['IDR'];
    const converted = amountInUSD * rates[targetCode];
    
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: targetCode === 'JPY' || targetCode === 'KRW' ? 0 : 2,
    }).format(converted);
  };

  // Filter data direktori mata uang
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
  }, [searchQuery, selectedRegion]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Header Title */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <h1 className={`text-2xl md:text-3xl font-extrabold flex items-center gap-3 ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
              <FiGlobe /> Directory & World Currency Exchange Rates
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Cek konversi nilai Rupiah real-time ke berbagai mata uang global beserta direktori lengkapnya.
            </p>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm border shadow-sm ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
            Total Tercatat: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{currenciesData.length} Negara</strong>
          </div>
        </div>

        {/* --- FITUR KONVERTER RUPIAH LIVE --- */}
        <div className={`border rounded-2xl p-6 mb-10 shadow-xl transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-slate-800 to-slate-800/60 border-slate-700/80' 
            : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
        }`}>
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-4 ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <FiRefreshCw className={`text-sky-500 ${loadingRates ? 'animate-spin' : ''}`} /> 
                Live Konverter Rupiah (IDR)
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Masukkan nominal dalam Rupiah untuk melihat perbandingannya secara otomatis.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <label className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nominal (IDR):</label>
              <input
                type="number"
                value={idrAmount}
                onChange={(e) => setIdrAmount(e.target.value)}
                className={`border rounded-xl px-4 py-2 font-mono font-bold focus:outline-none focus:border-sky-500 w-full md:w-48 transition ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-sky-400' 
                    : 'bg-white border-slate-300 text-sky-600'
                }`}
              />
            </div>
          </div>

          {/* Grid Kurs Cepat (USD, AUD, SGD, JPY, EUR, GBP) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { code: 'USD', name: 'Dolar AS', symbol: '$' },
              { code: 'AUD', name: 'Dolar Australia', symbol: 'AU$' },
              { code: 'SGD', name: 'Dolar Singapura', symbol: 'S$' },
              { code: 'EUR', name: 'Euro Eropa', symbol: '€' },
              { code: 'GBP', name: 'Poundsterling UK', symbol: '£' },
              { code: 'JPY', name: 'Yen Jepang', symbol: '¥' },
            ].map((item) => (
              <div 
                key={item.code} 
                className={`border rounded-xl p-3.5 flex flex-col justify-between transition ${
                  isDark 
                    ? 'bg-slate-900/70 border-slate-700/60' 
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className={`flex justify-between items-center text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>{item.code}</span>
                    <span className="text-sky-500 font-bold">{item.symbol}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.name}</p>
                </div>
                <div className={`mt-3 pt-2 border-t text-sm font-mono font-bold truncate ${
                  isDark ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'
                }`}>
                  {loadingRates ? '...' : `${item.symbol} ${convertFromIDR(item.code)}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- PENCARIAN & DIREKTORI NEGARA --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <span className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <FiSearch size={18} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan negara, mata uang, atau kode (contoh: IDR, USD, Jepang)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition shadow-sm ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-sm ${
                  selectedRegion === region
                    ? 'bg-sky-600 text-white shadow-sky-600/30'
                    : isDark 
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-300'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid Direktori */}
        {filteredCurrencies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCurrencies.map((item, index) => (
              <div
                key={index}
                className={`border rounded-2xl p-5 transition duration-200 hover:shadow-lg flex flex-col justify-between ${
                  isDark 
                    ? 'bg-slate-800/60 border-slate-700/70 hover:border-sky-500/50' 
                    : 'bg-white border-slate-200 hover:border-sky-400 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                      isDark 
                        ? 'bg-slate-700/60 text-sky-400 border-slate-600/50' 
                        : 'bg-sky-50 text-sky-700 border-sky-100'
                    }`}>
                      {item.region}
                    </span>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shadow-inner ${
                      isDark ? 'bg-slate-700/80 border-slate-600 text-sky-300' : 'bg-slate-100 border-slate-200 text-sky-600'
                    }`}>
                      {item.symbol}
                    </div>
                  </div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{item.country}</h3>
                  <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.currency}</p>
                </div>

                <div className={`mt-5 pt-3 border-t flex justify-between items-center text-xs ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Estimasi dari Rp 100rb:</span>
                  <span className={`font-mono px-2.5 py-1 rounded font-semibold border ${
                    isDark 
                      ? 'bg-slate-900 text-sky-400 border-slate-800' 
                      : 'bg-slate-100 text-sky-600 border-slate-200'
                  }`}>
                    {loadingRates ? '...' : `${item.symbol} ${convertFromIDR(item.code)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 border rounded-2xl ${isDark ? 'bg-slate-800/30 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <FiDollarSign className="mx-auto text-slate-400 text-5xl mb-3" />
            <p className={`font-medium text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mata uang atau negara tidak ditemukan</p>
            <p className="text-slate-400 text-sm mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        )}

      </div>
    </div>
  );
}