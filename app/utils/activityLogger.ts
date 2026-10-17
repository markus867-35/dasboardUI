export interface ActivityItem {
  id: string | number;
  nama?: string; // 🚀 1. Tambahkan properti nama
  title: string;
  description?: string;
  timestamp: string;
  type: 'upload' | 'update' | 'system' | 'security' | string;
  color?: string;
}

export const logActivity = (
  title: string, 
  description: string, 
  color: string = 'text-indigo-500', // 🚀 2. Tambahkan parameter warna agar mendukung 4 argumen
  type: 'upload' | 'update' | 'system' | 'security' | string = 'update'
) => {
  if (typeof window === 'undefined') return;

  try {
    const saved = localStorage.getItem('app_activities');
    const logs: ActivityItem[] = saved ? JSON.parse(saved) : [];

    // 🚀 3. Tangkap nama admin dari localStorage, tolak jika 'Admin' atau kosong
    const storedName = localStorage.getItem('adminName') || localStorage.getItem('name');
    const currentAdminName = (!storedName || storedName === 'Admin') ? 'miakhalifa' : storedName;

    const newLog: ActivityItem = {
      id: Date.now(),
      nama: currentAdminName, // 🚀 4. Masukkan nama miakhalifa ke dalam log
      title,
      description,
      timestamp: 'Baru saja',
      type,
      color: color || (type === 'upload' ? 'text-amber-500' : type === 'security' ? 'text-red-500' : 'text-indigo-500')
    };

    const updated = [newLog, ...logs].slice(0, 30); // Batasi 30 log terakhir
    localStorage.setItem('app_activities', JSON.stringify(updated));
  } catch (err) {
    console.error('Gagal mencatat log:', err);
  }
};