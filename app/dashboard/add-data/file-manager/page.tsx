'use client';
import { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiFolder, FiUpload, FiLink, FiTrash2, FiSearch, 
  FiGrid, FiList, FiFile, FiArrowLeft, FiX, FiEye 
} from 'react-icons/fi';

interface FileItem {
  id: string;
  name: string;
  type: 'excel' | 'folder' | 'code' | 'archive' | 'app' | 'other';
  size: string;
  date: string;
  parentFolder?: string;
  content?: string;
}

const initialFiles: FileItem[] = [
  { id: '1', name: 'coin-report-202609', type: 'excel', size: '2.4 MB', date: '19 Sep 2026', parentFolder: 'root', content: 'Contoh data laporan keuangan koin: \n- Baris 1: Deposit ID #9921 - 20.000\n- Baris 2: Withdraw ID #9922 - 15.000\n- Status: Success' },
  { id: '2', name: 'Laporan Bonus(3)', type: 'excel', size: '1.1 MB', date: '18 Sep 2026', parentFolder: 'root', content: 'Rincian Laporan Bonus Member:\n- Bonus Referral: Rp 500.000\n- Bonus Cashback: Rp 250.000' },
  { id: '3', name: 'Vysor-win-5.0.7', type: 'app', size: '45.2 MB', date: '18 Sep 2026', parentFolder: 'root', content: 'File Installer Aplikasi Desktop (.exe)' },
  { id: '4', name: 'Python-3.14.7.tar', type: 'archive', size: '120 MB', date: '15 Sep 2026', parentFolder: 'root', content: 'Arsip source code python environment.' },
  { id: '9', name: 'tes', type: 'folder', size: '--', date: '15 Sep 2026', parentFolder: 'root' },
  { id: '10', name: 'Telegram Desktop', type: 'folder', size: '--', date: '14 Sep 2026', parentFolder: 'root' },
  { id: '12', name: 'catatan-penting.txt', type: 'other', size: '15 KB', date: '15 Sep 2026', parentFolder: 'tes', content: 'Catatan rahasia: Pastikan konfigurasi database Supabase sudah aman sebelum deployment.' },
  { id: '13', name: 'config-backup.json', type: 'code', size: '4 KB', date: '15 Sep 2026', parentFolder: 'tes', content: '{\n  "theme": "dark",\n  "version": "1.0.4",\n  "debug": false\n}' },
];

