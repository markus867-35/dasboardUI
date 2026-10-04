'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTheme } from '@/app/context/ThemeContext'; 
import { 
  Folder, FolderPlus, FileText, Plus, Trash2, Edit3, 
  Save, X, ChevronRight, Menu, Search 
} from 'lucide-react';

// Inisialisasi Supabase Client (Sesuaikan dengan file config Anda jika ada)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface FolderType {
  id: string;
  name: string;
}

interface NoteType {
  id: string;
  folder_id: string;
  title: string;
  content: string;
  updated_at: string;
}

export default function NoteManagerPage() {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);

  // State untuk form & modal
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editedFolderName, setEditedFolderName] = useState('');

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isEditingNoteTitle, setIsEditingNoteTitle] = useState(false);
  const [editedNoteTitle, setEditedNoteTitle] = useState('');
  
  const [noteContent, setNoteContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);


  const { mode } = useTheme(); 
  const isDark = mode === 'dark';

  // 1. Fetch Folders
  const fetchFolders = async () => {
    const { data, error } = await supabase.from('folders').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setFolders(data);
      if (data.length > 0 && !selectedFolderId) {
        setSelectedFolderId(data[0].id);
      }
    }
  };

  // 2. Fetch Notes berdasarkan Folder yang dipilih
  const fetchNotes = async (folderId: string) => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('folder_id', folderId)
      .order('updated_at', { ascending: false });
    if (!error && data) {
      setNotes(data);
      if (data.length > 0) {
        setSelectedNote(data[0]);
        setNoteContent(data[0].content || '');
      } else {
        setSelectedNote(null);
        setNoteContent('');
      }
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolderId) {
      fetchNotes(selectedFolderId);
    } else {
      setNotes([]);
      setSelectedNote(null);
    }
  }, [selectedFolderId]);

  // Sinkronisasi isi catatan saat berpilih catatan
  useEffect(() => {
    if (selectedNote) {
      setNoteContent(selectedNote.content || '');
    }
  }, [selectedNote]);

  // --- CRUD FOLDER ---
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const { data, error } = await supabase
      .from('folders')
      .insert([{ name: newFolderName.trim() }])
      .select();

    if (!error && data) {
      setNewFolderName('');
      setIsCreatingFolder(false);
      await fetchFolders();
      setSelectedFolderId(data[0].id);
    } else {
      alert('Gagal membuat folder: ' + error?.message);
    }
  };

  const handleUpdateFolder = async (folderId: string) => {
    if (!editedFolderName.trim()) return;
    const { error } = await supabase
      .from('folders')
      .update({ name: editedFolderName.trim() })
      .eq('id', folderId);

    if (!error) {
      setEditingFolderId(null);
      fetchFolders();
    } else {
      alert('Gagal mengubah nama folder');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Hapus folder ini beserta seluruh catatan di dalamnya?')) return;
    const { error } = await supabase.from('folders').delete().eq('id', folderId);
    if (!error) {
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
        setSelectedNote(null);
      }
      fetchFolders();
    } else {
      alert('Gagal menghapus folder');
    }
  };

  // --- CRUD NOTE ---
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !selectedFolderId) return;

    const { data, error } = await supabase
      .from('notes')
      .insert([{
        folder_id: selectedFolderId,
        title: newNoteTitle.trim(),
        content: '',
        updated_at: new Date().toISOString()
      }])
      .select();

    if (!error && data) {
      setNewNoteTitle('');
      setIsCreatingNote(false);
      await fetchNotes(selectedFolderId);
      setSelectedNote(data[0]);
    } else {
      alert('Gagal membuat catatan: ' + error?.message);
    }
  };

  const handleSaveNoteContent = async () => {
    if (!selectedNote) return;
    setLoading(true);

    const { error } = await supabase
      .from('notes')
      .update({ 
        content: noteContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedNote.id);

    setLoading(false);
    if (error) {
      alert('Gagal menyimpan catatan!');
    } else {
      // Perbarui state lokal
      setSelectedNote({ ...selectedNote, content: noteContent });
    }
  };

  const handleUpdateNoteTitle = async () => {
    if (!selectedNote || !editedNoteTitle.trim()) return;

    const { error } = await supabase
      .from('notes')
      .update({ 
        title: editedNoteTitle.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedNote.id);

    if (!error) {
      setSelectedNote({ ...selectedNote, title: editedNoteTitle.trim() });
      setIsEditingNoteTitle(false);
      if (selectedFolderId) fetchNotes(selectedFolderId);
    } else {
      alert('Gagal mengubah judul catatan');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Hapus catatan ini?')) return;
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    if (!error) {
      if (selectedFolderId) fetchNotes(selectedFolderId);
    } else {
      alert('Gagal menghapus catatan');
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

return (
    <div className={`flex h-screen overflow-hidden font-sans ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#111827] text-slate-100'}`}>
      
      {/* SIDEBAR: FOLDERS */}
      <div className={`w-64 border-r flex flex-col ${isDark ? 'bg-[#1F2937] border-slate-700/60' : 'bg-white border-slate-200'}`}>
        <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <h1 className="font-bold text-lg tracking-wide text-indigo-400 flex items-center gap-2">
            <Folder className="w-5 h-5 text-indigo-400" /> Daftar Folder
          </h1>
          <button 
            onClick={() => setIsCreatingFolder(true)}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition"
            title="Buat Folder Baru"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Input Buat Folder */}
        {isCreatingFolder && (
          <form onSubmit={handleCreateFolder} className={`p-3 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
            <input 
              type="text" 
              placeholder="Nama folder..." 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:border-indigo-500 mb-2 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreatingFolder(false)} className="px-2 py-1 text-xs text-slate-400 hover:text-white">Batal</button>
              <button type="submit" className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs rounded text-white font-medium">Simpan</button>
            </div>
          </form>
        )}

        {/* List Folder */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {folders.map(folder => (
            <div key={folder.id}>
              {editingFolderId === folder.id ? (
                <div className={`p-2 rounded-lg space-y-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <input 
                    type="text" 
                    value={editedFolderName}
                    onChange={(e) => setEditedFolderName(e.target.value)}
                    className={`w-full px-2 py-1 text-xs border border-indigo-500 rounded focus:outline-none ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
                    autoFocus
                  />
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setEditingFolderId(null)} className="px-2 py-0.5 text-xs text-slate-400">Batal</button>
                    <button onClick={() => handleUpdateFolder(folder.id)} className="px-2 py-0.5 bg-indigo-600 text-xs rounded text-white">Ubah</button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition ${selectedFolderId === folder.id ? (isDark ? 'bg-[#222D3D] text-indigo-300 font-medium border-l-4 border-indigo-500' : 'bg-indigo-50 text-indigo-600 font-medium border-l-4 border-indigo-600') : (isDark ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-100 text-slate-600')}`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className={`w-4 h-4 ${selectedFolderId === folder.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="truncate text-sm">{folder.name}</span>
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingFolderId(folder.id); setEditedFolderName(folder.name); }}
                      className="p-1 text-slate-400 hover:text-indigo-400 rounded"
                      title="Edit Nama Folder"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                      className="p-1 text-slate-400 hover:text-red-400 rounded"
                      title="Hapus Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {folders.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-6">Belum ada folder. Buat folder baru terlebih dahulu.</p>
          )}
        </div>
      </div>

      {/* SUB-SIDEBAR: NOTES LIST */}
      <div className={`w-72 border-r flex flex-col ${isDark ? 'bg-[#1A2230] border-slate-700/60' : 'bg-white border-slate-200'}`}>
        <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <h2 className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Daftar Catatan</h2>
          <button 
            disabled={!selectedFolderId}
            onClick={() => setIsCreatingNote(true)}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-white transition"
            title="Buat Catatan Baru"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search Notes */}
        <div className={`p-3 border-b ${isDark ? 'border-slate-700/40' : 'border-slate-200'}`}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari catatan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            />
          </div>
        </div>

        {/* Input Buat Catatan */}
        {isCreatingNote && (
          <form onSubmit={handleCreateNote} className={`p-3 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
            <input 
              type="text" 
              placeholder="Judul catatan..." 
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:border-indigo-500 mb-2 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreatingNote(false)} className="px-2 py-1 text-xs text-slate-400 hover:text-white">Batal</button>
              <button type="submit" className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs rounded text-white font-medium">Buat</button>
            </div>
          </form>
        )}

        {/* List Catatan */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.map(note => (
            <div 
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${selectedNote?.id === note.id ? (isDark ? 'bg-[#222D3D] border-l-4 border-amber-500 text-white' : 'bg-amber-50 border-l-4 border-amber-500 text-slate-900') : (isDark ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-100 text-slate-600')}`}
            >
              <div className="flex items-start gap-2.5 truncate">
                <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${selectedNote?.id === note.id ? 'text-amber-400' : 'text-slate-400'}`} />
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{note.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{note.content || 'Kosong'}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 rounded transition"
                title="Hapus Catatan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-6">Tidak ada catatan di folder ini.</p>
          )}
        </div>
      </div>

      {/* MAIN CONTENT: NOTEPAD EDITOR */}
      <div className={`flex-1 flex flex-col ${isDark ? 'bg-[#111827]' : 'bg-slate-50'}`}>
        {selectedNote ? (
          <>
            {/* Header Notepad */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700/60 bg-[#1A2230]/50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400" />
                {isEditingNoteTitle ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editedNoteTitle}
                      onChange={(e) => setEditedNoteTitle(e.target.value)}
                      className={`px-2.5 py-1 text-sm border border-indigo-500 rounded focus:outline-none ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
                      autoFocus
                    />
                    <button onClick={handleUpdateNoteTitle} className="px-3 py-1 bg-indigo-600 text-xs rounded text-white hover:bg-indigo-500">Simpan</button>
                    <button onClick={() => setIsEditingNoteTitle(false)} className="px-2 py-1 text-xs text-slate-400">Batal</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setIsEditingNoteTitle(true); setEditedNoteTitle(selectedNote.title); }}>
                    <h2 className={`text-lg font-semibold transition ${isDark ? 'text-white group-hover:text-indigo-300' : 'text-slate-800 group-hover:text-indigo-600'}`}>{selectedNote.title}</h2>
                    <Edit3 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                )}
              </div>

              {/* Tombol Simpan Manual */}
              <button 
                onClick={handleSaveNoteContent}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium shadow-lg transition"
              >
                <Save className="w-4 h-4" /> {loading ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>
            </div>

            {/* Area Teks Notepad */}
            <div className="flex-1 p-6 flex flex-col">
              <textarea 
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Mulai menulis catatan di sini..."
                className={`w-full flex-1 bg-transparent resize-none focus:outline-none text-base leading-relaxed font-mono placeholder:text-slate-500 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
            <FileText className="w-16 h-16 mb-3 stroke-1 text-slate-600" />
            <p className="text-base font-medium">Pilih atau buat catatan baru</p>
            <p className="text-xs text-slate-600 mt-1">Pilih salah satu folder di sebelah kiri untuk melihat dan mengelola catatan Anda.</p>
          </div>
        )}
      </div>

    </div>
  );
}