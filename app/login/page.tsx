'use client';
import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/app/context/ThemeContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const router = useRouter();

  // State untuk melacak posisi panel (true = DAFTAR di kanan, false = LOGIN di kiri)
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);

  // State Form LOGIN
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // State Form DAFTAR
  const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '' });
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

// Handler LOGIN
const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  try {
    // Contoh validasi dari tabel admins Supabase
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', signInData.email)
      .single();

    if (error || !data) {
      throw new Error('Email atau akun tidak ditemukan.');
    }

    if (data.password !== signInData.password) {
      throw new Error('Password yang Anda masukkan salah.');
    }

    Swal.fire('Berhasil!', 'Login Berhasil.', 'success').then(() => {
      // Simpan ID admin yang sedang login ke browser localStorage
      localStorage.setItem('adminId', String(data.id)); // Pastikan dikonversi ke string
      
      router.push('/dashboard');
    });
  } catch (err: any) { // 👈 Tambahkan : any di sini
    Swal.fire('Gagal!', err.message || 'Terjadi kesalahan saat login.', 'error');
  } finally {
    setLoading(false);
  }
};



// Handler DAFTAR
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => { // 👈 Tambahkan tipe di sini
    e.preventDefault();
    setLoading(true);
    try {
      if (signUpData.password.length < 6) {
        throw new Error('Password minimal harus 6 karakter.');
      }

      // Masukkan data ke tabel admins
      const { error } = await supabase.from('admins').insert([
        {
          name: signUpData.name,
          username: signUpData.email.split('@')[0], // Generate username otomatis dari email
          email: signUpData.email,
          password: signUpData.password,
          status: 'Aktif Bekerja',
        },
      ]);

      if (error) throw error;

      Swal.fire('Berhasil!', 'Akun berhasil dibuat, silakan LOGIN.', 'success');
      setIsSignUp(false); // Geser ke panel LOGIN
      setSignUpData({ name: '', email: '', password: '' });
    } catch (err: any) { // 👈 Tambahkan : any di sini
      Swal.fire('Gagal!', err.message || 'Terjadi kesalahan saat pendaftaran.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      {/* Container Utama Box */}
      <div className={`relative w-[850px] h-[520px] rounded-3xl shadow-2xl overflow-hidden flex transition-colors duration-200 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
        
        {/* --- FORM LOGIN (Di Kiri) --- */}
        <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-8 transition-opacity duration-500 ease-in-out ${!isSignUp ? 'opacity-100 z-25 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
          <h2 className="text-3xl font-bold mb-4">LOGIN</h2>
          
          <span className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>LOGIN With Email & Password</span>

          <form onSubmit={handleSignIn} className="w-full space-y-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Mail size={18} /></span>
              <input 
                type="email" 
                placeholder="Enter E-mail"
                required
                value={signInData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignInData({ ...signInData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none border ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-100 border-gray-200 text-gray-800'}`}
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Lock size={18} /></span>
              <input 
                type={showSignInPassword ? 'text' : 'password'} 
                placeholder="Enter Password" 
                required
                value={signInData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignInData({ ...signInData, password: e.target.value })}
                className={`w-full pl-10 pr-10 py-3 rounded-lg text-sm focus:outline-none border ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-100 border-gray-200 text-gray-800'}`}
              />
              <button
                type="button"
                onClick={() => setShowSignInPassword(!showSignInPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="w-full text-right">
              <a href="#" className={`text-xs hover:underline ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Forget Password?</a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Proses...' : 'LOGIN'}
            </button>
          </form>
        </div>


        {/* --- FORM DAFTAR (Di Kanan) --- */}
        <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-8 transition-opacity duration-500 ease-in-out ${isSignUp ? 'opacity-100 z-25 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
          <h2 className="text-3xl font-bold mb-4">Create Account</h2>

          <span className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>Register with E-mail</span>

          <form onSubmit={handleSignUp} className="w-full space-y-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><User size={18} /></span>
              <input 
                type="text" 
                placeholder="Name" 
                required
                value={signUpData.name}
                onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none border ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-100 border-gray-200 text-gray-800'}`}
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Mail size={18} /></span>
              <input 
                type="email" 
                placeholder="Enter E-mail" 
                required
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none border ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-100 border-gray-200 text-gray-800'}`}
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Lock size={18} /></span>
              <input 
                type={showSignUpPassword ? 'text' : 'password'} 
                placeholder="Enter Password" 
                required
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                className={`w-full pl-10 pr-10 py-3 rounded-lg text-sm focus:outline-none border ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-100 border-gray-200 text-gray-800'}`}
              />
              <button
                type="button"
                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition duration-200 mt-2 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'DAFTAR'}
            </button>
          </form>
        </div>


{/* --- PANEL GESER (SLIDING PANEL DENGAN BACKGROUND DINAMIS) --- */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full text-white flex flex-col items-center justify-center p-8 text-center z-30 transition-transform duration-700 ease-in-out shadow-lg bg-cover bg-center ${
            isSignUp ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ 
            backgroundImage: isSignUp 
              ? `url('https://ik.imagekit.io/j72i7hsy1/13.jpg?updatedAt=1785034895884')` 
              : `url('https://ik.imagekit.io/j72i7hsy1/d2c96ac30d42e9157e313fe4e2cee952%20(1).jpg')` 
          }}
        >
          {isSignUp ? (
            <div>
              <h2 className="text-3xl font-bold mb-3">Welcome To Hyper-S</h2>
              <p className="text-sm mb-6 text-red-100">Sudah punya akun? Silakan masuk ke akun Anda.</p>
              <button 
                onClick={() => setIsSignUp(false)}
                className="border-2 border-white px-8 py-2.5 rounded-full font-semibold hover:bg-white hover:text-red-600 transition duration-300"
              >
                LOGIN
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold mb-3">Hello World</h2>
              <p className="text-sm mb-6 text-red-100">Daftar sekarang dan nikmati akses dashboard lengkap.</p>
              <button 
                onClick={() => setIsSignUp(true)}
                className="border-2 border-white px-8 py-2.5 rounded-full font-semibold hover:bg-white hover:text-red-600 transition duration-300"
              >
                DAFTAR
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}