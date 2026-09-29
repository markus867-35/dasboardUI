'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { 
  FiFolder, FiFolderPlus, FiFile, FiUpload, FiTrash2, 
  FiChevronRight, FiArrowLeft, FiExternalLink, FiGrid, FiList, FiSearch, FiCopy, FiCheck, FiX, FiImage, FiClipboard 
} from 'react-icons/fi';

interface ItemNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parent_id: string | null;
  size?: string;
  url?: string;
  created_at: string;
}

export default function FileManagementPage() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [items, setItems] = useState<ItemNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<ItemNode | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  // Tangkap event Paste (Ctrl+V) baik secara global atau langsung pada area khusus
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            await uploadFileToSupabase(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [currentFolderId, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('file_managers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setItems(data);
    } catch (error) {
      console.error('Gagal memuat data file/folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentFolderName = () => {
    if (currentFolderId === null) return 'Root Utama';
    const folder = items.find(item => item.id === currentFolderId);
    return folder ? folder.name : 'Root Utama';
  };

  const currentItems = items.filter(item => {
    const matchesFolder = item.parent_id === currentFolderId;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const newFolderData = {
        name: newFolderName.trim(),
        type: 'folder' as const,
        parent_id: currentFolderId,
      };

      const { data, error } = await supabase
        .from('file_managers')
        .insert([newFolderData])
        .select();

      if (error) throw error;

      if (data) {
        setItems([data[0], ...items]);
        setNewFolderName('');
        setIsCreatingFolder(false);
      }
    } catch (error: any) {
      console.error('Gagal membuat folder:', error);
      alert(`Gagal membuat folder: ${error.message || 'Terjadi kesalahan'}`);
    }
  };

  const uploadFileToSupabase = async (file: File) => {
    const localUrl = URL.createObjectURL(file);

    try {
      const newFileData = {
        name: file.name || `Pasted-Image-${Date.now()}.png`,
        type: 'file' as const,
        parent_id: currentFolderId,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: localUrl,
      };

      const { data, error } = await supabase
        .from('file_managers')
        .insert([newFileData])
        .select();

      if (error) throw error;

      if (data) {
        setItems([data[0], ...items]);
      }
    } catch (error: any) {
      console.error('Gagal mengupload file:', error);
      alert(`Gagal mengupload file: ${error.message || 'Terjadi kesalahan'}`);
    }
  };

  const handleFileUploadInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFileToSupabase(files[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const { error } = await supabase
        .from('file_managers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
      if (selectedFile?.id === id) setSelectedFile(null);
    } catch (error: any) {
      console.error('Gagal menghapus item:', error);
      alert(`Gagal menghapus: ${error.message || 'Terjadi kesalahan'}`);
    }
  };

  const handleBackNavigation = () => {
    if (currentFolderId === null) return;
    const currentFolder = items.find(item => item.id === currentFolderId);
    setCurrentFolderId(currentFolder ? currentFolder.parent_id : null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 space-y-6 max-w-10xl mx-auto min-h-screen transition-colors ${
      isDark ? 'text-slate-100 bg-slate-950' : 'text-slate-800 bg-white'
    }`}>
      
      {/* HEADER & BREADCRUMB */}
      <div className={`p-6 border rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#16222A] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="cursor-pointer hover:underline" onClick={() => setCurrentFolderId(null)}>File Manager</span>
            {currentFolderId !== null && (
              <>
                <FiChevronRight className="w-3.5 h-3.5" />
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {getCurrentFolderName()}
                </span>
              </>
            )}
          </div>
          <h1 className="text-lg font-bold">Penyimpanan Berkas & Direktori</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {currentFolderId !== null && (
            <button
              onClick={handleBackNavigation}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <FiArrowLeft className="w-4 h-4" /> Kembali
            </button>
          )}

          <button
            onClick={() => setIsCreatingFolder(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <FiFolderPlus className="w-4 h-4" /> Buat Folder Baru
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUploadInput} 
            className="hidden" 
            id="upload-file-general" 
          />
          <label 
            htmlFor="upload-file-general"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-all"
          >
            <FiUpload className="w-4 h-4" /> Upload File
          </label>
        </div>
      </div>

      {/* KOTAK KHUSUS PASTE GAMBAR / DROPZONE */}
      <div 
        ref={pasteAreaRef}
        tabIndex={0}
        className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
          isDark ? 'bg-[#16222A]/60 border-slate-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-300 hover:border-indigo-500'
        }`}
        onClick={() => {
          // Fokuskan agar langsung bisa terima paste, atau klik untuk pilih file
          if (fileInputRef.current) fileInputRef.current.click();
        }}
      >
        <div className={`p-3 rounded-full ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          <FiClipboard className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold">Klik di sini lalu tekan <kbd className="px-1.5 py-0.5 border rounded bg-indigo-600 text-white font-mono">Ctrl + V</kbd> untuk menempel gambar</p>
          <p className="text-[11px] text-slate-400 mt-1">Atau klik untuk memilih file dari komputer Anda</p>
        </div>
      </div>

      {/* FILTER BAR: PENCARIAN & TOGGLE */}
      <div className={`p-4 border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-[#16222A] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari berkas atau folder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-xs border rounded-xl outline-none ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
            }`}
          />
        </div>

        <div className={`flex items-center p-1 border rounded-xl ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'
        }`}>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'grid' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black')
            }`}
            title="Tampilan Grid"
          >
            <FiGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black')
            }`}
            title="Tampilan List"
          >
            <FiList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODAL BUAT FOLDER */}
      {isCreatingFolder && (
        <div className={`p-4 border rounded-2xl flex items-center justify-between gap-4 ${
          isDark ? 'bg-[#1e2d38] border-indigo-500/50' : 'bg-indigo-50/50 border-indigo-200'
        }`}>
          <form onSubmit={handleCreateFolder} className="flex items-center gap-3 w-full">
            <FiFolder className="w-5 h-5 text-indigo-500 shrink-0" />
            <input 
              type="text"
              autoFocus
              required
              placeholder="Masukkan nama folder baru..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className={`w-full px-3 py-2 text-xs border rounded-xl outline-none ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
              }`}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0 transition"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              Batal
            </button>
          </form>
        </div>
      )}

      {/* KONTEN UTAMA: FOLDER & FILE */}
      <div className={`p-6 border rounded-2xl shadow-xs space-y-4 min-h-[400px] flex flex-col ${
        isDark ? 'bg-[#16222A] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`text-xs font-medium pb-3 border-b flex justify-between items-center ${
          isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-500 border-slate-100'
        }`}>
          <span>Lokasi: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{getCurrentFolderName()}</strong></span>
          <span>Total Item: {currentItems.length}</span>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 py-24">
            <span>Memuat data...</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-xs text-slate-400 py-24 space-y-2">
            <FiFolder className="w-10 h-10 opacity-30" />
            <span>Folder ini masih kosong atau pencarian tidak ditemukan.</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {currentItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  if (item.type === 'folder') {
                    setCurrentFolderId(item.id);
                  } else {
                    setSelectedFile(item);
                  }
                }}
                className={`group relative p-4 border rounded-2xl flex items-center justify-between transition-all shadow-xs cursor-pointer ${
                  isDark ? 'bg-[#1e2d38] border-slate-700/70 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-indigo-500'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    item.type === 'folder' 
                      ? (isDark ? 'bg-amber-950/40 text-amber-400' : 'bg-amber-50 text-amber-600')
                      : (isDark ? 'bg-blue-950/40 text-blue-400' : 'bg-blue-50 text-blue-600')
                  }`}>
                    {item.type === 'folder' ? <FiFolder className="w-5 h-5" /> : <FiFile className="w-5 h-5" />}
                  </div>
                  <div className="truncate">
                    <h3 className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {item.type === 'folder' ? 'Folder' : item.size || 'File Dokumen'} • {item.created_at?.split('T')[0]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors"
                    title="Hapus"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <tr>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Ukuran</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/20">
                {currentItems.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => {
                      if (item.type === 'folder') setCurrentFolderId(item.id);
                      else setSelectedFile(item);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 flex items-center gap-3 font-medium">
                      {item.type === 'folder' ? <FiFolder className="w-4 h-4 text-amber-500" /> : <FiFile className="w-4 h-4 text-blue-500" />}
                      <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{item.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 uppercase">{item.type}</td>
                    <td className="py-3 px-4 text-slate-400">{item.size || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">{item.created_at?.split('T')[0]}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POP-UP / MODAL DETAIL PRATINJAU */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl border space-y-4 relative ${
            isDark ? 'bg-[#16222A] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <h3 className="text-sm font-bold truncate flex items-center gap-2">
                <FiImage className="w-4 h-4 text-indigo-500" /> {selectedFile.name}
              </h3>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-1.5 rounded-lg hover:bg-slate-700/20 text-slate-400 hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedFile.url && (
                <div className="w-full h-64 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                  <img src={selectedFile.url} alt={selectedFile.name} className="max-h-full max-w-full object-contain" />
                </div>
              )}

              <div className="space-y-1 text-xs text-slate-400">
                <p>Ukuran: <span className="text-slate-200 font-medium">{selectedFile.size || 'Tidak diketahui'}</span></p>
                <p>Dibuat: <span className="text-slate-200 font-medium">{selectedFile.created_at}</span></p>
              </div>

              {selectedFile.url && (
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedFile.url} 
                    className={`w-full px-3 py-2 text-xs border rounded-xl outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300'
                    }`}
                  />
                  <button
                    onClick={() => copyToClipboard(selectedFile.url!)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition"
                  >
                    {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                    {copied ? 'Disalin' : 'Salin URL'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <a 
                href={selectedFile.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
              >
                <FiExternalLink className="w-4 h-4" /> Buka di Tab Baru
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}