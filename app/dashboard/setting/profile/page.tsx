'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/app/utils/activityLogger'; // Impor helper logger
import Swal from 'sweetalert2';

export default function ProfilePage() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [adminId, setAdminId] = useState(null);

  // ID Dummy tetap (karena belum ada pengecekan Auth sesuai permintaan)
  const ADMIN_ID = '11111111-1111-1111-1111-111111111111';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialAdminData, setInitialAdminData] = useState({});

  // Form State Detail Profil
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    birth_day: '',
    birth_month: '',
    birth_year: '',
    status: '',
    bio: '',
  });

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Avatar & History State
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarHistory, setAvatarHistory] = useState([]);
  const fileInputRef = useRef(null);

  // Ambil data dari Supabase saat halaman dimuat
useEffect(() => {
    checkUserAndFetchProfile();
  }, []);

const checkUserAndFetchProfile = async () => {
  try {
    setLoading(true);

    // Ambil ID dari localStorage yang disimpan saat login
    const currentUserId = localStorage.getItem('adminId');

    if (!currentUserId) {
      throw new Error('Sesi login tidak ditemukan. Silakan login kembali.');
    }

    setAdminId(currentUserId);

    // Ambil data dari tabel admins berdasarkan ID tersebut
    const { data, error: dbError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', currentUserId)
      .single();

    if (dbError) throw dbError;

    if (data) {
      setFormData({
        name: data.name || '',
        username: data.username || '',
        email: data.email || '',
        birth_day: data.birth_day || '',
        birth_month: data.birth_month || '',
        birth_year: data.birth_year || '',
        status: data.status || '',
        bio: data.bio || '',
      });
      setInitialAdminData(data);
      setAvatarUrl(data.avatar_url || '');
      setAvatarHistory(data.avatar_history || []);
    }
  } catch (err) {
    console.error('Gagal memuat profil:', err.message);
    Swal.fire('Oops!', err.message, 'error').then(() => {
      router.push('/login');
    });
  } finally {
    setLoading(false);
  }
};


  // Handle perubahan input text detail profil
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };






