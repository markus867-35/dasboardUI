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
    <div className={`flex items-center space-x-2 px-6 py-2 border-b overflow-x-auto no-scrollbar ${
      mode === 'light' ? 'bg-white border-slate-200' : 'bg-[#142028] border-slate-700/40'
    }`}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm shrink-0 whitespace-nowrap ${
              isActive 
                ? 'bg-emerald-600 text-white shadow-md' 
                : mode === 'light'
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  : 'bg-[#1B2A35] text-slate-300 hover:bg-[#253644] border border-slate-700/50'
            }`}
          >
            {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0"></span>}
            <span className="truncate max-w-[120px]" title={tab.name}>{tab.name}</span>
            {tabs.length > 1 && (
              <span 
                onClick={(e) => removeTab(tab.path, e)}
                className={`ml-1 px-1 rounded-full text-xs transition-colors shrink-0 ${
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