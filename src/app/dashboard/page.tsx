'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import type { InventoryItem } from '@/data/seedData';
import EcoBadge from '@/components/EcoBadge';
import {
  Package,
  AlertTriangle,
  Trash2,
  Sparkles,
  ArrowRight,
  Check,
  Flame,
  ShoppingBag,
  LineChart,
  Recycle,
  GraduationCap,
  Pencil,
  X,
} from 'lucide-react';

const UNITS = ['kg', 'gram', 'liter', 'ml', 'botol', 'pcs', 'pack', 'sachet'];
const LOCATIONS: InventoryItem['location'][] = ['Pantry', 'Kulkas', 'Kamar Mandi', 'Dapur'];

export default function DashboardPage() {
  const { user, inventory, wasteSummary, removeFromInventory, updateInventoryItem } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'Dapur' | 'Pantry' | 'Kamar Mandi'>('all');

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState<InventoryItem['location']>('Pantry');
  const [editQty, setEditQty] = useState('');
  const [editUnit, setEditUnit] = useState('pcs');
  const [editExpiry, setEditExpiry] = useState('');

  const expiringSoon = inventory.filter((item) => {
    if (!item.expiryDate) return false;
    const diffDays = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 5;
  });

  const filteredInventory = activeTab === 'all'
    ? inventory
    : inventory.filter((i) => i.location === activeTab);

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setEditName(item.product.name);
    setEditLocation(item.location);
    setEditQty(String(item.quantity));
    setEditUnit(item.unit);
    setEditExpiry(item.expiryDate || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateInventoryItem(editingItem.id, {
      name: editName.trim() || editingItem.product.name,
      location: editLocation,
      quantity: Number(editQty) || 0,
      unit: editUnit,
      expiryDate: editExpiry,
    });
    setEditingItem(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Welcome */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Rumah Tangga Lestari</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
            {user.householdSize} Anggota
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
          Dashboard Stok & Konsumsi
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Pantau stok, hindari mubazir, dan jaga waste score serendah mungkin.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/products" className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm hover:border-emerald-300 transition-colors">
          <ShoppingBag className="w-5 h-5 text-emerald-600 mb-2" />
          <div className="text-sm font-bold text-slate-900 dark:text-white">Eco Finder</div>
          <div className="text-[11px] text-slate-500">Katalog &amp; pencarian produk</div>
        </Link>
        <Link href="/konsumsi" className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm hover:border-emerald-300 transition-colors">
          <LineChart className="w-5 h-5 text-teal-600 mb-2" />
          <div className="text-sm font-bold text-slate-900 dark:text-white">Konsumsi</div>
          <div className="text-[11px] text-slate-500">Catat belanja &amp; sampah</div>
        </Link>
        <Link href="/sampah" className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm hover:border-emerald-300 transition-colors">
          <Recycle className="w-5 h-5 text-sky-600 mb-2" />
          <div className="text-sm font-bold text-slate-900 dark:text-white">Sampah</div>
          <div className="text-[11px] text-slate-500">Hitung timbulan &amp; pilah</div>
        </Link>
        <Link href="/edukasi" className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm hover:border-emerald-300 transition-colors">
          <GraduationCap className="w-5 h-5 text-amber-600 mb-2" />
          <div className="text-sm font-bold text-slate-900 dark:text-white">Edukasi</div>
          <div className="text-[11px] text-slate-500">Label &amp; anti-greenwashing</div>
        </Link>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Waste recorded */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">Sampah Tercatat</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {wasteSummary.totalKg} <span className="text-xs font-medium text-gray-400">kg</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {wasteSummary.logCount} entri · 30 hari terakhir
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
            {wasteSummary.co2Kg} kg CO₂e dari sampah tercatat
          </div>
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
          {filteredInventory.map((item) => (
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
                    <span className="text-gray-400">Stok:</span>
                    <span className="font-bold">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kedaluwarsa:</span>
                    <span>{item.expiryDate || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => openEdit(item)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Produk
                </button>
                <button
                  onClick={() => removeFromInventory(item.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Hapus dari stok"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Produk Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Edit Produk</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-500"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  Nama Produk
                </label>
                <input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="edit-location" className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  Kategori (Lokasi)
                </label>
                <select
                  id="edit-location"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value as InventoryItem['location'])}
                  className="mt-1 w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-qty" className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  Stok
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    id="edit-qty"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="px-3 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="edit-expiry" className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  Kadaluwarsa
                </label>
                <input
                  id="edit-expiry"
                  type="date"
                  value={editExpiry}
                  onChange={(e) => setEditExpiry(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
