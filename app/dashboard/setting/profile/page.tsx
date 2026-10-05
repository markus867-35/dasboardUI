'use client';

import React, { useState ,useEffect} from 'react';
import { useTheme } from '@/app/context/ThemeContext'; 
import { logActivity } from '@/app/utils/activityLogger'; // Impor helper logger
import { supabase } from '@/lib/supabase';
import { 
  User, Mail, Calendar, GraduationCap, 
  Lock, Camera, Save, Edit3, Move, X 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProfilePage() {
  
  const { mode } = useTheme(); 
  const isDark = mode === 'dark';

  // --- STATE DATA PROFIL ---
  const [profile, setProfile] = useState({
    name: 'Ahmad Developer',
    username: 'ahmad_dev',
    email: 'ahmad.dev@example.com',
    birthDate: '1998-05-15',
    graduationYear: '2020',
    bio: 'Seorang Full-Stack Web Developer yang antusias dengan teknologi Next.js, React, dan Tailwind CSS. Suka membangun aplikasi web yang bersih dan interaktif.',
  });

  // --- STATE EDIT MODE & PASSWORD ---
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- STATE FOTO PROFIL & POSISI ---
  const [avatarUrl, setAvatarUrl] = useState('');
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });

  // --- HITUNG UMUR OTOMATIS ---
  const calculateAge = (birthDateString: string) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };




