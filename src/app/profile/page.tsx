'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useApp();

  const [name, setName] = useState(user.name);
  const [householdSize, setHouseholdSize] = useState(user.householdSize);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      name,
      householdSize: Number(householdSize),
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          Profil Rumah Tangga
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Hanya dua data yang memengaruhi perhitungan estimasi stok.
        </p>
      </div>

      {/* Main Profile Form */}
      <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-sm space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Nama Keluarga
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-amber-50/20 dark:bg-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Jumlah Anggota Rumah Tangga
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-amber-50/20 dark:bg-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-gray-500">
                Dipakai untuk skala laju konsumsi harian (dibagi 3 sebagai baseline).
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-emerald-600 font-bold">
              {savedSuccess && '✓ Perubahan berhasil disimpan ke profil!'}
            </span>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Info jujur */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
          Batasan saat ini
        </h3>
        <ul className="mt-2 text-xs text-gray-500 space-y-1 list-disc pl-4">
          <li>Estimasi laju konsumsi dihitung dari histori pembelian Anda (butuh ≥2 pembelian &amp; rentang ≥14 hari).</li>
          <li>Data produk &amp; Eco-Score utama bersumber dari Open Food Facts (basis data terbuka), bukan karangan.</li>
          <li>Faktor emisi &amp; konversi satuan memakai referensi tersitasi (indikatif), bukan pengukuran langsung.</li>
          <li>Tidak ada prediksi bila data belum cukup — aplikasi menandainya secara jujur.</li>
        </ul>
      </div>
    </div>
  );
}
