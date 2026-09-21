'use client';
import React, { useState, useRef } from 'react';
import { Editor as TinyMCEEditor } from 'tinymce';
import { Editor } from '@tinymce/tinymce-react';
import { useTheme } from '@/app/context/ThemeContext'; 
import { useSidebarTheme } from '@/app/context/SidebarThemeContext';

export default function RichTextEditorPage() {
  // State khusus untuk menampung teks Live Preview
  const [previewContent, setPreviewContent] = useState('<p>Perkenalkan nama saya jimbaran...</p>');
  const editorRef = useRef<TinyMCEEditor | null>(null);
  
  const { theme } = useTheme();
  const { sidebarTheme } = useSidebarTheme();

  // Fungsi untuk menyimpan ke Database / Console
  const handleSave = () => {
    const contentToSave = editorRef.current ? editorRef.current.getContent() : previewContent;
    console.log("Konten yang disimpan:", contentToSave);
    alert('Konten berhasil disimpan!');
  };

  // === FUNGSI DOWNLOAD KE PDF ===
  const handleDownloadPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('pdf-preview-content');
      
      const options = {
        margin:       10,
        filename:     'dokumen-editor.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(element).set(options).save();
    } catch (error) {
      console.error("Gagal mendownload PDF:", error);
      alert("Terjadi kesalahan saat mengunduh PDF.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Bagian Header Informasi */}
      <div className={`border p-4 rounded-xl text-sm leading-relaxed transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-slate-100 border-slate-300 text-slate-700' 
          : 'bg-white/5 border-white/10 text-slate-300'
      }`}>
        Rich text is a core feature of the management backend, but at the same time it is a place with lots of pits. 
        The common rich texts on the market have been basically used, and I finally chose Tinymce.
      </div>

      {/* === TOMBOL UPLOAD / SIMPAN DI ATAS === */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-md"
        >
          <span>☁ upload / simpan</span>
        </button>
      </div>

      {/* Komponen TinyMCE Editor */}
      <div className={`rounded-xl shadow-lg overflow-hidden border transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white border-slate-300 shadow-slate-200/50' 
          : 'bg-white/5 border-white/20 shadow-black/40'
      }`}>
        <Editor
          apiKey="w4zcww4rfgtbbudm6m1tup4m4jz248dngih399mlkot5625j"
          onInit={(_evt, editor) => {
            editorRef.current = editor;
            // Set initial value saat editor selesai dimuat
            setPreviewContent(editor.getContent());
          }}
          initialValue="<p>Perkenalkan nama saya jimbaran...</p>"
          init={{
            height: 500,
            menubar: 'file edit insert view format table',
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar:
              'undo redo | blocks | ' +
              'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | ' +
              'bullist numlist outdent indent | removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
          // Mengambil konten secara langsung dari instance editor setiap kali ada perubahan ketikan
          onEditorChange={(newText, editor) => {
            setPreviewContent(newText);
          }}
        />
      </div>

{/* === BAGIAN LIVE PREVIEW (DIPERBESAR TINGGINYA) === */}
      <div className={`border p-6 rounded-xl space-y-3 shadow-xl transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white border-slate-300 text-slate-900 shadow-sm' 
          : 'bg-slate-900/80 border-white/20 text-white backdrop-blur-md'
      }`}>
        <h3 className={`text-xs font-semibold uppercase tracking-wider border-b pb-2 ${
          theme === 'light' ? 'text-slate-600 border-slate-200' : 'text-slate-300 border-white/15'
        }`}>
          Live Preview Hasil Edit:
        </h3>
        
        {/* Min-height diperbesar menjadi 250px agar lebih tinggi dan leluasa */}
        <div 
          id="pdf-preview-content"
          className={`prose max-w-none min-h-[250px] p-4 rounded-lg border border-dashed ${
            theme === 'light' 
              ? 'text-slate-900 bg-slate-50/50 border-slate-200' 
              : 'text-slate-100 prose-invert bg-white/5 border-white/10'
          }`}
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      </div>
      {/* === TOMBOL DOWNLOAD PDF TERPISAH DI BAWAH === */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-md"
        >
          <span>📥 Download PDF</span>
        </button>
      </div>

    </div>
  );
}