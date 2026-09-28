'use client';
import { useState } from 'react';

export default function AuthPage() {
  // State untuk melacak apakah posisi sedang "sign-up" atau "sign-in"
  // true = panel merah di kiri (tampilan Create Account di kanan)
  // false = panel merah di kanan (tampilan Sign In di kiri)
  const [isSignUp, setIsSignUp] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] p-4">
      {/* Container Utama Box */}
      <div className="relative w-[850px] h-[520px] bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        
        {/* --- FORM SIGN IN (Selalu di Kiri secara layout, diatur visibilitasnya) --- */}
        <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-8 transition-opacity duration-500 ease-in-out ${!isSignUp ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Sign In</h2>
          
          {/* Sosial Media Icons */}
          <div className="flex space-x-3 mb-4">
            {['G', 'f', 'GH', 'in'].map((icon, idx) => (
              <button key={idx} className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition">
                {icon}
              </button>
            ))}
          </div>
          
          <span className="text-xs text-gray-400 mb-4">Sign in With Email & Password</span>

          <input 
            type="email" 
            placeholder="Enter E-mail" 
            className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg mb-3 text-sm focus:outline-none"
          />
          <input 
            type="password" 
            placeholder="Enter Password" 
            className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg mb-2 text-sm focus:outline-none"
          />

          <div className="w-full text-right mb-4">
            <a href="#" className="text-xs text-gray-500 hover:underline">Forget Password?</a>
          </div>

          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition duration-200">
            SIGN IN
          </button>
        </div>


        {/* --- FORM SIGN UP (Selalu di Kanan secara layout, diatur visibilitasnya) --- */}
        <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-8 transition-opacity duration-500 ease-in-out ${isSignUp ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Create Account</h2>
          
          {/* Sosial Media Icons */}
          <div className="flex space-x-3 mb-4">
            {['G', 'f', 'GH', 'in'].map((icon, idx) => (
              <button key={idx} className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition">
                {icon}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-400 mb-4">Register with E-mail</span>

          <input 
            type="text" 
            placeholder="Name" 
            className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg mb-3 text-sm focus:outline-none"
          />
          <input 
            type="email" 
            placeholder="Enter E-mail" 
            className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg mb-3 text-sm focus:outline-none"
          />
          <input 
            type="password" 
            placeholder="Enter Password" 
            className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg mb-4 text-sm focus:outline-none"
          />

          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition duration-200">
            SIGN UP
          </button>
        </div>


        {/* --- PANEL GESER (SLIDING RED PANEL) --- */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full bg-red-600 text-white flex flex-col items-center justify-center p-8 text-center z-30 transition-transform duration-700 ease-in-out shadow-lg ${
            isSignUp ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {isSignUp ? (
            // Konten saat panel merah di KIRI (mengajak ke Sign In)
            <div>
              <h2 className="text-3xl font-bold mb-3">Welcome To Hyper-S</h2>
              <p className="text-sm mb-6 text-red-100">Sign in With Email & Password</p>
              <button 
                onClick={() => setIsSignUp(false)}
                className="border-2 border-white px-8 py-2.5 rounded-full font-semibold hover:bg-white hover:text-red-600 transition duration-300"
              >
                SIGN IN
              </button>
            </div>
          ) : (
            // Konten saat panel merah bergeser ke KANAN (mengajak ke Sign Up)
            <div>
              <h2 className="text-3xl font-bold mb-3">Hello World</h2>
              <p className="text-sm mb-6 text-red-100">Sign up now and enjoy our site</p>
              <button 
                onClick={() => setIsSignUp(true)}
                className="border-2 border-white px-8 py-2.5 rounded-full font-semibold hover:bg-white hover:text-red-600 transition duration-300"
              >
                SIGN UP
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}