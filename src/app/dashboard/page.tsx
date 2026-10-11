'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import EcoBadge from '@/components/EcoBadge';
import {
  Package,
  AlertTriangle,
  Trash2,
  Sparkles,
  Clock,
  PlusCircle,
  ArrowRight,
  Check,
  Flame,
  ShoppingBag
} from 'lucide-react';

export default function DashboardPage() {
  const { 
    user, 
    inventory, 
    predictions, 
    removeFromInventory, 
    generateShoppingListFromPredictions,
    addToShoppingList
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'Dapur' | 'Pantry' | 'Kamar Mandi'>('all');
  const [copiedAlert, setCopiedAlert] = useState(false);

  // Filter items running out soon (<= 4 days)
  const runningOutSoon = predictions.filter((p) => p.daysRemaining <= 4);

  // Filter items expiring soon (<= 5 days from today)
  const expiringSoon = inventory.filter((item) => {
    if (!item.expiryDate) return false;
    const diffDays = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 5;
  });

  const filteredInventory = activeTab === 'all' 
    ? inventory 
    : inventory.filter((i) => i.location === activeTab);

  const handleGenerateSmartList = () => {
    generateShoppingListFromPredictions();
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Rumah Tangga Lestari</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
              {user.householdSize} Anggota
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Dashboard Stok & Konsumsi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pantau laju pemakaian, hindari mubazir, dan jaga waste score serendah mungkin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateSmartList}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{copiedAlert ? 'Daftar Diperbarui!' : 'Generate Belanja'}</span>
          </button>
          <Link
            href="/scan"
            className="p-2.5 rounded-xl bg-amber-100 dark:bg-gray-800 text-amber-900 dark:text-amber-300 hover:bg-amber-200 font-bold transition-colors"
            title="Scan Tambah Stok"
          >
            <PlusCircle className="w-5 h-5 text-emerald-600" />
          </Link>
          <Link
            href="/detect"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
            title="Deteksi kemasan SIH"
          >
            <span>Deteksi SIH</span>
          </Link>
        </div>
      </div>

      {/* Banner Deteksi Kemasan */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-teal-100">Tanpa barcode? Foto kemasan cukup</div>
          <div className="font-black text-base sm:text-lg">Hitung kiloan + harga → karbon, sampah & 6 aspek SIH</div>
        </div>
        <Link href="/detect" className="px-5 py-2.5 rounded-xl bg-white text-teal-800 font-extrabold text-xs sm:text-sm text-center hover:bg-teal-50 transition-colors">
          Buka Deteksi Kemasan
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Inventory */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">Stok Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {inventory.length} <span className="text-xs font-medium text-gray-400">item</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>●</span> Semua kategori tercatat
          </div>
        </div>

        {/* Depleting Soon */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">Akan Habis</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {runningOutSoon.length} <span className="text-xs font-medium text-gray-400">item</span>
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Habis dalam 4 hari ke depan
          </div>
        </div>

        {/* Waste Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">Waste Score</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {user.wasteScore}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Kategori Sangat Rendah Sampah
          </div>
        </div>

        {/* Green Points */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">Poin Hijau</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {user.greenPoints}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-1">
            {user.co2SavedThisMonthKg} kg CO₂ terselamatkan
          </div>
        </div>
      </div>

      {/* Action alerts: Expiring & Running Out */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Akan Habis (Urgensi Belanja) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-amber-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Perlu Dibeli Minggu Ini
                </h3>
                <span className="text-xs text-gray-500">Prediksi habis &lt;= 4 hari</span>
              </div>
            </div>
            <Link
              href="/shopping-list"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Lihat Belanja</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {runningOutSoon.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                Semua stok aman untuk 4 hari ke depan!
              </p>
            ) : (
              runningOutSoon.map((item) => (
                <div
                  key={item.productId}
                  className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-gray-800/50 border border-amber-100 dark:border-gray-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <EcoBadge grade={item.product.grade} size="sm" />
                    <div className="truncate">
                      <div className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        Tersisa {item.daysRemaining} hari ({item.currentStock} {item.product.unit.split(' ')[0]})
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addToShoppingList(item.product, 1, true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 whitespace-nowrap shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>+ Belanja</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Akan Kedaluwarsa */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-rose-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Akan Kedaluwarsa
                </h3>
                <span className="text-xs text-gray-500">Gunakan segera sebelum basi</span>
              </div>
            </div>
            <Link
              href="/impact"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>Waste Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {expiringSoon.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                Bagus! Tidak ada produk yang mendekati tanggal kedaluwarsa.
              </p>
            ) : (
              expiringSoon.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-gray-800/50 border border-rose-100 dark:border-gray-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                      EXP
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                        {inv.product.name}
                      </div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                        Kadaluwarsa: {inv.expiryDate} (Lokasi: {inv.location})
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromInventory(inv.id)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-rose-100 text-gray-700 dark:text-gray-200 hover:text-rose-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Habis Dipakai</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Household Inventory Management */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
              Inventaris Rumah Tangga ({filteredInventory.length})
            </h3>
            <p className="text-xs text-gray-500">
              Kelola stok pantry, kulkas, dan kamar mandi keluarga Anda
            </p>
          </div>

          {/* Location Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'Dapur', 'Pantry', 'Kamar Mandi'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-white shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab === 'all' ? 'Semua Ruang' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.map((item) => {
            const pred = predictions.find((p) => p.productId === item.productId);
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                      {item.location}
                    </span>
                    <EcoBadge grade={item.product.grade} score={item.product.ecoScore} size="sm" />
                  </div>

                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug line-clamp-1">
                    {item.product.name}
                  </h4>
                  <div className="text-xs text-emerald-600 font-semibold mb-3">
                    {item.product.brand}
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 bg-amber-50/40 dark:bg-gray-800/40 p-2.5 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sisa Stok:</span>
                      <span className="font-bold">{item.quantity} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prediksi Habis:</span>
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        {pred ? `${pred.daysRemaining} hari (${pred.predictedEmptyDate})` : '14 hari'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kedaluwarsa:</span>
                      <span>{item.expiryDate || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Detail Produk
                  </Link>
                  <button
                    onClick={() => removeFromInventory(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Hapus dari stok"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
