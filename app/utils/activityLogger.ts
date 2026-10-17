import { supabase } from '@/lib/supabase'; // 🚀 Pastikan import supabase sudah ada di file ini

export interface ActivityItem {
  id: string | number;
  nama?: string;
  title: string;
  description?: string;
  timestamp: string;
  type: 'upload' | 'update' | 'system' | 'security' | string;
  color?: string;
}

export const logActivity = async (
  title: string, 
  description: string, 
  color: string = 'text-indigo-500', 
  type: 'upload' | 'update' | 'system' | 'security' | string = 'update'
) => {
  if (typeof window === 'undefined') return;

  try {
    // 1. Ambil nama admin dari localStorage, tolak jika 'Admin' atau kosong
    const storedName = localStorage.getItem('adminName') || localStorage.getItem('name');
    const currentAdminName = (!storedName || storedName === 'Admin') ? 'miakhalifa' : storedName;

    // 2. Data payload yang akan dikirim ke Supabase
    const newLogPayload = {
      nama: currentAdminName,
      title,
      description,
      type,
      color: color || (type === 'upload' ? 'text-amber-500' : type === 'security' ? 'text-red-500' : 'text-indigo-500')
    };

    // 3. Simpan ke Database Supabase (Tabel activity_logs)
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([newLogPayload])
      .select();

    if (error) {
      console.error('❌ Gagal menyimpan log ke Supabase:', error.message);
    } else {
      console.log('✅ Berhasil mencatat log ke Supabase:', data);
    }

    // 4. (Opsional) Tetap simpan cadangan ke localStorage agar UI lokal tetap responsif
    const saved = localStorage.getItem('app_activities');
    const logs: ActivityItem[] = saved ? JSON.parse(saved) : [];
    
    const localLogItem: ActivityItem = {
      id: data?.[0]?.id || Date.now(),
      nama: currentAdminName,
      title,
      description,
      timestamp: 'Baru saja',
      type,
      color: newLogPayload.color
    };

    const updated = [localLogItem, ...logs].slice(0, 30);
    localStorage.setItem('app_activities', JSON.stringify(updated));

  } catch (err) {
    console.error('Gagal mencatat log:', err);
  }
};