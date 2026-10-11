'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { SEED_PRODUCTS } from '@/data/seedData';
import { calculateProductEcoScore } from '@/lib/algorithms';
import EcoBadge from '@/components/EcoBadge';
import { ArrowLeft, ShieldCheck, Plus, ShoppingBag } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const { addToInventory, addToShoppingList, addToCompare } = useApp();

  const productId = params?.id as string;
  const allProducts = [...SEED_PRODUCTS];
  const product = allProducts.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">Produk Tidak Ditemukan</h2>
        <Link href="/products" className="text-emerald-600 font-bold underline">
          Kembali ke Katalog Produk
        </Link>
      </div>
    );
  }

  const ecoAnalysis = calculateProductEcoScore(product);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Eco-Product Finder</span>
      </Link>

      {/* Main Product Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-sm">
        {/* Product Image */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 h-80 sm:h-96">
          <img src={product.imageUrl} alt={product.name} decoding="async" className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4">
            <EcoBadge grade={product.grade} score={product.ecoScore} size="lg" />
          </div>
        </div>

        {/* Product Info & Actions */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{product.brand}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2">
              {product.name}
            </h1>

            <div className="text-2xl font-black text-emerald-600 mb-4">
              Rp {product.price.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-medium text-gray-400">/ {product.unit}</span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Badges / Certifications */}
            <div className="space-y-1 mb-4">
              <span className="text-xs font-bold text-gray-500">Sertifikasi Resmi:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.certifications.map((cert, i) => (
                  <span
                    key={i}
                    className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{cert}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  addToInventory(product);
                  alert(`${product.name} berhasil ditambahkan ke Stok!`);
                }}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah ke Stok</span>
              </button>
              <button
                onClick={() => {
                  addToShoppingList(product);
                  alert(`${product.name} ditambahkan ke Daftar Belanja!`);
                }}
                className="py-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-amber-200 dark:border-amber-800"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>+ Belanja</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Criteria Eco-Score Deep Dive */}
      <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-gray-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            Breakdown 5 Kriteria Eco-Score
          </h3>
          <p className="text-xs text-gray-500">
            Metodologi terstandarisasi pengujian dampak siklus hidup produk (LCA)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Carbon */}
          <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500">Jejak Karbon (25%)</span>
              <span className="text-sm font-black text-emerald-600">
                {Math.round(product.carbonFootprint * 100)}/100
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Estimasi emisi: <strong>{product.co2PerUnitKg} kg CO₂ eq</strong> per kemasan.
            </div>
          </div>

          {/* Sourcing */}
          <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500">Bahan Baku & Rantai Pasok (20%)</span>
              <span className="text-sm font-black text-emerald-600">
                {Math.round(product.sourcingScore * 100)}/100
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Asal: <strong>{product.origin}</strong> (Bahan lokal & etis).
            </div>
          </div>

          {/* Packaging */}
          <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500">Kemasan (20%)</span>
              <span className="text-sm font-black text-emerald-600">
                {Math.round(product.packagingScore * 100)}/100
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Material: <strong>{product.packagingType}</strong>.
            </div>
          </div>
        </div>

        {/* Ingredients & Origin Details */}
        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 space-y-3">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">Komposisi & Bahan Baku:</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-mono">
            {product.ingredients}
          </p>
        </div>
      </div>
    </div>
  );
}
