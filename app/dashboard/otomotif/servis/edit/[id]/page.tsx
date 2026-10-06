'use client';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { FiSave, FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

export default function FormEditServisPage() {
  const { mode } = useTheme();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Servis Ringan / Tune Up');
  const [brand, setBrand] = useState('Honda AHASS');
  const [stock, setStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>(5);
  const [buyPrice, setBuyPrice] = useState<number | ''>('');
  const [sellPrice, setSellPrice] = useState<number | ''>('');
  
  // Field Tambahan Spesifikasi & Deskripsi Servis
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState('Mesin & Tune Up'); // Disimpan di kolom position
  const [material, setMaterial] = useState('Standar'); // Disimpan di kolom diameter (tingkat kerumitan)
  const [serviceType, setServiceType] = useState('Paket Berkala'); // Disimpan di kolom tire_type (jenis layanan)
  const [sni, setSni] = useState('');

  // Multi-Foto Array
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceBrands = ['Honda AHASS', 'Yamaha Riders', 'Global Service', 'Pro Tuner', 'Express Pit'];
  const serviceSubCategories = [
    'Servis Ringan / Tune Up', 
    'Servis Berat / Turun Mesin', 
    'Servis CVT & Transmisi', 
    'Kelistrikan & Injeksi'
  ];

  // Ambil data servis berdasarkan ID saat halaman dimuat
  useEffect(() => {
    if (id) {
      fetchServiceDetail();
    }
  }, [id]);

  const fetchServiceDetail = async () => {
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
        
        // Membersihkan awalan kategori jika tersimpan dengan format "Servis - Kategori"
        const cleanCat = data.category ? data.category.replace('Servis - ', '') : 'Servis Ringan / Tune Up';
        setCategory(cleanCat);

        setBrand(data.brand || 'Honda AHASS');
        setStock(data.stock ?? '');
        setMinStock(data.min_stock ?? 5);
        setBuyPrice(data.buy_price ?? '');
        setSellPrice(data.sell_price ?? '');
        
        // Mengisi data spesifikasi & deskripsi servis
        setDescription(data.description || '');
        setPosition(data.position || 'Mesin & Tune Up');
        setMaterial(data.diameter || 'Standar');
        setServiceType(data.tire_type || 'Paket Berkala');
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
      console.error('Gagal mengambil data servis:', err);
      alert('Data paket servis tidak ditemukan.');
      router.push('/dashboard/otomotif/servis');
    } finally {
      setLoading(false);
    }
  };

  const uploadImageFile = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `servis/${fileName}`;

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
      category: `Servis - ${category}`,
      brand,
      stock: Number(stock),
      min_stock: Number(minStock),
      buy_price: Number(buyPrice),
      sell_price: priceValue,
      price: priceValue, // Menjaga kompatibilitas kolom harga
      description: description.trim(),
      position: position.trim(),
      diameter: material.trim(),     // Menyimpan tingkat kerumitan ke kolom diameter
      tire_type: serviceType.trim(), // Menyimpan jenis layanan ke kolom tire_type
      sni: sni.trim(),
      image_url: imageUrls
    };

    try {
      const { error } = await supabase
        .from('online_shop_stock')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      
      alert('Data paket servis berhasil diperbarui!');
      router.push(`/dashboard/otomotif/servis/detail/${id}`);
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
      <div className="p-12 text-center text-xs opacity-60">Memuat data servis untuk diedit...</div>
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
        <h1 className="text-lg font-bold">Form Edit Data Servis & Spesifikasi</h1>
      </div>

      {/* Konten Halaman Form Edit Servis */}
      <div className={`p-8 rounded-2xl border ${getCardStyle()}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold opacity-70 mb-1">Nama / Paket Servis Motor *</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Contoh: Paket Tune Up & Pembersihan Injektor Lengkap" 
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
              <label className="block text-xs font-semibold opacity-70 mb-1">Bengkel / Provider</label>
              <select 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              >
                {serviceBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Jenis Kategori Servis</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              >
                {serviceSubCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Kapasitas Slot / Hari *</label>
              <input 
                type="number" 
                value={stock} 
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} 
                placeholder="50" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Estimasi Biaya Pokok (Rp) *</label>
              <input 
                type="number" 
                value={buyPrice} 
                onChange={(e) => setBuyPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                placeholder="35000" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Tarif Jasa Servis (Rp) *</label>
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

          {/* Kolom Spesifikasi Tambahan Servis (Bagian, Kerumitan, Sertifikasi) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Bagian Pengerjaan</label>
              <input 
                type="text" 
                value={position} 
                onChange={(e) => setPosition(e.target.value)} 
                placeholder="Mesin & Tune Up" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Tingkat Kerumitan</label>
              <input 
                type="text" 
                value={material} 
                onChange={(e) => setMaterial(e.target.value)} 
                placeholder="Standar / Medium" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Nomor Sertifikasi / Standar</label>
              <input 
                type="text" 
                value={sni} 
                onChange={(e) => setSni(e.target.value)} 
                placeholder="SRV-CERT/2026/AHASS" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
              />
            </div>
          </div>

          {/* Kolom Input Deskripsi Layanan */}
          <div>
            <label className="block text-xs font-semibold opacity-70 mb-1">Deskripsi Layanan Servis</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              placeholder="Tulis deskripsi detail tahapan pengerjaan servis..." 
              className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none resize-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
            />
          </div>

          {/* Bagian Multi-Foto Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold opacity-70">Galeri Foto / Banner Servis (Tambah/Hapus foto)</label>
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
              <FiSave size={16} /> {saving ? 'Menyimpan...' : 'Perbarui Data Servis'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}