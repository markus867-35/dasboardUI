'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar } from 'react-icons/fi';

export default function AddOrderPage() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    productName: 'Women Shoes',
    quantity: '1',
    paymentStatus: 'Paid',
    orderStatus: 'In Progress',
    totalAmount: '120.00',
    orderDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Order Data Created:', formData);
    router.push('/dashboard/orders');
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 my-8 rounded-2xl border shadow-xl transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      
      {/* Header Halaman */}
      <div className={`flex items-center gap-3 mb-6 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <button 
          type="button"
          onClick={() => router.back()}
          className={`p-2 rounded-xl border transition ${
            isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Add New Order</h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Masukkan data pelanggan dan rincian pesanan baru ke dalam sistem.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Informasi Pelanggan */}
        <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider opacity-75">Customer Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Customer Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Harold Gonzalez"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <FiUser className="absolute left-3 top-3 opacity-50" size={14} />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="harold@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <FiMail className="absolute left-3 top-3 opacity-50" size={14} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Phone Number</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <FiPhone className="absolute left-3 top-3 opacity-50" size={14} />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Shipping Address</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="Alamat lengkap pengiriman"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <FiMapPin className="absolute left-3 top-3 opacity-50" size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Rincian Produk & Pembayaran */}
        <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider opacity-75">Order & Payment Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Product</label>
              <select 
                value={formData.productName}
                onChange={(e) => setFormData({...formData, productName: e.target.value})}
                className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <option value="Women Shoes">Women Shoes</option>
                <option value="Black Round Sunglasses">Black Round Sunglasses</option>
                <option value="Dimond Earning">Dimond Earning</option>
                <option value="Shoulder Bag">Shoulder Bag</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Quantity</label>
              <input 
                type="number" 
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Total Amount ($)</label>
              <input 
                type="text" 
                value={formData.totalAmount}
                onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Payment Status</label>
              <select 
                value={formData.paymentStatus}
                onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <option value="Paid">Paid</option>
                <option value="Refunded">Refunded</option>
                <option value="Cancel">Cancel</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Order Status</label>
              <select 
                value={formData.orderStatus}
                onChange={(e) => setFormData({...formData, orderStatus: e.target.value})}
                className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <option value="In Progress">In Progress</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Order Date</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Pilih Tanggal"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
                  className={`w-full pl-3 pr-9 py-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <FiCalendar className="absolute right-3 top-3 opacity-50" size={14} />
              </div>
            </div>
          </div>

        </div>

        {/* Tombol Aksi */}
        <div className={`flex justify-end gap-3 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={() => router.back()}
            className={`px-5 py-2.5 rounded-xl font-semibold border transition ${
              isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md transition"
          >
            Simpan Pesanan
          </button>
        </div>

      </form>
    </div>
  );
}