"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext'; 
import Link from 'next/link';
import { FiSearch, FiCpu, FiBox, FiShield, FiTruck, FiGlobe, FiTag, FiPlus, FiX } from 'react-icons/fi';
// Pastikan Anda sudah menginstal dan mengkonfigurasi supabase client di project Anda
// import { supabase } from '@/lib/supabaseClient'; 

interface TechItem {
  id?: string | number;
  country: string;
  flag: string;
  region: string;
  category: 'Transportasi' | 'Pertahanan & Militer' | 'Elektronik & Teknologi' | 'Dirgantara & Luar Angkasa' | 'Industri & Manufaktur';
  products: string[];
  description: string;
}

// Data awal / Fallback jika belum terhubung ke Supabase
const initialTechData: TechItem[] = [
  {
    country: 'Indonesia',
    flag: '🇮🇩',
    region: 'Asia',
    category: 'Transportasi',
    products: ['Kapal Perang (KRI)', 'Kereta Api (PT INKA)', 'Motor Listrik (GESITS)'],
    description: 'Indonesia unggul dalam manufaktur transportasi berat dan perakitan gerbong.'
  },
  // ... data lainnya bisa dimasukkan di sini atau langsung ditarik dari database
];

export default function CountryTechDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [techData, setTechData] = useState<TechItem[]>(initialTechData);
  const [loading, setLoading] = useState(false);

  // State untuk Modal Form Tambah Data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCountry, setNewCountry] = useState('');
  const [newFlag, setNewFlag] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [newCategory, setNewCategory] = useState<TechItem['category']>('Transportasi');
  const [newProducts, setNewProducts] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const { mode } = useTheme(); 
  const isDark = mode === 'dark';

  const categories = [
    'All',
    'Transportasi',
    'Pertahanan & Militer',
    'Elektronik & Teknologi',
    'Dirgantara & Luar Angkasa',
    'Industri & Manufaktur'
  ];

  // ==========================================
  // 1. AMBIL DATA DARI SUPABASE (LOAD ON MOUNT)
  // ==========================================
  useEffect(() => {
    fetchTechDataFromSupabase();
  }, []);

  const fetchTechDataFromSupabase = async () => {
    try {
      setLoading(true);
      // Contoh query Supabase:
      // const { data, error } = await supabase.from('tech_directories').select('*');
      // if (error) throw error;
      // if (data && data.length > 0) setTechData(data);
    } catch (error) {
      console.error('Gagal memuat data dari Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 2. SIMPAN DATA BARU KE SUPABASE
  // ==========================================
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ubah string produk yang dipisah koma menjadi Array
    const productsArray = newProducts.split(',').map((p) => p.trim()).filter(Boolean);

    const newItem: TechItem = {
      country: newCountry,
      flag: newFlag || '🏳️',
      region: newRegion || 'Global',
      category: newCategory,
      products: productsArray,
      description: newDescription,
    };

    try {
      setLoading(true);
      
      // Simpan ke Supabase:
      // const { data, error } = await supabase.from('tech_directories').insert([newItem]).select();
      // if (error) throw error;
      // if (data) setTechData([data[0], ...techData]);

      // Simulasi state lokal sementara jika belum konek ke database asli:
      setTechData([newItem, ...techData]);

      // Reset Form & Tutup Modal
      setIsModalOpen(false);
      setNewCountry('');
      setNewFlag('');
      setNewRegion('');
      setNewProducts('');
      setNewDescription('');
      alert('Data teknologi berhasil ditambahkan!');
    } catch (error) {
      console.error('Gagal menyimpan ke Supabase:', error);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  // Filter data berdasarkan pencarian dan kategori
  const filteredTech = useMemo(() => {
    return techData.filter((item) => {
      const matchesSearch =
        item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.products.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, techData]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Transportasi': return <FiTruck className="text-sky-500" />;
      case 'Pertahanan & Militer': return <FiShield className="text-rose-500" />;
      case 'Elektronik & Teknologi': return <FiCpu className="text-indigo-500" />;
      case 'Dirgantara & Luar Angkasa': return <FiGlobe className="text-teal-500" />;
      default: return <FiBox className="text-amber-500" />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-10xl mx-auto p-4 md:p-8">
        
        {/* Header Title & Tombol Tambah Manual */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <h1 className={`text-2xl md:text-3xl font-extrabold flex items-center gap-3 ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
              <FiCpu /> Direktori Teknologi & Manufaktur Negara
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Menampilkan produk unggulan, alat transportasi, teknologi militer, dan manufaktur buatan dari berbagai negara.
            </p>
          </div>
          
<div className="flex items-center gap-3">
            {/* Ubah tombol menjadi Link ke halaman tujuan */}
            <Link
              href="/dashboard/global/name-directory/addteknologi" // <-- Sesuaikan dengan rute tujuan Anda
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-sky-600/20"
            >
              <FiPlus size={16} /> Tambah Direktori Baru
            </Link>

            <div className={`px-4 py-2 rounded-xl text-sm border shadow-xs ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
              Total Sektor: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{techData.length}</strong>
            </div>
          </div>
        </div>

        {/* --- PENCARIAN & FILTER KATEGORI --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <span className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <FiSearch size={18} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan negara, produk (kapal, motor, chip), atau teknologi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition shadow-xs ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-sky-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600'
              }`}
            />
          </div>
        </div>

        {/* Filter Kategori Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-xs ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-sky-600/30'
                  : isDark 
                    ? 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Kartu Hasil */}
        {filteredTech.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTech.map((item, index) => (
              <div
                key={index}
                className={`border rounded-2xl p-6 transition duration-200 hover:shadow-xl flex flex-col justify-between ${
                  isDark 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-sky-500/50' 
                    : 'bg-white border-slate-200 hover:border-sky-400 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" role="img" aria-label="flag">{item.flag}</span>
                      <div>
                        <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.country}</h3>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.region}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border font-medium ${
                      isDark ? 'bg-slate-800/80 text-sky-300 border-slate-700/60' : 'bg-sky-50 text-sky-700 border-sky-100'
                    }`}>
                      {getCategoryIcon(item.category)}
                      <span>{item.category}</span>
                    </div>
                  </div>

                  <p className={`text-sm mb-5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {item.description}
                  </p>

                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <FiTag size={13} /> Produk & Teknologi Utama:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.products.map((prod, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-medium ${
                            isDark 
                              ? 'bg-slate-950/80 border-slate-800 text-sky-400' 
                              : 'bg-slate-100 border-slate-200 text-sky-700'
                          }`}
                        >
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`mt-6 pt-3 border-t text-xs flex justify-between items-center ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                  <span>Status Manufaktur Nasional</span>
                  <span className="font-semibold text-emerald-500">Aktif & Berkembang</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 border rounded-2xl ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <FiCpu className="mx-auto text-slate-400 text-5xl mb-3" />
            <p className={`font-medium text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Data teknologi tidak ditemukan</p>
            <p className="text-slate-400 text-sm mt-1">Coba gunakan kata kunci lain atau tambahkan data baru.</p>
          </div>
        )}

       

      </div>
    </div>
  );
}