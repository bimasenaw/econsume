'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { SEED_PRODUCTS, ProductData } from '@/data/seedData';
import EcoBadge from '@/components/EcoBadge';
import { 
  Search, 
  Filter, 
  Scale, 
  Sparkles, 
  Leaf, 
  X, 
  Check, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export default function ProductsPage() {
  const { compareList, addToCompare, removeFromCompare, clearCompare, addToShoppingList } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedGrade, setSelectedGrade] = useState('Semua');
  const [selectedCert, setSelectedCert] = useState('Semua');
  const [showCompareModal, setShowCompareModal] = useState(false);

  const categories = ['Semua', 'Makanan & Minuman', 'Perawatan Diri', 'Pembersih Rumah', 'Dapur & Pantry'];
  const grades = ['Semua', 'A', 'B', 'C', 'D', 'E'];
  const certOptions = ['Semua', 'Organik', 'Fair Trade', 'FSC', 'Zero Waste', 'Cruelty-Free'];

  const allProducts = useMemo(() => [...SEED_PRODUCTS], []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((prod) => {
      const matchSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.ingredients.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'Semua' || prod.category === selectedCategory;
      const matchGrade = selectedGrade === 'Semua' || prod.grade === selectedGrade;
      const matchCert =
        selectedCert === 'Semua' ||
        prod.certifications.some((c) => c.toLowerCase().includes(selectedCert.toLowerCase()));

      return matchSearch && matchCategory && matchGrade && matchCert;
    });
  }, [searchQuery, selectedCategory, selectedGrade, selectedCert]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Katalog Berkelanjutan</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              {filteredProducts.length} Produk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Eco-Product Finder
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cari produk ramah lingkungan dengan Eco-Score transparan, sertifikasi hijau, dan jejak karbon rendah.
          </p>
        </div>

        {compareList.length > 0 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 flex items-center gap-2 transition-all"
          >
            <Scale className="w-4 h-4" />
            <span>Bandingkan ({compareList.length}/3)</span>
          </button>
        )}
      </div>

      {/* Search & Filter Chips */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk, merek, atau bahan organik..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-amber-50/20 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filter Sections */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold hide-scrollbar">
            <span className="text-gray-400 shrink-0">Kategori:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Eco-Score Grade */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold hide-scrollbar">
            <span className="text-gray-400 shrink-0">Eco-Score:</span>
            {grades.map((gr) => (
              <button
                key={gr}
                onClick={() => setSelectedGrade(gr)}
                className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
                  selectedGrade === gr
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {gr === 'Semua' ? 'Semua Grade' : `Grade ${gr}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const isComparing = compareList.some((p) => p.id === product.id);
          return (
            <div
              key={product.id}
              className="group p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <EcoBadge grade={product.grade} score={product.ecoScore} size="sm" />
                  </div>
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-emerald-600 mb-0.5">{product.brand}</div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug line-clamp-2 mb-2">
                  {product.name}
                </h3>

                {/* Certifications badges */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.certifications.slice(0, 2).map((cert, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-100 dark:border-emerald-900"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-gray-900 dark:text-white">
                    Rp {product.price.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">{product.unit}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (isComparing) {
                        removeFromCompare(product.id);
                      } else {
                        addToCompare(product);
                      }
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                      isComparing
                        ? 'bg-teal-50 border-teal-400 text-teal-700'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isComparing ? 'Dibatalkan' : 'Bandingkan'}</span>
                  </button>
                  <Link
                    href={`/products/${product.id}`}
                    className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors text-center"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 max-w-4xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Perbandingan Produk Side-by-Side
                </h3>
                <p className="text-xs text-gray-500">Bandingkan metrik Eco-Score, bahan, dan harga</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearCompare}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Bersihkan
                </button>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {compareList.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-amber-50/40 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <img src={p.imageUrl} alt={p.name} className="w-full h-32 object-cover rounded-xl mb-2" />
                    <EcoBadge grade={p.grade} score={p.ecoScore} size="sm" showLabel />
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-2">{p.name}</h4>
                    <div className="text-xs text-emerald-600 font-semibold">{p.brand}</div>
                    
                    <div className="mt-3 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <div><strong>Harga:</strong> Rp {p.price.toLocaleString('id-ID')}</div>
                      <div><strong>Jejak Karbon:</strong> {p.co2PerUnitKg} kg CO₂/unit</div>
                      <div><strong>Kemasan:</strong> {p.packagingType}</div>
                      <div><strong>Asal:</strong> {p.origin}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addToShoppingList(p);
                      alert(`${p.name} ditambahkan ke Daftar Belanja!`);
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>+ Belanja</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
