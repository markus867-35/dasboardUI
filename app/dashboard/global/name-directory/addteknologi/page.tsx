"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

export default function TambahTeknologiPage() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [loading, setLoading] = useState(false);
  const [newCountry, setNewCountry] = useState('');
  const [newFlag, setNewFlag] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [newCategory, setNewCategory] = useState<'Transportasi' | 'Pertahanan & Militer' | 'Elektronik & Teknologi' | 'Dirgantara & Luar Angkasa' | 'Industri & Manufaktur'>('Transportasi');
  const [newProducts, setNewProducts] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ubah string produk yang dipisah koma menjadi Array
    const productsArray = newProducts.split(',').map((p) => p.trim()).filter(Boolean);

    const newItem = {
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
      // const { error } = await supabase.from('tech_directories').insert([newItem]);
      // if (error) throw error;

      alert('Data teknologi berhasil ditambahkan!');
      router.push('/dashboard/global/name-directory'); // Kembali ke halaman utama direktori setelah sukses
    } catch (error) {
      console.error('Gagal menyimpan ke Supabase:', error);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 py-10 px-4 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-2xl mx-auto">
        
        {/* Tombol Kembali */}
        <div className="mb-6">
          <Link 
            href="/dashboard/global/name-directory"
            className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FiArrowLeft size={16} /> Kembali ke Direktori
          </Link>
        </div>

        {/* Card Form */}
        <div className={`border rounded-2xl p-6 md:p-8 shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          
          <div className="mb-6 pb-4 border-b border-slate-700/50">
            <h1 className="text-xl md:text-2xl font-extrabold flex items-center gap-2.5">
              <FiPlus className="text-sky-500" /> Tambah Direktori Teknologi Baru
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Lengkapi formulir di bawah ini untuk menambahkan data produk dan manufaktur negara baru ke dalam database.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">Nama Negara</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Singapura" 
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-300 focus:border-sky-600'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">Emoji Bendera</label>
                <input 
                  type="text" 
                  placeholder="Contoh: 🇸🇬" 
                  value={newFlag}
                  onChange={(e) => setNewFlag(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-300 focus:border-sky-600'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">Kawasan / Region</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Asia / Europe" 
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-300 focus:border-sky-600'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">Kategori Sektor</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-300 focus:border-sky-600'}`}
                >
                  <option value="Transportasi">Transportasi</option>
                  <option value="Pertahanan & Militer">Pertahanan & Militer</option>
                  <option value="Elektronik & Teknologi">Elektronik & Teknologi</option>
                  <option value="Dirgantara & Luar Angkasa">Dirgantara & Luar Angkasa</option>
                  <option value="Industri & Manufaktur">Industri & Manufaktur</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-400">Produk & Teknologi (Pisahkan dengan koma)</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Chipset AI, Smart Port, Bio-Tech" 
                value={newProducts}
                onChange={(e) => setNewProducts(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-300 focus:border-sky-600'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-400">Deskripsi Singkat</label>
              <textarea 
                rows={4}
                required
                placeholder="Tuliskan ringkasan keunggulan teknologi negara ini..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none resize-none ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-300 focus:border-sky-600'}`}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-700/50">
              <Link
                href="/dashboard/global/name-directory"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition shadow-lg shadow-sky-600/30"
              >
                {loading ? 'Menyimpan...' : 'Simpan ke Database'}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}