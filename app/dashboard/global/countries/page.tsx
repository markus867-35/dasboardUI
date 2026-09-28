"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { FiSearch, FiGlobe, FiMapPin, FiFlag, FiPlus } from 'react-icons/fi';
import { useTheme } from '@/app/context/ThemeContext';
import Swal from 'sweetalert2';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CountryItem {
  id?: string;
  name: string;
  capital: string;
  region: string;
  subregion: string;
  code: string;
  phoneCode: string;
  flagUrl: string;
}

const INITIAL_COUNTRIES: CountryItem[] = [
  { name: "Indonesia", capital: "Jakarta", region: "Asia", subregion: "South-Eastern Asia", code: "id", phoneCode: "+62", flagUrl: "https://flagcdn.com/id.svg" },
  { name: "Japan", capital: "Tokyo", region: "Asia", subregion: "Eastern Asia", code: "jp", phoneCode: "+81", flagUrl: "https://flagcdn.com/jp.svg" },
  { name: "United States", capital: "Washington, D.C.", region: "Americas", subregion: "Northern America", code: "us", phoneCode: "+1", flagUrl: "https://flagcdn.com/us.svg" }
];

export default function CountryList() {
  const themeContext = useTheme() as any;
  const { mode } = useTheme(); 

  // Penentuan mode gelap yang bersumber langsung dari mode context atau DOM class secara reaktif
  const isDarkMode = mode === 'dark' || themeContext?.theme === 'dark' || themeContext?.isDarkMode === true;

  const [countries, setCountries] = useState<CountryItem[]>(INITIAL_COUNTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState<CountryItem>({
    name: '',
    capital: '',
    region: 'Asia',
    subregion: '',
    code: '',
    phoneCode: '',
    flagUrl: ''
  });

  const regions = ['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase.from('countries').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        const formattedData: CountryItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          capital: item.capital,
          region: item.region,
          subregion: item.subregion,
          code: item.code,
          phoneCode: item.phone_code,
          flagUrl: item.flag_url,
        }));
        setCountries(formattedData);
      }
    } catch (err) {
      console.error("Gagal memuat data dari Supabase:", err);
    }
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('countries').insert([
        {
          name: form.name,
          capital: form.capital,
          region: form.region,
          subregion: form.subregion,
          code: form.code.toLowerCase(),
          phone_code: form.phoneCode,
          flag_url: form.flagUrl,
        }
      ]).select();

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Negara baru berhasil ditambahkan ke database.',
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f8fafc' : '#0f172a',
      });

      setIsModalOpen(false);
      setForm({ name: '', capital: '', region: 'Asia', subregion: '', code: '', phoneCode: '', flagUrl: '' });
      fetchCountries();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.message || 'Terjadi kesalahan saat menyimpan data.',
      });
    }
  };

  const handleFlagClick = (item: CountryItem) => {
    Swal.fire({
      title: `<span class="${isDarkMode ? 'text-sky-400' : 'text-sky-600'}">${item.name}</span>`,
      html: `
        <div class="flex flex-col items-center gap-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}">
          <img src="${item.flagUrl}" alt="Bendera ${item.name}" class="w-28 h-20 object-cover rounded-lg border ${isDarkMode ? 'border-slate-700' : 'border-slate-300'} shadow-md" />
          <div class="w-full text-left ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} p-4 rounded-xl space-y-2 text-sm border">
            <p><strong>Ibu Kota:</strong> <span class="${isDarkMode ? 'text-sky-300' : 'text-sky-600'}">${item.capital}</span></p>
            <p><strong>Kawasan:</strong> <span class="${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}">${item.region} (${item.subregion})</span></p>
            <p><strong>Kode Telepon:</strong> <span class="font-mono ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}">${item.phoneCode}</span></p>
            <p><strong>Kode Negara:</strong> <span class="uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}">${item.code}</span></p>
          </div>
        </div>
      `,
      background: isDarkMode ? '#1e293b' : '#ffffff',
      color: isDarkMode ? '#f8fafc' : '#0f172a',
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#0284c7',
      customClass: {
        popup: `border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} rounded-2xl shadow-2xl`,
      }
    });
  };

  const filteredCountries = useMemo(() => {
    return countries.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phoneCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = selectedRegion === 'All' || item.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion, countries]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-10xl mx-auto p-4 md:p-8">
        
        {/* Header & Tombol Aksi */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6 border-slate-700/50">
          <div>
            <h1 className={`text-2xl md:text-3xl font-extrabold flex items-center gap-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
              <FiGlobe /> Direktori Negara di Dunia
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Kelola dan cari informasi direktori negara.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
<Link
  href="/dashboard/global/countries/add"
  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 transition shadow-sm"
>
  <FiPlus size={16} /> Tambah Negara
</Link>
          </div>
        </div>

        {/* Pencarian dan Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <span className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <FiSearch size={18} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama negara, ibu kota, atau kode telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition shadow-sm ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600'
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
                    ? 'bg-sky-600 text-white'
                    : isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List Negara */}
        {filteredCountries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCountries.map((item, index) => (
              <div key={item.id || index} className={`border rounded-2xl p-5 transition duration-200 hover:shadow-lg flex flex-col justify-between ${
                isDarkMode ? 'bg-slate-800/60 border-slate-700/70' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                      isDarkMode ? 'bg-slate-700/60 text-sky-400 border-slate-600/50' : 'bg-sky-50 text-sky-700 border-sky-100'
                    }`}>
                      {item.region}
                    </span>
                    <div onClick={() => handleFlagClick(item)} className="w-12 h-9 rounded-lg overflow-hidden border shadow-sm flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 transition">
                      <img src={item.flagUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{item.name}</h3>
                  <div className={`mt-3 space-y-1.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-sky-500 shrink-0" size={14} />
                      <span>Ibu Kota:</span> <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{item.capital}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiFlag className="text-emerald-500 shrink-0" size={14} />
                      <span>Sub-kawasan:</span> <span>{item.subregion}</span>
                    </div>
                  </div>
                </div>
                <div className={`mt-5 pt-3 border-t flex justify-between items-center text-xs ${isDarkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                  <span className="text-slate-400">Kode Telepon:</span>
                  <span className={`font-mono px-2.5 py-1 rounded font-semibold border ${isDarkMode ? 'bg-slate-900 text-sky-400 border-slate-800' : 'bg-slate-100 text-sky-600 border-slate-200'}`}>
                    {item.phoneCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 border rounded-2xl ${isDarkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <FiGlobe className="mx-auto text-slate-400 text-5xl mb-3" />
            <p className={`font-medium text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Negara tidak ditemukan</p>
          </div>
        )}

        {/* Modal Tambah Negara */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
              <h2 className="text-xl font-bold mb-4">Tambah Direktori Negara Baru</h2>
              <form onSubmit={handleAddCountry} className="space-y-4 text-xs">
                <div>
                  <label className="block mb-1 font-semibold">Nama Negara</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`} placeholder="Contoh: Indonesia" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 font-semibold">Ibu Kota</label>
                    <input type="text" required value={form.capital} onChange={(e) => setForm({...form, capital: e.target.value})} className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`} placeholder="Contoh: Jakarta" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Kawasan (Region)</label>
                    <select value={form.region} onChange={(e) => setForm({...form, region: e.target.value})} className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
                      {regions.filter(r => r !== 'All').map(reg => <option key={reg} value={reg}>{reg}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block mb-1 font-semibold">Sub-kawasan</label>
                    <input type="text" required value={form.subregion} onChange={(e) => setForm({...form, subregion: e.target.value})} className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`} placeholder="South-Eastern Asia" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Kode (cth: id)</label>
                    <input type="text" required value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`} placeholder="id" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Kode Telp</label>
                    <input type="text" required value={form.phoneCode} onChange={(e) => setForm({...form, phoneCode: e.target.value})} className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`} placeholder="+62" />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">URL Bendera (SVG/PNG)</label>
                  <input type="url" required value={form.flagUrl} onChange={(e) => setForm({...form, flagUrl: e.target.value})} className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`} placeholder="https://flagcdn.com/id.svg" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-600 font-semibold">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500">Simpan ke Supabase</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}