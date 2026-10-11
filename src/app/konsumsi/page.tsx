'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { WASTE_CATEGORIES } from '@/data/reference';
import SourcePanel from '@/components/SourcePanel';
import {
  ShoppingCart,
  Trash2,
  Plus,
  LineChart,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const UNITS = ['kg', 'gram', 'liter', 'ml', 'botol', 'pcs', 'pack', 'sachet'];
const TODAY = new Date().toISOString().split('T')[0];

export default function KonsumsiPage() {
  const {
    purchaseLogs,
    estimates,
    addPurchaseLog,
    removePurchaseLog,
    wasteLogs,
    addWasteLog,
    removeWasteLog,
  } = useApp();

  const [pName, setPName] = useState('');
  const [pQty, setPQty] = useState('1');
  const [pUnit, setPUnit] = useState('kg');
  const [pPrice, setPPrice] = useState('0');
  const [pDate, setPDate] = useState(TODAY);

  const [wName, setWName] = useState('');
  const [wCat, setWCat] = useState(WASTE_CATEGORIES[0].id);
  const [wQty, setWQty] = useState('1');
  const [wUnit, setWUnit] = useState('kg');
  const [wReason, setWReason] = useState('');
  const [wDate, setWDate] = useState(TODAY);

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const name = pName.trim();
    if (!name) return;
    addPurchaseLog({
      productName: name,
      quantity: Number(pQty) || 0,
      unit: pUnit,
      price: Number(pPrice) || 0,
      purchasedAt: pDate,
    });
    setPName('');
    setPQty('1');
    setPPrice('0');
  };

  const handleAddWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const name = wName.trim();
    if (!name) return;
    addWasteLog({
      productName: name,
      categoryId: wCat,
      quantity: Number(wQty) || 0,
      unit: wUnit,
      reason: wReason.trim() || 'Tidak disebutkan',
      date: wDate,
      source: 'sisa',
    });
    setWName('');
    setWQty('1');
    setWReason('');
  };

  const sufficientCount = estimates.filter((e) => e.sufficient).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pelacakan Empiris</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Catatan Konsumsi &amp; Sampah
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Semua estimasi dihitung dari catatan Anda sendiri — bukan prediksi karangan. Catat pembelian
          agar laju konsumsi bisa dihitung, dan catat sampah agar timbulan bisa diukur.
        </p>
      </div>

      {/* Purchase + Waste forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase form */}
        <form
          onSubmit={handleAddPurchase}
          className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm p-5 space-y-4"
        >
          <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" /> Catat Pembelian
          </h2>
          <div>
            <label htmlFor="p-name" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Nama produk
            </label>
            <input
              id="p-name"
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              placeholder="cth: Beras Pandan Wangi 5kg"
              className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-amber-50/30 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="p-qty" className="text-xs font-bold text-slate-700 dark:text-slate-200">Jumlah</label>
              <input
                id="p-qty"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={pQty}
                onChange={(e) => setPQty(e.target.value)}
                className="mt-1 w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="p-unit" className="text-xs font-bold text-slate-700 dark:text-slate-200">Satuan</label>
              <select
                id="p-unit"
                value={pUnit}
                onChange={(e) => setPUnit(e.target.value)}
                className="mt-1 w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-price" className="text-xs font-bold text-slate-700 dark:text-slate-200">Harga (Rp)</label>
              <input
                id="p-price"
                type="number"
                inputMode="numeric"
                min={0}
                step="500"
                value={pPrice}
                onChange={(e) => setPPrice(e.target.value)}
                className="mt-1 w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="p-date" className="text-xs font-bold text-slate-700 dark:text-slate-200">Tanggal</label>
            <input
              id="p-date"
              type="date"
              value={pDate}
              max={TODAY}
              onChange={(e) => setPDate(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> Simpan Pembelian
          </button>
        </form>

        {/* Waste form */}
        <form
          onSubmit={handleAddWaste}
          className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm p-5 space-y-4"
        >
          <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" /> Catat Sampah
          </h2>
          <div>
            <label htmlFor="w-name" className="text-xs font-bold text-slate-700 dark:text-slate-200">Nama/item sampah</label>
            <input
              id="w-name"
              value={wName}
              onChange={(e) => setWName(e.target.value)}
              placeholder="cth: Sisa sayur / botol PET"
              className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-amber-50/30 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="w-cat" className="text-xs font-bold text-slate-700 dark:text-slate-200">Kategori</label>
            <select
              id="w-cat"
              value={wCat}
              onChange={(e) => setWCat(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {WASTE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="w-qty" className="text-xs font-bold text-slate-700 dark:text-slate-200">Berat/jumlah</label>
              <input
                id="w-qty"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={wQty}
                onChange={(e) => setWQty(e.target.value)}
                className="mt-1 w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="w-unit" className="text-xs font-bold text-slate-700 dark:text-slate-200">Satuan</label>
              <select
                id="w-unit"
                value={wUnit}
                onChange={(e) => setWUnit(e.target.value)}
                className="mt-1 w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="w-reason" className="text-xs font-bold text-slate-700 dark:text-slate-200">Alasan</label>
              <input
                id="w-reason"
                value={wReason}
                onChange={(e) => setWReason(e.target.value)}
                placeholder="cth: basi / kemasan"
                className="mt-1 w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="w-date" className="text-xs font-bold text-slate-700 dark:text-slate-200">Tanggal</label>
              <input
                id="w-date"
                type="date"
                value={wDate}
                max={TODAY}
                onChange={(e) => setWDate(e.target.value)}
                className="mt-1 w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> Simpan Sampah
          </button>
        </form>
      </div>

      {/* Estimates */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-emerald-600" /> Laju Konsumsi (dari histori Anda)
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {sufficientCount}/{estimates.length} siap dihitung
          </span>
        </div>

        {estimates.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">Belum ada catatan pembelian.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2 pr-3">Produk</th>
                  <th className="py-2 pr-3">Pembelian</th>
                  <th className="py-2 pr-3">Hari</th>
                  <th className="py-2 pr-3">Laju/hari</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map((e) => (
                  <tr key={e.key} className="border-b border-slate-50 dark:border-slate-800/60">
                    <td className="py-2.5 pr-3 font-semibold text-slate-800 dark:text-slate-100">{e.productName}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{e.purchaseCount}x</td>
                    <td className="py-2.5 pr-3 text-slate-500">{e.observedDays}</td>
                    <td className="py-2.5 pr-3 font-bold text-slate-800 dark:text-slate-100">
                      {e.ratePerDay !== null ? `${e.ratePerDay} ${e.unit}` : '—'}
                    </td>
                    <td className="py-2.5">
                      {e.sufficient ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cukup
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300" title={e.note}>
                          <AlertCircle className="w-3.5 h-3.5" /> Data kurang
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <SourcePanel
          items={[
            { label: 'Laju konsumsi', source: 'Total kuantitas dibeli ÷ rentang hari observasi dari catatan Anda' },
            { label: 'Syarat cukup', source: 'Minimal 2 pembelian dan rentang ≥ 14 hari' },
          ]}
        />
      </div>

      {/* Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm p-5">
          <h2 className="font-black text-slate-900 dark:text-white mb-3">Riwayat Pembelian ({purchaseLogs.length})</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {purchaseLogs.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{l.productName}</div>
                  <div className="text-[11px] text-slate-500">
                    {l.quantity} {l.unit} · Rp {l.price.toLocaleString('id-ID')} · {l.purchasedAt}
                  </div>
                </div>
                <button
                  onClick={() => removePurchaseLog(l.id)}
                  aria-label={`Hapus ${l.productName}`}
                  className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-slate-900 dark:text-white">Riwayat Sampah ({wasteLogs.length})</h2>
            <Link href="/sampah" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              Hitung timbulan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {wasteLogs.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{l.productName}</div>
                  <div className="text-[11px] text-slate-500">
                    {WASTE_CATEGORIES.find((c) => c.id === l.categoryId)?.label ?? l.categoryId} · {l.quantity} {l.unit} · {l.reason}
                  </div>
                </div>
                <button
                  onClick={() => removeWasteLog(l.id)}
                  aria-label={`Hapus ${l.productName}`}
                  className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