const handleSaveProfile = async (e) => {
  e.preventDefault();
  if (!adminId) return; // Pastikan ID ada
  setSaving(true);
  try {
      // 1. Deteksi perubahan dengan membandingkan string secara aman (mengatasi perbedaan tipe data/null/undefined)
      const changedFields = [];
      
      if (String(formData.name || '') !== String(initialAdminData.name || '')) changedFields.push('Nama Lengkap');
      if (String(formData.username || '') !== String(initialAdminData.username || '')) changedFields.push('Username');
      if (String(formData.email || '') !== String(initialAdminData.email || '')) changedFields.push('Email');
      if (String(formData.status || '') !== String(initialAdminData.status || '')) changedFields.push('Status');
      if (String(formData.bio || '') !== String(initialAdminData.bio || '')) changedFields.push('Bio');
      if (String(formData.birth_date || '') !== String(initialAdminData.birth_date || '')) changedFields.push('Tanggal Lahir');

      // Buat deskripsi: jika ada field spesifik yang berubah, sebutkan. Jika tidak ada, tulis umum.
      const description = changedFields.length > 0 
        ? `Memperbarui bagian: ${changedFields.join(', ')}`
        : 'Memperbarui informasi profil admin';

const { error } = await supabase
      .from('admins')
      .update({
        ...formData,
        updated_at: new Date(),
      })
      .eq('id', adminId); // 👈 Gunakan adminId dinamis

    if (error) throw error;

      // 2. Catat log dengan teks deskripsi yang sudah difilter akurat
      logActivity(
        'Profile',
        description,
        'update'
      );

      // 3. Perbarui initialAdminData agar setelah disimpan, data ini jadi acuan baru lagi
      setInitialAdminData({ ...formData });

      Swal.fire('Berhasil!', 'Detail profil berhasil diperbarui.', 'success');
    } catch (err) {
      Swal.fire('Gagal!', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Ubah Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return Swal.fire('Oops!', 'Konfirmasi password baru tidak cocok.', 'warning');
    }

    try {
      // Validasi password lama
      const { data, error: fetchErr } = await supabase
        .from('admins')
        .select('password')
        .eq('id', ADMIN_ID)
        .single();

      if (fetchErr) throw fetchErr;

      if (data.password && data.password !== passwords.currentPassword) {
        return Swal.fire('Gagal!', 'Password saat ini salah.', 'error');
      }

    logActivity(
      'Profile',
      `Informasi Password berhasil di ubah.`,
      'update'
    );
      // Update password baru ke Supabase
      const { error: updateErr } = await supabase
        .from('admins')
        .update({ password: passwords.newPassword })
        .eq('id', ADMIN_ID);

      if (updateErr) throw updateErr;

      Swal.fire('Berhasil!', 'Password berhasil diubah.', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      Swal.fire('Gagal!', err.message, 'error');
    }
  };





  // State untuk mengatur mata (show/hide password)
const [showPassword, setShowPassword] = useState({
  current: false,
  new: false,
  confirm: false,
});

  // Trigger pemilihan file foto
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      openCropSweetAlert(base64Image, file);
    };
    reader.readAsDataURL(file);
  };

  // SweetAlert interaktif untuk mengatur posisi foto (geser kiri, kanan, atas, bawah)
  const openCropSweetAlert = (imageSrc, fileObject) => {
    let posX = 50; // posisi persentase X (0-100)
    let posY = 50; // posisi persentase Y (0-100)
    let zoom = 100; // skala zoom (%)

    Swal.fire({
      title: 'Atur Posisi Foto Profil',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
          <div style="width: 160px; height: 160px; border-radius: 50%; overflow: hidden; border: 3px solid #3b82f6; position: relative; background: #000;">
            <img id="swal-crop-img" src="${imageSrc}" style="position: absolute; left: ${posX}%; top: ${posY}%; transform: translate(--${posX}%, --${posY}%) scale(${zoom / 100}); width: 100%; height: 100%; object-fit: cover; transition: transform 0.1s ease;" />
          </div>
          <p style="font-size: 13px; color: #64748b; margin: 0;">Gunakan tombol di bawah untuk menggeser posisi gambar:</p>
          
          <div style="display: grid; grid-template-columns: repeat(3, 40px); gap: 6px;">
            <div></div>
            <button type="button" id="btn-up" class="swal2-confirm swal2-styled" style="margin:0; padding:6px;">⬆️</button>
            <div></div>
            <button type="button" id="btn-left" class="swal2-confirm swal2-styled" style="margin:0; padding:6px;">⬅️</button>
            <button type="button" id="btn-reset" class="swal2-deny swal2-styled" style="margin:0; padding:6px; background:#64748b;">🔄</button>
            <button type="button" id="btn-right" class="swal2-confirm swal2-styled" style="margin:0; padding:6px;">➡️</button>
            <div></div>
            <button type="button" id="btn-down" class="swal2-confirm swal2-styled" style="margin:0; padding:6px;">⬇️</button>
            <div></div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px; width: 80%; margin-top: 8px;">
            <span style="font-size: 12px;">Zoom:</span>
            <input type="range" id="zoom-range" min="100" max="250" value="${zoom}" style="width: 100%; cursor: pointer;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan Foto',
      cancelButtonText: 'Batal',
didOpen: () => {
  // 1. Berikan tipe eksplisit (HTMLInputElement / HTMLElement)
  const imgEl = document.getElementById('swal-crop-img') as HTMLImageElement | null;
  const zoomEl = document.getElementById('zoom-range') as HTMLInputElement | null;

  const btnUp = document.getElementById('btn-up');
  const btnDown = document.getElementById('btn-down');
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnReset = document.getElementById('btn-reset');

  const updateStyle = () => {
    if (imgEl) {
      imgEl.style.transform = `translate(-${posX}%, -${posY}%) scale(${zoom / 100})`;
      imgEl.style.objectPosition = `${posX}% ${posY}%`;
    }
  };

  if (btnUp) btnUp.onclick = () => { posY = Math.max(0, posY - 10); updateStyle(); };
  if (btnDown) btnDown.onclick = () => { posY = Math.min(100, posY + 10); updateStyle(); };
  if (btnLeft) btnLeft.onclick = () => { posX = Math.max(0, posX - 10); updateStyle(); };
  if (btnRight) btnRight.onclick = () => { posX = Math.min(100, posX + 10); updateStyle(); };
  
  if (btnReset && zoomEl) {
    btnReset.onclick = () => { 
      posX = 50; 
      posY = 50; 
      zoom = 100; 
      zoomEl.value = '100'; // Diubah menjadi string agar sesuai tipe input value
      updateStyle(); 
    };
  }
  
  if (zoomEl) {
    zoomEl.oninput = (e: Event) => {
      // 2. Cast e.target menjadi HTMLInputElement agar properti .value bisa diakses
      const target = e.target as HTMLInputElement;
      zoom = Number(target.value);
      updateStyle();
    };
  }
},
preConfirm: () => {
  return { posX, posY, zoom };
}
}).then(async (result) => {
  if (result.isConfirmed) {
    await uploadAndSaveAvatar(fileObject);
  }
});
  };





  // Upload Avatar ke Storage Supabase & Perbarui Riwayat