export default function FileManagerPage() {
  const { mode } = useTheme();
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<FileItem | null>(null);

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'excel':
        return <div className="w-12 h-14 bg-emerald-600 rounded flex flex-col items-center justify-center text-white font-bold text-xs shadow-md">XLS</div>;
      case 'folder':
        return <FiFolder className="w-14 h-14 text-amber-400 fill-amber-400/20" />;
      case 'code':
        return <div className="w-12 h-14 bg-sky-600 rounded flex flex-col items-center justify-center text-white font-bold text-xs shadow-md">{ }</div>;
      case 'archive':
        return <div className="w-12 h-14 bg-amber-700 rounded flex flex-col items-center justify-center text-white font-bold text-xs shadow-md">ZIP</div>;
      case 'app':
        return <div className="w-12 h-14 bg-blue-600 rounded flex flex-col items-center justify-center text-white font-bold text-xs shadow-md">APP</div>;
      default:
        return <FiFile className="w-12 h-14 text-slate-400" />;
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'folder') {
      setCurrentFolder(item.name);
      setSearchQuery('');
    } else {
      setSelectedFileForPreview(item);
    }
  };

  // Handler Upload Folder & File Sekaligus
  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFiles = Array.from(e.target.files);
      const newEntries: FileItem[] = [];
      const discoveredFolders = new Set<string>();

      uploadedFiles.forEach((file: any) => {
        // Mendapatkan path relatif file (misal: "NamaFolder/subfolder/file.txt")
        const relativePath = file.webkitRelativePath || file.name;
        const pathSegments = relativePath.split('/');

        if (pathSegments.length > 1) {
          // Jika di dalam folder, catat folder utamanya agar otomatis menjadi folder baru di UI
          const rootFolderName = pathSegments[0];
          discoveredFolders.add(rootFolderName);

          // Jika file berada tepat di dalam root folder tersebut
          if (pathSegments.length === 2 && currentFolder === 'root') {
            newEntries.push({
              id: `${Date.now()}-${Math.random()}`,
              name: file.name,
              type: file.name.endsWith('.xlsx') ? 'excel' : 'other',
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              date: 'Baru saja',
              parentFolder: rootFolderName,
              content: `File dari folder ${rootFolderName}/${file.name}`
            });
          }
        } else {
          // File biasa tanpa struktur folder
          newEntries.push({
            id: `${Date.now()}-${Math.random()}`,
            name: file.name,
            type: file.name.endsWith('.xlsx') ? 'excel' : 'other',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            date: 'Baru saja',
            parentFolder: currentFolder,
            content: `File upload: ${file.name}`
          });
        }
      });

      // Tambahkan ikon folder baru ke daftar jika ditemukan folder saat upload
      discoveredFolders.forEach((folderName) => {
        const folderExists = files.some(f => f.name === folderName && f.parentFolder === 'root');
        if (!folderExists && currentFolder === 'root') {
          newEntries.push({
            id: `${Date.now()}-dir-${folderName}`,
            name: folderName,
            type: 'folder',
            size: '--',
            date: 'Baru saja',
            parentFolder: 'root'
          });
        }
      });

      setFiles(prev => [...newEntries, ...prev]);
    }
  };

  const displayedFiles = files.filter(f => {
    const matchesFolder = f.parentFolder === currentFolder;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 relative">
      
      {/* HEADER & TOOLBAR */}
      <div className={`p-5 rounded-2xl border transition-colors ${getCardStyle()}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {currentFolder !== 'root' && (
              <button 
                onClick={() => setCurrentFolder('root')} 
                className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 transition"
                title="Kembali"
              >
                <FiArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                File Manager <span className="text-xs font-normal opacity-60">/ {currentFolder}</span>
              </h1>
              <p className="text-xs opacity-70 mt-0.5">
                {currentFolder === 'root' ? 'Kelola dokumen dan direktori utama.' : `Folder aktif: ${currentFolder}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`flex items-center px-3 py-2 rounded-xl border ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'} w-full md:w-64`}>
              <FiSearch className="opacity-50 mr-2" />
              <input 
                type="text" 
                placeholder="Cari file..." 
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

        {/* INPUT UPLOAD FOLDER & FILE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/20">
          <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition ${mode === 'light' ? 'border-slate-300 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-800/50'}`}>
            <FiUpload className="text-blue-500 text-xl" />
            <div className="text-left">
              <p className="text-xs font-semibold">Upload Folder / File ke &quot;{currentFolder}&quot;</p>
              <p className="text-[10px] opacity-60">Pilih folder atau dokumen dari perangkat</p>
            </div>
            {/* Atribut webkitdirectory & directory diaktifkan di sini */}
            <input 
              type="file" 
              onChange={handleFolderUpload} 
              className="hidden" 
              {...({ webkitdirectory: "", directory: "" } as any)}
            />
          </label>

          <div className={`flex items-center p-3 rounded-xl border ${mode === 'light' ? 'border-slate-300 bg-slate-50' : 'border-slate-700 bg-[#0f172a]'}`}>
            <FiLink className="text-blue-500 ml-2 mr-2" size={18} />
            <input 
              type="url" 
              placeholder="Paste URL file di sini..." 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full px-2"
            />
            <button 
              onClick={() => {
                if(!urlInput) return;
                const newEntry: FileItem = { 
                  id: Date.now().toString(), 
                  name: urlInput.split('/').pop() || 'file-url', 
                  type: 'other', 
                  size: 'External', 
                  date: 'Baru saja', 
                  parentFolder: currentFolder,
                  content: `Sumber URL Eksternal: ${urlInput}` 
                };
                setFiles([newEntry, ...files]);
                setUrlInput('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>

      {/* AREA KONTEN FILE */}
      <div className={`min-h-[400px] p-6 rounded-2xl border transition-all ${getCardStyle()}`}>
        <div className="mb-4 flex justify-between items-center text-xs opacity-70 font-medium">
          <span>Direktori: {currentFolder} ({displayedFiles.length} item)</span>
          {currentFolder !== 'root' && (
            <button onClick={() => setCurrentFolder('root')} className="text-blue-500 hover:underline">
              &larr; Kembali ke Utama
            </button>
          )}
        </div>

        {displayedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 text-xs">
            <FiFolder size={48} className="mb-2" />
            <p>Folder ini kosong.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {displayedFiles.map((file) => (
              <div 
                key={file.id} 
                onClick={() => handleItemClick(file)}
                className="group flex flex-col items-center p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition border border-transparent hover:border-blue-500/30 relative"
              >
                <div className="mb-2 transition transform group-hover:scale-105 relative">
                  {getFileIcon(file.type)}
                  {file.type !== 'folder' && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                      <FiEye size={10} />
                    </span>
                  )}
                </div>
                <span className="text-xs text-center font-medium line-clamp-2 w-full mt-1" title={file.name}>
                  {file.name}
                </span>
                <span className="text-[10px] opacity-50 mt-0.5">{file.size}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700/20 opacity-60">
                  <th className="pb-3 font-semibold">Nama Berkas</th>
                  <th className="pb-3 font-semibold">Ukuran</th>
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10">
                {displayedFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    onClick={() => handleItemClick(file)}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                  >
                    <td className="py-3 flex items-center gap-3 font-medium">
                      <div className="w-8 h-8 flex items-center justify-center scale-75 origin-left">
                        {getFileIcon(file.type)}
                      </div>
                      <span className="truncate max-w-xs">{file.name}</span>
                    </td>
                    <td className="py-3 opacity-70">{file.size}</td>
                    <td className="py-3 opacity-70">{file.date}</td>
                    <td className="py-3 text-right flex items-center justify-end gap-2">
                      {file.type !== 'folder' && (
                        <span className="text-blue-500 hover:underline flex items-center gap-1 text-[11px]">
                          <FiEye size={12} /> Buka
                        </span>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFiles(files.filter(f => f.id !== file.id)); }}
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

      {/* MODAL PREVIEW */}
      {selectedFileForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl rounded-2xl p-6 border shadow-2xl relative ${mode === 'light' ? 'bg-white text-slate-900 border-slate-200' : 'bg-[#16222A] text-slate-100 border-slate-700'}`}>
            <button 
              onClick={() => setSelectedFileForPreview(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
            >
              <FiX size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="scale-75 origin-left">
                {getFileIcon(selectedFileForPreview.type)}
              </div>
              <div>
                <h2 className="text-base font-bold">{selectedFileForPreview.name}</h2>
                <p className="text-xs opacity-60">Ukuran: {selectedFileForPreview.size} • Diperbarui: {selectedFileForPreview.date}</p>
              </div>
            </div>

            <div className={`w-full h-64 p-4 rounded-xl border overflow-y-auto font-mono text-xs whitespace-pre-wrap ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700 text-slate-300'}`}>
              {selectedFileForPreview.content || "Tidak ada pratonton teks tersedia untuk berkas ini."}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setSelectedFileForPreview(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}