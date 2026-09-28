'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { FiArrowLeft, FiChevronDown, FiStar, FiHeart, FiShoppingCart } from 'react-icons/fi';

export default function ProductDetailsPage() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  // State interaktif
  const [selectedImage, setSelectedImage] = useState(
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop'
  );
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [selectedSize, setSelectedSize] = useState('7');
  const [openSection, setOpenSection] = useState<'details' | 'specs' | 'shipping' | 'refund' | null>('details');

  const images = [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=200&h=200&fit=crop',
  ];

  const colors = [
    { name: 'indigo', hex: 'bg-indigo-600 border-white' },
    { name: 'emerald', hex: 'bg-emerald-600 border-white' },
    { name: 'rose', hex: 'bg-rose-600 border-white' },
    { name: 'cyan', hex: 'bg-cyan-500 border-white' },
    { name: 'amber', hex: 'bg-amber-500 border-white' },
    { name: 'white', hex: 'bg-white border-slate-400' },
  ];

  const sizes = ['6', '7', '8', '9', '10', '11'];

  const reviews = [
    {
      name: 'James Ennis',
      date: '28 Nov 2023',
      rating: 4.4,
      comment: "It's awesome , I never thought about Dash UI that awesome shoes.very pretty.",
    },
    {
      name: 'Bradley Mouton',
      date: '21 Apr 2023',
      rating: 5.0,
      comment: "Quality is more than good that I was expected for buying. I first time purchase Dash UI shoes & this brand is good. Thanks to Dash UI delivery was faster than fast ...Love Dash UI",
    },
    {
      name: 'Kieth J. Watson',
      date: '21 May 2023',
      rating: 4.4,
      comment: "Excellent shoes with original logo , Thanks Dash UI , Buy these shoes without any tension",
      hasImages: true,
    },
  ];

  return (
    <div className={`max-w-10xl mx-auto p-6 my-8 rounded-2xl border shadow-xl transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      
      {/* Header Halaman */}
      <div className={`flex items-center gap-3 mb-8 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <button 
          type="button"
          onClick={() => router.back()}
          className={`p-2 rounded-xl border transition ${
            isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Products Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* BAGIAN KIRI: Foto Utama & Thumbnail */}
        <div className="lg:col-span-6 space-y-4">
          <div className={`rounded-2xl border p-4 flex items-center justify-center h-[420px] overflow-hidden ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <img 
              src={selectedImage} 
              alt="Product Main" 
              className="w-full h-full object-cover rounded-xl shadow-md transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`rounded-xl border h-24 overflow-hidden cursor-pointer transition-all p-1 ${
                  selectedImage === img 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40' 
                    : isDark ? 'border-slate-800 bg-slate-900 opacity-60 hover:opacity-100' : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* BAGIAN KANAN: Detail, Warna, Ukuran, Harga & Aksi */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Product Title Name</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">
                4.4 <FiStar className="fill-emerald-500" size={12} />
              </span>
              <span className="opacity-65">592 Customer Reviews</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold text-indigo-400">$49.00</span>
              <span className="text-sm line-through opacity-50">$69.00</span>
              <span className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                (45% OFF)
              </span>
            </div>
            <p className="text-[11px] opacity-50">inclusive of all taxes</p>
          </div>

          {/* Pilihan Warna */}
          <div>
            <span className="text-xs font-semibold block mb-2">Color</span>
            <div className="flex items-center gap-3">
              {colors.map((col) => (
                <button
                  key={col.name}
                  onClick={() => setSelectedColor(col.name)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${col.hex} ${
                    selectedColor === col.name ? 'scale-125 ring-2 ring-indigo-500/50' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Pilihan Ukuran */}
          <div>
            <span className="text-xs font-semibold block mb-2">Select Size</span>
            <div className="flex items-center gap-2 flex-wrap">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`w-10 h-10 rounded-xl border text-xs font-semibold transition ${
                    selectedSize === sz
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800' : 'border-slate-300 bg-white hover:bg-slate-100'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-4 pt-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg transition">
              <FiShoppingCart size={16} /> Add To Cart
            </button>
            <button className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-semibold transition ${
              isDark ? 'border-slate-700 bg-slate-900 hover:bg-slate-800' : 'border-slate-300 bg-white hover:bg-slate-100'
            }`}>
              <FiHeart size={16} /> Wishlist
            </button>
          </div>

          {/* Accordion / Dropdown Info Produk */}
          <div className="space-y-3 pt-4 border-t border-slate-700/30 text-xs">
            
            {/* Product Details */}
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
              <button 
                onClick={() => setOpenSection(openSection === 'details' ? null : 'details')}
                className="w-full flex items-center justify-between p-4 font-bold text-left"
              >
                <span>Product Details</span>
                <FiChevronDown className={`transition-transform ${openSection === 'details' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'details' && (
                <div className="px-4 pb-4 space-y-3 opacity-80 leading-relaxed">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean nisi magna, rhoncus in diam vel, aliquet volutpat nisl. Proin nisl dolor, sagittis vitae pulvinar eu, pharetra ultrices felis.</p>
                  <p className="font-semibold">Features:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                    <li>Integer ut justo quis diam finibus lobortis vel at dui.</li>
                    <li>Morbi ultricies leo sit amet nisl suscipit, et vulputate orci fringilla.</li>
                    <li>Nullam sit amet lacus ut nibh pharetra rutrum venenatis ac purus.</li>
                    <li>Sed ut arcu dapibus, viverra ex vitae, fermentum libero.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
              <button 
                onClick={() => setOpenSection(openSection === 'specs' ? null : 'specs')}
                className="w-full flex items-center justify-between p-4 font-bold text-left"
              >
                <span>Specifications</span>
                <FiChevronDown className={`transition-transform ${openSection === 'specs' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'specs' && (
                <div className="px-4 pb-4 opacity-80">
                  <p>Informasi spesifikasi lengkap produk tercantum di sini dengan detail material dan dimensi.</p>
                </div>
              )}
            </div>

            {/* Free Shipping Policy */}
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
              <button 
                onClick={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
                className="w-full flex items-center justify-between p-4 font-bold text-left"
              >
                <span>Free Shipping Policy</span>
                <FiChevronDown className={`transition-transform ${openSection === 'shipping' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'shipping' && (
                <div className="px-4 pb-4 opacity-80">
                  <p>Nikmati layanan bebas ongkir untuk pengiriman ke seluruh wilayah dengan minimum pembelian tertentu.</p>
                </div>
              )}
            </div>

            {/* Refund Policy */}
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
              <button 
                onClick={() => setOpenSection(openSection === 'refund' ? null : 'refund')}
                className="w-full flex items-center justify-between p-4 font-bold text-left"
              >
                <span>Refund Policy</span>
                <FiChevronDown className={`transition-transform ${openSection === 'refund' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'refund' && (
                <div className="px-4 pb-4 opacity-80">
                  <p>Garansi pengembalian dana dalam waktu 14 hari jika produk tidak sesuai atau mengalami kerusakan.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* BAGIAN BAWAH: Ratings & Reviews */}
      <div className="mt-12 pt-8 border-t border-slate-700/30">
        <h3 className="text-lg font-bold mb-6">Ratings & Reviews</h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-8">
          
          {/* Skor Total */}
          <div className="md:col-span-4 space-y-2">
            <div className="text-5xl font-extrabold">4.5</div>
            <div className="flex text-emerald-500 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar key={i} className="fill-emerald-500" size={16} />
              ))}
            </div>
            <p className="text-xs opacity-60">595 Verified Buyers</p>
          </div>

          {/* Bar Chart Rating */}
          <div className="md:col-span-8 space-y-2 text-xs">
            {[
              { star: 5, count: 420, width: '85%', color: 'bg-emerald-500' },
              { star: 4, count: 90, width: '45%', color: 'bg-emerald-500' },
              { star: 3, count: 33, width: '25%', color: 'bg-emerald-500' },
              { star: 2, count: 12, width: '15%', color: 'bg-amber-500' },
              { star: 1, count: 40, width: '30%', color: 'bg-rose-500' },
            ].map((item) => (
              <div key={item.star} className="flex items-center gap-3">
                <span className="w-6 font-semibold">{item.star}★</span>
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
                </div>
                <span className="w-8 opacity-60 text-right">{item.count}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Daftar Komentar Pembeli */}
        <div className="space-y-6 pt-4 border-t border-slate-700/20">
          {reviews.map((rev, index) => (
            <div key={index} className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">
                  {rev.rating} <FiStar className="fill-emerald-500" size={10} />
                </span>
                <span className="opacity-50">{rev.date}</span>
              </div>
              <p className="text-xs opacity-95 leading-relaxed">{rev.comment}</p>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold opacity-75">{rev.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button className="text-xs font-bold text-indigo-400 hover:underline">
            View all 89 reviews
          </button>
        </div>

      </div>

    </div>
  );
}