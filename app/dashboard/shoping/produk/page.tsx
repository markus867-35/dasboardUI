'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2, FiSettings, FiUpload, FiDownload 
} from 'react-icons/fi';

interface ProductItem {
  id: string;
  name: string;
  image: string;
  rating: number;
  category: string;
  addedDate: string;
  price: number;
  quantity: number;
  status: 'Active' | 'Deactive';
}

export default function ProductsPage() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState(10);

  // Data contoh produk sesuai dengan tampilan gambar
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: '1',
      name: 'Women Shoes',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=100&h=100&fit=crop',
      rating: 5,
      category: 'Accessories',
      addedDate: '19 July, 2023',
      price: 65.29,
      quantity: 235,
      status: 'Active',
    },
    {
      id: '2',
      name: 'Black Round Sunglasses',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&h=100&fit=crop',
      rating: 5,
      category: 'Bags',
      addedDate: '19 July, 2023',
      price: 15.99,
      quantity: 56,
      status: 'Active',
    },
    {
      id: '3',
      name: 'Black Round Sunglasses',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop',
      rating: 5,
      category: "Men's Fashion",
      addedDate: '19 July, 2023',
      price: 12.39,
      quantity: 67,
      status: 'Deactive',
    },
    {
      id: '4',
      name: 'Dimond Earning',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop',
      rating: 5,
      category: "Women's Fashion",
      addedDate: '18 July, 2023',
      price: 35.99,
      quantity: 24,
      status: 'Active',
    },
    {
      id: '5',
      name: 'Shoulder Bag',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop',
      rating: 5,
      category: 'Accessories',
      addedDate: '17 July, 2023',
      price: 65.29,
      quantity: 32,
      status: 'Active',
    },
    {
      id: '6',
      name: 'Vinage Perfume',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=100&h=100&fit=crop',
      rating: 5,
      category: 'Bags',
      addedDate: '20 July, 2023',
      price: 45.29,
      quantity: 45,
      status: 'Active',
    },
    {
      id: '7',
      name: 'Apple airpods',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100&h=100&fit=crop',
      rating: 5,
      category: "Men's Fashion",
      addedDate: '20 July, 2023',
      price: 65.29,
      quantity: 45,
      status: 'Deactive',
    },
  ]);

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      
      {/* Header Halaman & Tombol Aksi Atas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl font-bold">Products</h1>
        
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/dashboard/shoping/produk/add-product"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 shadow-md transition"
          >
            <FiPlus size={16} /> Add Product
          </Link>
          <button className={`p-2.5 rounded-xl border transition ${isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-300 hover:bg-slate-100'}`}>
            <FiSettings size={16} />
          </button>
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-300 hover:bg-slate-100'}`}>
            <FiUpload size={14} /> Import
          </button>
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-300 hover:bg-slate-100'}`}>
            <FiDownload size={14} /> Export
          </button>
        </div>
      </div>

      {/* Baris Kontrol: Show Entries & Search */}
      <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-b text-xs ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select 
            value={entries}
            onChange={(e) => setEntries(Number(e.target.value))}
            className={`px-3 py-1.5 rounded-lg border focus:outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span>Search:</span>
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-2.5 opacity-50" size={14} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-sky-500 ${
                isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300'
              }`}
              placeholder="Cari produk..."
            />
          </div>
        </div>
      </div>

      {/* Tabel Produk */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className={`border-b opacity-60 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <th className="pb-3 font-semibold w-10 text-center">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="pb-3 font-semibold">Product</th>
              <th className="pb-3 font-semibold">Category</th>
              <th className="pb-3 font-semibold">Added Date</th>
              <th className="pb-3 font-semibold">Price</th>
              <th className="pb-3 font-semibold">Quantity</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
            {filteredProducts.slice(0, entries).map((item) => (
              <tr key={item.id} className={`transition ${isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-100/60'}`}>
                <td className="py-3 text-center">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700/20 shadow-sm shrink-0" 
                    />
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
                <td className="py-3 opacity-80">{item.category}</td>
                <td className="py-3 opacity-80">{item.addedDate}</td>
                <td className="py-3 font-semibold">${item.price.toFixed(2)}</td>
                <td className="py-3 opacity-80">{item.quantity}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    item.status === 'Active' 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button className="p-1.5 rounded-lg border border-transparent hover:border-slate-700 opacity-60 hover:opacity-100 transition" title="View">
                      <FiEye size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg border border-transparent hover:border-slate-700 opacity-60 hover:opacity-100 transition" title="Edit">
                      <FiEdit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg border border-transparent hover:border-red-500/40 text-rose-500 opacity-80 hover:opacity-100 transition" 
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}