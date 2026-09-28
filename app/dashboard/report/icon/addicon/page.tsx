'use client';
import { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { FiPlus, FiSmile, FiCode, FiLayers } from 'react-icons/fi';

export default function AddIconPage() {
  const { mode } = useTheme();
  const [iconName, setIconName] = useState('');
  const [iconClass, setIconClass] = useState('');
  const [iconCategory, setIconCategory] = useState('element');
  const [previewIcon, setPreviewIcon] = useState('smile');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format kode yang akan disimpan/digunakan
    const generatedCode = iconCategory === 'element' 
      ? `<i class="el-icon-${iconName}" />` 
      : `<svg-icon icon-class="${iconName}" />`;

    console.log({
      name: iconName,
      class: iconClass,
      category: iconCategory,
      code: generatedCode
    });

    alert(`Ikon "${iconName}" berhasil ditambahkan!\nKode: ${generatedCode}`);
    
    // Reset form
    setIconName('');
    setIconClass('');
  };

  const getContainerStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200' 
      : 'bg-[#16222A] text-slate-100 border-slate-800';
  };

  const getInputStyle = () => {
    return mode === 'light'
      ? 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
      : 'bg-[#1e2d38] border-slate-700 text-slate-100 focus:border-blue-500';
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="p-4 rounded-xl border text-sm text-blue-600 bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400 flex items-center justify-between">
        <span>Tambah Ikon Baru ke Sistem</span>
        <FiPlus className="w-4 h-4" />
      </div>

      {/* Main Card Form */}
      <div className={`p-8 rounded-2xl border shadow-sm ${getContainerStyle()}`}>
        <h2 className="text-base font-semibold mb-6 pb-3 border-b border-inherit">
          Form Registrasi Ikon
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama Ikon */}
          <div>
            <label className="block text-xs font-medium opacity-75 mb-1.5">
              Nama Ikon (contoh: <span className="text-blue-500 font-mono">chart</span> atau <span className="text-blue-500 font-mono">success</span>)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center opacity-40">
                <FiSmile className="w-4 h-4" />
              </span>
              <input 
                type="text"
                value={iconName}
                onChange={(e) => setIconName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="masukkan-nama-ikon..."
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all ${getInputStyle()}`}
                required
              />
            </div>
            {iconName && (
              <p className="mt-1.5 text-[11px] opacity-60 font-mono">
                Preview Tag: &lt;svg-icon icon-class=&quot;{iconName}&quot; /&gt; atau &lt;i class=&quot;el-icon-{iconName}&quot; /&gt;
              </p>
            )}
          </div>

          {/* Kategori Ikon */}
          <div>
            <label className="block text-xs font-medium opacity-75 mb-1.5">
              Kategori Tampilan
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setIconCategory('element')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  iconCategory === 'element' 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600' 
                    : 'border-slate-200 dark:border-slate-700 opacity-70'
                }`}
              >
                <FiLayers className="w-5 h-5" />
                <div>
                  <div className="text-xs font-semibold">Element-UI Icons</div>
                  <div className="text-[10px] opacity-60">Format: &lt;i class=&quot;el-icon-...&quot; /&gt;</div>
                </div>
              </div>

              <div 
                onClick={() => setIconCategory('svg')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  iconCategory === 'svg' 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600' 
                    : 'border-slate-200 dark:border-slate-700 opacity-70'
                }`}
              >
                <FiCode className="w-5 h-5" />
                <div>
                  <div className="text-xs font-semibold">SVG / Custom Icons</div>
                  <div className="text-[10px] opacity-60">Format: &lt;svg-icon ... /&gt;</div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Custom CSS Class / SVG Source (Opsional) */}
          <div>
            <label className="block text-xs font-medium opacity-75 mb-1.5">
              CSS Class / Sumber Data (Opsional)
            </label>
            <input 
              type="text"
              value={iconClass}
              onChange={(e) => setIconClass(e.target.value)}
              placeholder="fa fa-icon atau path svg..."
              className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition-all ${getInputStyle()}`}
            />
          </div>

          {/* Tombol Aksi */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { setIconName(''); setIconClass(''); }}
              className="px-5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100 transition-opacity"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Simpan Ikon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}