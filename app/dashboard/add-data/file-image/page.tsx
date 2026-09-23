'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { 
  FiImage, FiUpload, FiTrash2, FiSearch, 
  FiGrid, FiList, FiX, FiEye, FiClipboard, FiCheck 
} from 'react-icons/fi';

interface ImageItem {
  id: string;
  name: string;
  url: string; 
  size: string;
  date: string;
  dimension?: string;
}

export default function FileImagePage() {
  const { mode } = useTheme();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  // State untuk menampung gambar hasil Paste dari Clipboard
  const [pastedImageBase64, setPastedImageBase64] = useState<string | null>(null);
  const [pastedImageName, setPastedImageName] = useState<string>('');

  const fetchImagesFromSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('image_items').select('*');
      if (error) {
        console.error('Gagal mengambil data gambar:', error.message);
      } else if (data) {
        const formattedData: ImageItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          url: item.url,
          size: item.size,
          date: item.date,
          dimension: item.dimension
        }));
        setImages(formattedData);
      }
    } catch (err) {
      console.error('Terjadi kesalahan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImagesFromSupabase();
  }, []);

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  // Handler Upload Gambar Lokal Langsung Simpan
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const base64Url = uploadEvent.target?.result as string;

        const newImage: ImageItem = {
          id: Date.now().toString(),
          name: file.name,
          url: base64Url,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          date: 'Baru saja',
          dimension: 'Original'
        };

        setImages(prev => [newImage, ...prev]);

        await supabase.from('image_items').insert([{
          id: newImage.id,
          name: newImage.name,
          url: newImage.url,
          size: newImage.size,
          date: newImage.date,
          dimension: newImage.dimension
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler Event Paste Gambar dari Clipboard (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setPastedImageBase64(event.target?.result as string);
            setPastedImageName(`pasted-image-${Date.now()}.png`);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  // Handler Simpan Gambar Hasil Paste ke Supabase
  const handleSavePastedImage = async () => {
    if (!pastedImageBase64) return;

    const newImage: ImageItem = {
      id: Date.now().toString(),
      name: pastedImageName,
      url: pastedImageBase64,
      size: '1.0 MB',
      date: 'Baru saja',
      dimension: 'Original'
    };

    setImages(prev => [newImage, ...prev]);
    setPastedImageBase64(null);
    setPastedImageName('');

    await supabase.from('image_items').insert([{
      id: newImage.id,
      name: newImage.name,
      url: newImage.url,
      size: newImage.size,
      date: newImage.date,
      dimension: newImage.dimension
    }]);
  };

  const handleDeleteImage = async (id: string | number, url?: string) => {
    await supabase.from('image_items').delete().eq('id', id);
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);
    
    const remainingFiltered = updatedImages.filter(img => 
      img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (remainingFiltered.length > 0) {
      setSelectedImage(remainingFiltered[0]);
    } else {
      setSelectedImage(null);
    }
  };

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 relative">
      
      {/* HEADER & TOOLBAR */}
      <div className={`p-5 rounded-2xl border transition-colors ${getCardStyle()}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              File Image <span className="text-xs font-normal opacity-60">/ Galeri Media</span>
            </h1>
            <p className="text-xs opacity-70 mt-0.5">
              Kelola tangkapan layar, aset visual, dan dokumentasi gambar Anda (Sinkron Supabase).
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`flex items-center px-3 py-2 rounded-xl border ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'} w-full md:w-64`}>
              <FiSearch className="opacity-50 mr-2" />
              <input 
                type="text" 
                placeholder="Cari gambar..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full"
              />
            </div>
            <div className="flex border rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'opacity-60'}`}><FiGrid size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'opacity-60'}`}><FiList size={16} /></button>
            </div>
          </div>
        </div>

        {/* INPUT DUA KOLOM: UPLOAD LOKAL & PASTE CLIPBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/20">
          
          {/* Opsi 1: Upload dari Lokal */}
          <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${mode === 'light' ? 'border-slate-300 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-800/50'}`}>
            <FiUpload className="text-blue-500 text-xl" />
            <div className="text-left">
              <p className="text-xs font-semibold">Upload Gambar dari Lokal</p>
              <p className="text-[10px] opacity-60">Pilih file gambar (PNG, JPG, WEBP)</p>
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          {/* Opsi 2: Paste Gambar dari Clipboard + Tombol Simpan */}
          <div 
            onPaste={handlePaste}
            tabIndex={0}
            className={`flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition outline-none focus:border-blue-500 ${mode === 'light' ? 'border-slate-300 bg-slate-50/50' : 'border-slate-700 bg-slate-800/30'}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <FiClipboard className="text-emerald-500 text-xl flex-shrink-0" />
              <div className="text-left truncate">
                <p className="text-xs font-semibold">
                  {pastedImageBase64 ? pastedImageName : "Klik di sini lalu Tekan Ctrl+V"}
                </p>
                <p className="text-[10px] opacity-60">
                  {pastedImageBase64 ? "Gambar siap disimpan" : "Paste tangkapan layar / gambar yang disalin"}
                </p>
              </div>
            </div>

            {pastedImageBase64 && (
              <button 
                onClick={handleSavePastedImage}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition flex-shrink-0 ml-2"
              >
                <FiCheck size={14} /> Simpan
              </button>
            )}
          </div>

        </div>
      </div>

      {/* AREA TAMPILAN GALERI GAMBAR */}
      <div className={`min-h-[400px] p-6 rounded-2xl border transition-all ${getCardStyle()}`}>
        <div className="mb-4 text-xs opacity-70 font-medium">
          <span>Total Koleksi: {filteredImages.length} Gambar</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-xs opacity-60">Memuat data dari Supabase...</div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 text-xs">
            <FiImage size={48} className="mb-2" />
            <p>Tidak ada gambar yang ditemukan.</p>
          </div>
) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredImages.map((img) => (
              <div 
                key={img.id} 
                onClick={() => setSelectedImage(img)}
                className="group flex flex-col rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-transparent hover:border-blue-500/40 cursor-pointer transition relative"
              >
                <div className="h-36 w-full overflow-hidden relative bg-slate-800">
                  <img 
                    src={img.url} 
                    alt={img.name} 
                    className="w-full h-full object-cover transition transform group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <FiEye size={20} />
                  </div>
                </div>

                <div className="p-3 flex flex-col justify-between flex-grow">
                  <span className="text-xs font-medium truncate w-full" title={img.name}>{img.name}</span>
                  
                  {/* BAGIAN INI YANG DIUBAH: Menambahkan tombol delete di samping tanggal */}
                  <div className="flex justify-between items-center text-[10px] opacity-50 mt-1">
                    <span>{img.size}</span>
                    <div className="flex items-center gap-2">
                      <span>{img.date}</span>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); // Mencegah modal preview ikut terbuka saat tombol delete diklik
                          handleDeleteImage(img.id, img.url); 
                        }}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded transition opacity-0 group-hover:opacity-100"
                        title="Hapus Gambar"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700/20 opacity-60">
                  <th className="pb-3 font-semibold">Pratinjau</th>
                  <th className="pb-3 font-semibold">Nama Berkas</th>
                  <th className="pb-3 font-semibold">Ukuran</th>
                  <th className="pb-3 font-semibold">Dimensi</th>
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10">
                {filteredImages.map((img) => (
                  <tr 
                    key={img.id} 
                    onClick={() => setSelectedImage(img)}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                  >
                    <td className="py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 font-medium truncate max-w-xs">{img.name}</td>
                    <td className="py-3 opacity-70">{img.size}</td>
                    <td className="py-3 opacity-70">{img.dimension}</td>
                    <td className="py-3 opacity-70">{img.date}</td>
                    <td className="py-3 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}
                        className="p-1.5 hover:text-blue-500 transition opacity-60 hover:opacity-100"
                        title="Lihat"
                      >
                        <FiEye size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }}
                        className="p-1.5 hover:text-red-500 transition opacity-60 hover:opacity-100"
                        title="Hapus"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL LIGHTBOX / PREVIEW GAMBAR BESAR */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className={`w-full max-w-4xl rounded-2xl p-5 border shadow-2xl relative flex flex-col max-h-[90vh] ${mode === 'light' ? 'bg-white text-slate-900 border-slate-200' : 'bg-[#16222A] text-slate-100 border-slate-700'}`}>
            
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
            >
              <FiX size={18} />
            </button>

            <div className="mb-3">
              <h2 className="text-sm font-bold truncate pr-10">{selectedImage.name}</h2>
              <p className="text-[10px] opacity-60">Ukuran: {selectedImage.size} • Dimensi: {selectedImage.dimension} • {selectedImage.date}</p>
            </div>

            <div className="flex-grow flex items-center justify-center overflow-hidden rounded-xl bg-black/20 p-2 min-h-[300px] relative group">
              
              <button 
                onClick={() => {
                  const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
                  if (currentIndex > 0) {
                    setSelectedImage(filteredImages[currentIndex - 1]);
                  } else {
                    setSelectedImage(filteredImages[filteredImages.length - 1]);
                  }
                }}
                className="absolute left-3 z-10 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition opacity-70 group-hover:opacity-100 shadow-lg"
              >
                &larr;
              </button>

              <img 
                src={selectedImage.url} 
                alt={selectedImage.name} 
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg transition-all duration-300" 
              />

              <button 
                onClick={() => {
                  const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
                  if (currentIndex < filteredImages.length - 1) {
                    setSelectedImage(filteredImages[currentIndex + 1]);
                  } else {
                    setSelectedImage(filteredImages[0]);
                  }
                }}
                className="absolute right-3 z-10 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition opacity-70 group-hover:opacity-100 shadow-lg"
              >
                &rarr;
              </button>

            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-700/20">
              <button 
                onClick={() => handleDeleteImage(selectedImage.id)}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition flex items-center gap-1.5"
              >
                <FiTrash2 size={14} /> Hapus Gambar
              </button>

              <div className="text-[11px] opacity-60">
                {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} dari {filteredImages.length}
              </div>

              <button 
                onClick={() => setSelectedImage(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}