'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  WASTE_CATEGORIES,
  NATIONAL_WASTE,
  POPULATION,
  NATIONAL_PER_CAPITA_DAILY_KG,
} from '@/data/reference';
import { wasteFactor } from '@/lib/tracking';
import SourcePanel from '@/components/SourcePanel';
import {
  Calculator,
  Trash2,
  Recycle,
  MapPin,
  Plus,
  AlertTriangle,
  ExternalLink,
  Leaf,
} from 'lucide-react';

interface LocalBank {
  id: string;
  name: string;
  area: string;
  contact: string;
}

const TONE_TEXT: Record<string, string> = {
  emerald: 'text-emerald-600',
  sky: 'text-sky-600',
  slate: 'text-slate-600',
  rose: 'text-rose-600',
};

export default function SampahPage() {
  const { user, wasteSummary } = useApp();

  // Quick calculator (manual, monthly kg)
  const [manual, setManual] = useState<Record<string, string>>({
    organik: '0',
    anorganik_daur: '0',
    residu: '0',
    b3: '0',
  });

  const manualRows = WASTE_CATEGORIES.map((c) => {
    const kg = Number(manual[c.id]) || 0;
    return { category: c, kg, co2: Number((kg * wasteFactor(c.id)).toFixed(2)) };
  });
  const manualTotalKg = Number(manualRows.reduce((a, r) => a + r.kg, 0).toFixed(2));
  const manualTotalCo2 = Number(manualRows.reduce((a, r) => a + r.co2, 0).toFixed(2));
  const manualPerCapita =
    user.householdSize > 0 ? Number((manualTotalKg / user.householdSize / 30).toFixed(3)) : 0;
  const manualRatio =
    NATIONAL_PER_CAPITA_DAILY_KG > 0
      ? Number((manualPerCapita / NATIONAL_PER_CAPITA_DAILY_KG).toFixed(2))
      : 0;

  // Local bank sampah notes
  const [banks, setBanks] = useState<LocalBank[]>([]);
  const [bName, setBName] = useState('');
  const [bArea, setBArea] = useState('');
  const [bContact, setBContact] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ecoconsume_bank_sampah');
      if (raw) setBanks(JSON.parse(raw));
    } catch {}
  }, []);

  const saveBanks = (next: LocalBank[]) => {
    setBanks(next);
    try {
      localStorage.setItem('ecoconsume_bank_sampah', JSON.stringify(next));
    } catch {}
  };

  const addBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim()) return;
    saveBanks([{ id: `b-${Date.now()}`, name: bName.trim(), area: bArea.trim(), contact: bContact.trim() }, ...banks]);
    setBName('');
    setBArea('');
    setBContact('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Timbulan & Pemilahan</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Sampah Rumah Tangga</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Ukur timbulan sampah keluarga Anda, bandingkan dengan rata-rata nasional, dan pelajari cara
          memilah yang benar.
        </p>
      </div>

      {/* Dari catatan pengguna */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-500" /> Dari Catatan Sampah Anda (30 hari)
        </h2>

        {wasteSummary.logCount === 0 ? (
          <p className="text-sm text-slate-500 py-4">
            Belum ada catatan sampah. Tambahkan di halaman <span className="font-bold">Konsumsi</span>.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label="Total sampah" value={`${wasteSummary.totalKg} kg`} tone="rose" />
              <Stat label="Jejak CO₂e" value={`${wasteSummary.co2Kg} kg`} tone="amber" />
              <Stat label="Per kapita/hari" value={`${wasteSummary.perCapitaDailyKg} kg`} tone="teal" />
              <Stat
                label="vs rata-rata nasional"
                value={`${wasteSummary.ratioToNational}×`}
                tone="emerald"
                hint={`Nasional ${wasteSummary.nationalPerCapitaDailyKg} kg/kapita/hari`}
              />
            </div>

            <div className="space-y-2">
              {wasteSummary.byCategory.map((c) => {
                const pct = wasteSummary.totalKg > 0 ? (c.kg / wasteSummary.totalKg) * 100 : 0;
                return (
                  <div key={c.category.id}>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-200">{c.category.label}</span>
                      <span className="text-slate-900 dark:text-white">
                        {c.kg} kg · {c.co2Kg} kg CO₂e
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {wasteSummary.unconvertible.length > 0 && (
              <p className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-3 py-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {wasteSummary.unconvertible.length} catatan tidak punya satuan-ke-kg yang dikenal, sehingga
                belum dihitung. Gunakan satuan kg/gram/liter/botol/pcs/sachet.
              </p>
            )}

            <SourcePanel
              items={[
                { label: 'Benchmark nasional', source: `${NATIONAL_WASTE.totalTonsPerYear.toLocaleString('id-ID')} ton/tahun — ${NATIONAL_WASTE.source}`, url: NATIONAL_WASTE.sourceUrl },
                { label: 'Populasi', source: `${POPULATION.total.toLocaleString('id-ID')} jiwa (${POPULATION.year}) — ${POPULATION.source}`, url: POPULATION.sourceUrl },
                { label: 'Rata-rata nasional', source: `${NATIONAL_PER_CAPITA_DAILY_KG} kg/kapita/hari (SIPSN ÷ BPS ÷ 365)` },
                { label: 'Faktor CO₂', source: 'Poore & Nemecek (2018) untuk makanan; ADEME (indikatif) untuk material', url: 'https://doi.org/10.1126/science.aaq0216' },
                { label: 'Asumsi periode', source: 'Log dianggap mencakup 30 hari terakhir' },
              ]}
            />
          </>
        )}
      </div>

      {/* Quick calculator */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-600" /> Kalkulator Cepat (per bulan)
        </h2>
        <p className="text-xs text-slate-500 -mt-2">
          Masukkan berat nyata tiap kategori (timbang/estimasi ember Anda) untuk melihat timbulan & CO₂e.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {WASTE_CATEGORIES.map((c) => (
            <div key={c.id}>
              <label htmlFor={`m-${c.id}`} className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {c.label} (kg)
              </label>
              <input
                id={`m-${c.id}`}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={manual[c.id]}
                onChange={(e) => setManual((m) => ({ ...m, [c.id]: e.target.value }))}
                className="mt-1 w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total" value={`${manualTotalKg} kg`} tone="rose" />
          <Stat label="CO₂e" value={`${manualTotalCo2} kg`} tone="amber" />
          <Stat label="Per kapita/hari" value={`${manualPerCapita} kg`} tone="teal" />
          <Stat label="vs nasional" value={`${manualRatio}×`} tone="emerald" />
        </div>
        <SourcePanel
          items={[
            { label: 'CO₂ makanan', source: 'Poore & Nemecek (2018)', url: 'https://doi.org/10.1126/science.aaq0216' },
            { label: 'CO₂ material', source: 'ADEME (nilai indikatif)' },
            { label: 'Per kapita', source: 'Total ÷ jumlah anggota ÷ 30 hari' },
          ]}
        />
      </div>

      {/* Sorting guide */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Recycle className="w-5 h-5 text-emerald-600" /> Panduan Pemilahan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WASTE_CATEGORIES.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <Leaf className={`w-4 h-4 ${TONE_TEXT[c.color] ?? 'text-emerald-600'}`} />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{c.label}</h3>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.examples.map((ex) => (
                  <span key={ex} className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {ex}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{c.handling}</p>
            </div>
          ))}
        </div>
        <SourcePanel
          title="Rujukan pemilahan"
          items={[
            { label: 'Alur kategori', source: 'Organik / Anorganik / B3 / Residu mengikuti panduan KLHK & SIPSN', url: 'https://sipsn.menlhk.go.id/' },
            { label: 'Prinsip 3R', source: 'Reduce → Reuse → Recycle (prioritas berurutan)' },
          ]}
        />
      </div>

      {/* Bank sampah */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" /> Bank Sampah di Sekitar Anda
        </h2>
        <p className="text-xs text-slate-500 -mt-2">
          Kami tidak menebak lokasi. Temukan yang resmi lewat kanal berikut, lalu simpan catatan lokal Anda.
        </p>

        <div className="flex flex-wrap gap-2">
          <a href="https://sipsn.menlhk.go.id/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100">
            SIPSN KLHK <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a href="https://www.google.com/maps/search/bank+sampah" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100">
            Cari di peta <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <form onSubmit={addBank} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            value={bName}
            onChange={(e) => setBName(e.target.value)}
            placeholder="Nama bank sampah"
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <input
            value={bArea}
            onChange={(e) => setBArea(e.target.value)}
            placeholder="Area/alamat"
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <input
            value={bContact}
            onChange={(e) => setBContact(e.target.value)}
            placeholder="Kontak"
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button type="submit" className="cursor-pointer px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> Simpan
          </button>
        </form>

        {banks.length > 0 && (
          <div className="space-y-2">
            {banks.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{b.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {[b.area, b.contact].filter(Boolean).join(' · ') || 'Tanpa detail'}
                  </div>
                </div>
                <button
                  onClick={() => saveBanks(banks.filter((x) => x.id !== b.id))}
                  aria-label={`Hapus ${b.name}`}
                  className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: 'rose' | 'amber' | 'teal' | 'emerald';
  hint?: string;
}) {
  const tones: Record<string, string> = {
    rose: 'text-rose-600',
    amber: 'text-amber-600',
    teal: 'text-teal-600',
    emerald: 'text-emerald-600',
  };
  return (
    <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="text-[11px] font-bold text-slate-400">{label}</div>
      <div className={`text-xl font-black ${tones[tone]}`}>{value}</div>
      {hint && <div className="text-[10px] text-slate-400 mt-0.5">{hint}</div>}
    </div>
  );
}