const handleSaveProfile = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // 1. Deteksi perubahan field untuk log aktivitas
    const changes: string[] = [];
    if (tempProfile.name !== profile.name) changes.push(`Nama Lengkap dari "${profile.name}" menjadi "${tempProfile.name}"`);
    if (tempProfile.username !== profile.username) changes.push(`Username dari "${profile.username}" menjadi "${tempProfile.username}"`);
    if (tempProfile.email !== profile.email) changes.push(`Email dari "${profile.email}" menjadi "${tempProfile.email}"`);
    if (tempProfile.birthDate !== profile.birthDate) changes.push(`Tanggal Lahir diubah`);
    if (tempProfile.graduationYear !== profile.graduationYear) changes.push(`Tahun Kelulusan dari "${profile.graduationYear}" menjadi "${tempProfile.graduationYear}"`);
    if (tempProfile.bio !== profile.bio) changes.push(`Bio/Deskripsi diperbarui`);

    if (changes.length === 0) {
      setIsEditing(false);
      alert('Tidak ada perubahan data.');
      return;
    }

    // 2. Kirim update ke Supabase berdasarkan email profil saat ini
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: tempProfile.name,
        username: tempProfile.username,
        email: tempProfile.email,
        birth_date: tempProfile.birthDate,
        graduation_year: tempProfile.graduationYear,
        bio: tempProfile.bio,
        avatar: tempProfile.avatar,
        updated_at: new Date().toISOString(),
      })
      .eq('email', profile.email); // Menggunakan email untuk mencocokkan data yang diupdate

    if (updateError) throw updateError;

    setProfile(tempProfile);
    setIsEditing(false);

    logActivity(
      'Pembaruan Informasi Pribadi',
      `Mengubah ${changes.join(', ')}`,
      'update'
    );

    alert('Profil berhasil diperbarui dan disimpan ke database!');

  } catch (error: any) {
    console.error('Gagal menyimpan profil:', error);
    alert(`Gagal memperbarui profil: ${error.message || 'Terjadi kesalahan'}`);
  }
};


  // --- FUNGSI MODAL SWEETALERT UNTUK MELIHAT FOTO BESAR & ATUR POSISI ---
  const handleOpenPhotoModal = () => {
    let tempX = imagePosition.x;
    let tempY = imagePosition.y;

    Swal.fire({
      title: '<span style="font-size: 18px; font-weight: 600;">Foto Profil</span>',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; margin-top: 10px;">
          <!-- TAMPILAN GAMBAR UKURAN BESAR -->
          <div style="width: 240px; height: 240px; border-radius: 50%; overflow: hidden; border: 4px solid #6366f1; box-shadow: 0 15px 25px -5px rgba(0,0,0,0.4); background: #0f172a;">
            <img id="swal-img-preview" src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; object-position: ${tempX}% ${tempY}%;" />
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Geser slider di bawah jika ingin menyesuaikan posisi foto:</p>
          
          <div style="width: 100%; text-align: left;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">
              <span>Geser Horizontal (X)</span>
              <span id="val-x" style="font-weight: 600; color: #818cf8;">${tempX}%</span>
            </div>
            <input id="swal-range-x" type="range" min="0" max="100" value="${tempX}" style="width: 100%; accent-color: #6366f1; cursor: pointer;" />
          </div>

          <div style="width: 100%; text-align: left;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">
              <span>Geser Vertikal (Y)</span>
              <span id="val-y" style="font-weight: 600; color: #818cf8;">${tempY}%</span>
            </div>
            <input id="swal-range-y" type="range" min="0" max="100" value="${tempY}" style="width: 100%; accent-color: #6366f1; cursor: pointer;" />
          </div>
        </div>
      `,
      background: isDark ? '#1F2937' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
      showCancelButton: true,
      confirmButtonText: 'Simpan Posisi',
      cancelButtonText: 'Tutup',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      didOpen: () => {
        const rangeX = document.getElementById('swal-range-x') as HTMLInputElement;
        const rangeY = document.getElementById('swal-range-y') as HTMLInputElement;
        const imgPreview = document.getElementById('swal-img-preview') as HTMLImageElement;
        const valX = document.getElementById('val-x');
        const valY = document.getElementById('val-y');

        rangeX?.addEventListener('input', (e) => {
          tempX = Number((e.target as HTMLInputElement).value);
          if (imgPreview) imgPreview.style.objectPosition = `${tempX}% ${tempY}%`;
          if (valX) valX.innerText = `${tempX}%`;
        });

        rangeY?.addEventListener('input', (e) => {
          tempY = Number((e.target as HTMLInputElement).value);
          if (imgPreview) imgPreview.style.objectPosition = `${tempX}% ${tempY}%`;
          if (valY) valY.innerText = `${tempY}%`;
        });
      },
      preConfirm: () => {
        const rangeX = (document.getElementById('swal-range-x') as HTMLInputElement)?.value;
        const rangeY = (document.getElementById('swal-range-y') as HTMLInputElement)?.value;
        return { x: Number(rangeX), y: Number(rangeY) };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setImagePosition(result.value);

logActivity(
    'Penyesuaian Posisi Foto',
    `Mengatur koordinat fokus bingkai foto profil pada titik X: ${result.value.x}%, Y: ${result.value.y}%`,
    'update'
  );

        Swal.fire({
          icon: 'success',
          title: 'Posisi foto berhasil disimpan!',
          showConfirmButton: false,
          timer: 1200,
          background: isDark ? '#1F2937' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a'
        });
      }
    });
  };




  // --- HANDLER UPLOAD & KONVERSI FOTO KE BASE64 ---
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      // 1. Set state avatar lokal
      setAvatarUrl(base64String);

      // 2. Simpan juga langsung ke state profil & localStorage agar persisten
      const updatedProfile = { ...profile, avatar: base64String };
      setProfile(updatedProfile);
      localStorage.setItem('user_profile_data', JSON.stringify(updatedProfile));

      // 3. Catat aktivitas ke /activity
      logActivity(
        'Unggah Foto Profil',
        `Berhasil mengunggah file gambar baru: "${file.name}"`,
        'upload'
      );

      // 4. Buka modal atur posisi
      setTimeout(() => {
        handleOpenPhotoModal();
      }, 100);
    };

    // Baca file sebagai data URL (Base64)
    reader.readAsDataURL(file);
  }
};



useEffect(() => {
  const savedProfile = localStorage.getItem('user_profile_data');
  if (savedProfile) {
    const parsed = JSON.parse(savedProfile);
    setProfile(parsed);
    setTempProfile(parsed);
    if (parsed.avatar) {
      setAvatarUrl(parsed.avatar); // Memuat kembali foto base64 yang tersimpan
    }
  }
}, []);




  // --- HANDLER GANTI PASSWORD ---
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Semua field password harus diisi!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }

logActivity(
    'Perubahan Keamanan Sandi',
    'Pengguna berhasil memperbarui kata sandi akun.',
    'security'
  );

    alert('Password berhasil diubah!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  return (
    <div className={`min-h-screen p-6 md:p-10 font-sans transition-colors duration-200 ${isDark ? 'bg-[#111827] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER JUDUL */}
        <div className={`flex items-center justify-between border-b pb-5 ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <div>
            <h1 className="text-2xl font-bold text-indigo-500">Pengaturan Profil</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Kelola informasi akun, foto profil, dan keamanan Anda.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Tombol Edit/Batal */}
            <button
              onClick={() => {
                if (isEditing) setTempProfile(profile);
                setIsEditing(!isEditing);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isEditing 
                  ? (isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800') 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isEditing ? <><X className="w-4 h-4" /> Batal</> : <><Edit3 className="w-4 h-4" /> Edit Profil</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: FOTO PROFIL & POSISI */}
          <div className="md:col-span-1 space-y-6">
            <div className={`p-6 rounded-2xl border flex flex-col items-center text-center shadow-lg transition-colors ${isDark ? 'bg-[#1F2937] border-slate-700/60' : 'bg-white border-slate-200'}`}>
              
              {/* CONTAINER PREVIEW FOTO (KLIK MEMUNCULKAN SWEETALERT) */}
              <div 
                onClick={handleOpenPhotoModal}
                className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-indigo-500/40 shadow-inner group mb-4 bg-slate-900 cursor-pointer"
                title="Klik untuk atur posisi foto"
              >
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-all duration-150"
                  style={{ objectPosition: `${imagePosition.x}% ${imagePosition.y}%` }}
                />
                
                {/* Tombol Overlay Upload */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition text-white">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[11px] font-medium">Ganti / Atur</span>
                </div>
              </div>

              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.name}</h2>
              <p className="text-xs text-indigo-400">@{profile.username}</p>
              
              {/* TOMBOL GANTI FOTO / ATUR POSISI */}
              <div className="w-full mt-4 flex flex-col gap-2">
                <button 
                  onClick={handleOpenPhotoModal}
                  className={`w-full py-2 px-3 text-xs rounded-xl border font-medium transition flex items-center justify-center gap-1.5 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'}`}
                >
                  <Move className="w-3.5 h-3.5 text-indigo-500" /> Atur Posisi Foto
                </button>

                <label className={`w-full py-2 px-3 text-xs rounded-xl border font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${isDark ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30' : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'}`}>
                  <Camera className="w-3.5 h-3.5" /> Upload Foto Baru
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

            </div>
          </div>

          {/* KOLOM KANAN: DETAIL PROFIL & FORM EDIT */}
          <div className="md:col-span-2 space-y-6">
            
            {/* FORM DETAIL PROFIL */}
            <div className={`p-6 rounded-2xl border shadow-lg transition-colors ${isDark ? 'bg-[#1F2937] border-slate-700/60' : 'bg-white border-slate-200'}`}>
              <h2 className={`text-base font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <User className="w-4 h-4 text-indigo-500" /> Informasi Pribadi
              </h2>

              {!isEditing ? (
                // TAMPILAN DETAIL PROFIL (READ-ONLY)
                <div className="space-y-4 text-sm">
                  <div className={`grid grid-cols-2 gap-4 border-b pb-3 ${isDark ? 'border-slate-700/40' : 'border-slate-100'}`}>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Nama Lengkap</p>
                      <p className={`font-medium mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.name}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Username</p>
                      <p className={`font-medium mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>@{profile.username}</p>
                    </div>
                  </div>

                  <div className={`grid grid-cols-2 gap-4 border-b pb-3 ${isDark ? 'border-slate-700/40' : 'border-slate-100'}`}>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email</p>
                      <p className={`font-medium mt-0.5 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {profile.email}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tanggal Lahir & Umur</p>
                      <p className={`font-medium mt-0.5 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> 
                        {profile.birthDate} ({calculateAge(profile.birthDate)} Tahun)
                      </p>
                    </div>
                  </div>

                  <div className={`border-b pb-3 ${isDark ? 'border-slate-700/40' : 'border-slate-100'}`}>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tahun Kelulusan</p>
                      <p className={`font-medium mt-0.5 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {profile.graduationYear}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bio / Deskripsi</p>
                    <p className={`font-medium mt-1 leading-relaxed text-xs p-3 rounded-lg border ${isDark ? 'bg-slate-900/50 border-slate-700/40 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                      {profile.bio}
                    </p>
                  </div>
                </div>
              ) : (
                // FORM EDIT PROFIL
                <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Nama Lengkap</label>
                      <input 
                        type="text" 
                        value={tempProfile.name}
                        onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Username</label>
                      <input 
                        type="text" 
                        value={tempProfile.username}
                        onChange={(e) => setTempProfile({ ...tempProfile, username: e.target.value })}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email</label>
                      <input 
                        type="email" 
                        value={tempProfile.email}
                        onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tanggal Lahir (Umur otomatis terhitung)</label>
                      <input 
                        type="date" 
                        value={tempProfile.birthDate}
                        onChange={(e) => setTempProfile({ ...tempProfile, birthDate: e.target.value })}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tahun Kelulusan</label>
                    <input 
                      type="text" 
                      value={tempProfile.graduationYear}
                      onChange={(e) => setTempProfile({ ...tempProfile, graduationYear: e.target.value })}
                      className={`w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bio / Deskripsi</label>
                    <textarea 
                      rows={3}
                      value={tempProfile.bio}
                      onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                      className={`w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-sm resize-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit" 
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow transition"
                    >
                      <Save className="w-4 h-4" /> Simpan Perubahan
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* FORM UBAH PASSWORD */}
            <div className={`p-6 rounded-2xl border shadow-lg transition-colors ${isDark ? 'bg-[#1F2937] border-slate-700/60' : 'bg-white border-slate-200'}`}>
              <h2 className={`text-base font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <Lock className="w-4 h-4 text-indigo-500" /> Keamanan & Ubah Password
              </h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-4 text-sm">
                <div>
                  <label className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password Saat Ini</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password Baru</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Konfirmasi Password Baru</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                  >
                    <Lock className="w-4 h-4" /> Perbarui Password
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}