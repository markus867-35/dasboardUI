'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/app/context/ThemeContext';

const ChangePassword = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [loading, setLoading] = useState(false);
  
  // State untuk data form password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // State terpisah untuk toggle visibility masing-masing input mata
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Asumsi mengambil ID Admin yang sedang login
  const ADMIN_ID = '11111111-1111-1111-1111-111111111111'; 

  const handleChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // Validasi kecocokan password baru
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire('Peringatan!', 'Konfirmasi password baru tidak cocok.', 'warning');
      return;
    }

    // Validasi panjang password minimal
    if (passwordData.newPassword.length < 6) {
      Swal.fire('Peringatan!', 'Password baru minimal harus 6 karakter.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // 1. Ambil data admin saat ini untuk verifikasi password lama
      const { data: admin, error: fetchError } = await supabase
        .from('admins')
        .select('password')
        .eq('id', ADMIN_ID)
        .single();

      if (fetchError) throw fetchError;

      // 2. Cek apakah password lama sesuai
      if (admin.password !== passwordData.currentPassword) {
        throw new Error('Password lama yang Anda masukkan salah.');
      }

      // 3. Update ke password baru di Supabase
      const { error: updateError } = await supabase
        .from('admins')
        .update({
          password: passwordData.newPassword,
          updated_at: new Date(),
        })
        .eq('id', ADMIN_ID);

      if (updateError) throw updateError;

      Swal.fire('Berhasil!', 'Password berhasil diperbarui.', 'success');
      
      // Reset form setelah berhasil
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

    } catch (err) {
      Swal.fire('Gagal!', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-xl mx-auto p-6 rounded-xl shadow-md border transition-colors duration-200 ${isDark ? 'text-slate-100 bg-slate-950 border-slate-800' : 'text-slate-800 bg-white border-slate-200'}`}>
      <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-indigo-950/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Ubah Password</h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pastikan akun Anda menggunakan password yang aman.</p>
        </div>
      </div>

      <form onSubmit={handleUpdatePassword} className="space-y-4">
        {/* Password Lama */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password Lama</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Lock size={18} />
            </span>
            <input
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleChange}
              required
              placeholder="Masukkan password lama"
              className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'}`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Password Baru */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password Baru</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <KeyRound size={18} />
            </span>
            <input
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleChange}
              required
              placeholder="Masukkan password baru"
              className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'}`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Konfirmasi Password Baru */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Konfirmasi Password Baru</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <KeyRound size={18} />
            </span>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Ulangi password baru"
              className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Perbarui Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;