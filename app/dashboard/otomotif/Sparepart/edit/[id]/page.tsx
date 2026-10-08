'use client';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { FiSave, FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

export default function FormEditSparepartPage() {
  const { mode } = useTheme();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Kampas Rem & Piringan');
  const [brand, setBrand] = useState('Honda Genuine');
  const [stock, setStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>(3);
  const [buyPrice, setBuyPrice] = useState<number | ''>('');
  const [sellPrice, setSellPrice] = useState<number | ''>('');
  const [discountPrice, setDiscountPrice] = useState<number | ''>(''); // State Harga Diskon
  
  // Field Tambahan Spesifikasi & Deskripsi Sparepart
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState('Sistem Rem'); // Disimpan di kolom position
  const [material, setMaterial] = useState('Kampas Karbon'); // Disimpan di kolom diameter
  const [SparepartType, setSparepartType] = useState('Original'); // Disimpan di kolom tire_type
  const [sni, setSni] = useState('');

  // Multi-Foto Array
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const SparepartBrands = ['Honda Genuine', 'Yamaha Genuine', 'NISSIN', 'KTC Kytaco', 'RCB', 'SSW', 'Daytona', 'TDR'];
  const SparepartSubCategories = [
    'Kampas Rem & Piringan', 
    'Rantai & Sprocket', 
    'Filter Udara & Oli', 
    'Busi & Kelistrikan'
  ];

  // Ambil data Sparepart berdasarkan ID saat halaman dimuat
  useEffect(() => {
    if (id) {
      fetchSparepartDetail();
    }
  }, [id]);

  const fetchSparepartDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('online_shop_stock')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setName(data.name || '');
        setSku(data.sku || '');
        
        // Membersihkan awalan kategori jika tersimpan dengan format "Sparepart - Kategori"
        const cleanCat = data.category ? data.category.replace('Sparepart - ', '') : 'Kampas Rem & Piringan';
        setCategory(cleanCat);

        setBrand(data.brand || 'Honda Genuine');
        setStock(data.stock ?? '');
        setMinStock(data.min_stock ?? 3);
        setBuyPrice(data.buy_price ?? '');
        setSellPrice(data.sell_price ?? '');
        
        // Mengisi data spesifikasi & deskripsi Sparepart
        setDescription(data.description || '');
        setPosition(data.position || 'Sistem Rem');
        setMaterial(data.diameter || 'Kampas Karbon');
        setSparepartType(data.tire_type || 'Original');
        setDiscountPrice(data.discount_price ?? ''); // Memuat data harga diskon dari database
        setSni(data.sni || '');

        // Normalisasi data gambar
        if (Array.isArray(data.image_url)) {
          setImageUrls(data.image_url.filter(Boolean));
        } else if (typeof data.image_url === 'string' && data.image_url.trim() !== '') {
          setImageUrls([data.image_url]);
        } else {
          setImageUrls([]);
        }
      }
    } catch (err: any) {
      console.error('Gagal mengambil data Sparepart:', err);
      alert('Data Sparepart tidak ditemukan.');
      router.push('/dashboard/otomotif/Sparepart');
    } finally {
      setLoading(false);
    }
  };

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

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const priceValue = Number(sellPrice);

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      category: `Sparepart - ${category}`,
      brand,
      stock: Number(stock),
      min_stock: Number(minStock),
      buy_price: Number(buyPrice),
      sell_price: priceValue,
      price: priceValue, // Menjaga kompatibilitas kolom harga
      discount_price: discountPrice === '' ? 0 : Number(discountPrice), // <-- TAMBAHKAN BARIS INI
      description: description.trim(),
      position: position.trim(),
      diameter: material.trim(),     // Menyimpan material ke kolom diameter
      tire_type: SparepartType.trim(), // Menyimpan jenis tipe ke kolom tire_type
      sni: sni.trim(),
      image_url: imageUrls
    };

    try {
      const { error } = await supabase
        .from('online_shop_stock')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      
      alert('Data Sparepart berhasil diperbarui!');
      router.push(`/dashboard/otomotif/Sparepart/detail/${id}`);
    } catch (err: any) {
      console.error('Gagal memperbarui:', err);
      alert(`Terjadi kesalahan: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs opacity-60">Memuat data Sparepart untuk diedit...</div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6" onPaste={handlePaste}>
      
      {/* Tombol Kembali & Header */}
      <div className="flex items-center justify-between">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-500/20 hover:bg-slate-500/10 transition"
        >
          <FiArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-lg font-bold">Form Edit Data Sparepart & Spesifikasi</h1>
      </div>

      {/* Konten Halaman Form Edit Sparepart */}
      <div className={`p-8 rounded-2xl border ${getCardStyle()}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          
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

                    {/* Kolom Harga Diskon (Opsional) */}
          <div>
            <label className="block text-xs font-semibold opacity-70 mb-1">Harga Diskon (Opsional)</label>
            <input 
              type="number" 
              value={discountPrice} 
              onChange={(e) => setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))} 
              placeholder="Kosongkan jika tidak ada diskon (Badge diskon tidak akan muncul)" 
              className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
            />
          </div>

          {/* Kolom Spesifikasi Tambahan Sparepart (Bagian, Material, SNI) */}
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

          {/* Kolom Input Deskripsi Produk */}
          <div>
            <label className="block text-xs font-semibold opacity-70 mb-1">Deskripsi Produk</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              placeholder="Tulis deskripsi kualitas Sparepart..." 
              className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none resize-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
            />
          </div>

          {/* Bagian Multi-Foto Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold opacity-70">Galeri Foto Sparepart (Tambah/Hapus foto)</label>
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
              disabled={saving || uploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              <FiSave size={16} /> {saving ? 'Menyimpan...' : 'Perbarui Data Sparepart'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}