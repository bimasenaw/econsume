'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { ProductData } from '@/data/seedData';
import EcoBadge from '@/components/EcoBadge';
import {
  Search,
  ShoppingBag,
  Loader2,
  ExternalLink,
  Globe,
  Sparkles,
} from 'lucide-react';

const SUGGESTED: Array<{ id: string; label: string; query: string }> = [
  { id: 'beras', label: 'Beras', query: 'beras' },
  { id: 'minyak', label: 'Minyak Goreng', query: 'minyak goreng' },
  { id: 'gula', label: 'Gula Pasir', query: 'gula pasir' },
  { id: 'telur', label: 'Telur', query: 'telur' },
  { id: 'tepung', label: 'Tepung Terigu', query: 'tepung terigu' },
  { id: 'mie', label: 'Mie Instan', query: 'mie instan' },
  { id: 'kecap', label: 'Kecap Manis', query: 'kecap manis' },
  { id: 'sambal', label: 'Sambal', query: 'sambal' },
];

interface SuggestedItem {
  id: string;
  label: string;
  query: string;
  product: ProductData | null;
}

function ProductCard({ product, label }: { product: ProductData; label?: string }) {
  const { addToShoppingList } = useApp();

  return (
    <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col gap-2">
      <div className="h-28 rounded-xl overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        ) : (
          <ShoppingBag className="w-8 h-8 text-slate-300" />
        )}
      </div>

      {label && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 w-fit">
          {label}
        </span>
      )}

      <div className="text-xs font-semibold text-sky-600 line-clamp-1">{product.brand}</div>
      <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{product.name}</div>

      <div className="flex items-center gap-2 mt-auto">
        {product.grade && product.ecoScore > 0 ? (
          <EcoBadge grade={product.grade} score={product.ecoScore} size="sm" />
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            Skor OFF belum ada
          </span>
        )}
        <a
          href={`https://world.openfoodfacts.org/product/${product.barcode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 dark:text-sky-300 hover:underline"
        >
          OFF <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <button
        onClick={() => {
          addToShoppingList(product, 1, false);
          alert(`${product.name} ditambahkan ke Daftar Belanja!`);
        }}
        className="cursor-pointer mt-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors"
      >
        <ShoppingBag className="w-3.5 h-3.5" /> + Belanja
      </button>
    </div>
  );
}

async function fetchFirst(query: string): Promise<ProductData | null> {
  try {
    const r1 = await fetch(`/api/products?source=off&q=${encodeURIComponent(query)}&country=indonesia`);
    if (r1.ok) {
      const d1 = await r1.json();
      if ((d1.products as ProductData[])?.length) return (d1.products as ProductData[])[0];
    }
  } catch {
    /* lanjut ke fallback tanpa filter negara */
  }
  try {
    const r2 = await fetch(`/api/products?source=off&q=${encodeURIComponent(query)}`);
    if (r2.ok) {
      const d2 = await r2.json();
      if ((d2.products as ProductData[])?.length) return (d2.products as ProductData[])[0];
    }
  } catch {
    /* abaikan */
  }
  return null;
}

export default function ProductsPage() {
  const [offQuery, setOffQuery] = useState('');
  const [offLoading, setOffLoading] = useState(false);
  const [offResults, setOffResults] = useState<ProductData[]>([]);
  const [offError, setOffError] = useState<string | null>(null);

  const [suggested, setSuggested] = useState<SuggestedItem[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

  const runSearch = async (q: string) => {
    const term = q.trim();
    if (!term) return;
    setOffLoading(true);
    setOffError(null);
    setOffResults([]);
    try {
      const res = await fetch(`/api/products?source=off&q=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mencari di Open Food Facts.');
      const products = data.products as ProductData[];
      setOffResults(products);
      if (products.length === 0) {
        setOffError(`Tidak ada produk cocok untuk "${term}" di Open Food Facts. Coba kata kunci lain.`);
      }
    } catch (err) {
      setOffError(err instanceof Error ? err.message : 'Gagal mencari.');
    } finally {
      setOffLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void runSearch(offQuery);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSuggestedLoading(true);
      const items: SuggestedItem[] = await Promise.all(
        SUGGESTED.map(async (s) => ({ ...s, product: await fetchFirst(s.query) }))
      );
      if (cancelled) return;
      setSuggested(items);
      setSuggestedLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-sky-600" />
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pencarian Produk Nyata</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Eco-Product Finder
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cari produk nyata dari basis data terbuka Open Food Facts — lengkap dengan Eco-Score &amp; Nutri-Score bila
          tersedia. Bukan katalog buatan, semua data langsung dari OFF.
        </p>
      </div>

      {/* Open Food Facts live search */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-sky-600" />
          <h2 className="font-black text-slate-900 dark:text-white">Cari Produk Nyata</h2>
        </div>
        <p className="text-xs text-slate-500 -mt-2">
          Basis data terbuka &amp; crowd-sourced. Hasil menampilkan Eco-Score/Nutri-Score nyata bila tersedia.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={offQuery}
              onChange={(e) => setOffQuery(e.target.value)}
              placeholder="cth: beras, indomie, susu, sampo…"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={offLoading}
            className="cursor-pointer px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-bold transition-colors"
          >
            {offLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
          </button>
        </form>

        {offError && (
          <p
            role="alert"
            className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-3 py-2"
          >
            {offError}
          </p>
        )}

        {offResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {offResults.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Suggested products (prioritaskan Indonesia) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="font-black text-slate-900 dark:text-white">Produk Disarankan</h2>
        </div>
        <p className="text-xs text-slate-500 -mt-2">
          Rekomendasi kebutuhan pokok dari Open Food Facts — diutamakan produk dari Indonesia.
        </p>

        {suggestedLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUGGESTED.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 animate-pulse h-64"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggested.map((s) =>
              s.product ? (
                <ProductCard key={s.id} product={s.product} label={s.label} />
              ) : (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center min-h-[180px]"
                >
                  <Sparkles className="w-6 h-6 text-slate-300" />
                  <div className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">{s.label}</div>
                  <button
                    onClick={() => void runSearch(s.query)}
                    className="mt-1 text-[11px] font-bold text-sky-600 hover:underline cursor-pointer"
                  >
                    Cari di OFF
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
