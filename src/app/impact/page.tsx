'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { WASTE_CATEGORIES, NATIONAL_PER_CAPITA_DAILY_KG } from '@/data/reference';
import { toKg } from '@/data/reference';
import SourcePanel from '@/components/SourcePanel';
import { Leaf, Flame, Sparkles, Trash2, LineChart } from 'lucide-react';

export default function ImpactPage() {
  const { user, wasteSummary, wasteLogs, estimates } = useApp();
  const sufficient = estimates.filter((e) => e.sufficient).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-br from-emerald-600 to-teal-800 p-8 rounded-3xl text-white shadow-lg">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Laporan Dampak (Data Nyata)</span>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">
            Keluarga {user.name.split('&')[0].replace('Keluarga', '').trim() || user.name}
          </h1>
          <p className="text-emerald-100 text-sm max-w-lg">
            Semua angka di halaman ini dihitung dari catatan Anda sendiri + faktor referensi ter-sitasi.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Poin Hijau</div>
          <div className="text-4xl font-black text-amber-300 flex items-center gap-2 justify-end">
            <Sparkles className="w-6 h-6" />
            {user.greenPoints}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-teal-600 font-bold text-xs mb-1">
            <Trash2 className="w-4 h-4" /> Sampah Tercatat (30 hari)
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {wasteSummary.totalKg} <span className="text-base text-slate-400 font-medium">kg</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{wasteSummary.logCount} entri log</div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs mb-1">
            <Flame className="w-4 h-4" /> Jejak CO₂e dari Sampah
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {wasteSummary.co2Kg} <span className="text-base text-slate-400 font-medium">kg</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Faktor Poore &amp; Nemecek (2018) / ADEME</div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-sky-600 font-bold text-xs mb-1">
            <Leaf className="w-4 h-4" /> Sampah per Kapita/Hari
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {wasteSummary.perCapitaDailyKg} <span className="text-base text-slate-400 font-medium">kg</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Rata-rata nasional {NATIONAL_PER_CAPITA_DAILY_KG} kg/kapita/hari
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs mb-1">
            <LineChart className="w-4 h-4" /> Produk dengan Laju Terukur
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {sufficient}
            <span className="text-base text-slate-400 font-medium"> / {estimates.length}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Estimasi hanya untuk produk berdata cukup</div>
        </div>
      </div>

      {/* Waste log */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Catatan Sampah</h3>
        <p className="text-xs text-slate-500 mb-4">Hanya menampilkan yang benar-benar Anda catat.</p>
        <div className="space-y-3">
          {wasteLogs.length === 0 && <p className="text-sm text-slate-500">Belum ada catatan sampah.</p>}
          {wasteLogs.map((w) => {
            const kg = toKg(w.quantity, w.unit);
            const cat = WASTE_CATEGORIES.find((c) => c.id === w.categoryId);
            return (
              <div
                key={w.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{w.productName}</div>
                  <div className="text-xs text-slate-500">
                    {cat?.label ?? w.categoryId} • {w.quantity} {w.unit} {kg !== null && `(≈ ${kg} kg)`} • {w.reason}
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-500 sm:text-right">{w.date}</div>
              </div>
            );
          })}
        </div>
      </div>

      <SourcePanel
        items={[
          { label: 'Konversi satuan', source: 'Tabel indikatif (kg/gram/liter/botol/pcs/sachet...)' },
          { label: 'Faktor emisi', source: 'Poore & Nemecek (2018) untuk pangan; ADEME indikatif untuk material', url: 'https://doi.org/10.1126/science.aaq0216' },
          { label: 'Benchmark nasional', source: 'SIPSN KLHK ÷ BPS ÷ 365', url: 'https://sipsn.menlhk.go.id/' },
          { label: 'Asumsi periode', source: 'Log dianggap 30 hari terakhir' },
        ]}
      />
    </div>
  );
}
