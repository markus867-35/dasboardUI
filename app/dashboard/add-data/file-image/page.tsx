'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Sesuaikan path supabase client Anda
import { useTheme } from '@/app/context/ThemeContext'; // <-- Import ThemeContext Anda
import { FiDollarSign, FiArrowUpRight, FiArrowDownLeft, FiPlus, FiTrash2, FiCalendar } from 'react-icons/fi';

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export default function FinancePage() {
  const { mode } = useTheme(); // <-- Mengambil mode dari ThemeContext global
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form Tambah Transaksi
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Umum');

  // Ambil Data dari Supabase
  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Gagal memuat data keuangan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Tambah Transaksi Baru
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            title: title.trim(),
            amount: parseFloat(amount),
            type,
            category,
            date: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        setTransactions([data[0], ...transactions]);
        setTitle('');
        setAmount('');
      }
    } catch (error) {
      console.error('Gagal menambah transaksi:', error);
      alert('Gagal menyimpan transaksi.');
    }
  };

  // Hapus Transaksi
  const handleDeleteTransaction = async (id: number) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Gagal menghapus transaksi:', error);
    }
  };

  // Kalkulasi Total Uang Masuk, Keluar, dan Sisa Saldo
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const remainingBalance = totalIncome - totalExpense;

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  return (
    <div className={`p-6 min-h-screen ${mode === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#0b1329] text-slate-100'}`}>
      
      {/* Header Halaman */}
      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FiDollarSign className="text-blue-500" size={24} /> Manajemen Keuangan Pribadi
        </h1>
        <p className="text-xs opacity-60">Pantau uang masuk, uang pengeluaran, dan sisa saldo Anda secara real-time.</p>
      </div>

      {/* KARTU RINGKASAN SALDO (3 KOTAK UTAMA) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Sisa Saldo */}
        <div className={`p-4 rounded-2xl border shadow-inner flex flex-col justify-between ${
          mode === 'light' ? 'bg-white border-slate-200' : 'bg-[#16222A]/80 border-slate-700/80'
        }`}>
          <span className="text-xs opacity-60 font-medium">Sisa Saldo Keuangan</span>
          <h2 className={`text-2xl font-black my-2 ${remainingBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatRupiah(remainingBalance)}
          </h2>
          <span className="text-[10px] opacity-50">Total Bersih (Pemasukan - Pengeluaran)</span>
        </div>

        {/* Total Uang Masuk */}
        <div className={`p-4 rounded-2xl border shadow-inner flex flex-col justify-between ${
          mode === 'light' ? 'bg-white border-slate-200' : 'bg-[#16222A]/80 border-slate-700/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-60 font-medium">Total Uang Masuk</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <FiArrowDownLeft size={16} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-emerald-500 my-2">{formatRupiah(totalIncome)}</h2>
          <span className="text-[10px] opacity-50">Akumulasi seluruh pemasukan</span>
        </div>

        {/* Total Uang Keluar */}
        <div className={`p-4 rounded-2xl border shadow-inner flex flex-col justify-between ${
          mode === 'light' ? 'bg-white border-slate-200' : 'bg-[#16222A]/80 border-slate-700/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-60 font-medium">Total Uang Keluar</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <FiArrowUpRight size={16} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-red-500 my-2">{formatRupiah(totalExpense)}</h2>
          <span className="text-[10px] opacity-50">Akumulasi seluruh pengeluaran</span>
        </div>

      </div>

      {/* GRID UTAMA: FORM TAMBAH & RIWAYAT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Form Tambah Transaksi */}
        <div className={`p-5 rounded-2xl border h-fit shadow-md ${
          mode === 'light' ? 'bg-white border-slate-200' : 'bg-[#16222A]/80 border-slate-700/80'
        }`}>
          <h3 className="text-sm font-bold mb-4 pb-2 border-b border-slate-700/20">Tambah Transaksi Baru</h3>
          
          <form onSubmit={handleAddTransaction} className="space-y-3">
            <div>
              <label className="text-[11px] opacity-70 block mb-1">Jenis Transaksi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 rounded-xl text-xs font-semibold transition ${
                    type === 'income' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-500/10 hover:bg-slate-500/20'
                  }`}
                >
                  Uang Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 rounded-xl text-xs font-semibold transition ${
                    type === 'expense' ? 'bg-red-600 text-white shadow' : 'bg-slate-500/10 hover:bg-slate-500/20'
                  }`}
                >
                  Uang Keluar
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] opacity-70 block mb-1">Judul / Keterangan</label>
              <input 
                type="text" 
                placeholder="Contoh: Gaji Bulanan / Beli Makan" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                  mode === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                }`}
                required
              />
            </div>

            <div>
              <label className="text-[11px] opacity-70 block mb-1">Jumlah Nominal (Rp)</label>
              <input 
                type="number" 
                placeholder="Contoh: 50000" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                  mode === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                }`}
                required
              />
            </div>

            <div>
              <label className="text-[11px] opacity-70 block mb-1">Kategori</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                  mode === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="Umum">Umum</option>
                <option value="Gaji / Pemasukan">Gaji / Pemasukan</option>
                <option value="Makanan & Minuman">Makanan & Minuman</option>
                <option value="Transportasi">Transportasi</option>
                <option value="Belanja">Belanja</option>
                <option value="Tagihan & Utilitas">Tagihan & Utilitas</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-1.5 shadow"
            >
              <FiPlus size={16} /> Simpan Transaksi
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Riwayat Transaksi */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border shadow-md flex flex-col ${
          mode === 'light' ? 'bg-white border-slate-200' : 'bg-[#16222A]/80 border-slate-700/80'
        }`}>
          <h3 className="text-sm font-bold mb-4 pb-2 border-b border-slate-700/20 flex justify-between items-center">
            <span>Riwayat Transaksi</span>
            <span className="text-xs opacity-60 font-normal">{transactions.length} Total Transaksi</span>
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs opacity-60">Memuat data keuangan...</div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-60 flex flex-col items-center justify-center">
              <FiDollarSign size={32} className="mb-2 opacity-30" />
              <p>Belum ada catatan transaksi.<br/>Silakan tambahkan uang masuk atau keluar lewat form di samping.</p>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[450px] pr-1">
              {transactions.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition ${
                    mode === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {item.type === 'income' ? <FiArrowDownLeft size={18} /> : <FiArrowUpRight size={18} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/10 opacity-70">{item.category}</span>
                        <span className="text-[10px] opacity-50 flex items-center gap-1">
                          <FiCalendar size={10} /> {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${item.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                    </span>
                    <button 
                      onClick={() => handleDeleteTransaction(item.id)}
                      className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:text-red-400 transition"
                      title="Hapus Transaksi"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}