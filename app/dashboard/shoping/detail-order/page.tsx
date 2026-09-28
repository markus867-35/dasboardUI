'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { FiArrowLeft, FiFileText, FiCheck } from 'react-icons/fi';

export default function OrderDetailsPage() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const orderedProducts = [
    {
      id: '1',
      name: 'Women Shoes',
      sku: '1',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=100&h=100&fit=crop',
      items: 1,
      amounts: 65.29,
    },
    {
      id: '2',
      name: 'Black Round Sunglasses',
      sku: '1',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&h=100&fit=crop',
      items: 1,
      amounts: 15.99,
    },
    {
      id: '3',
      name: 'Shoulder Bag',
      sku: '1',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop',
      items: 1,
      amounts: 65.29,
    },
    {
      id: '4',
      name: 'Vintage Perfume',
      sku: '1',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=100&h=100&fit=crop',
      items: 1,
      amounts: 45.29,
    },
  ];

  return (
    <div className={`max-w-10xl mx-auto p-6 my-8 rounded-2xl border shadow-xl transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      
      {/* Header Halaman & Tombol Kembali */}
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
        <h1 className="text-xl font-bold">Order Detials</h1>
      </div>

      {/* Progress Bar Status Pesanan */}
      <div className={`p-6 rounded-2xl border mb-8 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative flex items-center justify-between max-w-3xl mx-auto my-4">
          {/* Garis Progress */}
          <div className={`absolute left-0 right-0 h-1 top-1/2 -translate-y-1/2 z-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className="absolute left-0 w-1/3 h-1 top-1/2 -translate-y-1/2 bg-indigo-600 z-0" />

          {/* Step 1: Order Placed */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <FiCheck size={14} />
            </div>
            <span className="text-xs font-bold mt-2 text-indigo-400">Order Placed</span>
          </div>

          {/* Step 2: Packed */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-300 text-slate-500'
            }`}>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            </div>
            <span className={`text-xs font-semibold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Packed</span>
          </div>

          {/* Step 3: Shipped */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-300 text-slate-500'
            }`}>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            </div>
            <span className={`text-xs font-semibold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Shipped</span>
          </div>

          {/* Step 4: Delivered */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-300 text-slate-500'
            }`}>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            </div>
            <span className={`text-xs font-semibold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Delivered</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* BAGIAN KIRI: Daftar Produk & Info ID */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Info ID & Tombol Invoice */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">Order ID:</span>
                <span className="font-bold text-indigo-400">#DU00017</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="opacity-60">Order Date: October 03, 2023 at 6:31 pm</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Paid
                </span>
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md transition">
              <FiFileText size={14} /> Invoice
            </button>
          </div>

          {/* Tabel Produk Pesanan */}
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b opacity-60 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <th className="p-4 font-semibold">Products</th>
                  <th className="p-4 font-semibold">Items</th>
                  <th className="p-4 font-semibold text-right">Amounts</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {orderedProducts.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700/20 shrink-0" />
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-[10px] opacity-50 mt-0.5">SKU: {item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 opacity-80">{item.items}</td>
                    <td className="p-4 font-semibold text-right">${item.amounts.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* BAGIAN KANAN: Ringkasan & Detail Pembayaran */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Order Summary */}
          <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-sm font-bold border-b pb-3 border-slate-700/30">Order Summary</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="opacity-70">Sub Total :</span>
                <span className="font-semibold">$340.00</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Discount (DIS15%) :</span>
                <span className="font-semibold text-rose-500">-$51.00</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Shipping Charge :</span>
                <span className="font-semibold">$15.00</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Tax Vat 19% (included) :</span>
                <span className="font-semibold">$64.00</span>
              </div>
              <div className={`flex justify-between pt-3 border-t font-bold text-sm ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span>Total Amount</span>
                <span className="text-indigo-400">$368.00</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-sm font-bold border-b pb-3 border-slate-700/30">Payment Details</h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="opacity-70">Transactions:</span>
                <span className="font-mono font-bold text-indigo-400">#DU444TO10000</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Payment Method:</span>
                <span className="font-semibold">Credit Card</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Card Holder Name:</span>
                <span className="font-semibold">Harold Gonzalez</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Card Number:</span>
                <span className="font-mono">xxxx xxxx xxxx 6779</span>
              </div>
              <div className={`flex justify-between pt-2 border-t font-bold ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span>Total Amount:</span>
                <span>$368.00</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}