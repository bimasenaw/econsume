import Link from 'next/link';
import { 
  Sparkles, 
  ScanBarcode, 
  TrendingDown, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Recycle, 
  BarChart3, 
  Award,
  Zap,
  ChevronRight
} from 'lucide-react';
import EcoBadge from '@/components/EcoBadge';
import { SEED_PRODUCTS } from '@/data/seedData';

export default function LandingPage() {
  const topEcoProducts = SEED_PRODUCTS.filter(p => p.grade === 'A').slice(0, 3);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 md:pt-16 pb-12 rounded-3xl bg-gradient-to-b from-emerald-100/60 via-amber-50 to-amber-50/20 dark:from-emerald-950/30 dark:via-gray-900 dark:to-gray-900 border border-emerald-100/80 dark:border-emerald-900/30 px-6 sm:px-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-semibold mb-6 animate-pulse">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>AI Household Assistant & Green Product Tracker</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Belanja Lebih Cerdas, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500">
            Hidup Lebih Hijau.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Kombinasi asisten prediksi konsumsi rumah tangga bertenaga AI dengan direktori Eco-Score 5 kriteria untuk mengurangi sampah dan jejak karbon keluarga Anda.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span>Buka Dashboard Rumah Tangga</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/scan"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold text-base border border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02]"
          >
            <ScanBarcode className="w-4 h-4 text-emerald-600" />
            <span>Scan Barcode Produk</span>
          </Link>
        </div>

        {/* Value Highlights */}
        <div className="mt-12 pt-8 border-t border-emerald-200/50 dark:border-gray-800 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Prediksi Stok Habis Real-Time</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sertifikasi & Eco-Score A-E</span>
          </div>
          <div className="flex items-center gap-2">
            <Recycle className="w-4 h-4 text-emerald-600" />
            <span>Hemat CO₂ & Cegah Makanan Basi</span>
          </div>
        </div>
      </section>

      {/* 3 Core Features Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Tiga Pilar Utama EcoConsume AI
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Solusi menyeluruh dari inventaris dapur hingga pemilihan produk berkelanjutan di rak supermarket.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mb-5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Estimasi Konsumsi Waktu Nyata
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Estimasi sederhana tanggal habis setiap bahan pokok berdasarkan jumlah anggota keluarga dan laju pemakaian harian.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>Lihat Dashboard Stok</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 mb-5">
              <ScanBarcode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Eco-Score 5 Kriteria & Barcode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Scan barcode kemasan dan temukan kalkulasi transparansi rantai pasok, jejak karbon, bahan baku, kemasan daur ulang, serta sertifikasi.
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>Coba Scanner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 mb-5">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Smart Shopping & Anti-Waste
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Daftar belanja otomatis hanya memasukkan item yang segera habis dan merekomendasikan alternatif produk berkategori Grade A dengan harga terbaik.
            </p>
            <Link
              href="/shopping-list"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>Lihat Shopping List</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Grade A Alternatives Section */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Produk Unggulan Berkelanjutan</span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">Pilihan Ramah Lingkungan Grade A</h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
          >
            <span>Eksplor Semua ({SEED_PRODUCTS.length} Produk)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topEcoProducts.map((product) => (
            <div
              key={product.id}
              className="group p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-amber-50/30 dark:bg-gray-800/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <EcoBadge grade={product.grade} score={product.ecoScore} size="sm" />
                  </div>
                </div>

                <div className="text-xs font-semibold text-emerald-600 mb-1">{product.brand}</div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-1 mb-2">
                  {product.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                  {product.description}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-400">Harga Estimasi</div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-white">
                    Rp {product.price.toLocaleString('id-ID')}
                  </div>
                </div>
                <Link
                  href={`/products/${product.id}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dampak / Callout */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>Hidup Minim Sampah</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black leading-tight">
            Kurangi Sampah & Jejak Karbon dari Dapur Sendiri
          </h2>
          <p className="text-sm text-emerald-100">
            Pantau stok sebelum kedaluwarsa, pilih produk Grade A, dan catat setiap sampah yang berhasil dicegah.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/impact"
            className="px-6 py-3.5 rounded-xl bg-white text-emerald-800 font-extrabold text-sm text-center shadow-lg hover:bg-emerald-50 transition-colors"
          >
            Lihat Waste Score & Poin
          </Link>
        </div>
      </section>
    </div>
  );
}
