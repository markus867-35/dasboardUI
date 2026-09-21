'use client';
import { useTabs } from '@/app/context/TabContext';
import { useTheme } from '@/app/context/ThemeContext';
import { usePathname, useRouter } from 'next/navigation';

export default function TagsView() {
  const { tabs, removeTab } = useTabs();
  const { mode } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={`flex items-center space-x-2 px-6 py-2 border-b overflow-x-auto ${
      mode === 'light' ? 'bg-white border-slate-200' : 'bg-[#142028] border-slate-700/40'
    }`}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm ${
              isActive 
                ? 'bg-emerald-600 text-white shadow-md' // Tampilan tab aktif (warna hijau seperti di gambar)
                : mode === 'light'
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  : 'bg-[#1B2A35] text-slate-300 hover:bg-[#253644] border border-slate-700/50'
            }`}
          >
            {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
            <span>{tab.name}</span>
            {tabs.length > 1 && (
              <span 
                onClick={(e) => removeTab(tab.path, e)}
                className={`ml-1 px-1 rounded-full text-xs transition-colors ${
                  isActive ? 'hover:bg-emerald-700 text-white' : 'hover:bg-black/20 text-slate-400 hover:text-white'
                }`}
              >
                ×
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}