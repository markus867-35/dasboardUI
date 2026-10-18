'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // <-- Cukup gunakan ini saja
import { useTheme } from '@/app/context/ThemeContext'; 
import { logActivity } from '@/app/utils/activityLogger'; // Impor helper logger
import { 
  Folder, FolderPlus, FileText, Plus, Trash2, Edit3, 
  Save, X, ChevronRight, Menu, Search, Table as TableIcon, Image as ImageIcon, Bold, Italic, List, ListOrdered ,AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';

// Import TipTap untuk Rich Text Editor (Tabel & Gambar)
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';

// HAPUS baris-baris ini karena 'supabase' sudah diimpor di atas:
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

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


// --- CUSTOM TABLE CELL & HEADER AGAR BISA DIWARNAI BACKGROUNDNYA ---
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor.replace(/['"]+/g, ''),
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {};
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
    };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor.replace(/['"]+/g, ''),
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {};
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
    };
  },
});

function NoteEditorComponent({ content, onChange, isDark }: { content: string; onChange: (html: string) => void; isDark: boolean }) {
const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily,
      // Highlight.configure({ multicolor: true }), // <-- Hapus atau komen baris ini agar tidak error
Image.configure({
  allowBase64: true,
  inline: true,
  HTMLAttributes: {
    class: 'draggable-image',
  },
}).extend({
  // Menandai node gambar agar bisa ditarik/digeser oleh mouse
  draggable: true, 
}),
      TextAlign.configure({ types: ['heading', 'paragraph'] }), // <-- Tambahkan ini
      Table.configure({ resizable: true }),
      TableRow,
      CustomTableHeader,
      CustomTableCell,
      
      
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); 
    },
    editorProps: {
      attributes: {
        class: `prose max-w-none focus:outline-none min-h-[400px] p-4 ${isDark ? 'text-slate-200 prose-invert' : 'text-slate-800'}`,
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;

            (async () => {
              try {
                const fileName = `note-img-${Date.now()}.${file.name.split('.').pop() || 'png'}`;
                const { data, error } = await supabase.storage
                  .from('notes-images')
                  .upload(fileName, file);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                  .from('notes-images')
                  .getPublicUrl(fileName);

                editor?.chain().focus().setImage({ src: publicUrl }).run();

                if (editor) {
                  onChange(editor.getHTML());
                }
              } catch (err) {
                console.error('Gagal total saat mengunggah gambar:', err);
                alert('Gagal mengunggah gambar ke server. Cek Console F12.');
              }
            })();

            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const isDifferent = editor.getHTML() !== content;
      if (isDifferent) {
        editor.commands.setContent(content || ''); 
      }
    }
  }, [content, editor]);
