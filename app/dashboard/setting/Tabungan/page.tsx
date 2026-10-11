'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/app/context/ThemeContext';
import { FiBookmark, FiPlus, FiTrash2, FiDollarSign } from 'react-icons/fi';

interface SavingGoal {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
}

export default function SavingsSection() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [savings, setSavings] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Target Tabungan Baru
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  // State Modal Setor/Tarik Uang Tabungan
  const [selectedSaving, setSelectedSaving] = useState<SavingGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Ambil Data Tabungan
  const fetchSavings = async () => {
    try {
      const { data, error } = await supabase
        .from('savings')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setSavings(data || []);
    } catch (err) {
      console.error('Gagal mengambil data tabungan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  // Tambah Target Tabungan Baru
  const handleCreateSaving = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    try {
      const { data, error } = await supabase
        .from('savings')
        .insert([{ title: title.trim(), target_amount: parseFloat(targetAmount), current_amount: 0 }])
        .select();

      if (error) throw error;
      if (data) setSavings([data[0], ...savings]);

      setTitle('');
      setTargetAmount('');
    } catch (err) {
      console.error('Gagal menambah tabungan:', err);
    }
  };

  // Setor / Tambah Uang ke Tabungan
  const handleDeposit = async (isAdd: boolean) => {
    if (!selectedSaving || !depositAmount) return;
    const amount = parseFloat(depositAmount);
    const newCurrent = isAdd 
      ? Number(selectedSaving.current_amount) + amount 
      : Math.max(0, Number(selectedSaving.current_amount) - amount);

    try {
      const { error } = await supabase
        .from('savings')
        .update({ current_amount: newCurrent })
        .eq('id', selectedSaving.id);

      if (error) throw error;

      setSavings(savings.map(s => s.id === selectedSaving.id ? { ...s, current_amount: newCurrent } : s));
      setSelectedSaving(null);
      setDepositAmount('');
    } catch (err) {
      console.error('Gagal memperbarui tabungan:', err);
    }
  };

  // Hapus Target Tabungan
  const handleDeleteSaving = async (id: number) => {
    try {
      const { error } = await supabase.from('savings').delete().eq('id', id);
      if (error) throw error;
      setSavings(savings.filter(s => s.id !== id));
    } catch (err) {
      console.error('Gagal menghapus tabungan:', err);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  return (
    <div className="space-y-6">
      
      {/* FORM BUAT TARGET TABUNGAN BARU */}
      <div className={`p-5 rounded-2xl border shadow-md ${
        isDark ? 'bg-[#16222A]/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <FiBookmark className="text-blue-500" /> Buat Target Tabungan / Impian Baru
        </h3>
        <form onSubmit={handleCreateSaving} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input 
            type="text"
            placeholder="Nama Target (misal: Beli Laptop / Dana Darurat)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs border outline-none ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
            }`}
            required
          />
          <input 
            type="number"
            placeholder="Target Nominal (Rp)"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs border outline-none ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
            }`}
            required
          />
          <button 
            type="submit"
            className="py-2 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-1.5 shadow"
          >
            <FiPlus size={16} /> Tambah Target
          </button>
        </form>
      </div>

      {/* DAFTAR KARTU TABUNGAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-xs opacity-60 col-span-3 text-center py-8">Memuat tabungan Anda...</p>
        ) : savings.length === 0 ? (
          <p className="text-xs opacity-60 col-span-3 text-center py-8">Belum ada target tabungan. Silakan buat target di atas!</p>
        ) : (
          savings.map((item) => {
            const percentage = Math.min(100, Math.round((item.current_amount / item.target_amount) * 100));

            return (
              <div 
                key={item.id}
                className={`p-4 rounded-2xl border shadow-md flex flex-col justify-between ${
                  isDark ? 'bg-[#16222A]/80 border-slate-700/80' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold truncate pr-2">{item.title}</h4>
                    <button 
                      onClick={() => handleDeleteSaving(item.id)}
                      className="text-red-500 hover:text-red-400 opacity-60 hover:opacity-100 transition"
                      title="Hapus Target"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                  {/* Nominal Terkumpul */}
                  <div className="my-2">
                    <span className="text-[10px] opacity-60">Terkumpul:</span>
                    <h3 className="text-lg font-black text-blue-500">{formatRupiah(item.current_amount)}</h3>
                    <p className="text-[10px] opacity-50">dari target {formatRupiah(item.target_amount)}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span>Progress</span>
                      <span className="font-bold text-blue-400">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-500/20 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Tombol Setor / Tarik Uang */}
                <div className="mt-4 pt-3 border-t border-slate-700/20 flex gap-2">
                  <button 
                    onClick={() => setSelectedSaving(item)}
                    className="w-full py-1.5 rounded-xl text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition flex items-center justify-center gap-1"
                  >
                    <FiDollarSign size={14} /> Setor / Tarik Uang
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL SETOR / TARIK UANG TABUNGAN */}
      {selectedSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm p-5 rounded-2xl border shadow-2xl ${
            isDark ? 'bg-[#16222A] text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200'
          }`}>
            <h3 className="text-sm font-bold mb-1">Kelola Tabungan: {selectedSaving.title}</h3>
            <p className="text-[11px] opacity-60 mb-4">Saldo Terkumpul saat ini: {formatRupiah(selectedSaving.current_amount)}</p>

            <input 
              type="number"
              placeholder="Nominal Uang (Rp)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none mb-4 ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
              }`}
            />

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleDeposit(true)}
                className="py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
              >
                + Setor Uang
              </button>
              <button 
                onClick={() => handleDeposit(false)}
                className="py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition"
              >
                - Tarik Uang
              </button>
            </div>

            <button 
              onClick={() => setSelectedSaving(null)}
              className="w-full mt-2 py-1.5 text-xs opacity-60 hover:opacity-100 transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}

    </div>
  );
}