import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const newsData = [
      {
        title: "GoPay Merchant Hadirkan Fitur Tagihan via QRIS, Dukung Digitalisasi UMKM",
        link: "#",
        source: "Kompas.com",
        snippet: "JAKARTA, KOMPAS.com — Penjual yang memasarkan produknya melalui media sosial kini memiliki opsi baru...",
        date: "10 Jun 2026",
        image: "https://images.unsplash.com/photo-1556742049-0a67d5e12444?w=150&auto=format&fit=crop&q=80"
      },
      {
        title: "Cara Buat QRIS untuk Usaha dengan Mudah, Ini Syarat & Biayanya",
        link: "#",
        source: "Pegadaian",
        snippet: "Di tengah semakin cepatnya perputaran transaksi digital, menyediakan metode pembayaran non-tunai...",
        date: "14 Apr 2026",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&auto=format&fit=crop&q=80"
      },
      {
        title: "Kuasai Pangsa Transaksi QRIS Terbesar di Banten, GoPay Sabet Digiwara Awards 2026.",
        link: "#",
        source: "SWA.co.id",
        snippet: "Di tengah persaingan industri pembayaran digital yang semakin ketat, kemampuan memperluas adopsi...",
        date: "6 Jun 2026",
        image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=150&auto=format&fit=crop&q=80"
      }
    ];

    return NextResponse.json({ success: true, data: newsData });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal memuat berita' }, { status: 500 });
  }
}