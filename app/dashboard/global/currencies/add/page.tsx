'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

export default function CurrencyFormPage() {
  const router = useRouter();
    const { mode } = useTheme();
  const isDark = mode === 'dark';


  const [formData, setFormData] = useState({
    country: '',
    currency: '',
    code: '',
    symbol: '',
    region: 'Asia',
  });

  const regions = ['All', 'Asia', 'Europe', 'America', 'Africa', 'Australia'];

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Data disimpan:', formData);
    router.push('/currencies'); 
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 my-8 rounded-2xl border shadow-xl transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header Halaman & Tombol Kembali */}
      <div className={`flex items-center justify-between mb-6 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.back()}
            className={`p-2 rounded-xl border transition ${
              isDark 
                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300' 
                : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Tambah Mata Uang Baru</h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Lengkapi informasi mata uang untuk disimpan ke database Supabase.
            </p>
          </div>
        </div>
      </div>

      {/* Form Utama */}
      <form onSubmit={handleSubmitForm} className="space-y-4">
        <div>
          <label className="text-xs font-semibold block mb-1">Nama Negara</label>
          <input
            type="text"
            required
            placeholder="Contoh: Indonesia"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-colors ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1">Nama Mata Uang</label>
          <input
            type="text"
            required
            placeholder="Contoh: Indonesian Rupiah"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-colors ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1">Kode (ISO)</label>
            <input
              type="text"
              required
              placeholder="IDR"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm uppercase focus:outline-none focus:border-sky-500 transition-colors ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Simbol</label>
            <input
              type="text"
              required
              placeholder="Rp"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-colors ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1">Wilayah / Region</label>
          <select
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-colors ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-white' 
                : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            {regions.filter(r => r !== 'All').map((reg) => (
              <option 
                key={reg} 
                value={reg} 
                className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}
              >
                {reg}
              </option>
            ))}
          </select>
        </div>

        <div className={`flex justify-end gap-3 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={() => router.back()}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition ${
              isDark 
                ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 shadow-md transition"
          >
            Simpan ke Supabase
          </button>
        </div>
      </form>
    </div>
  );
}