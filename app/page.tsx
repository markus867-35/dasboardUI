import { redirect } from 'next/navigation';

export default function Home() {
  // Langsung arahkan ke halaman login tanpa jeda atau merender dashboard
  redirect('/login');
}