const uploadAndSaveAvatar = async (file) => {
  try {
    // 1. Ambil ID admin yang sedang aktif dari localStorage
    const currentAdminId = localStorage.getItem('adminId');
    if (!currentAdminId) {
      throw new Error('Sesi login tidak ditemukan. Silakan login kembali.');
    }

    Swal.fire({ title: 'Mengunggah...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const fileExt = file.name.split('.').pop();
    // Gunakan currentAdminId untuk penamaan file yang unik
    const fileName = `${currentAdminId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // 2. Upload file ke Supabase Storage (pastikan bucket 'avatars' sudah public)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // 3. Dapatkan Public URL yang valid
    const { data: publicURLData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const newAvatarUrl = publicURLData.publicUrl;

    // 4. Siapkan riwayat foto lama
    let updatedHistory = [...avatarHistory];
    if (avatarUrl && !updatedHistory.includes(avatarUrl)) {
      updatedHistory.unshift(avatarUrl);
    }

    // 5. Update URL baru dan history ke tabel admins di database berdasarkan ID yang benar
    const { error: dbError } = await supabase
      .from('admins')
      .update({
        avatar_url: newAvatarUrl,
        avatar_history: updatedHistory,
        updated_at: new Date(),
      })
      .eq('id', currentAdminId); // 👈 Gunakan ID dari localStorage

    if (dbError) throw dbError;

    // Catat aktivitas jika fungsi logActivity tersedia
    if (typeof logActivity === 'function') {
      logActivity(
        'Profile',
        `Foto profil berhasil diperbarui.`,
        'update'
      );
    }

    // 6. Set state lokal agar langsung berubah tanpa harus refresh manual
    setAvatarUrl(newAvatarUrl);
    setAvatarHistory(updatedHistory);

    Swal.fire('Berhasil!', 'Foto profil berhasil disimpan dan diperbarui.', 'success');
  } catch (err) {
    Swal.fire('Gagal Upload!', err.message, 'error');
  }
};

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'text-slate-100 bg-slate-950' : 'text-slate-800 bg-white'}`}>
        <p className="text-lg font-medium animate-pulse">Memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-8 transition-colors duration-200 ${isDark ? 'text-slate-100 bg-slate-950' : 'text-slate-800 bg-white'}`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Profil</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Kelola informasi profil, foto, dan keamanan akun Anda 
          </p>
        </div>
{/* Bagian Foto Profil & Upload */}
        <div className={`p-6 rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className="text-xl font-semibold mb-6">Foto Profil & Riwayat</h2>
          
          {/* Layout dibagi 2 kolom: Kiri (Upload/Utama), Kanan (Riwayat) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            
            {/* KOLOM KIRI: Foto Utama & Tombol Ganti */}
            <div className="flex flex-col sm:flex-row md:flex-col items-center sm:items-start md:items-center text-center sm:text-left md:text-center gap-4 p-4 rounded-xl border border-slate-700/30 bg-slate-800/20">
              
              {/* Bagian Foto yang saat diklik memunculkan SweetAlert */}
              <div 
                onClick={() => {
                  Swal.fire({
                    title: '<span class="' + (isDark ? 'text-slate-100' : 'text-slate-900') + '">Foto Profil</span>',
                    html: `
                      <div class="flex flex-col items-center justify-center space-y-3">
                        
                        <div class="w-80 h-80 rounded-full bg-transparent overflow-hidden border-4 border-blue-500 shadow-xl">
                          <img src="${avatarUrl || 'https://via.placeholder.com/150'}" alt="Foto Profil Utama" class="w-full h-full object-cover" />
                        </div>
                        <p class="text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}">${formData.name ? `${formData.name} (@${formData.username})` : 'Admin Profil'}</p>
                      </div>
                    `,
                    showCloseButton: true,
                    showConfirmButton: false,
                    background: 'transparent',
                    customClass: {
                      popup: isDark ? '!bg-slate-900/80 backdrop-blur-md text-slate-100 border border-slate-800 rounded-2xl shadow-2xl' : '!bg-white/80 backdrop-blur-md text-slate-900 rounded-2xl shadow-2xl'
                    }
                  });
                }}
                className="relative group cursor-pointer"
                title="Klik untuk melihat foto"
              >
                <div className="w-55 h-55 rounded-full overflow-hidden border-4 border-blue-500 shadow-md bg-slate-800 relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition duration-200 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}

                  {/* Overlay petunjuk saat kursor diarahkan (hover) */}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200">
                    <span className="text-xl">🔍</span>
                    <span className="text-[10px] font-semibold mt-1">Lihat Foto</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 w-full">
<p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
  {formData.bio || 'Belum ada bio'}
</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow w-full"
                >
                  Ganti Foto Profil
                </button>
              </div>
            </div>

            {/* KOLOM KANAN: Kumpulan Riwayat Foto Sebelumnya */}
            <div className="flex flex-col justify-between h-full p-4 rounded-xl border border-slate-700/30 bg-slate-800/20">
              <div>
                <h3 className="text-md font-medium mb-2">Riwayat Foto Sebelumnya</h3>
                <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Klik "Gunakan" pada salah satu foto di bawah untuk memasangnya kembali secara instan.
                </p>
              </div>

              {avatarHistory.length === 0 ? (
                <div className="py-6 text-center">
                  <p className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Belum ada riwayat foto profil sebelumnya.
                  </p>
                </div>
              ) : (
                /* Ukuran thumbnail riwayat diperbesar dari w-16 h-16 menjadi w-20 h-20 */
                <div className="flex flex-wrap gap-3 max-h-56 overflow-y-auto p-1">
                  {avatarHistory.map((histUrl, idx) => (
                    <div key={idx} className="w-30 h-30 rounded-xl overflow-hidden border-2 border-slate-600 shadow-sm relative group">
                      <img src={histUrl} alt={`Riwayat ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={async () => {
                          setAvatarUrl(histUrl);
                          await supabase.from('admins').update({ avatar_url: histUrl }).eq('id', ADMIN_ID);
                          Swal.fire('Berhasil', 'Foto profil dikembalikan ke riwayat terpilih.', 'success');
                        }}
                        className="absolute inset-0 bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition font-semibold"
                      >
                        Gunakan
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
        
        {/* Bagian Detail Profil */}
        <form onSubmit={handleSaveProfile} className={`p-6 rounded-2xl border shadow-sm space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className="text-xl font-semibold mb-2">Detail Informasi</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                required
              />
            </div>

            {/* Tanggal Lahir, Bulan, Tahun */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  name="birth_day"
                  placeholder="Hari (1-31)"
                  min="1"
                  max="31"
                  value={formData.birth_day}
                  onChange={handleInputChange}
                  className={`px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
                <input
                  type="number"
                  name="birth_month"
                  placeholder="Bulan (1-12)"
                  min="1"
                  max="12"
                  value={formData.birth_month}
                  onChange={handleInputChange}
                  className={`px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
                <input
                  type="number"
                  name="birth_year"
                  placeholder="Tahun (YYYY)"
                  value={formData.birth_year}
                  onChange={handleInputChange}
                  className={`px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Status</label>
              <input
                type="text"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                placeholder="Contoh: Sedang aktif coding / Sibuk"
                className={`w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tuliskan sedikit tentang diri Anda..."
                className={`w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition shadow disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
          </div>
        </form>

{/* Bagian Reset / Ubah Password */}
<form onSubmit={handleUpdatePassword} className={`p-6 rounded-2xl border shadow-sm space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
  <h2 className="text-xl font-semibold mb-2">Keamanan & Ubah Password</h2>
  
  <div className="space-y-4">
    {/* Password Saat Ini */}
    <div>
      <label className="block text-sm font-medium mb-1">Password Saat Ini</label>
      <div className="relative">
        <input
          type={showPassword.current ? "text" : "password"}
          value={passwords.currentPassword}
          onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          className={`w-full px-4 py-2 pr-10 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none text-sm"
        >
          {showPassword.current ? '👁️‍🗨️' : '👁️'}
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Password Baru */}
      <div>
        <label className="block text-sm font-medium mb-1">Password Baru</label>
        <div className="relative">
          <input
            type={showPassword.new ? "text" : "password"}
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className={`w-full px-4 py-2 pr-10 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none text-sm"
          >
            {showPassword.new ? '👁️‍🗨️' : '👁️'}
          </button>
        </div>
      </div>

      {/* Konfirmasi Password Baru */}
      <div>
        <label className="block text-sm font-medium mb-1">Konfirmasi Password Baru</label>
        <div className="relative">
          <input
            type={showPassword.confirm ? "text" : "password"}
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            className={`w-full px-4 py-2 pr-10 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none text-sm"
          >
            {showPassword.confirm ? '👁️‍🗨️️' : '👁️'}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div className="flex justify-end pt-2">
    <button
      type="submit"
      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition shadow"
    >
      Perbarui Password
    </button>
  </div>
</form>

      </div>
    </div>
  );
}