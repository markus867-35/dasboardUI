'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiArrowLeft, FiBold, FiItalic, FiUnderline, 
  FiList, FiLink, FiImage, FiCode, FiVideo, FiCalendar 
} from 'react-icons/fi';

export default function AddProductPage() {
  const router = useRouter();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    productCode: '',
    productSku: '',
    gender: 'Male',
    category: 'Shoe',
    tags: '',
    status: 'Published',
    schedule: '',
    regularPrice: '',
    salePrice: '',
    inStock: true,
    priceIncludesTax: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Product Data:', formData);
    router.push('/dashboard/shoping/produk');
  };

  return (
    <div className={`max-w-10xl mx-auto p-6 my-8 rounded-2xl border shadow-xl transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      
      {/* Header Halaman */}
      <div className={`flex items-center justify-between mb-6 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.back()}
            className={`p-2 rounded-xl border transition ${
              isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Add Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <label className="text-xs font-semibold block mb-2">Product Title</label>
              <input 
                type="text" 
                required
                placeholder="Enter Product Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-sky-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <label className="text-xs font-semibold block mb-2">Product Description</label>
              <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}>
                <div className={`flex items-center gap-3 px-3 py-2 border-b text-xs flex-wrap ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-600'}`}>
                  <span className="cursor-pointer hover:opacity-100 opacity-70">Normal ▾</span>
                  <span className="cursor-pointer hover:opacity-100 opacity-70">Sans Serif ▾</span>
                  <div className="h-4 w-[1px] bg-slate-600/30" />
                  <FiBold className="cursor-pointer hover:text-sky-500" size={14} />
                  <FiItalic className="cursor-pointer hover:text-sky-500" size={14} />
                  <FiUnderline className="cursor-pointer hover:text-sky-500" size={14} />
                  <div className="h-4 w-[1px] bg-slate-600/30" />
                  <FiList className="cursor-pointer hover:text-sky-500" size={14} />
                  <FiLink className="cursor-pointer hover:text-sky-500" size={14} />
                  <FiImage className="cursor-pointer hover:text-sky-500" size={14} />
                  <FiCode className="cursor-pointer hover:text-sky-500" size={14} />
                  <FiVideo className="cursor-pointer hover:text-sky-500" size={14} />
                </div>
                <textarea 
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full p-4 text-xs focus:outline-none resize-none ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-900'}`}
                  placeholder="Tulis deskripsi produk..."
                />
              </div>
            </div>

            <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-xs font-bold uppercase tracking-wider opacity-70">Product Gallery</h2>
              
              <div>
                <label className="text-xs font-semibold block mb-1">Product Image</label>
                <p className="text-[10px] opacity-50 mb-2">Add Product main Image.</p>
                <div className={`flex items-center border rounded-xl overflow-hidden ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}>
                  <label className="px-4 py-2 bg-slate-700 text-white text-xs cursor-pointer hover:bg-slate-600 transition">
                    Choose File
                    <input type="file" className="hidden" />
                  </label>
                  <span className="px-4 text-xs opacity-50">No file chosen</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Product Gallery</label>
                <p className="text-[10px] opacity-50 mb-2">Add Product Gallery Images.</p>
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                  isDark ? 'border-slate-700 hover:border-slate-500 bg-slate-800/40' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }`}>
                  <p className="text-xs opacity-60">Drop files here to upload</p>
                </div>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN */}
          <div className="space-y-6">
            
            <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">In Stock</span>
                <input 
                  type="checkbox" 
                  checked={formData.inStock}
                  onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                  className="toggle accent-sky-600 w-5 h-5 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Product Code</label>
                <input 
                  type="text" 
                  placeholder="Enter Product Code"
                  value={formData.productCode}
                  onChange={(e) => setFormData({...formData, productCode: e.target.value})}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Product SKU</label>
                <input 
                  type="text" 
                  placeholder="Enter Product SKU"
                  value={formData.productSku}
                  onChange={(e) => setFormData({...formData, productSku: e.target.value})}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Gender</label>
                <div className="flex items-center gap-4 pt-1 text-xs">
                  {['Male', 'Female', 'Kids'].map((g) => (
                    <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="gender" 
                        checked={formData.gender === g}
                        onChange={() => setFormData({...formData, gender: g})}
                        className="accent-sky-600"
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold">Category</label>
                  <span className="text-[10px] text-sky-500 cursor-pointer font-semibold hover:underline">Add New</span>
                </div>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <option value="Shoe">Shoe</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Bags">Bags</option>
                  <option value="Men's Fashion">Men's Fashion</option>
                  <option value="Women's Fashion">Women's Fashion</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Tags</label>
                <input 
                  type="text" 
                  placeholder="Enter Tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

            </div>

            <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <label className="text-xs font-semibold block mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Schedule</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Select Date"
                    value={formData.schedule}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                  <FiCalendar className="absolute right-3 top-2.5 opacity-50" size={14} />
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <label className="text-xs font-semibold block mb-1">Regular Price</label>
                <input 
                  type="text" 
                  placeholder="$ 49.00"
                  value={formData.regularPrice}
                  onChange={(e) => setFormData({...formData, regularPrice: e.target.value})}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Sale Price</label>
                <input 
                  type="text" 
                  placeholder="$ 49.00"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold">Price includes taxes</span>
                <input 
                  type="checkbox" 
                  checked={formData.priceIncludesTax}
                  onChange={(e) => setFormData({...formData, priceIncludesTax: e.target.checked})}
                  className="toggle accent-sky-600 w-5 h-5 cursor-pointer"
                />
              </div>
            </div>

          </div>

        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="w-full lg:w-auto px-8 py-3 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 shadow-lg transition"
          >
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
}