'use client';
import { useState, useRef } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { FiSave, FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function FormSparepartPage() {
  const { mode } = useTheme();
  const router = useRouter();

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState(`PART-${Math.floor(1000 + Math.random() * 9000)}`);
  const [category, setCategory] = useState('Kampas Rem & Piringan');
  const [brand, setBrand] = useState('Honda Genuine');
  const [stock, setStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>(3);
  const [buyPrice, setBuyPrice] = useState<number | ''>('');
  const [sellPrice, setSellPrice] = useState<number | ''>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // Field Tambahan Spesifikasi & Deskripsi Sparepart
  const [position, setPosition] = useState('Sistem Rem');
  const [material, setMaterial] = useState('Kampas Karbon');
  const [SparepartType, setSparepartType] = useState('Original');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [sni, setSni] = useState('8821.5540/SNI/IX/2025');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const SparepartBrands = ['Honda Genuine', 'Yamaha Genuine', 'NISSIN', 'KTC Kytaco', 'RCB', 'SSW', 'Daytona', 'TDR'];
  const SparepartSubCategories = [
    'Kampas Rem & Piringan', 
    'Rantai & Sprocket', 
    'Filter Udara & Oli', 
    'Busi & Kelistrikan'
  ];

  // Fungsi upload file gambar ke Supabase Storage (folder 'products/Sparepart')
  const uploadImageFile = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `Sparepart/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      if (data?.publicUrl) {
        setImageUrls(prev => [...prev, data.publicUrl]);
      }
    } catch (error: any) {
      console.error('Gagal mengunggah gambar:', error);
      alert(`Gagal upload gambar: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadImageFile(e.target.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          uploadImageFile(file);
          e.preventDefault();
        }
        break;
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const priceValue = Number(sellPrice);

    // Menyimpan data Sparepart ke tabel online_shop_stock dengan kompatibilitas kolom
    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      category: `Sparepart - ${category}`, // Memastikan kategori terdeteksi di halaman utama Sparepart
      brand,
      stock: Number(stock),
      min_stock: Number(minStock),
      buy_price: Number(buyPrice),
      sell_price: priceValue,
      price: priceValue, 
      image_url: imageUrls, 
      position,        // Menyimpan bagian/posisi Sparepart
      diameter: material,  // Memetakan material ke kolom diameter
      tire_type: SparepartType, // Memetakan jenis tipe Sparepart ke kolom tire_type
      description: description.trim(),
      features: features.trim(),
      sni: sni.trim()
    };

    try {
      const { data, error } = await supabase
        .from('online_shop_stock')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      
      alert('Data Sparepart berhasil disimpan!');
      
      if (data && data.id) {
        router.push(`/dashboard/otomotif/Sparepart/detail/${data.id}`);
      } else {
        router.push('/dashboard/otomotif/Sparepart');
      }

    } catch (err: any) {
      console.error('Gagal menyimpan:', err);
      alert(`Terjadi kesalahan: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6" onPaste={handlePaste}>
      
      <div className="flex items-center justify-between">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-500/20 hover:bg-slate-500/10 transition"
        >
          <FiArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-lg font-bold">Form Input Data Sparepart Baru</h1>
      </div>

      <div className={`p-8 rounded-2xl border ${getCardStyle()}`}>
        <form onSubmit={handleSave} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold opacity-70 mb-1">Nama / Spesifikasi Sparepart *</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Contoh: Kampas Rem Depan NISSIN Samurai Brake Master" 
              className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              required 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Kode SKU</label>
              <input 
                type="text" 
                value={sku} 
                onChange={(e) => setSku(e.target.value)} 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Merek Sparepart</label>
              <select 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              >
                {SparepartBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Jenis Kategori Sparepart</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              >
                {SparepartSubCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Stok Fisik *</label>
              <input 
                type="number" 
                value={stock} 
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} 
                placeholder="20" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Harga Modal (Rp) *</label>
              <input 
                type="number" 
                value={buyPrice} 
                onChange={(e) => setBuyPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                placeholder="50000" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Harga Jual (Rp) *</label>
              <input 
                type="number" 
                value={sellPrice} 
                onChange={(e) => setSellPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                placeholder="75000" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
                required 
              />
            </div>
          </div>

          {/* Spesifikasi Tambahan Sparepart (Bagian, Material, SNI) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Bagian / Posisi</label>
              <input 
                type="text" 
                value={position} 
                onChange={(e) => setPosition(e.target.value)} 
                placeholder="Sistem Rem" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Material</label>
              <input 
                type="text" 
                value={material} 
                onChange={(e) => setMaterial(e.target.value)} 
                placeholder="Kampas Karbon" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Nomor SNI</label>
              <input 
                type="text" 
                value={sni} 
                onChange={(e) => setSni(e.target.value)} 
                placeholder="8821.5540/SNI/IX/2025" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              />
            </div>
          </div>

          {/* Deskripsi Produk */}
          <div>
            <label className="block text-xs font-semibold opacity-70 mb-1">Deskripsi Produk</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              placeholder="Tulis deskripsi kualitas Sparepart, presisi pemasangan, daya tahan, dll..." 
              className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none resize-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
            />
          </div>

          {/* Fitur Produk */}
          <div>
            <label className="block text-xs font-semibold opacity-70 mb-1">Fitur / Keunggulan</label>
            <textarea 
              value={features} 
              onChange={(e) => setFeatures(e.target.value)} 
              rows={2}
              placeholder="Contoh: - Daya cengkram kuat dan tahan panas&#10;- Tidak merusak piringan cakram" 
              className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none resize-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
            />
          </div>

          {/* Galeri Foto Sparepart (Multi-Upload & Paste Support) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold opacity-70">
              Galeri Foto Sparepart (Bisa upload banyak foto atau Paste dengan Ctrl+V)
            </label>
            
            <div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <FiUpload size={14} /> {uploading ? 'Mengunggah...' : '+ Tambah Foto Galeri'}
              </button>
            </div>

            {/* Preview Grid Foto */}
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl border overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center group">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain" />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                      title="Hapus Foto Ini"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-500/20">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="px-5 py-2.5 bg-slate-500/20 rounded-xl text-xs font-medium hover:bg-slate-500/30 transition"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading || uploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              <FiSave size={16} /> {loading ? 'Menyimpan...' : 'Simpan Sparepart Baru'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}