return (
    <div className={`flex flex-col flex-1 w-full h-full border rounded-lg overflow-hidden ${isDark ? 'border-slate-700/60 bg-slate-900/50' : 'border-slate-300 bg-white'}`}>
      
<style jsx global>{`
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        .ProseMirror td, .ProseMirror th {
          min-width: 1em;
          border: 2px solid ${isDark ? '#475569' : '#cbd5e1'};
          padding: 10px 12px; /* Padding diperbesar agar baris terasa lebih tinggi dan lega */
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror th {
          font-weight: bold;
          background-color: ${isDark ? '#1e293b' : '#f1f5f9'};
        }
        .ProseMirror img {
          display: inline-block;
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 4px 8px 4px 0;
        }
        .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(99, 102, 241, 0.15);
          pointer-events: none;
        }

        /* Garis Handle Penarik Lebar Kolom */
        .ProseMirror .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #3b82f6;
          pointer-events: none;
          z-index: 20;
        }
        .ProseMirror table.resize-cursor {
          cursor: col-resize;
        }
      `}</style>

      {/* --- TOOLBAR UTAMA YANG LEBIH RAPI & RESPONSIF --- */}
      <div className={`flex flex-wrap items-center gap-2 p-2.5 border-b ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-100 border-slate-200'}`}>
        
        {/* GRUP 1: Font & Ukuran Teks */}
        <div className="flex items-center gap-1.5">
          <select
            onChange={(e) => editor?.chain().focus().setFontFamily(e.target.value).run()}
            className={`px-2 py-1 rounded text-xs border outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
            title="Jenis Font"
          >
            <option value="Inter">Inter</option>
            <option value="Calibri">Calibri</option>
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
          </select>

          <select
            onChange={(e) => {
              const val = e.target.value;
              if (!editor) return;
              if (val === 'paragraph') editor.chain().focus().setParagraph().run();
              else if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
              else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
              else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            className={`px-2 py-1 rounded text-xs border outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
            title="Gaya Teks"
          >
            <option value="paragraph">Teks Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>

        <div className={`w-[1px] h-5 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

        {/* GRUP 2: Format Teks (Bold, Italic, Warna) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded text-xs transition ${editor?.isActive('bold') ? 'bg-indigo-600 text-white' : (isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700')}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded text-xs transition ${editor?.isActive('italic') ? 'bg-indigo-600 text-white' : (isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700')}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 ml-1 px-1">
            <span className="text-[10px] opacity-70">Warna:</span>
            <input 
              type="color" 
              onInput={(e) => editor?.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
              className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
              title="Warna Teks"
            />
          </div>
        </div>

        <div className={`w-[1px] h-5 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

        {/* GRUP 3: Perataan Teks (Alignment) */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded text-xs transition ${editor?.isActive({ textAlign: 'left' }) ? 'bg-indigo-600 text-white' : (isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700')}`}
            title="Rata Kiri"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded text-xs transition ${editor?.isActive({ textAlign: 'center' }) ? 'bg-indigo-600 text-white' : (isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700')}`}
            title="Rata Tengah"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded text-xs transition ${editor?.isActive({ textAlign: 'right' }) ? 'bg-indigo-600 text-white' : (isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700')}`}
            title="Rata Kanan"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
            className={`p-1.5 rounded text-xs transition ${editor?.isActive({ textAlign: 'justify' }) ? 'bg-indigo-600 text-white' : (isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700')}`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        <div className={`w-[1px] h-5 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

        {/* GRUP 4: Tabel & Media */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'}`}
            title="Sisipkan Tabel"
          >
            <TableIcon className="w-3.5 h-3.5 text-indigo-400" /> + Tabel
          </button>

          <button
            type="button"
            onClick={() => {
              const url = prompt('Masukkan URL Gambar:');
              if (url) editor?.chain().focus().setImage({ src: url }).run();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'}`}
            title="Sisipkan Gambar"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> + Gambar
          </button>
        </div>

        {/* GRUP 5: Kontrol Tambahan Tabel (Hanya muncul jika kursor di dalam tabel) */}
        {editor?.can().addRowAfter() && (
          <div className="flex flex-wrap items-center gap-1 w-full pt-2 mt-1 border-t border-slate-600/30">
            <span className="text-[10px] opacity-70 font-semibold mr-1">Tabel Aksi:</span>
            <button
              type="button"
              onClick={() => editor?.chain().focus().addRowAfter().run()}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'}`}
            >
              + Baris
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().addColumnAfter().run()}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'}`}
            >
              + Kolom
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().deleteRow().run()}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-600/10 text-red-400 hover:bg-red-600/20 transition border border-red-500/20"
            >
              Hapus Baris
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().deleteColumn().run()}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-600/10 text-red-400 hover:bg-red-600/20 transition border border-red-500/20"
            >
              Hapus Kolom
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().deleteTable().run()}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition border border-red-500/30"
            >
              Hapus Tabel
            </button>

            {/* Warna Background Sel */}
            <div className="flex items-center gap-1 ml-auto pl-2 border-l border-slate-600/40">
              <span className="text-[10px] opacity-70">Warna Sel:</span>
              <button type="button" onClick={() => editor?.chain().focus().setCellAttribute('backgroundColor', '#3b82f6').run()} className="w-3.5 h-3.5 rounded-full bg-blue-500 hover:scale-110 transition" title="Biru" />
              <button type="button" onClick={() => editor?.chain().focus().setCellAttribute('backgroundColor', '#10b981').run()} className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:scale-110 transition" title="Hijau" />
              <button type="button" onClick={() => editor?.chain().focus().setCellAttribute('backgroundColor', '#ef4444').run()} className="w-3.5 h-3.5 rounded-full bg-red-500 hover:scale-110 transition" title="Merah" />
              <button type="button" onClick={() => editor?.chain().focus().setCellAttribute('backgroundColor', '#f59e0b').run()} className="w-3.5 h-3.5 rounded-full bg-amber-500 hover:scale-110 transition" title="Kuning" />
              <button type="button" onClick={() => editor?.chain().focus().setCellAttribute('backgroundColor', null).run()} className="px-1.5 py-0.5 text-[10px] rounded bg-slate-500/20 text-slate-300">Reset</button>
            </div>
          </div>
        )}

      </div>

      <div className="flex-1 overflow-y-auto cursor-text p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}


export default function NoteManagerPage() {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

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

  const { mode, colorTheme, getThemeClasses } = useTheme(); 
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
// --- CRUD FOLDER ---
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const folderName = newFolderName.trim();

    const { data, error } = await supabase
      .from('folders')
      .insert([{ name: folderName }])
      .select();

    if (!error && data) {
      // Catat aktivitas pembuatan folder baru ke log
      logActivity(
        'Notepad',
        `Berhasil membuat folder baru: "${folderName}".`,
        'create' // Tipe aktivitas untuk pembuatan data baru
      );

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

    const newFolderName = editedFolderName.trim();

    // 1. Update nama folder di Supabase
    const { error } = await supabase
      .from('folders')
      .update({ name: newFolderName })
      .eq('id', folderId);

    if (!error) {
      // 2. Catat aktivitas perubahan nama folder ke log
      logActivity(
        'Notepad',
        `Berhasil mengubah nama folder menjadi: "${newFolderName}".`,
        'update' // Tipe aktivitas untuk pembaruan data
      );

      setEditingFolderId(null);
      fetchFolders();
    } else {
      alert('Gagal mengubah nama folder');
    }
  };






  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Hapus folder ini beserta seluruh catatan di dalamnya?')) return;

    // 1. Cari nama folder yang akan dihapus untuk dicatat ke log
    // (Sesuaikan variabel 'folders' dengan nama state daftar folder Anda jika berbeda)
    const targetFolder = folders.find((f: any) => f.id === folderId);
    const folderName = targetFolder ? targetFolder.name : 'Folder';

    // 2. Hapus dari database Supabase
    const { error } = await supabase.from('folders').delete().eq('id', folderId);
    
    if (!error) {
      // 3. Catat aktivitas penghapusan folder ke log
      logActivity(
        'Notepad',
        `Berhasil menghapus folder: "${folderName}" beserta isinya.`,
        'delete' // Tipe aktivitas untuk penghapusan
      );

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

    const noteTitle = newNoteTitle.trim();

    const { data, error } = await supabase
      .from('notes')
      .insert([{
        folder_id: selectedFolderId,
        title: noteTitle,
        content: '',
        updated_at: new Date().toISOString()
      }])
      .select();

    if (!error && data) {
      // Catat aktivitas pembuatan catatan baru ke log dengan aman
      try {
        await logActivity(
          'Notepad',
          `Berhasil membuat catatan baru: "${noteTitle}".`,
          'create'
        );
      } catch (logErr) {
        console.error("Gagal mencatat log aktivitas:", logErr);
      }

      setNewNoteTitle('');
      setIsCreatingNote(false);
      await fetchNotes(selectedFolderId);
      setSelectedNote(data[0]);
    } else {
      alert('Gagal membuat catatan: ' + (error?.message || 'Terjadi kesalahan'));
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
      setSelectedNote({ ...selectedNote, content: noteContent });

      const noteTitle = selectedNote.title || 'Catatan Tanpa Judul';
      
      // 1. Bersihkan semua tag HTML (seperti <p>, <strong>, dll)
      // 2. Hapus pembatas 50 karakter agar teks tidak terpotong dan tidak ada titik-titik (...)
      const cleanContent = noteContent.replace(/<\/?[^>]+(>|$)/g, "").trim();

      try {
        await logActivity(
          'Notepad',
          `Memperbarui catatan "${noteTitle}" dengan isi: "${cleanContent || '(Kosong)'}"`,
          'update'
        );
      } catch (logErr) {
        console.error("Gagal mengirim log:", logErr);
      }
    }
  };






const handleUpdateNoteTitle = async () => {
    if (!selectedNote || !editedNoteTitle.trim()) return;

    const oldTitle = selectedNote.title; // Simpan judul lama untuk referensi log (opsional)
    const newTitle = editedNoteTitle.trim();

    const { error } = await supabase
      .from('notes')
      .update({ 
        title: newTitle,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedNote.id);

    if (!error) {
      // Catat aktivitas perubahan judul catatan ke log
      logActivity(
        'Notepad',
        `Berhasil mengubah judul catatan dari "${oldTitle}" menjadi "${newTitle}".`,
        'update' // Tipe aktivitas untuk update
      );

      setSelectedNote({ ...selectedNote, title: newTitle });
      setIsEditingNoteTitle(false);
      if (selectedFolderId) fetchNotes(selectedFolderId);
    } else {
      alert('Gagal mengubah judul catatan');
    }
  };






const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Hapus catatan ini?')) return;

    // 1. Cari judul catatan yang akan dihapus untuk dicatat ke log
    const targetNote = notes.find(n => n.id === noteId);
    const noteTitle = targetNote ? targetNote.title : 'Catatan';

    // 2. Hapus dari database Supabase
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    
    if (!error) {
      // 3. Catat aktivitas penghapusan catatan ke log
      logActivity(
        'Notepad', // Nama modul/aksi yang muncul di tabel log
        `Berhasil menghapus catatan: "${noteTitle}".`,
        'delete' // Tipe aktivitas
      );

      if (selectedFolderId) fetchNotes(selectedFolderId);
    } else {
      alert('Gagal menghapus catatan');
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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




  return (
    <div className={`flex h-screen overflow-hidden font-sans relative ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* TOMBOL MENGAMBANG UNTUK MEMBUKA KEMBALI JIKA PANEL KIRI DITUTUP */}
      {!isLeftSidebarOpen && (
        <button 
          type="button"
          onClick={() => setIsLeftSidebarOpen(true)}
          className={`absolute left-4 top-3 z-30 p-2 rounded-lg border shadow-lg transition flex items-center gap-2 ${getCardStyle()}`}
          title="Buka Daftar Folder & Catatan"
        >
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-xs font-medium">Menu</span>
        </button>
      )}

      {/* CONTAINER PANEL SEBELAH KIRI (FOLDER & LIST CATATAN) */}
      <div className={`
        flex transition-all duration-300 ease-in-out z-20 h-full border-r
        ${isDark ? 'border-slate-800' : 'border-slate-200'}
        ${isLeftSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 w-0 overflow-hidden'}
      `}>
        
        {/* 1. SIDEBAR: FOLDERS */}
        <div className={`w-64 border-r flex flex-col h-full shrink-0 ${getCardStyle()}`}>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <h1 className="font-bold text-lg tracking-wide text-indigo-400 flex items-center gap-2">
              <Folder className="w-5 h-5 text-indigo-400" /> Daftar Folder
            </h1>
            <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={() => setIsCreatingFolder(true)}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition"
                title="Buat Folder Baru"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => setIsLeftSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                title="Tutup Panel Kiri"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Input Buat Folder */}
          {isCreatingFolder && (
            <form onSubmit={handleCreateFolder} className={`p-3 border-b ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
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
                      <button type="button" onClick={() => setEditingFolderId(null)} className="px-2 py-0.5 text-xs text-slate-400">Batal</button>
                      <button type="button" onClick={() => handleUpdateFolder(folder.id)} className="px-2 py-0.5 bg-indigo-600 text-xs rounded text-white">Ubah</button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition ${selectedFolderId === folder.id ? (isDark ? 'bg-indigo-600/20 text-indigo-300 font-medium border-l-4 border-indigo-500' : 'bg-indigo-50 text-indigo-600 font-medium border-l-4 border-indigo-600') : (isDark ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-100 text-slate-600')}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Folder className={`w-4 h-4 ${selectedFolderId === folder.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span className="truncate text-sm">{folder.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setEditingFolderId(folder.id); setEditedFolderName(folder.name); }}
                        className="p-1 text-slate-400 hover:text-indigo-400 rounded"
                        title="Edit Nama Folder"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
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
              <p className="text-xs text-slate-500 text-center py-6">Belum ada folder.</p>
            )}
          </div>
        </div>

        {/* 2. SUB-SIDEBAR: NOTES LIST */}
        <div className={`w-72 border-r flex flex-col h-full shrink-0 ${getCardStyle()}`}>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <h2 className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Daftar Catatan</h2>
            <button 
              type="button"
              disabled={!selectedFolderId}
              onClick={() => setIsCreatingNote(true)}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-white transition"
              title="Buat Catatan Baru"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search Notes */}
          <div className={`p-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
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
            <form onSubmit={handleCreateNote} className={`p-3 border-b ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
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
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${selectedNote?.id === note.id ? (isDark ? 'bg-amber-500/20 border-l-4 border-amber-500 text-white' : 'bg-amber-50 border-l-4 border-amber-500 text-slate-900') : (isDark ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-100 text-slate-600')}`}
              >
                <div className="flex items-start gap-2.5 truncate">
                  <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${selectedNote?.id === note.id ? 'text-amber-400' : 'text-slate-400'}`} />
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{note.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{note.content ? note.content.replace(/<[^>]*>?/gm, '') : 'Kosong'}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                  className="p-1 text-slate-400 hover:text-red-400 rounded transition opacity-0 group-hover:opacity-100"
                  title="Hapus Catatan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {filteredNotes.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">Tidak ada catatan.</p>
            )}
          </div>
        </div>

      </div>

      {/* MAIN CONTENT: NOTEPAD EDITOR */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {selectedNote ? (
          <>
            {/* Header Notepad */}
            <div className={`px-4 md:px-6 py-3 border-b flex items-center justify-between gap-2 ${getCardStyle()}`}>
              <div className="flex items-center gap-2.5 truncate">
                <button 
                  type="button"
                  onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                  className={`p-2 rounded-lg border flex items-center justify-center transition ${getCardStyle()}`}
                  title={isLeftSidebarOpen ? "Sembunyikan Panel Kiri" : "Tampilkan Panel Kiri"}
                >
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <FileText className="w-5 h-5 text-amber-400 shrink-0 hidden sm:block" />
                {isEditingNoteTitle ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editedNoteTitle}
                      onChange={(e) => setEditedNoteTitle(e.target.value)}
                      className={`px-2.5 py-1 text-sm border border-indigo-500 rounded focus:outline-none ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
                      autoFocus
                    />
                    <button type="button" onClick={handleUpdateNoteTitle} className="px-3 py-1 bg-indigo-600 text-xs rounded text-white hover:bg-indigo-500">Simpan</button>
                    <button type="button" onClick={() => setIsEditingNoteTitle(false)} className="px-2 py-1 text-xs text-slate-400">Batal</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer truncate" onClick={() => { setIsEditingNoteTitle(true); setEditedNoteTitle(selectedNote.title); }}>
                    <h2 className={`text-sm md:text-lg font-semibold truncate transition ${isDark ? 'text-white group-hover:text-indigo-300' : 'text-slate-800 group-hover:text-indigo-600'}`}>{selectedNote.title}</h2>
                    <Edit3 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </div>
                )}
              </div>

              {/* Tombol Simpan Manual */}
              <button 
                type="button"
                onClick={handleSaveNoteContent}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs md:text-sm font-medium shadow-lg transition shrink-0"
              >
                <Save className="w-4 h-4" /> 
                <span>{loading ? 'Menyimpan...' : 'Simpan Catatan'}</span>
              </button>
            </div>

            {/* Area Editor Tiptap */}
            <div className="flex-1 p-3 md:p-6 flex flex-col overflow-y-auto">
              <NoteEditorComponent 
                content={noteContent} 
                onChange={(html) => setNoteContent(html)} 
                isDark={isDark} 
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <FileText className="w-16 h-16 mb-3 stroke-1 text-slate-600" />
            <p className="text-base font-medium">Pilih atau buat catatan baru</p>
            <p className="text-xs text-slate-600 mt-1">Pilih salah satu folder di sebelah kiri untuk mengelola catatan.</p>
          </div>
        )}
      </div>

    </div>
  );
}