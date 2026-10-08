'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import Link from 'next/link';
import { 
  FiSearch, FiFilter, FiChevronDown, FiChevronUp, 
  FiAlertTriangle, FiPlus, FiEdit2, FiTrash2, FiTag 
} from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string | number;
  name: string;
  sku: string;
  category: string;
  brand: string;
  stock: number;
  min_stock: number;
  buy_price?: number;
  discount_price?: number; // <-- TAMBAHKAN BARIS INI
  modal_price?: number;
  sell_price?: number;
  price?: number;
  image_url: string | string[];
}

export default function OliInventoryPage() {
  const { mode } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('Semua');
  const [maxPriceFilter, setMaxPriceFilter] = useState(155000);
  const [minPriceFilter, setMinPriceFilter] = useState(0);
  const [sortBy, setSortBy] = useState('terbaru');

  // Multi-select Checkbox Filter States (Array)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedViscosities, setSelectedViscosities] = useState<string[]>([]); // Kekentalan (e.g. 10W-30, 10W-40)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]); // Ukuran / Volume (e.g. 0.65 L, 0.8 L, 1 L, 120 ML)
  const [selectedOilTypes, setSelectedOilTypes] = useState<string[]>([]); // Tipe Oli (e.g. Matic, Bebek, Sport, Gear)

  // Accordion Sidebar State
  const [openFilterCategory, setOpenFilterCategory] = useState(true);
  const [openFilterMotor, setOpenFilterMotor] = useState(true);
  const [openFilterPrice, setOpenFilterPrice] = useState(true);
  const [openFilterBrand, setOpenFilterBrand] = useState(true);
  const [openFilterViscosity, setOpenFilterViscosity] = useState(true);
  const [openFilterSize, setOpenFilterSize] = useState(true);
  const [openFilterOilType, setOpenFilterOilType] = useState(true);

  // Data Options Referensi Oli
  const oilBrands = ['X-TEN', 'AHM Oil', 'Yamalube', 'Castrol', 'Motul', 'Shell', 'Federal', 'Enduro'];
  const oilViscosities = ['10W-30', '10W-40', '20W-50', '15W-40', '5W-30'];
  const oilSizes = ['0.65 L', '0.8 L', '0.9 L', '1 L', '120 ML'];
  const oilTypes = ['Matic', 'Bebek', 'Sport', 'Gear Matic'];

  const oilSubCategories = [
    'Semua', 
    'Oli Motor Matic', 
    'Oli Motor Bebek', 
    'Oli Motor Sport',
    'Oli Gear Matic'
  ];

  const motorTypes = ['Semua', 'Honda Beat / Scoopy / Vario', 'Yamaha NMAX / PCX', 'Yamaha Mio / Fino'];
  const [selectedMotorType, setSelectedMotorType] = useState('Semua');

  const getCardStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
      : 'bg-[#16222A] text-slate-100 border-slate-800 shadow-xl';
  };

  useEffect(() => {
    fetchOilProducts();
  }, []);

  const fetchOilProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('online_shop_stock')
        .select('*')
        .ilike('category', '%Oli%')
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error('Gagal mengambil data oli:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Hapus data oli ini?')) return;
    try {
      const { error } = await supabase.from('online_shop_stock').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error('Gagal menghapus:', err);
    }
  };

  const handleCheckboxChange = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Filter & Sorting Logic
  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubCat = selectedSubCategory === 'Semua' || item.category === selectedSubCategory;
    
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(item.brand);
    const matchesViscosity = selectedViscosities.length === 0 || selectedViscosities.some(v => item.name.toLowerCase().includes(v.toLowerCase()));
    const matchesSize = selectedSizes.length === 0 || selectedSizes.some(sz => item.name.toLowerCase().includes(sz.toLowerCase()));
    const matchesOilType = selectedOilTypes.length === 0 || selectedOilTypes.some(t => item.name.toLowerCase().includes(t.toLowerCase()));

    const currentSellPrice = Number(item.sell_price ?? item.price ?? 0);
    const matchesPrice = currentSellPrice >= minPriceFilter && currentSellPrice <= maxPriceFilter;

    return matchesSearch && matchesSubCat && matchesBrand && matchesViscosity && matchesSize && matchesOilType && matchesPrice;
  }).sort((a, b) => {
    const priceA = Number(a.sell_price ?? a.price ?? 0);
    const priceB = Number(b.sell_price ?? b.price ?? 0);
    if (sortBy === 'termahal') return priceB - priceA;
    if (sortBy === 'termurah') return priceA - priceB;
    return 0;
  });

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-0 space-y-6 max-w-[1700px] mx-auto">
      
      {/* 1. HEADER LOGO MEREK OLI (HORIZONTAL SLIDER) */}
      <div className={`p-4 rounded-2xl border ${getCardStyle()}`}>
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <button 
            onClick={() => setSelectedBrands([])}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border shrink-0 transition ${selectedBrands.length === 0 ? 'bg-blue-600 text-white border-blue-600 shadow-md' : mode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0f172a] border-slate-700 text-slate-300'}`}
          >
            Semua Merek
          </button>
          {oilBrands.map(b => (
            <button 
              key={b}
              onClick={() => handleCheckboxChange(b, selectedBrands, setSelectedBrands)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border shrink-0 transition flex items-center gap-2 ${selectedBrands.includes(b) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : mode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-[#0f172a] border-slate-700 text-slate-300 hover:bg-slate-800'}`}
            >
              <span>{b}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN LAYOUT: SIDEBAR FILTER & KONTEN UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* SIDEBAR FILTER */}
        <div className="lg:col-span-1 space-y-4">
          <div className={`p-5 rounded-2xl border ${getCardStyle()} space-y-4`}>
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/20">
              <span className="text-sm font-bold flex items-center gap-2"><FiFilter /> Filter</span>
              <button 
                onClick={() => { 
                  setSelectedSubCategory('Semua'); 
                  setSelectedBrands([]); 
                  setSelectedViscosities([]);
                  setSelectedSizes([]);
                  setSelectedOilTypes([]);
                  setSelectedMotorType('Semua');
                  setMinPriceFilter(0);
                  setMaxPriceFilter(155000); 
                  setSearchQuery(''); 
                }} 
                className="text-[11px] text-blue-500 hover:underline font-semibold"
              >
                Reset Semua
              </button>
            </div>

            {/* Kategori */}
            <div className="border-b border-slate-700/20 pb-3">
              <button onClick={() => setOpenFilterCategory(!openFilterCategory)} className="w-full flex justify-between items-center text-xs font-bold mb-2">
                <span>Kategori</span>
                {openFilterCategory ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {openFilterCategory && (
                <div className="space-y-1 pl-1">
                  {oilSubCategories.map(cat => (
                    <div 
                      key={cat} 
                      onClick={() => setSelectedSubCategory(cat)}
                      className={`text-xs cursor-pointer py-1 px-2 rounded-lg transition ${selectedSubCategory === cat ? 'bg-blue-600/10 text-blue-500 font-bold' : 'opacity-70 hover:opacity-100'}`}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kompatibilitas untuk motor */}
            <div className="border-b border-slate-700/20 pb-3">
              <button onClick={() => setOpenFilterMotor(!openFilterMotor)} className="w-full flex justify-between items-center text-xs font-bold mb-2">
                <span>Kompatibilitas untuk motor</span>
                {openFilterMotor ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {openFilterMotor && (
                <div className="space-y-2">
                  <select 
                    value={selectedMotorType}
                    onChange={(e) => setSelectedMotorType(e.target.value)}
                    className={`w-full text-xs p-2 rounded-xl border outline-none ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'}`}
                  >
                    {motorTypes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Harga */}
            <div className="border-b border-slate-700/20 pb-3">
              <button onClick={() => setOpenFilterPrice(!openFilterPrice)} className="w-full flex justify-between items-center text-xs font-bold mb-2">
                <span>Harga</span>
                {openFilterPrice ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {openFilterPrice && (
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-mono opacity-80">
                    <span>{formatRupiah(minPriceFilter)}</span>
                    <span>{formatRupiah(maxPriceFilter)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="300000" 
                    step="5000"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={`Rp ${minPriceFilter.toLocaleString('id-ID')}`}
                      onChange={(e) => setMinPriceFilter(Number(e.target.value.replace(/[^0-9]/g, '')))}
                      className={`w-full text-xs p-1.5 rounded-lg border text-center font-mono ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'}`}
                    />
                    <span className="text-xs opacity-50">-</span>
                    <input 
                      type="text" 
                      value={`Rp ${maxPriceFilter.toLocaleString('id-ID')}`}
                      onChange={(e) => setMaxPriceFilter(Number(e.target.value.replace(/[^0-9]/g, '')))}
                      className={`w-full text-xs p-1.5 rounded-lg border text-center font-mono ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Merek Checkbox */}
            <div className="border-b border-slate-700/20 pb-3">
              <button onClick={() => setOpenFilterBrand(!openFilterBrand)} className="w-full flex justify-between items-center text-xs font-bold mb-2">
                <span>Merek</span>
                {openFilterBrand ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {openFilterBrand && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {oilBrands.map(b => (
                    <label key={b} className="flex items-center gap-2 text-xs cursor-pointer opacity-80 hover:opacity-100">
                      <input 
                        type="checkbox" 
                        checked={selectedBrands.includes(b)}
                        onChange={() => handleCheckboxChange(b, selectedBrands, setSelectedBrands)}
                        className="rounded border-slate-600 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Kekentalan / Viskositas Checkbox */}
            <div className="border-b border-slate-700/20 pb-3">
              <button onClick={() => setOpenFilterViscosity(!openFilterViscosity)} className="w-full flex justify-between items-center text-xs font-bold mb-2">
                <span>Kekentalan</span>
                {openFilterViscosity ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {openFilterViscosity && (
                <div className="space-y-2">
                  {oilViscosities.map(v => (
                    <label key={v} className="flex items-center gap-2 text-xs cursor-pointer opacity-80 hover:opacity-100">
                      <input 
                        type="checkbox" 
                        checked={selectedViscosities.includes(v)}
                        onChange={() => handleCheckboxChange(v, selectedViscosities, setSelectedViscosities)}
                        className="rounded border-slate-600 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>{v}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Ukuran / Volume Checkbox */}
            <div className="border-b border-slate-700/20 pb-3">
              <button onClick={() => setOpenFilterSize(!openFilterSize)} className="w-full flex justify-between items-center text-xs font-bold mb-2">
                <span>Ukuran</span>
                {openFilterSize ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {openFilterSize && (
                <div className="space-y-2">
                  {oilSizes.map(sz => (
                    <label key={sz} className="flex items-center gap-2 text-xs cursor-pointer opacity-80 hover:opacity-100">
                      <input 
                        type="checkbox" 
                        checked={selectedSizes.includes(sz)}
                        onChange={() => handleCheckboxChange(sz, selectedSizes, setSelectedSizes)}
                        className="rounded border-slate-600 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>{sz}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Tipe Oli Checkbox */}
            <div className="border-b border-slate-700/20 pb-3">
              <button onClick={() => setOpenFilterOilType(!openFilterOilType)} className="w-full flex justify-between items-center text-xs font-bold mb-2">
                <span>Tipe Oli</span>
                {openFilterOilType ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {openFilterOilType && (
                <div className="space-y-2">
                  {oilTypes.map(t => (
                    <label key={t} className="flex items-center gap-2 text-xs cursor-pointer opacity-80 hover:opacity-100">
                      <input 
                        type="checkbox" 
                        checked={selectedOilTypes.includes(t)}
                        onChange={() => handleCheckboxChange(t, selectedOilTypes, setSelectedOilTypes)}
                        className="rounded border-slate-600 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition">
              Tampilkan
            </button>

          </div>
        </div>

        {/* KONTEN KANAN: PENCARIAN & GRID PRODUK */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${getCardStyle()}`}>
            <div className={`flex items-center px-3 py-2 rounded-xl border w-full md:w-80 ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'}`}>
              <FiSearch className="opacity-50 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Cari oli buat motormu disini..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full"
              />
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              <div className="text-xs opacity-70 shrink-0">
                Menampilkan <span className="font-bold">{filteredProducts.length}</span> dari {products.length} Data
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs opacity-70">Urutkan</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`text-xs p-2 rounded-xl border outline-none font-medium ${mode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-700'}`}
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="termurah">Harga Termurah</option>
                  <option value="termahal">Harga Termahal</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Link 
              href="/dashboard/otomotif/oli-motor/tambah"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition"
            >
              <FiPlus size={16} /> Tambah Oli Baru
            </Link>
          </div>

          {loading ? (
            <div className={`p-16 text-center rounded-2xl border text-xs opacity-60 ${getCardStyle()}`}>Memuat data oli...</div>
          ) : filteredProducts.length === 0 ? (
            <div className={`p-16 text-center rounded-2xl border text-xs opacity-50 ${getCardStyle()}`}>Tidak ada oli yang sesuai dengan kriteria filter.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(item => {
                const isLowStock = item.stock <= item.min_stock;
                
                const productPrice = Number(item.sell_price ?? item.price ?? 0);
                const productBuyPrice = Number(item.buy_price ?? item.modal_price ?? 0);

                const formattedPrice = formatRupiah(productPrice); 
                const priceWithoutPrefix = formattedPrice.replace(/^Rp\s*/, '');

                const isLight = mode === 'light';
                const cardBg = isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-[#16222A] text-slate-100 border-slate-800';
                const imageBg = isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/60 border-slate-700/60';
                const footerBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-slate-800';

                return (
                  <div key={item.id} className={`rounded-3xl border overflow-hidden flex flex-col justify-between relative group transition hover:shadow-xl ${cardBg}`}>
                    
                    {/* BADGE DISKON HARGA */}
{/* BADGE DISKON HARGA - Hanya muncul jika produk memiliki data diskon/harga coret */}
{item.discount_price && Number(item.discount_price) > 0 && (
  <div className="absolute top-0 left-0 z-10">
    <span className="px-4 py-1.5 rounded-tl-2xl rounded-br-2xl bg-red-600 text-white text-[11px] font-bold shadow uppercase tracking-wider inline-block">
      Diskon Harga
    </span>
  </div>
)}

                    <div className="p-4 space-y-3">
                      <Link href={`/dashboard/otomotif/oli-motor/detail/${item.id}`} className="block group-hover:opacity-95 transition">
                        
                        {/* Area Gambar */}
                        <div className={`w-full h-44 rounded-xl mb-3 overflow-hidden flex items-center justify-center relative border ${imageBg}`}>
                          {Array.isArray(item.image_url) && item.image_url.length > 0 ? (
                            <img 
                              src={item.image_url[0]} 
                              alt={item.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                            />
                          ) : typeof item.image_url === 'string' && item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                            />
                          ) : (
                            <div className="text-center">
                              <span className={`text-xs font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{item.brand}</span>
                              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Judul Produk */}
                        <div className="space-y-1">
                          <h2 className={`text-xs font-bold line-clamp-2 uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {item.name}
                          </h2>
                        </div>
                      </Link>

                      {/* HARGA */}
                      <div className="space-y-0.5">
                        <div className={`flex items-baseline ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          <span className="text-xs font-bold mr-0.5">Rp</span>
                          <span className="text-lg font-black tracking-tight">{priceWithoutPrefix}</span>
                        </div>
                        <div className={`text-[11px] flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          <span className="line-through">{formatRupiah(productBuyPrice)}</span>
                          <span className="text-red-600 font-bold">Hemat 15%</span>
                        </div>
                      </div>

                      {/* Xtra Diskon Badge */}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md py-1 px-2 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="bg-emerald-600 text-white rounded px-1 text-[8px]">%</span>
                        <span>Xtra Diskon {formatRupiah(Math.round(productPrice * 0.1))}</span>
                      </div>
                    </div>

                    {/* Footer Kartu */}
                    <div className={`flex items-center justify-between px-4 py-3 border-t ${footerBg}`}>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isLowStock ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        Stok: {item.stock}
                      </span>
                      <div className="flex items-center gap-1">
                        <Link 
                          href={`/dashboard/otomotif/oli-motor/edit/${item.id}`}
                          className={`p-1.5 rounded-lg transition inline-flex items-center justify-center ${isLight ? 'text-slate-600 hover:bg-slate-200 hover:text-blue-600' : 'text-slate-300 hover:bg-slate-800 hover:text-blue-400'}`} 
                          title="Edit"
                        >
                          <FiEdit2 size={13} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className={`p-1.5 rounded-lg transition inline-flex items-center justify-center ${isLight ? 'text-slate-600 hover:bg-slate-200 hover:text-red-600' : 'text-slate-300 hover:bg-slate-800 hover:text-red-400'}`} 
                          title="Hapus"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}