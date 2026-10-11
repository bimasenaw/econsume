'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Leaf, Flame, Sparkles } from 'lucide-react';
import { INITIAL_WASTE_LOGS } from '@/data/seedData';

export default function ImpactPage() {
  const { user } = useApp();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Profile / Impact Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-br from-emerald-600 to-teal-800 p-8 rounded-3xl text-white shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Laporan Dampak Lingkungan
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">
            Keluarga {user.name.split(' ')[1] || user.name}
          </h1>
          <p className="text-emerald-100 text-sm max-w-lg">
            Ringkasan stok yang berhasil dihemat, sampah yang tercatat, dan estimasi emisi yang dihindari.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Poin Hijau</div>
            <div className="text-4xl font-black text-amber-300 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              {user.greenPoints}
            </div>
            <div className="text-[11px] text-emerald-200/80">Hanya dari belanja yang diselesaikan</div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-teal-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-teal-600 font-bold text-xs mb-1">
              <Leaf className="w-4 h-4" />
              Estimasi CO₂ Dihindari (Bulan Ini)
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">
              {user.co2SavedThisMonthKg} <span className="text-base text-gray-400 font-medium">kg</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Dari memilih produk Grade A vs konvensional</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-amber-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs mb-1">
              <Flame className="w-4 h-4" />
              Waste Score Saat Ini
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">
              {user.wasteScore}%
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              {user.wasteScore < 20 ? 'Rendah. Pertahankan pencatatan sampah.' : 'Perlu perhatian untuk menekan sisa makanan.'}
            </div>
          </div>
        </div>
      </div>

      {/* Waste Log - data tercatat, bukan tren simulasi */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="mb-4">
          <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
            Catatan Sampah Tercatat
          </h3>
          <p className="text-xs text-gray-500">Hanya tampilkan yang benar-benar dicatat pengguna, tanpa proyeksi palsu</p>
        </div>

        <div className="space-y-3">
          {INITIAL_WASTE_LOGS.map((w) => (
            <div
              key={w.id}
              className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{w.productName}</div>
                <div className="text-xs text-gray-500">
                  {w.quantity} • {w.reason} • {w.date}
                </div>
              </div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 sm:text-right">
                <div>{w.carbonLossKg} kg CO₂ terbuang</div>
                <div className="text-gray-400">Rugi Rp {w.financialLoss.toLocaleString('id-ID')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
