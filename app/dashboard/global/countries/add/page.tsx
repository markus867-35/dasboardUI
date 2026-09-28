'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { FiArrowLeft, FiMoon, FiSun } from 'react-icons/fi';

export default function AddCountryPage() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [form, setForm] = useState({
    name: '',
    capital: '',
    region: 'Asia',
    subregion: '',
    code: '',
    phoneCode: '',
    flagUrl: '',
  });

  const regions = ['All', 'Asia', 'Europe', 'America', 'Africa', 'Australia'];

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Data negara disimpan:', form);
    router.push('/countries'); // Sesuaikan dengan route halaman direktori Anda
  };

  return (
    <div className={`max-w-3xl mx-auto p-6 my-8 rounded-2xl border shadow-xl transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
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
            <h1 className="text-xl font-bold">Tambah Direktori Negara Baru</h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Lengkapi informasi data negara untuk disimpan ke database Supabase.
            </p>
          </div>
        </div>



      </div>

      {/* Form Utama */}
      <form onSubmit={handleAddCountry} className="space-y-4 text-xs">
        <div>
          <label className="block mb-1 font-semibold">Nama Negara</label>
          <input 
            type="text" 
            required 
            value={form.name} 
            onChange={(e) => setForm({...form, name: e.target.value})} 
            className={`w-full p-2.5 border rounded-xl focus:outline-none focus:border-sky-500 transition-colors ${
              isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`} 
            placeholder="Contoh: Indonesia" 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Ibu Kota</label>
            <input 
              type="text" 
              required 
              value={form.capital} 
              onChange={(e) => setForm({...form, capital: e.target.value})} 
              className={`w-full p-2.5 border rounded-xl focus:outline-none focus:border-sky-500 transition-colors ${
                isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`} 
              placeholder="Contoh: Jakarta" 
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Kawasan (Region)</label>
            <select 
              value={form.region} 
              onChange={(e) => setForm({...form, region: e.target.value})} 
              className={`w-full p-2.5 border rounded-xl focus:outline-none focus:border-sky-500 transition-colors ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {regions.filter(r => r !== 'All').map(reg => (
                <option key={reg} value={reg} className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Sub-kawasan</label>
            <input 
              type="text" 
              required 
              value={form.subregion} 
              onChange={(e) => setForm({...form, subregion: e.target.value})} 
              className={`w-full p-2.5 border rounded-xl focus:outline-none focus:border-sky-500 transition-colors ${
                isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`} 
              placeholder="South-Eastern Asia" 
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Kode (cth: id)</label>
            <input 
              type="text" 
              required 
              value={form.code} 
              onChange={(e) => setForm({...form, code: e.target.value})} 
              className={`w-full p-2.5 border rounded-xl uppercase focus:outline-none focus:border-sky-500 transition-colors ${
                isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`} 
              placeholder="id" 
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Kode Telp</label>
            <input 
              type="text" 
              required 
              value={form.phoneCode} 
              onChange={(e) => setForm({...form, phoneCode: e.target.value})} 
              className={`w-full p-2.5 border rounded-xl focus:outline-none focus:border-sky-500 transition-colors ${
                isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`} 
              placeholder="+62" 
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold">URL Bendera (SVG/PNG)</label>
          <input 
            type="url" 
            required 
            value={form.flagUrl} 
            onChange={(e) => setForm({...form, flagUrl: e.target.value})} 
            className={`w-full p-2.5 border rounded-xl focus:outline-none focus:border-sky-500 transition-colors ${
              isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`} 
            placeholder="https://flagcdn.com/id.svg" 
          />
        </div>

        <div className={`flex justify-end gap-2 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className={`px-4 py-2 rounded-xl border font-semibold transition ${
              isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 shadow-md transition"
          >
            Simpan ke Supabase
          </button>
        </div>
      </form>
    </div>
  );
}