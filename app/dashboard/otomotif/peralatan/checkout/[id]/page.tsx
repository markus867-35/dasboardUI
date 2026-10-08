'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { FiArrowLeft, FiCheckCircle, FiCreditCard, FiTruck, FiShield, FiCopy, FiCheck } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

export default function CheckoutPeralatanPage() {
  const { mode } = useTheme();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Pembeli & Pengiriman
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer_bca');
  const [shippingMethod, setShippingMethod] = useState('regular');

  // State untuk menampilkan instruksi pembayaran setelah checkout berhasil
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('online_shop_stock')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err: any) {
      console.error('Gagal mengambil detail produk peralatan untuk checkout:', err);
      alert('Produk peralatan tidak ditemukan.');
      router.push('/dashboard/otomotif/peralatan');
    } finally {
      setLoading(false);
    }
  };

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  if (loading) {
    return <div className="p-16 text-center text-xs opacity-60">Memuat halaman pembayaran peralatan...</div>;
  }

  if (!product) {
    return <div className="p-16 text-center text-xs opacity-60">Data produk peralatan tidak valid.</div>;
  }

  // Kalkulasi Harga: Sell Price dikurangi Discount Price (Nominal Potongan)
  const sellPrice = Number(product.sell_price || product.price || 0);
  const discountAmount = Number(product.discount_price || 0);
  const finalItemPrice = Math.max(0, sellPrice - discountAmount);
  
  const subtotal = finalItemPrice * quantity;
  const shippingCost = shippingMethod === 'express' ? 35000 : 20000;
  const adminFee = 2000;
  const grandTotal = subtotal + shippingCost + adminFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !shippingAddress) {
      alert('Mohon lengkapi Nama, No. Telepon, dan Alamat Pengiriman!');
      return;
    }

    if (quantity > product.stock) {
      alert(`Stok tidak mencukupi! Stok tersisa: ${product.stock} pcs.`);
      return;
    }

    setSubmitting(true);

    try {
      // Kurangi stok produk langsung di Supabase
      const newStock = product.stock - quantity;
      const { error: updateError } = await supabase
        .from('online_shop_stock')
        .update({ stock: newStock })
        .eq('id', id);

      if (updateError) throw updateError;

      // Simpan data pesanan agar layar instruksi pembayaran tampil sesuai metode yang dipilih
      setOrderSuccessData({
        buyerName,
        buyerPhone,
        shippingAddress,
        grandTotal,
        paymentMethod,
        shippingMethod
      });
    } catch (err: any) {
      console.error('Gagal memproses checkout peralatan:', err);
      alert(`Terjadi kesalahan: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // JIKA PESANAN BERHASIL DIBUAT -> TAMPILKAN INSTRUKSI SESUAI METODE PEMBAYARAN
  if (orderSuccessData) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className={`p-8 rounded-2xl border ${getCardStyle()} space-y-6 text-center`}>
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle size={36} />
          </div>

          <div className="space-y-2">
            <h1 className="text-lg font-bold">Pesanan Peralatan Bengkel Berhasil Dibuat!</h1>
            <p className="text-xs opacity-70">Silakan selesaikan pembayaran sesuai instruksi di bawah ini.</p>
          </div>

          {/* DETAIL PEMBAYARAN BERDASARKAN METODE YANG DIPILIH */}
          <div className="p-5 rounded-xl bg-slate-500/5 border border-slate-500/10 text-left space-y-4 text-xs">
            
            {/* 1. JIKA TRANSFER BCA */}
            {orderSuccessData.paymentMethod === 'transfer_bca' && (
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2 border-slate-500/10">
                  <span className="opacity-70">Metode Pembayaran</span>
                  <span className="font-bold text-blue-600">Transfer Bank BCA (Virtual Account)</span>
                </div>
                <div>
                  <span className="opacity-70 block mb-1">Nomor Rekening / Virtual Account:</span>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">880208123456789</span>
                    <button 
                      type="button" 
                      onClick={() => handleCopyText('880208123456789')}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold flex items-center gap-1 hover:bg-blue-700 transition"
                    >
                      {copiedText ? <FiCheck size={12} /> : <FiCopy size={12} />} {copiedText ? 'Disalin' : 'Salin No. VA'}
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-[11px] opacity-80">
                  <p>• Nama Bank: <b>BCA</b></p>
                  <p>• Atas Nama: <b>PT Peralatan Bengkel Indonesia</b></p>
                </div>
              </div>
            )}

            {/* 2. JIKA TRANSFER MANDIRI */}
            {orderSuccessData.paymentMethod === 'transfer_mandiri' && (
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2 border-slate-500/10">
                  <span className="opacity-70">Metode Pembayaran</span>
                  <span className="font-bold text-blue-600">Transfer Bank Mandiri (Virtual Account)</span>
                </div>
                <div>
                  <span className="opacity-70 block mb-1">Nomor Rekening / Virtual Account:</span>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">890208123456789</span>
                    <button 
                      type="button" 
                      onClick={() => handleCopyText('890208123456789')}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold flex items-center gap-1 hover:bg-blue-700 transition"
                    >
                      {copiedText ? <FiCheck size={12} /> : <FiCopy size={12} />} {copiedText ? 'Disalin' : 'Salin No. VA'}
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-[11px] opacity-80">
                  <p>• Nama Bank: <b>Mandiri</b></p>
                  <p>• Atas Nama: <b>PT Peralatan Bengkel Indonesia</b></p>
                </div>
              </div>
            )}

            {/* 3. JIKA QRIS */}
            {orderSuccessData.paymentMethod === 'qris' && (
              <div className="space-y-3 text-center">
                <div className="flex justify-between border-b pb-2 border-slate-500/10 text-left">
                  <span className="opacity-70">Metode Pembayaran</span>
                  <span className="font-bold text-blue-600">QRIS (GoPay, OVO, Dana, ShopeePay)</span>
                </div>
                <div className="py-2">
                  <p className="text-[11px] opacity-70 mb-3">Scan kode QR di bawah ini menggunakan aplikasi e-wallet atau m-banking Anda:</p>
                  <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl border border-slate-300 shadow-inner flex items-center justify-center">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PERALATAN_BENGKEL_OFFICIAL_QRIS" 
                      alt="Kode QRIS" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] opacity-60 mt-2">Merchant: PERALATAN BENGKEL OFFICIAL</p>
                </div>
              </div>
            )}

            {/* 4. JIKA COD (BAYAR DI TEMPAT) */}
            {orderSuccessData.paymentMethod === 'cod' && (
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2 border-slate-500/10">
                  <span className="opacity-70">Metode Pembayaran</span>
                  <span className="font-bold text-emerald-600">Bayar di Tempat (COD)</span>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">
                  Pesanan peralatan bengkel Anda akan segera disiapkan dan dikirimkan. Mohon siapkan uang tunai sejumlah total tagihan saat kurir tiba di alamat Anda.
                </p>
              </div>
            )}

            {/* TOTAL TAGIHAN */}
            <div className="flex justify-between pt-3 border-t border-slate-500/10 font-bold text-sm">
              <span className="opacity-70">Total Tagihan Pembayaran</span>
              <span className="text-blue-600">Rp {orderSuccessData.grandTotal.toLocaleString('id-ID')}</span>
            </div>

          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={() => router.push('/dashboard/otomotif/peralatan')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              Selesai & Kembali ke Daftar Peralatan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header & Tombol Kembali */}
      <div className="flex items-center justify-between">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-500/20 hover:bg-slate-500/10 transition"
        >
          <FiArrowLeft size={16} /> Kembali ke Detail
        </button>
        <h1 className="text-lg font-bold">Checkout & Pembayaran Peralatan Bengkel</h1>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Informasi Pengiriman & Metode Pembayaran */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Data Penerima */}
          <div className={`p-6 rounded-2xl border ${getCardStyle()} space-y-4`}>
            <h2 className="text-sm font-bold flex items-center gap-2 border-b pb-3 border-slate-500/20">
              <FiTruck size={16} className="text-blue-500" /> Informasi Pengiriman
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold opacity-70 mb-1">Nama Penerima *</label>
                <input 
                  type="text" 
                  value={buyerName} 
                  onChange={(e) => setBuyerName(e.target.value)} 
                  placeholder="Contoh: Budi Santoso" 
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold opacity-70 mb-1">No. Telepon / WhatsApp *</label>
                <input 
                  type="tel" 
                  value={buyerPhone} 
                  onChange={(e) => setBuyerPhone(e.target.value)} 
                  placeholder="081234567890" 
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Alamat Lengkap Pengiriman *</label>
              <textarea 
                value={shippingAddress} 
                onChange={(e) => setShippingAddress(e.target.value)} 
                rows={3}
                placeholder="Jl. Merdeka No. 45, RT 02/RW 05, Kel. Depok, Kec. Pancoran Mas, Kota Depok" 
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none resize-none ${mode === 'light' ? 'bg-white border-slate-300' : 'bg-[#0f172a] border-slate-700 text-white'}`}
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Pilih Layanan Kurir</label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setShippingMethod('regular')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${shippingMethod === 'regular' ? 'border-blue-600 bg-blue-500/10 font-bold' : 'border-slate-500/20 opacity-70'}`}
                >
                  <div className="flex justify-between"><span>Reguler (2-3 Hari)</span> <span>Rp 20.000</span></div>
                </div>
                <div 
                  onClick={() => setShippingMethod('express')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${shippingMethod === 'express' ? 'border-blue-600 bg-blue-500/10 font-bold' : 'border-slate-500/20 opacity-70'}`}
                >
                  <div className="flex justify-between"><span>Express (1 Hari)</span> <span>Rp 35.000</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className={`p-6 rounded-2xl border ${getCardStyle()} space-y-4`}>
            <h2 className="text-sm font-bold flex items-center gap-2 border-b pb-3 border-slate-500/20">
              <FiCreditCard size={16} className="text-blue-500" /> Metode Pembayaran
            </h2>

            <div className="space-y-2 text-xs">
              {[
                { id: 'transfer_bca', label: 'Transfer Bank BCA (Virtual Account)' },
                { id: 'transfer_mandiri', label: 'Transfer Bank Mandiri (Virtual Account)' },
                { id: 'qris', label: 'QRIS (GoPay, OVO, Dana, ShopeePay)' },
                { id: 'cod', label: 'Bayar di Tempat (COD)' }
              ].map(method => (
                <label key={method.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${paymentMethod === method.id ? 'border-blue-600 bg-blue-500/10 font-bold' : 'border-slate-500/20 opacity-80'}`}>
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === method.id} 
                      onChange={() => setPaymentMethod(method.id)} 
                      className="accent-blue-600"
                    />
                    <span>{method.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Kolom Kanan: Ringkasan Pesanan */}
        <div className="space-y-4">
          <div className={`p-6 rounded-2xl border ${getCardStyle()} space-y-4 sticky top-6`}>
            <h2 className="text-sm font-bold border-b pb-3 border-slate-500/20">Ringkasan Belanja</h2>

            {/* Item Produk */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-500/10">
              <div className="w-16 h-16 rounded-xl border overflow-hidden shrink-0 bg-white p-1">
                <img 
                  src={Array.isArray(product.image_url) ? product.image_url[0] : product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="space-y-1 overflow-hidden">
                <h3 className="text-xs font-bold line-clamp-2 uppercase">{product.name}</h3>
                <p className="text-[11px] font-bold text-blue-600">Rp {finalItemPrice.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Atur Jumlah */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-500/10">
              <span className="opacity-70">Jumlah Beli</span>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold hover:bg-slate-500/10"
                >
                  -
                </button>
                <span className="font-bold w-6 text-center">{quantity}</span>
                <button 
                  type="button" 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold hover:bg-slate-500/10"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rincian Kalkulasi Harga */}
            <div className="space-y-2 text-xs opacity-80 pb-3 border-b border-slate-500/10">
              <div className="flex justify-between">
                <span>Total Harga ({quantity} barang)</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Pengiriman</span>
                <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan & Admin</span>
                <span>Rp {adminFee.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Total Pembayaran */}
            <div className="flex justify-between items-center text-sm font-extrabold pt-1">
              <span>Total Tagihan</span>
              <span className="text-blue-600 text-base">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>

            {/* Tombol Konfirmasi Bayar */}
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiCheckCircle size={16} /> {submitting ? 'Memproses Pesanan...' : 'Bayar Sekarang'}
            </button>

            <div className="flex items-center gap-1.5 text-[10px] opacity-60 justify-center pt-2">
              <FiShield size={12} className="text-emerald-500" /> Transaksi aman & terjamin
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}