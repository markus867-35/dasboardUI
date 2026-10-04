'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { 
  FiImage, FiUpload, FiTrash2, FiSearch, 
  FiGrid, FiList, FiX, FiEye, FiClipboard, FiCheck,
  FiFolder, FiFolderPlus, FiEdit2, FiArrowLeft, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

interface FolderItem {
  id: string;
  name: string;
}

interface ImageItem {
  id: string;
  name: string;
  url: string; 
  size: string;
  date: string;
  dimension?: string;
  folder_id?: string | null;
}

export default function FileImagePage() {
  const { mode } = useTheme();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State untuk Preview Gambar & Navigasi Indeks
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  // State Form Buat Folder Inline
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [editFolderName, setEditFolderName] = useState('');

  const [pastedImageBase64, setPastedImageBase64] = useState<string | null>(null);
  const [pastedImageName, setPastedImageName] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: folderData, error: folderError } = await supabase
        .from('folders')
        .select('*')
        .order('id', { ascending: false });

      if (folderError) console.error('Gagal ambil folder:', folderError.message);
      else if (folderData) setFolders(folderData);

      const { data: imgData, error: imgError } = await supabase
        .from('image_items')
        .select('*')
        .order('id', { ascending: false })
        .limit(100);

      if (imgError) {
        console.error('Gagal mengambil data gambar:', imgError.message);
      } else if (imgData) {
        const formattedData: ImageItem[] = imgData.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          url: item.url,
          size: item.size,
          date: item.date,
          dimension: item.dimension,
          folder_id: item.folder_id ? item.folder_id.toString() : null
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
    fetchData();
  }, []);

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const folderName = newFolderName.trim();
    const generatedId = crypto.randomUUID();

    const { data, error } = await supabase
      .from('folders')
      .insert([{ id: generatedId, name: folderName }])
      .select();

    if (error) {
      alert('Gagal membuat folder: ' + error.message);
      return;
    }

    if (data && data.length > 0) {
      const createdFolder: FolderItem = {
        id: data[0].id.toString(),
        name: data[0].name
      };
      setFolders(prev => [createdFolder, ...prev]);
    }

    setNewFolderName('');
    setIsCreateFolderOpen(false);
  };

  const handleUpdateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder || !editFolderName.trim()) return;

    const updatedName = editFolderName.trim();
    setFolders(prev => prev.map(f => f.id === editingFolder.id ? { ...f, name: updatedName } : f));
    if (currentFolder?.id === editingFolder.id) {
      setCurrentFolder({ ...currentFolder, name: updatedName });
    }
    setEditingFolder(null);

    await supabase.from('folders').update({ name: updatedName }).eq('id', editingFolder.id);
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Hapus folder ini? Semua gambar di dalam folder ini juga akan terhapus.")) return;

    await supabase.from('image_items').delete().eq('folder_id', folderId);
    await supabase.from('folders').delete().eq('id', folderId);

    setFolders(prev => prev.filter(f => f.id !== folderId));
    setImages(prev => prev.filter(img => img.folder_id !== folderId));
    if (currentFolder?.id === folderId) {
      setCurrentFolder(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 5 MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const img = new Image();
        img.src = uploadEvent.target?.result as string;

        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64Url = canvas.toDataURL('image/jpeg', 0.7);
          const sizeStr = `${(compressedBase64Url.length * (3/4) / (1024 * 1024)).toFixed(1)} MB`;
          const dimStr = `${width}x${height}`;
          const targetFolderId = currentFolder ? currentFolder.id : null;

          const { data, error } = await supabase.from('image_items').insert([{
            name: file.name,
            url: compressedBase64Url,
            size: sizeStr,
            date: 'Baru saja',
            dimension: dimStr,
            folder_id: targetFolderId
          }]).select();

          if (error) {
            alert('Gagal mengunggah gambar.');
            return;
          }

          if (data && data.length > 0) {
            const newImage: ImageItem = {
              id: data[0].id.toString(),
              name: data[0].name,
              url: data[0].url,
              size: data[0].size,
              date: data[0].date,
              dimension: data[0].dimension,
              folder_id: data[0].folder_id ? data[0].folder_id.toString() : null
            };
            setImages(prev => [newImage, ...prev]);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const MAX_WIDTH = 1200;
              const MAX_HEIGHT = 1200;

              if (width > height) {
                if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
              } else {
                if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);

              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

              setPastedImageBase64(compressedBase64);
              setPastedImageName(`pasted-image-${Date.now()}.jpg`);
            };
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleSavePastedImage = async () => {
    if (!pastedImageBase64) return;

    const calculatedSize = `${(pastedImageBase64.length * (3/4) / (1024 * 1024)).toFixed(1)} MB`;
    const targetFolderId = currentFolder ? currentFolder.id : null;

    const { data, error } = await supabase.from('image_items').insert([{
      name: pastedImageName,
      url: pastedImageBase64,
      size: calculatedSize,
      date: 'Baru saja',
      dimension: 'Optimized',
      folder_id: targetFolderId
    }]).select();

    if (error) return;

    if (data && data.length > 0) {
      const newImage: ImageItem = {
        id: data[0].id.toString(),
        name: data[0].name,
        url: data[0].url,
        size: data[0].size,
        date: data[0].date,
        dimension: data[0].dimension,
        folder_id: data[0].folder_id ? data[0].folder_id.toString() : null
      };
      setImages(prev => [newImage, ...prev]);
    }

    setPastedImageBase64(null);
    setPastedImageName('');
  };

  const handleDeleteImage = async (id: string | number) => {
    await supabase.from('image_items').delete().eq('id', id);
    setImages(prev => prev.filter(img => img.id !== id.toString()));
    setSelectedImage(null);
  };

  const activeFolders = !currentFolder && !searchQuery ? folders : folders.filter(f => !currentFolder && f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeImages = images.filter(img => {
    const matchFolder = currentFolder ? img.folder_id === currentFolder.id : (!img.folder_id);
    const matchSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  // --- LOGIKA NAVIGASI PREVIEW (NEXT & PREV) ---
  const handlePrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = activeImages.findIndex(img => img.id === selectedImage.id);
    if (currentIndex > 0) {
      setSelectedImage(activeImages[currentIndex - 1]);
    } else {
      // Loop ke gambar paling akhir jika sudah di awal
      setSelectedImage(activeImages[activeImages.length - 1]);
    }
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = activeImages.findIndex(img => img.id === selectedImage.id);
    if (currentIndex < activeImages.length - 1) {
      setSelectedImage(activeImages[currentIndex + 1]);
    } else {
      // Loop kembali ke gambar pertama jika sudah di akhir
      setSelectedImage(activeImages[0]);
    }
  };

  // Keyboard shortcut (Arrow Left & Arrow Right) saat modal preview terbuka
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, activeImages]);

  return (
    <div className="p-6 space-y-6 relative">
      
      {/* HEADER & TOOLBAR */}
      <div className={`p-5 rounded-2xl border transition-colors ${getCardStyle()}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {currentFolder && (
              <button 
                onClick={() => setCurrentFolder(null)}
                className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-blue-600 hover:text-white transition"
                title="Kembali ke Root"
              >
                <FiArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                File Image <span className="text-xs font-normal opacity-65">/ {currentFolder ? currentFolder.name : 'Galeri Utama'}</span>
              </h1>
              <p className="text-xs opacity-70 mt-0.5">
                {currentFolder ? `Menampilkan isi folder: ${currentFolder.name}` : 'Kelola folder, tangkapan layar, dan aset visual Anda.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!currentFolder && (
              <button 
                onClick={() => setIsCreateFolderOpen(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2.5 rounded-xl font-medium transition flex-shrink-0 shadow-md"
              >
                <FiFolderPlus size={16} /> Buat Folder
              </button>
            )}

            <div className={`flex items-center px-3 py-2 rounded-xl border ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'} w-full md:w-56`}>
              <FiSearch className="opacity-50 mr-2" />
              <input 
                type="text" 
                placeholder="Cari berkas atau folder..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full"
              />
            </div>
            <div className="flex border rounded-xl overflow-hidden border-slate-700/20">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'opacity-65 hover:opacity-100'}`}><FiGrid size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'opacity-65 hover:opacity-100'}`}><FiList size={16} /></button>
            </div>
          </div>
        </div>

        {/* INPUT UPLOAD & PASTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/20">
          <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${mode === 'light' ? 'border-slate-300 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-800/50'}`}>
            <FiUpload className="text-blue-500 text-xl" />
            <div className="text-left">
              <p className="text-xs font-semibold">Upload Gambar {currentFolder ? `ke "${currentFolder.name}"` : 'ke Utama'}</p>
              <p className="text-[10px] opacity-60">Pilih file (PNG, JPG, WEBP)</p>
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

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
                  {pastedImageBase64 ? "Gambar siap disimpan" : "Paste tangkapan layar / gambar"}
                </p>
              </div>
            </div>

            {pastedImageBase64 && (
              <button 
                onClick={handleSavePastedImage}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition flex-shrink-0 ml-2 shadow"
              >
                <FiCheck size={14} /> Simpan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FORM BUAT FOLDER INLINE */}
      {isCreateFolderOpen && !currentFolder && (
        <form onSubmit={handleCreateFolder} className={`p-4 rounded-2xl border flex items-center gap-3 shadow-lg ${mode === 'light' ? 'bg-white border-blue-500/50' : 'bg-[#16222A] border-blue-500/50'}`}>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
            <FiFolder size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Masukkan nama folder baru..." 
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className={`w-full p-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-[#0f172a] border-slate-700'}`}
            autoFocus
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="submit" className="px-4 py-2.5 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shadow">Simpan</button>
            <button type="button" onClick={() => setIsCreateFolderOpen(false)} className="px-4 py-2.5 rounded-xl text-xs bg-gray-500/10 opacity-70 hover:opacity-100">Batal</button>
          </div>
        </form>
      )}

      {/* KONTEN UTAMA: FOLDER & GAMBAR */}
      <div className={`min-h-[350px] p-6 rounded-2xl border transition-all ${getCardStyle()}`}>
        <div className="mb-4 text-xs opacity-75 font-medium flex justify-between items-center">
          <span>
            {currentFolder ? `Direktori: ${currentFolder.name}` : 'Direktori Utama'} • {activeFolders.length} Folder, {activeImages.length} Berkas
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-xs opacity-60">Memuat data...</div>
        ) : activeFolders.length === 0 && activeImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 text-xs">
            <FiFolder size={48} className="mb-2 opacity-40" />
            <p>Folder atau gambar kosong.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {!searchQuery && activeFolders.map(folder => {
              const countImg = images.filter(img => img.folder_id === folder.id).length;
              return (
                <div 
                  key={folder.id}
                  onClick={() => setCurrentFolder(folder)}
                  className={`group p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between relative bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <FiFolder className="text-blue-500" size={30} />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setEditFolderName(folder.name); }}
                        className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                        title="Edit Nama Folder"
                      >
                        <FiEdit2 size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                        title="Hapus Folder"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold truncate">{folder.name}</h3>
                    <p className="text-[10px] opacity-60 mt-0.5">{countImg} Item</p>
                  </div>
                </div>
              );
            })}

            {activeImages.map((img) => (
              <div 
                key={img.id} 
                onClick={() => setSelectedImage(img)}
                className="group flex flex-col rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-transparent hover:border-blue-500/40 cursor-pointer transition relative shadow-sm"
              >
                <div className="h-36 w-full overflow-hidden relative bg-slate-800">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover transition transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <FiEye size={20} />
                  </div>
                </div>

                <div className="p-3 flex flex-col justify-between flex-grow">
                  <span className="text-xs font-medium truncate w-full" title={img.name}>{img.name}</span>
                  <div className="flex justify-between items-center text-[10px] opacity-60 mt-1">
                    <span>{img.size}</span>
                    <div className="flex items-center gap-2">
                      <span>{img.date}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded transition opacity-0 group-hover:opacity-100"
                        title="Hapus"
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
                <tr className="border-b border-slate-700/20 opacity-70">
                  <th className="pb-3 font-semibold">Tipe / Pratinjau</th>
                  <th className="pb-3 font-semibold">Nama Berkas / Folder</th>
                  <th className="pb-3 font-semibold">Ukuran</th>
                  <th className="pb-3 font-semibold">Dimensi</th>
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10">
                {!searchQuery && activeFolders.map(folder => (
                  <tr key={folder.id} onClick={() => setCurrentFolder(folder)} className="hover:bg-blue-500/5 transition cursor-pointer">
                    <td className="py-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
                        <FiFolder size={20} />
                      </div>
                    </td>
                    <td className="py-3 font-bold truncate max-w-xs">{folder.name}</td>
                    <td className="py-3 opacity-60">-</td>
                    <td className="py-3 opacity-60">Folder</td>
                    <td className="py-3 opacity-60">-</td>
                    <td className="py-3 text-right flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setEditFolderName(folder.name); }} className="p-1.5 hover:text-blue-500 transition opacity-60"><FiEdit2 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="p-1.5 hover:text-red-500 transition opacity-60"><FiTrash2 size={14} /></button>
                    </td>
                  </tr>
                ))}

                {activeImages.map((img) => (
                  <tr key={img.id} onClick={() => setSelectedImage(img)} className="hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer">
                    <td className="py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 font-medium truncate max-w-xs">{img.name}</td>
                    <td className="py-3 opacity-70">{img.size}</td>
                    <td className="py-3 opacity-70">{img.dimension || '-'}</td>
                    <td className="py-3 opacity-70">{img.date}</td>
                    <td className="py-3 text-right flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }} className="p-1.5 hover:text-blue-500 transition opacity-60"><FiEye size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }} className="p-1.5 hover:text-red-500 transition opacity-60"><FiTrash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL EDIT FOLDER */}
      {editingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleUpdateFolder} className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl ${mode === 'light' ? 'bg-white text-slate-900 border-slate-200' : 'bg-[#16222A] text-slate-100 border-slate-700'}`}>
            <h2 className="text-base font-bold mb-3 flex items-center gap-2">
              <FiEdit2 className="text-blue-500" /> Ubah Nama Folder
            </h2>
            <input 
              type="text" 
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              className={`w-full p-3 rounded-xl border text-xs outline-none mb-4 ${mode === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-[#0f172a] border-slate-700'}`}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingFolder(null)} className="px-4 py-2 rounded-xl text-xs bg-gray-500/10 opacity-70 hover:opacity-100">Batal</button>
              <button type="submit" className="px-4 py-2 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shadow">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL LIGHTBOX / PREVIEW GAMBAR DENGAN TOMBOL NAVIGASI KIRI & KANAN */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-md p-4">
          <div className={`w-full max-w-4xl rounded-2xl p-5 border shadow-2xl bg-transparent relative flex flex-col max-h-[90vh] ${mode === 'light' ? 'bg-white text-slate-900 border-slate-200' : 'bg-[#16222A] text-slate-100 border-slate-700'}`}>
            
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"><FiX size={18} /></button>
            
            <div className="mb-3 pr-10">
              <h2 className="text-sm font-bold truncate">{selectedImage.name}</h2>
              <p className="text-[10px] opacity-60">
                Ukuran: {selectedImage.size} • Dimensi: {selectedImage.dimension || '-'} • {selectedImage.date} ({activeImages.findIndex(img => img.id === selectedImage.id) + 1} dari {activeImages.length})
              </p>
            </div>

            {/* AREA PREVIEW DENGAN TOMBOL PREV & NEXT */}
            <div className="flex-grow flex items-center justify-center overflow-hidden rounded-xl bg-black/20 p-2 min-h-[300px] relative group">
              
              {/* Tombol Navigasi Kiri */}
              {activeImages.length > 1 && (
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-3 z-20 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition shadow-lg opacity-80 group-hover:opacity-100"
                  title="Sebelumnya (Panah Kiri)"
                >
                  <FiChevronLeft size={22} />
                </button>
              )}

              <img src={selectedImage.url} alt={selectedImage.name} className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg" />

              {/* Tombol Navigasi Kanan */}
              {activeImages.length > 1 && (
                <button 
                  onClick={handleNextImage}
                  className="absolute right-3 z-20 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition shadow-lg opacity-80 group-hover:opacity-100"
                  title="Berikutnya (Panah Kanan)"
                >
                  <FiChevronRight size={22} />
                </button>
              )}
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-700/20">
              <button onClick={() => handleDeleteImage(selectedImage.id)} className="px-3 py-2 rounded-xl text-xs font-medium bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition flex items-center gap-1.5"><FiTrash2 size={14} /> Hapus</button>
              <button onClick={() => setSelectedImage(null)} className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition">Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}