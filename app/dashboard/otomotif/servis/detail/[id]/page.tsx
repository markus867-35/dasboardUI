'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { FiArrowLeft, FiEdit, FiTrash2, FiTag } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

export default function DetailServisPage() {
  const { mode } = useTheme();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // 1. SEMUA HOOKS DI ATAS
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('online_shop_stock')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setService(data);
    } catch (err: any) {
      console.error('Gagal mengambil detail servis:', err);
      alert('Gagal memuat detail paket servis.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus data paket servis ini?')) return;

    try {
      const { error } = await supabase
        .from('online_shop_stock')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Data paket servis berhasil dihapus.');
      router.push('/dashboard/otomotif/servis');
    } catch (err: any) {
      console.error('Gagal menghapus:', err);
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  // 2. KONDISI LOADING & RETURN DI BAWAH HOOKS
  if (loading) {
    return <div className="p-16 text-center text-xs opacity-60">Memuat detail paket servis...</div>;
  }

  if (!service) {
    return <div className="p-16 text-center text-xs opacity-60">Data paket servis tidak ditemukan.</div>;
  }

  // Normalisasi gambar
  let images: string[] = [];
  if (Array.isArray(service.image_url)) {
    images = service.image_url.filter(Boolean);
  } else if (typeof service.image_url === 'string' && service.image_url.trim() !== '') {
    images = [service.image_url];
  }
  if (images.length === 0) {
    images = ['https://via.placeholder.com/400'];
  }

  return (
    <div className="p-6 max-w-10xl mx-auto space-y-6">
      
      {/* Breadcrumb & Tombol Navigasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs opacity-70">
          <span className="cursor-pointer hover:underline" onClick={() => router.push('/dashboard/otomotif/servis')}>Servis</span>
          <span>/</span>
          <span>{service.brand}</span>
          <span>/</span>
          <span className="font-semibold text-slate-900 dark:text-white">{service.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/dashboard/otomotif/servis')} 
            className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-500/20 hover:bg-slate-500/10 transition"
          >
            <FiArrowLeft size={14} /> Kembali
          </button>
          <button 
            onClick={() => router.push(`/dashboard/otomotif/servis/edit/${service.id}`)} 
            className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <FiEdit size={14} /> Edit
          </button>
          <button 
            onClick={handleDelete} 
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <FiTrash2 size={14} /> Hapus
          </button>
        </div>
      </div>

      {/* Konten Utama Detail Servis */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-2xl border ${getCardStyle()}`}>
        
        {/* Kolom Kiri: Galeri Foto Banner Servis */}
        <div className="space-y-4 flex flex-col items-center">
          {/* Gambar Utama Besar */}
          <div className="w-full h-64 rounded-2xl border bg-white dark:bg-white border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-3 relative group">
            
            {/* Tombol Panah Kiri (Prev) */}
            {images.length > 1 && (
              <button 
                type="button"
                onClick={() => {
                  setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
                }}
                className="absolute left-3 p-2 rounded-full bg-slate-100/80 text-slate-700 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                title="Sebelumnya"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Gambar Utama */}
            <img 
              src={images[activeImageIndex]} 
              alt={service.name} 
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Tombol Panah Kanan (Next) */}
            {images.length > 1 && (
              <button 
                type="button"
                onClick={() => {
                  setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-3 p-2 rounded-full bg-slate-100/80 text-slate-700 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                title="Selanjutnya"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Thumbnail List */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto w-full pb-2">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl border overflow-hidden shrink-0 bg-white p-1 transition ${
                    activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-500/30' : 'opacity-60 hover:opacity-100 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Informasi Detail Servis */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 uppercase">
                {service.brand}
              </span>
              <span className="text-xs opacity-60">SKU: {service.sku}</span>
            </div>
            <h1 className="text-xl font-extrabold">{service.name}</h1>
            <p className="text-xs opacity-60 mt-1">Kategori: {service.category}</p>
          </div>

          {/* Tarif & Kapasitas Slot */}
          <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/10 space-y-1">
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              Rp {service.sell_price?.toLocaleString('id-ID')}
            </div>
            <div className="text-xs opacity-60 flex items-center gap-2">
              <span>Biaya Pokok: Rp {service.buy_price?.toLocaleString('id-ID')}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-600">Slot Harian: {service.stock} Sesi</span>
            </div>
          </div>

          {/* Benefit Banner */}
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-1 text-xs">
            <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <FiTag size={14} /> BENEFIT LAYANAN
            </div>
            <p className="opacity-80">Setiap paket servis mencakup pemeriksaan gratis dengan alat diagnostik komputer resmi.</p>
          </div>

          {/* Spesifikasi Grid Servis */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-500/20 text-xs">
            <div className="p-3 rounded-xl border bg-slate-500/5">
              <span className="block opacity-60 text-[10px]">Bagian Pengerjaan</span>
              <span className="font-bold">{service.position || 'Mesin & Tune Up'}</span>
            </div>
            <div className="p-3 rounded-xl border bg-slate-500/5">
              <span className="block opacity-60 text-[10px]">Tingkat Kerumitan</span>
              <span className="font-bold">{service.diameter || 'Standar'}</span>
            </div>
            <div className="p-3 rounded-xl border bg-slate-500/5">
              <span className="block opacity-60 text-[10px]">Jenis Layanan</span>
              <span className="font-bold">{service.tire_type || 'Paket Berkala'}</span>
            </div>
          </div>

          {/* Deskripsi & Tahapan */}
          <div className="space-y-2 pt-2 border-t border-slate-500/20 text-xs">
            <h3 className="font-bold">Deskripsi & Tahapan Pengerjaan</h3>
            <p className="opacity-80 leading-relaxed">
              {service.description || `${service.name} adalah layanan servis komprehensif yang dikerjakan oleh teknisi bersertifikat tinggi untuk mengembalikan performa optimal tarikan motor Anda.`}
            </p>
          </div>

          {/* Sertifikasi */}
          <div className="text-[11px] opacity-60 pt-2 border-t border-slate-500/20">
            Nomor Sertifikasi : <span className="font-semibold">{service.sni || 'SRV-CERT/2026/AHASS'}</span>
          </div>

        </div>

      </div>

    </div>
  );
}