export interface ActivityItem {
  id: string | number;
  title: string;
  description?: string;
  timestamp: string;
  type: 'upload' | 'update' | 'system' | 'security';
  color?: string;
}

export const logActivity = (
  title: string, 
  description: string, 
  type: 'upload' | 'update' | 'system' | 'security' = 'update'
) => {
  if (typeof window === 'undefined') return;

  try {
    const saved = localStorage.getItem('app_activities');
    const logs: ActivityItem[] = saved ? JSON.parse(saved) : [];

    const newLog: ActivityItem = {
      id: Date.now(),
      title,
      description,
      timestamp: 'Baru saja',
      type,
      color: type === 'upload' ? 'text-amber-500' : type === 'security' ? 'text-red-500' : 'text-indigo-500'
    };

    const updated = [newLog, ...logs].slice(0, 30); // Batasi 30 log terakhir
    localStorage.setItem('app_activities', JSON.stringify(updated));
  } catch (err) {
    console.error('Gagal mencatat log:', err);
  }
};