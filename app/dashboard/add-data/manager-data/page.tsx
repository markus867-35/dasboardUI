'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { logActivity } from '@/app/utils/activityLogger'; // Impor helper logger
import { supabase } from '@/lib/supabase';
import { 
  FiFolder, FiFolderPlus, FiFile, FiUpload, FiTrash2, 
  FiChevronRight, FiArrowLeft, FiExternalLink, FiGrid, FiList, 
  FiSearch, FiCopy, FiCheck, FiX, FiImage, FiClipboard,
  FiFileText, FiCode, FiMusic, FiVideo, FiArchive, FiEdit2
} from 'react-icons/fi';

interface ItemNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parent_id: string | null;
  size?: string;
  url?: string;
  content?: string;
  created_at: string;
}

export default function FileManagementPage() {
  const { mode, colorTheme, getThemeClasses } = useTheme();
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  



const getCardStyle = () => {
    if (mode === 'light') {
      switch (colorTheme) {
        case 'indigo': return 'bg-indigo-100 text-indigo-950 border border-indigo-300 shadow-md';
        case 'emerald': return 'bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-md';
        case 'slate': 
        case 'midnight': 
        case 'dark': return 'bg-slate-200 text-slate-900 border border-slate-300 shadow-md';
        case 'purple': return 'bg-purple-100 text-purple-950 border border-purple-300 shadow-md';
        case 'rose': return 'bg-rose-100 text-rose-950 border border-rose-300 shadow-md';
        case 'amber': return 'bg-amber-100 text-amber-950 border border-amber-300 shadow-md';
        case 'cyan': return 'bg-cyan-100 text-cyan-950 border border-cyan-300 shadow-md';
        case 'red': return 'bg-red-100 text-red-950 border border-red-300 shadow-md';
        case 'navy':
        default: return 'bg-slate-100 text-slate-900 border border-slate-300 shadow-md';
      }
    } else {
      switch (colorTheme) {
        case 'indigo': return 'bg-[#3730a3] text-white shadow-xl border border-indigo-700/50';
        case 'emerald': return 'bg-[#047857] text-white shadow-xl border border-emerald-700/50';
        case 'slate': return 'bg-slate-900 text-white shadow-xl border border-slate-800';
        case 'midnight': return 'bg-[#0f172a] text-white shadow-xl border border-indigo-950';
        case 'purple': return 'bg-[#581c87] text-white shadow-xl border border-purple-900';
        case 'rose': return 'bg-[#9f1239] text-white shadow-xl border border-rose-900';
        case 'amber': return 'bg-[#92400e] text-white shadow-xl border border-amber-900';
        case 'cyan': return 'bg-[#0e7490] text-white shadow-xl border border-cyan-900';
        case 'red': return 'bg-[#991b1b] text-white shadow-xl border border-red-900';
        case 'dark': return 'bg-zinc-900 text-white shadow-xl border border-zinc-800';
        case 'navy':
        default: return 'bg-[#1B2A35] text-white shadow-xl border border-slate-700/60';
      }
    }
  };




  const handleRename = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    logActivity(
      'Manager data',
      `Informasi nama folder berhasil di ubah.`,
      'update'
    );

    try {
      const { error } = await supabase
        .from('file_managers')
        .update({ name: editName.trim() })
        .eq('id', id);

      if (error) throw error;

      setItems(items.map(item => item.id === id ? { ...item, name: editName.trim() } : item));
      setEditingId(null);
      setEditName('');
    } catch (error: any) {
      console.error('Gagal mengganti nama:', error);
      alert(`Gagal mengganti nama: ${error.message || 'Terjadi kesalahan'}`);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Tangkap event Paste (Ctrl+V) secara global
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
      const folderNameClean = newFolderName.trim();
      const newFolderData = {
        name: folderNameClean,
        type: 'folder' as const,
        parent_id: currentFolderId,
      };

      // 1. Kirim data ke Supabase terlebih dahulu
      const { data, error } = await supabase
        .from('file_managers')
        .insert([newFolderData])
        .select();

      if (error) throw error;

      if (data) {
        setItems([data[0], ...items]);
        setNewFolderName('');
        setIsCreatingFolder(false);

        // 2. CATAT KE LOG HANYA KETIKA BERHASIL TERSIMPAN DI DATABASE
// ✅ KODE YANG BENAR (cukup panggil tanpa parameter tambahan):
logActivity(
  'Manager Data',
  `Berhasil membuat folder dengan nama: "${folderNameClean}"`,
  'text-emerald-500', // Warna indikator (opsional)
  'update'
);
      }
    } catch (error: any) {
      console.error('Gagal membuat folder:', error);
      alert(`Gagal membuat folder: ${error.message || 'Terjadi kesalahan'}`);
    }
  };





  const uploadFileToSupabase = async (file: File) => {
    try {
      let fileContent = null;
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      const textExtensions = ['txt', 'bat', 'js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'env', 'local', 'md', 'sh', 'ini', 'log'];
      
      if (textExtensions.includes(fileExt || '') || file.name.startsWith('.')) {
        fileContent = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result);
          reader.readAsText(file);
        });
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      const filePublicUrl = publicUrlData.publicUrl;

      const newFileData = {
        name: file.name || `Pasted-File-${Date.now()}`,
        type: 'file' as const,
        parent_id: currentFolderId,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: filePublicUrl,
        content: fileContent,
      };

      logActivity(
      'Manager data',
      `Informasi berhasil upload file .`,
      'update'
    );

      const { data, error: dbError } = await supabase
        .from('file_managers')
        .insert([newFileData])
        .select();

      if (dbError) throw dbError;

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

    logActivity(
      'Manager data',
      `Informasi berhasil delete item`,
      'update'
    );


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

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return <FiImage className="w-7 h-7 text-emerald-500" />;
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FiFileText className="w-7 h-7 text-blue-500" />;
      case 'js':
      case 'ts':
      case 'tsx':
      case 'jsx':
      case 'html':
      case 'css':
      case 'bat':
      case 'json':
        return <FiCode className="w-7 h-7 text-amber-500" />;
      case 'mp3':
      case 'wav':
        return <FiMusic className="w-7 h-7 text-purple-500" />;
      case 'mp4':
      case 'mkv':
        return <FiVideo className="w-7 h-7 text-rose-500" />;
      case 'zip':
      case 'rar':
      case 'tar':
        return <FiArchive className="w-7 h-7 text-yellow-500" />;
      default:
        return <FiFile className="w-7 h-7 text-blue-400" />;
    }
  };

  return (
    <div className={`p-0 space-y-6 max-w-10xl mx-auto min-h-screen transition-colors ${
      isDark ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* HEADER & BREADCRUMB */}
      <div className={`p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${getCardStyle()}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium opacity-70">
            <span className="cursor-pointer hover:underline" onClick={() => setCurrentFolderId(null)}>File Manager</span>
            {currentFolderId !== null && (
              <>
                <FiChevronRight className="w-3.5 h-3.5" />
                <span className="font-semibold">
                  {getCurrentFolderName()}
                </span>
              </>
            )}
          </div>
          <h1 className="text-xl font-bold">Penyimpanan Berkas & Direktori</h1>
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

      {/* DROPZONE / AREA PASTE GAMBAR */}
      <div 
        ref={pasteAreaRef}
        tabIndex={0}
        className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${getCardStyle()}`}
        onClick={() => {
          if (fileInputRef.current) fileInputRef.current.click();
        }}
      >
        <div className={`p-3 rounded-full ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          <FiClipboard className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold">Klik di sini lalu tekan <kbd className="px-1.5 py-0.5 border rounded bg-indigo-600 text-white font-mono">Ctrl + V</kbd> untuk menempel gambar</p>
          <p className="text-[11px] opacity-70 mt-1">Atau klik untuk memilih file dari komputer Anda</p>
        </div>
      </div>

      {/* FILTER BAR: PENCARIAN & TOGGLE */}
      <div className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${getCardStyle()}`}>
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input 
            type="text"
            placeholder="Cari berkas atau folder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-xs border rounded-xl outline-none ${
              isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
            }`}
          />
        </div>

        <div className={`flex items-center p-1 border rounded-xl ${
          isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-100 border-slate-300'
        }`}>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'grid' 
                ? 'bg-blue-600 text-white shadow-sm' 
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
                ? 'bg-blue-600 text-white shadow-sm' 
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
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 ${getCardStyle()}`}>
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
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300'
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
      <div className={`p-6 rounded-2xl shadow-sm space-y-4 min-h-[400px] flex flex-col ${getCardStyle()}`}>
        <div className={`text-xs font-medium pb-3 border-b flex justify-between items-center opacity-80 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <span>Lokasi: <strong className="font-semibold">{getCurrentFolderName()}</strong></span>
          <span>Total Item: {currentItems.length}</span>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs opacity-60 py-24">
            <span>Memuat data...</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-xs opacity-60 py-24 space-y-2">
            <FiFolder className="w-10 h-10 opacity-30" />
            <span>Folder ini masih kosong atau pencarian tidak ditemukan.</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {currentItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  if (editingId === item.id) return;
                  if (item.type === 'folder') {
                    setCurrentFolderId(item.id);
                  } else {
                    setSelectedFile(item);
                  }
                }}
                className={`group relative p-4 border rounded-2xl flex items-center justify-between transition-all shadow-sm cursor-pointer ${getCardStyle()}`}
              >
                <div className="flex items-center gap-3 truncate w-full">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    item.type === 'folder' 
                      ? (isDark ? 'bg-amber-950/40 text-amber-400' : 'bg-amber-50 text-amber-600')
                      : (isDark ? 'bg-blue-950/40 text-blue-400' : 'bg-blue-50 text-blue-600')
                  }`}>
                    {item.type === 'folder' ? <FiFolder className="w-10 h-10" /> : getFileIcon(item.name)}
                  </div>
                  
                  {editingId === item.id ? (
                    <form onSubmit={(e) => handleRename(item.id, e)} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 w-full">
                      <input 
                        type="text"
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`w-full px-2 py-1 text-xs border rounded-lg outline-none ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                        }`}
                      />
                      <button type="submit" className="p-1.5 bg-indigo-600 text-white rounded-lg text-xs" title="Simpan">
                        <FiCheck className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="p-1.5 bg-slate-600 text-white rounded-lg text-xs" title="Batal">
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="truncate w-full">
                      <h3 className="text-xs font-bold truncate">
                        {item.name}
                      </h3>
                      <p className="text-[10px] opacity-60">
                        {item.type === 'folder' ? 'Folder' : item.size || 'File Dokumen'} • {item.created_at?.split('T')[0]}
                      </p>
                    </div>
                  )}
                </div>

                {editingId !== item.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(item.id);
                        setEditName(item.name);
                      }}
                      className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-500 transition-colors"
                      title="Ubah Nama"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors"
                      title="Hapus"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b opacity-80 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <tr>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Ukuran</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/10">
                {currentItems.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => {
                      if (editingId === item.id) return;
                      if (item.type === 'folder') setCurrentFolderId(item.id);
                      else setSelectedFile(item);
                    }}
                    className="cursor-pointer transition-colors hover:opacity-75"
                  >
                    <td className="py-3 px-4 flex items-center gap-3 font-medium">
                      {item.type === 'folder' ? <FiFolder className="w-4 h-4 text-amber-500" /> : getFileIcon(item.name)}
                      
                      {editingId === item.id ? (
                        <form onSubmit={(e) => handleRename(item.id, e)} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 w-full">
                          <input 
                            type="text"
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className={`w-full px-2 py-1 text-xs border rounded-lg outline-none ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                            }`}
                          />
                          <button type="submit" className="p-1 bg-indigo-600 text-white rounded text-xs"><FiCheck className="w-3 h-3" /></button>
                          <button type="button" onClick={() => setEditingId(null)} className="p-1 bg-slate-600 text-white rounded text-xs"><FiX className="w-3 h-3" /></button>
                        </form>
                      ) : (
                        <span>{item.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 opacity-70 uppercase">{item.type}</td>
                    <td className="py-3 px-4 opacity-70">{item.size || '-'}</td>
                    <td className="py-3 px-4 opacity-70">{item.created_at?.split('T')[0]}</td>
                    <td className="py-3 px-4 text-right">
                      {editingId !== item.id && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(item.id);
                              setEditName(item.name);
                            }}
                            className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-500 transition-colors"
                            title="Ubah Nama"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors"
                            title="Hapus"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className={`transition-all duration-300 rounded-2xl shadow-2xl border overflow-hidden relative flex flex-col ${
            isMaximized 
              ? 'w-full h-full max-w-none max-h-none rounded-none' 
              : 'w-full max-w-lg'
          } ${getCardStyle()}`}>
            
            {/* HEADER MODAL */}
            <div className={`flex items-center justify-between px-5 py-3 border-b shrink-0 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <h3 className="text-xs font-bold truncate flex items-center gap-2">
                <span className="scale-75 origin-left inline-block">
                  {getFileIcon(selectedFile.name)}
                </span> 
                {selectedFile.name}
              </h3>

              <div className="flex items-center gap-3 opacity-70">
                <button 
                  onClick={() => {
                    setIsMinimized(false);
                    setIsMaximized(false);
                  }} 
                  className="hover:text-indigo-500 transition-colors p-1"
                  title="Beranda / Reset"
                >
                  <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                </button>
                
                <button 
                  onClick={() => setIsMinimized(!isMinimized)} 
                  className="hover:text-indigo-500 transition-colors p-1"
                  title="Minimize"
                >
                  <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"/></svg>
                </button>

                <button 
                  onClick={() => setIsMaximized(!isMaximized)} 
                  className="hover:text-indigo-500 transition-colors p-1"
                  title="Maximize"
                >
                  <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                </button>

                <button 
                  onClick={() => setSelectedFile(null)} 
                  className="hover:text-red-500 transition-colors p-1"
                  title="Tutup"
                >
                  <FiX className="w-4 h-4 pointer-events-none" />
                </button>
              </div>
            </div>

            {/* KONTEN UTAMA MODAL */}
            {!isMinimized && (
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {selectedFile.url && (
                  <div className={`w-full rounded-xl overflow-hidden flex items-center justify-center border ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  } ${isMaximized ? 'h-[60vh]' : 'h-64'}`}>
                    <TextViewer 
                      file={selectedFile} 
                      isDark={isDark} 
                      onUpdateContent={(fileId, newContent) => {
                        setItems(items.map(item => item.id === fileId ? { ...item, content: newContent } : item));
                        setSelectedFile({ ...selectedFile, content: newContent });
                      }} 
                    />
                  </div>
                )}

                <div className="relative group p-2 rounded-xl transition-all">
                  <div className="text-xs opacity-60 text-center py-3 group-hover:hidden border border-dashed rounded-xl border-slate-700/50">
                    Arahkan kursor ke sini untuk melihat detail & URL file...
                  </div>

                  <div className="space-y-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <div className="space-y-1 text-xs opacity-70">
                      <p>Ukuran: <span className="font-medium">{selectedFile.size || 'Tidak diketahui'}</span></p>
                      <p>Dibuat: <span className="font-medium">{selectedFile.created_at}</span></p>
                    </div>

                    {selectedFile.url && (
                      <div className="flex items-center gap-2 pt-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={selectedFile.url} 
                          className={`w-full px-3 py-2 text-xs border rounded-xl outline-none ${
                            isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300'
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

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

function TextViewer({ 
  file, 
  isDark, 
  onUpdateContent 
}: { 
  file: ItemNode; 
  isDark: boolean; 
  onUpdateContent: (fileId: string, newContent: string) => void 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<string>('Memuat isi file...');
  const [editedContent, setEditedContent] = useState<string>('');
  const [loadingSave, setLoadingSave] = useState(false);

  useEffect(() => {
    if (file.content !== null && file.content !== undefined) {
      setContent(file.content);
      setEditedContent(file.content);
    } else if (file.url) {
      fetch(file.url)
        .then(res => res.text())
        .then(text => {
          setContent(text);
          setEditedContent(text);
        })
        .catch(() => {
          setContent('Gagal memuat isi file.');
          setEditedContent('Gagal memuat isi file.');
        });
    }
  }, [file]);

  const handleSave = async () => {
    setLoadingSave(true);
    try {
      const { error } = await supabase
        .from('file_managers')
        .update({ content: editedContent })
        .eq('id', file.id);

      if (error) throw error;

      setContent(editedContent);
      setIsEditing(false);
      onUpdateContent(file.id, editedContent);
      alert('Perubahan berhasil disimpan!');
    } catch (error: any) {
      console.error('Gagal menyimpan:', error);
      alert(`Gagal menyimpan perubahan: ${error.message}`);
    } finally {
      setLoadingSave(false);
    }
  };

  const ext = file.name?.split('.').pop()?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950">
        <img src={file.url} alt={file.name} className="max-h-full max-w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-950">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs shrink-0">
        <span className="text-slate-400 font-mono">
          {isEditing ? 'Mode Edit Teks' : 'Pratinjau Isi File'}
        </span>
        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setIsEditing(false); setEditedContent(content); }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={loadingSave}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {loadingSave ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
            >
              Edit File
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full flex-1 p-3 bg-slate-950 text-emerald-400 font-mono text-xs outline-none resize-none"
        />
      ) : (
        <div className="p-3 flex-1 overflow-auto font-mono text-xs text-emerald-400 text-left">
          <pre className="whitespace-pre-wrap">{content || '(File kosong)'}</pre>
        </div>
      )}
    </div>
  );
}