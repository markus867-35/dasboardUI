'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';
import { FiTrash2, FiStar } from 'react-icons/fi';

interface CartItem {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: number;
  quantity: number;
}

export default function ShoppingCartPage() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Women Shoes',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=100&h=100&fit=crop',
      rating: 5,
      price: 65.29,
      quantity: 1,
    },
    {
      id: '2',
      name: 'Black Round Sunglasses',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&h=100&fit=crop',
      rating: 5,
      price: 15.99,
      quantity: 1,
    },
    {
      id: '3',
      name: 'Shoulder Bag',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop',
      rating: 5,
      price: 65.29,
      quantity: 6,
    },
    {
      id: '4',
      name: 'Vinage Perfume',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=100&h=100&fit=crop',
      rating: 5,
      price: 45.29,
      quantity: 2,
    },
    {
      id: '5',
      name: 'Apple airpods',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100&h=100&fit=crop',
      rating: 5,
      price: 65.29,
      quantity: 1,
    },
  ]);

  const [coupon, setCoupon] = useState('');

  const handleQuantityChange = (id: string, delta: number) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <div className={`max-w-10xl mx-auto p-6 my-8 rounded-2xl border shadow-xl transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      
      {/* Header Halaman */}
      <div className={`mb-6 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <h1 className="text-xl font-bold">Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* BAGIAN KIRI: Daftar Keranjang Belanja */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="p-4 border-b border-slate-700/20 font-bold text-xs opacity-75">
              My Cart
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b opacity-60 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <th className="p-4 font-semibold">Products</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Quantity</th>
                  <th className="p-4 font-semibold">Amounts</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {cartItems.map((item) => {
                  const totalAmount = item.price * item.quantity;
                  return (
                    <tr key={item.id} className={`transition ${isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-100/60'}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700/20 shrink-0" />
                          <div>
                            <p className="font-bold">{item.name}</p>
                            <div className="flex text-amber-400 text-[10px] mt-0.5">
                              {Array.from({ length: item.rating }).map((_, i) => (
                                <span key={i}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">${item.price.toFixed(2)}</td>
                      <td className="p-4">
                        <div className={`inline-flex items-center border rounded-xl overflow-hidden ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}>
                          <button 
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="px-2.5 py-1 hover:bg-slate-700/50 transition"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="px-2.5 py-1 hover:bg-slate-700/50 transition"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-indigo-400">${totalAmount.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 rounded-lg opacity-60 hover:opacity-100 hover:text-rose-500 transition"
                          title="Hapus"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {cartItems.length === 0 && (
              <div className="p-12 text-center opacity-50 text-xs">
                Keranjang belanja Anda kosong.
              </div>
            )}
          </div>

          {/* Tombol Navigasi Bawah */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
            <Link
              href="/dashboard/shoping/produk"
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition ${
                isDark ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-indigo-400' : 'border-slate-300 bg-white hover:bg-slate-100 text-indigo-600'
              }`}
            >
              Continue Shopping
            </Link>
            <button className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md transition">
              Checkout
            </button>
          </div>

        </div>

        {/* BAGIAN KANAN: Kupon & Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Kotak Kupon */}
          <div className={`p-5 rounded-2xl border flex items-center gap-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
            <input 
              type="text"
              placeholder="Coupon Code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
              }`}
            />
            <button className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-200 shadow transition shrink-0">
              Apply
            </button>
          </div>

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
                <span className="font-semibold text-emerald-500">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Tax Vat 19% (included) :</span>
                <span className="font-semibold">$64.00</span>
              </div>
              <div className={`flex justify-between pt-3 border-t font-bold text-sm ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span>Order Total</span>
                <span className="text-indigo-400">$368.00</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}