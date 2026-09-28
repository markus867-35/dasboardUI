'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('Silakan coba daftar');

  const handleSignUpClick = async () => {
    setStatusText('Memproses ke Supabase...');

    if (!supabaseUrl || !supabaseAnonKey) {
      setStatusText('ERROR: Kunci Supabase .env.local kosong!');
      return;
    }

    if (!name || !email || !password) {
      setStatusText('ERROR: Data belum lengkap!');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (error) {
        setStatusText(`GAGAL: ${error.message}`);
      } else {
        setStatusText('BERHASIL! Cek Supabase Authentication > Users');
        console.log("Data sukses:", data);
      }
    } catch (err: any) {
      setStatusText(`ERROR SYSTEM: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Kotak Status Informasi */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-black text-green-400 px-4 py-1 rounded text-xs font-mono">
          Status: {statusText}
        </div>

        {/* FORM SECTION */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center mt-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>

          {isSignUp && (
            <input 
              type="text" 
              placeholder="Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-xl mb-4 focus:outline-none border"
            />
          )}

          <input 
            type="email" 
            placeholder="Enter E-mail" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-xl mb-4 focus:outline-none border"
          />

          <input 
            type="password" 
            placeholder="Enter Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-xl mb-6 focus:outline-none border"
          />

          <button 
            type="button" 
            onClick={handleSignUpClick}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl transition shadow-md cursor-pointer"
          >
            {loading ? 'Processing...' : (isSignUp ? 'SIGN UP' : 'SIGN IN')}
          </button>
        </div>

        {/* SIDEBAR PANEL */}
        <div className="w-full md:w-1/2 bg-red-600 text-white p-10 flex flex-col justify-center items-center text-center">
          <h2 className="text-4xl font-bold mb-4">Hyper-S</h2>
          <p className="mb-6 text-red-100 text-sm">
            {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}
          </p>
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="border-2 border-white px-8 py-2.5 rounded-full font-semibold hover:bg-white hover:text-red-600 transition cursor-pointer"
          >
            {isSignUp ? 'SWITCH KE SIGN IN' : 'SWITCH KE SIGN UP'}
          </button>
        </div>

      </div>
    </div>
  );
}