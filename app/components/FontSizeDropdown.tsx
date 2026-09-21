'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { useFontSize } from '@/app/context/FontSizeContext';

export default function FontSizeDropdown() {
  const { fontSize, changeFontSize } = useFontSize();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { label: 'Default', value: 'default' },
    { label: 'Medium', value: 'medium' },
    { label: 'Small', value: 'small' },
    { label: 'Mini', value: 'mini' },
  ];

  return (
    <div className="relative">
      {/* Tombol ikon teks */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-200 transition-all flex items-center"
      >
        <span className="font-bold text-sm">T</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#1B2A35] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                changeFontSize(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                fontSize === opt.value
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#253644]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}