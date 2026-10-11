'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import EcoBadge from '@/components/EcoBadge';
import { 
  Sparkles, 
  Trash2, 
  Plus, 
  Check, 
  ShoppingBag, 
  ArrowLeft, 
  Leaf, 
  AlertCircle,
  Share2,
  DollarSign
} from 'lucide-react';
import { SEED_PRODUCTS } from '@/data/seedData';

export default function ShoppingListPage() {
  const { 
    shoppingList, 
    toggleShoppingItem, 
    removeShoppingItem, 
    addToShoppingList,
    generateShoppingListFromPredictions,
    addGreenPoints 
  } = useApp();

  const [newItemName, setNewItemName] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Financial & Carbon totals
  const totalEstimatedPrice = shoppingList.reduce((acc, curr) => acc + (curr.estimatedPrice || 0), 0);
  const totalCarbonSaved = shoppingList.reduce((acc, curr) => acc + (curr.carbonSavedKg || 0), 0);
  const completedCount = shoppingList.filter((item) => item.checked).length;

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    // Try finding matching seed product or default to generic
    const found = SEED_PRODUCTS.find((p) => p.name.toLowerCase().includes(newItemName.toLowerCase()));
    if (found) {
      addToShoppingList(found, 1, false);
    } else {
      addToShoppingList(SEED_PRODUCTS[0], 1, false);
    }
    setNewItemName('');
  };

  const handleCheckoutCompleted = () => {
    if (completedCount === 0) return;
    addGreenPoints(completedCount * 20, `Menyelesaikan ${completedCount} item belanja hijau`);
    alert(`Hebat! Anda menyelesaikan ${completedCount} item belanja dan mendapatkan ${completedCount * 20} Poin Hijau!`);
  };

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Smart Shopping</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              Estimasi Stok
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Daftar Belanja Cerdas
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Prioritas otomatis berdasarkan prediksi kehabisan stok & rekomendasi produk Grade A.
          </p>
        </div>

        <button
          onClick={() => {
            generateShoppingListFromPredictions();
            setCopiedNotification(true);
            setTimeout(() => setCopiedNotification(false), 3000);
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{copiedNotification ? 'Diperbarui dari Stok!' : 'Generate dari Stok Menipis'}</span>
        </button>
      </div>

      {/* Summary Cards: Carbon & Budget Estimation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Estimate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 mb-1">Estimasi Pengeluaran</div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Rp {totalEstimatedPrice.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">{shoppingList.length} item terdaftar</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
            Rp
          </div>
        </div>

        {/* Carbon Reduction Potential */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 mb-1">Potensi Penghematan CO₂</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">
              +{totalCarbonSaved.toFixed(1)} <span className="text-xs font-medium text-gray-400">kg CO₂</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Memilih Grade A dibanding konvensional</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 mb-1">Status Keranjang</div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {completedCount} / {shoppingList.length} <span className="text-xs font-medium text-gray-400">dibeli</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {completedCount === shoppingList.length && shoppingList.length > 0 ? 'Semua selesai!' : 'Belanja sedang berlangsung'}
            </div>
          </div>
          <button
            onClick={handleCheckoutCompleted}
            disabled={completedCount === 0}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              completedCount > 0 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            Selesaikan
          </button>
        </div>
      </div>

      {/* Shopping Items List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm space-y-4">
        {/* Quick Add Bar */}
        <form onSubmit={handleManualAdd} className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Tambah produk baru (contoh: Beras, Sabun Lerak, Gula Aren)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-amber-50/20 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </form>

        {/* Empty state */}
        {shoppingList.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Daftar Belanja Masih Kosong</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Klik tombol &ldquo;Generate dari Stok Menipis&rdquo; di atas untuk memasukkan produk yang segera habis di rumah.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {shoppingList.map((item) => (
              <div
                key={item.id}
                className={`py-3.5 flex items-center justify-between gap-3 transition-colors ${
                  item.checked ? 'opacity-50 line-through' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggleShoppingItem(item.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                      item.checked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500 bg-white dark:bg-gray-800'
                    }`}
                  >
                    {item.checked && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <EcoBadge grade={item.grade} score={item.ecoScore} size="sm" />

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </span>
                      {item.isAiRecommended && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Stok Menipis
                        </span>
                      )}
                      {item.priority === 'high' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          Urgen
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.brand} • {item.quantity} {item.unit} • Rp {item.estimatedPrice.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/products/${item.productId}`}
                    className="hidden sm:inline text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    Info
                  </Link>
                  <button
                    onClick={() => removeShoppingItem(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
