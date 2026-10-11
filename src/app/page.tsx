import Link from 'next/link';
import { 
  Sparkles, 
  Camera, 
  BrainCircuit, 
  TrendingDown, 
  ArrowRight, 
  ShieldCheck, 
  Recycle, 
  Award,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
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
          Asisten rumah tangga bertenaga AI dengan direktori Eco-Score 5 kriteria untuk mengurangi sampah dan jejak karbon keluarga Anda.
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
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Deteksi Produk (Foto AI)</span>
          </Link>
        </div>

        {/* Value Highlights */}
        <div className="mt-12 pt-8 border-t border-emerald-200/50 dark:border-gray-800 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
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
            Pilar Utama Econsume
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Solusi menyeluruh dari inventaris dapur hingga pemilihan produk berkelanjutan di rak supermarket.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 mb-5">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Deteksi Produk dengan AI
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Foto kemasan dan biarkan AI membaca jenis barang lalu menghitung jejak karbon, sampah, serta skor SIH.
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>Coba Deteksi AI</span>
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
