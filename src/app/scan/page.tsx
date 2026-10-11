'use client';

import React, { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getSihOptions, guessSihCategoryId, type SihDetectResult, type SihProductTypeId } from '@/lib/sih';
import type { GeminiDetectResult } from '@/lib/gemini';
import EcoBadge from '@/components/EcoBadge';
import {
  Camera,
  ScanLine,
  Sparkles,
  Leaf,
  Loader2,
  AlertCircle,
  Check,
  Plus,
  ShoppingBag,
  Factory,
  Recycle,
  Info,
  ImageIcon,
  BrainCircuit,
} from 'lucide-react';

const SIH_OPTIONS = getSihOptions();

/* ── helper: kompres foto di browser agar base64 ringan untuk Gemini ── */
function fileToCompressedDataUrl(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar valid.'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}


function PhotoPicker({
  preview,
  onPick,
  label,
}: {
  preview: string | null;
  onPick: (dataUrl: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('File harus berupa gambar.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Foto maksimal 10 MB.');
      return;
    }
    setError(null);
    try {
      const dataUrl = await fileToCompressedDataUrl(f);
      onPick(dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memproses foto.');
    }
  };

  return (
    <div>
      <label className="text-xs font-bold text-gray-700">{label}</label>
      <div className="mt-2 flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 transition-colors">
        {preview ? (
          <img src={preview} alt="Kemasan" className="w-20 h-20 rounded-xl object-cover bg-gray-100 shrink-0" />
        ) : (
          <span className="w-20 h-20 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Camera className="w-8 h-8" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4" />
              {preview ? 'Ganti Foto' : 'Upload Foto'}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-gray-500 leading-relaxed">
            {preview ? 'Foto siap — bisa diganti kapan saja.' : 'JPG/PNG hingga 10 MB. Di HP, bisa langsung jepret kamera.'}
          </p>
          {error && <p className="mt-1 text-[11px] font-bold text-rose-600">{error}</p>}
        </div>
      </div>
      {/* dua input: galeri + kamera langsung (mobile) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        id="camera-capture-input"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

/* ═══════════════ TAB 2: DETEKSI SIH — jenis barang ditentukan AI Gemini ═══════════════ */
function SihAiTab() {
  const { addToInventory, addToShoppingList } = useApp();
  const [photo, setPhoto] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [ai, setAi] = useState<(GeminiDetectResult & { model?: string }) | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [productName, setProductName] = useState('');
  const [sihCategory, setSihCategory] = useState<SihProductTypeId>('beras');
  const [weightGr, setWeightGr] = useState('5000');
  const [priceRp, setPriceRp] = useState('95000');
  const [packaging, setPackaging] = useState('curah');
  const [origin, setOrigin] = useState('lokal');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SihDetectResult | null>(null);

  const analyzeWithAi = async () => {
    if (!photo) {
      setAiError('Upload/foto kemasan dulu.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: photo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal analisis AI.');
      setAi(data);
      // Nama barang (teks bebas) + kategori SIH + kemasan + asal OTOMATIS dari AI (bisa di-override manual)
      if (data.productName || data.productType) setProductName(data.productName || data.productType);
      if (data.sihCategory) setSihCategory(data.sihCategory);
      setPackaging(data.packaging);
      setOrigin(data.origin);
      setResult(null);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Gagal analisis AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Kategori hitung: dari AI bila teks masih sama, bila tidak tebak dari ketikan.
      const aiText = (ai?.productName || ai?.productType || '').trim().toLowerCase();
      const typedText = productName.trim();
      const categoryId = ai && typedText.toLowerCase() === aiText
        ? ai.sihCategory
        : guessSihCategoryId(typedText, ai?.sihCategory ?? sihCategory);
      const res = await fetch('/api/ai-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: categoryId,
          sihCategory: categoryId,
          productName: typedText,
          // Input gram → API tetap menerima kg
          weightKg: Number(weightGr) / 1000,
          priceRp: Number(priceRp),
          packaging,
          origin,
          hasPhoto: !!photo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghitung estimasi.');
      if (photo) data.product = { ...data.product, imageUrl: photo };
      else if (ai?.productName) data.product = { ...data.product, name: `${ai.productName} (${data.productLabel} ${Math.round(data.weightKg * 1000)} g)` };
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghitung estimasi.');
    } finally {
      setLoading(false);
    }
  };

  const wasteTotal = result ? result.waste.organikKg + result.waste.anorganikKg : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
      <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-[24px] bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-800 shadow-sm p-5 sm:p-6 space-y-4">
        <PhotoPicker preview={photo} onPick={(d) => { setPhoto(d); setAi(null); }} label="1. Foto kemasan (wajib untuk AI)" />

        <button
          type="button"
          onClick={analyzeWithAi}
          disabled={!photo || aiLoading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
        >
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
          {aiLoading ? 'Gemini membaca foto…' : 'Tentukan Jenis Barang dengan AI'}
        </button>
        {aiError && (
          <p className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {aiError}
          </p>
        )}
        {ai && (
          <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-xs space-y-2">
            <p className="font-black text-violet-800 dark:text-violet-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Hasil Klasifikasi AI
              <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-full bg-violet-600 text-white">
                yakin {Math.round(ai.confidence * 100)}%
              </span>
            </p>
            <div className="rounded-xl bg-white/70 dark:bg-gray-900/60 border border-violet-100 dark:border-violet-900 divide-y divide-violet-100 dark:divide-violet-900">
              <div className="flex justify-between gap-2 px-3 py-2">
                <span className="text-gray-500 font-bold">Jenis barang</span>
                <span className="font-extrabold text-gray-900 dark:text-white text-right">{ai.productName || ai.productType}</span>
              </div>
              <div className="flex justify-between gap-2 px-3 py-2">
                <span className="text-gray-500 font-bold">Kemasan</span>
                <span className="font-extrabold text-gray-900 dark:text-white text-right">
                  {SIH_OPTIONS.packagings.find((p) => p.id === ai.packaging)?.label ?? ai.packaging}
                </span>
              </div>
              <div className="flex justify-between gap-2 px-3 py-2">
                <span className="text-gray-500 font-bold">Asal barang</span>
                <span className="font-extrabold text-gray-900 dark:text-white text-right">
                  {SIH_OPTIONS.origins.find((o) => o.id === ai.origin)?.label ?? ai.origin}
                </span>
              </div>
            </div>
            <p className="text-gray-500 leading-relaxed">Penjelasan AI: {ai.reasoning}</p>
            <p className="text-gray-500 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              Ketiga hasil di atas sudah dimasukkan otomatis ke kolom input di bawah — boleh dikoreksi manual.
            </p>
          </div>
        )}

        {/* ── A. Otomatis dari AI ── */}
        <div className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 p-3.5 space-y-3.5">
          <p className="text-[11px] font-black uppercase tracking-widest text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4" /> A. Otomatis dari AI
          </p>
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              Jenis barang {ai && <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-black">DARI AI</span>}
            </label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder='cth: "Indomie Goreng" — ketik manual atau isi via AI'
              className="mt-1 w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              Kategori hitung:{' '}
              <b className="text-gray-700 dark:text-gray-200">
                {SIH_OPTIONS.products.find((p) => p.id === (ai ? ai.sihCategory : guessSihCategoryId(productName, sihCategory)))?.label}
              </b>{' '}
              {ai ? '(dari AI)' : '(tebakan otomatis — jalankan AI untuk akurasi)'}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              Kemasan {ai && <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-black">DARI AI</span>}
            </label>
            <select value={packaging} onChange={(e) => setPackaging(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
              {SIH_OPTIONS.packagings.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              Asal barang {ai && <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-black">DARI AI</span>}
            </label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {SIH_OPTIONS.origins.map((o) => (
                <button key={o.id} type="button" onClick={() => setOrigin(o.id)}
                  className={`px-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${origin === o.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200' : 'border-gray-200 dark:border-gray-700 text-gray-500 bg-white dark:bg-gray-800'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── B. Isi manual ── */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 space-y-3.5">
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <ScanLine className="w-4 h-4" /> B. Isi manual
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-200">Berat (gram)</label>
              <input type="number" min={10} max={1000000} step={10} value={weightGr} onChange={(e) => setWeightGr(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-200">Harga (Rp)</label>
              <input type="number" min={0} max={100000000} step="500" value={priceRp} onChange={(e) => setPriceRp(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" required />
            </div>
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Leaf className="w-4 h-4" />}
          {loading ? 'Menghitung…' : 'Hitung Jejak & SIH'}
        </button>
      </form>

      <div className="lg:col-span-3 space-y-4">
        {!result && !loading && (
          <div className="rounded-[24px] border-2 border-dashed border-emerald-200 dark:border-gray-700 bg-emerald-50/50 dark:bg-gray-900 p-8 text-center">
            <Factory className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="mt-3 font-black text-gray-900 dark:text-white">Belum ada hasil</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Foto → AI menentukan jenis barang → isi berat & harga → Hitung. Estimasi edukasi, bukan sertifikat resmi SIH.</p>
          </div>
        )}
        {loading && (
          <div className="rounded-[24px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mt-3">Menghitung 6 aspek SIH…</p>
          </div>
        )}
        {result && (
          <div className="rounded-[28px] bg-white dark:bg-gray-900 border-2 border-emerald-200 dark:border-gray-700 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 px-6 py-5 text-white flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/70">Grade SIH</p>
                <h2 className="text-xl sm:text-2xl font-black">{result.sih.predikat} <span className="font-medium text-white/70 text-sm">(skor SIH {result.sih.total})</span></h2>
                <p className="text-[11px] text-white/70 mt-1">Layak ≥ 80 · Menuju ≥ 65 · Cukup ≥ 50 · Kurang ≥ 35 · di bawah itu Belum Memenuhi</p>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/70 mt-2">{result.productLabel} · {Math.round(result.weightKg * 1000).toLocaleString('id-ID')} g · Rp {result.priceRp.toLocaleString('id-ID')}</p>
                <p className="text-xs text-white/75 mt-1">Total {result.co2TotalKg} kg CO₂e · {result.co2PerKg} kg/kg · {result.waste.kategori}</p>
              </div>
              <EcoBadge grade={result.grade} score={result.ecoScore} size="lg" showLabel />
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-800">
                  <div className="text-[11px] font-bold text-teal-700 dark:text-teal-300">JEJAK KARBON</div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">{result.co2TotalKg}<span className="text-xs font-medium text-gray-400"> kg</span></div>
                  <div className="text-[11px] text-gray-500">{result.co2PerKg} kg per kg · {result.co2IntensityPerJutaRp} kg per Rp1jt</div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800">
                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300">SAMPAH</div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{result.waste.kategori}</div>
                  <div className="mt-2 h-2 rounded-full bg-white dark:bg-gray-800 overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${wasteTotal > 0 ? (result.waste.organikKg / wasteTotal) * 100 : 50}%` }} />
                    <div className="h-full bg-slate-400" style={{ width: `${wasteTotal > 0 ? (result.waste.anorganikKg / wasteTotal) * 100 : 50}%` }} />
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">Organik {result.waste.organikKg} kg · Anorganik {result.waste.anorganikKg} kg</div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800">
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">DAUR ULANG</div>
                  <div className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1"><Recycle className="w-4 h-4 text-emerald-600" /> {result.waste.dapatDidaurUlang ? 'Bisa' : 'Sulit'} / {result.waste.dapatDikompos ? 'Kompos' : 'Non-kompos'}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{result.waste.saranPilah}</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2">Rincian 6 Aspek SIH</h3>
                <div className="space-y-2">
                  {result.sih.aspects.map((a) => (
                    <div key={a.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between text-xs font-bold"><span className="text-gray-700 dark:text-gray-200">{a.label}</span><span className="text-gray-900 dark:text-white">{a.score}</span></div>
                      <div className="mt-1.5 h-2 bg-white dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${a.score}%` }} /></div>
                      <div className="text-[11px] text-gray-500 mt-1">{a.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-800">
                <h3 className="text-xs font-black text-sky-800 dark:text-sky-200">SARAN PERBAIKAN</h3>
                <ul className="mt-1 text-xs text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-4">
                  {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5"><Info className="w-4 h-4 text-emerald-500 shrink-0" /> Estimasi rule-based transparan (lihat src/lib/sih.ts). Jenis barang dari AI Gemini — koreksi manual bila keliru.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button onClick={() => { addToInventory(result.product, result.weightKg); alert('Masuk ke Stok!'); }}
                  className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Tambah ke Stok ({Math.round(result.weightKg * 1000).toLocaleString('id-ID')} g)
                </button>
                <button onClick={() => { addToShoppingList(result.product, 1); alert('Masuk ke Belanja!'); }}
                  className="py-3 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 text-sm font-extrabold flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Beli Nanti
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ Halaman Deteksi SIH + AI ═══════════════ */
export default function ScanPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="text-center max-w-2xl mx-auto pt-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold tracking-widest uppercase border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3.5 h-3.5" />
          Deteksi SIH + AI
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          Foto Kemasan,{' '}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
            AI yang Mengenali
          </span>
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Foto kemasan → AI menentukan jenis barang & kemasan → isi berat & harga → dapat grade SIH.
        </p>
      </div>

      <SihAiTab />
    </div>
  );
}
