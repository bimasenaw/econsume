/**
 * Estimasi berbasis histori NYATA pengguna.
 *
 * Tidak ada machine learning dan tidak ada angka default karangan:
 * - Laju konsumsi hanya dihitung bila pengguna sudah mencatat ≥2 pembelian
 *   dalam rentang waktu yang cukup. Jika tidak, statusnya "data belum cukup".
 * - Timbulan sampah dihitung dari log sampah/belanja pengguna + faktor referensi ter-sitasi.
 */

import {
  EMISSION_FACTORS,
  MATERIAL_FACTORS,
  WASTE_CATEGORIES,
  NATIONAL_PER_CAPITA_DAILY_KG,
  toKg,
  type WasteCategory,
} from '@/data/reference';
import type { ProductData, InventoryItem } from '@/data/seedData';

export interface PurchaseLog {
  id: string;
  productName: string;
  barcode?: string;
  category?: string;
  quantity: number;
  unit: string;
  price: number;
  purchasedAt: string; // ISO date
}

export interface WasteLogEntry {
  id: string;
  productName: string;
  categoryId: string; // WASTE_CATEGORIES id
  quantity: number;
  unit: string;
  reason: string;
  date: string; // ISO date
  source: 'stok' | 'kemasan' | 'sisa';
}

export interface ConsumptionEstimate {
  key: string;
  productName: string;
  unit: string;
  ratePerDay: number | null; // null bila data belum cukup
  totalQuantity: number;
  observedDays: number;
  purchaseCount: number;
  sufficient: boolean;
  note: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_PURCHASES = 2;
const MIN_OBSERVED_DAYS = 14;

function productKey(log: PurchaseLog): string {
  return (log.barcode || log.productName).trim().toLowerCase();
}

/**
 * Hitung laju konsumsi harian dari histori pembelian pengguna.
 * ratePerDay = total kuantitas yang dibeli / rentang hari observasi.
 */
export function estimateConsumption(purchases: PurchaseLog[]): ConsumptionEstimate[] {
  const groups = new Map<string, PurchaseLog[]>();
  for (const log of purchases) {
    const key = productKey(log);
    const arr = groups.get(key) ?? [];
    arr.push(log);
    groups.set(key, arr);
  }

  const out: ConsumptionEstimate[] = [];

  groups.forEach((logs, key) => {
    const sorted = [...logs].sort(
      (a, b) => new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime()
    );
    const first = new Date(sorted[0].purchasedAt).getTime();
    const last = new Date(sorted[sorted.length - 1].purchasedAt).getTime();
    const observedDays = Math.max(0, Math.floor((last - first) / DAY_MS));
    const totalQuantity = Number(sorted.reduce((a, b) => a + (Number(b.quantity) || 0), 0).toFixed(2));
    const unit = sorted[sorted.length - 1].unit;

    let sufficient = true;
    let note = 'Estimasi dari histori pembelian Anda.';

    if (sorted.length < MIN_PURCHASES) {
      sufficient = false;
      note = `Butuh minimal ${MIN_PURCHASES} catatan pembelian untuk menghitung laju.`;
    } else if (observedDays < MIN_OBSERVED_DAYS) {
      sufficient = false;
      note = `Rentang observasi baru ${observedDays} hari. Butuh minimal ${MIN_OBSERVED_DAYS} hari.`;
    }

    const elapsed = observedDays;
    const ratePerDay = sufficient && elapsed > 0 ? Number((totalQuantity / elapsed).toFixed(3)) : null;

    out.push({
      key,
      productName: sorted[sorted.length - 1].productName,
      unit,
      ratePerDay,
      totalQuantity,
      observedDays: elapsed,
      purchaseCount: sorted.length,
      sufficient,
      note,
    });
  });

  return out.sort((a, b) => a.productName.localeCompare(b.productName));
}

export interface PredictionItem {
  productId: string;
  productName: string;
  product: ProductData;
  currentStock: number;
  unit: string;
  avgDailyConsumption: number | null;
  daysRemaining: number | null;
  predictedEmptyDate: string | null;
  observedDays: number;
  purchaseCount: number;
  sufficient: boolean;
  note: string;
  urgency: 'high' | 'medium' | 'low';
}

/** Bangun prediksi HANYA dari laju empiris. Tanpa data cukup -> daysRemaining null. */
export function buildPredictions(
  inventory: InventoryItem[],
  estimates: ConsumptionEstimate[]
): PredictionItem[] {
  const now = Date.now();
  return inventory.map((inv) => {
    const key = (inv.product.barcode || inv.product.name).trim().toLowerCase();
    const est = estimates.find((e) => e.key === key);

    if (est && est.sufficient && est.ratePerDay && est.ratePerDay > 0) {
      const daysRemaining = Math.max(0, Math.floor(inv.quantity / est.ratePerDay));
      const predictedEmptyDate = new Date(now + daysRemaining * DAY_MS)
        .toISOString()
        .split('T')[0];
      const urgency: PredictionItem['urgency'] =
        daysRemaining <= 3 ? 'high' : daysRemaining <= 7 ? 'medium' : 'low';
      return {
        productId: inv.productId,
        productName: inv.product.name,
        product: inv.product,
        currentStock: inv.quantity,
        unit: inv.unit,
        avgDailyConsumption: est.ratePerDay,
        daysRemaining,
        predictedEmptyDate,
        observedDays: est.observedDays,
        purchaseCount: est.purchaseCount,
        sufficient: true,
        note: `Dari ${est.purchaseCount} pembelian / ${est.observedDays} hari.`,
        urgency,
      };
    }

    return {
      productId: inv.productId,
      productName: inv.product.name,
      product: inv.product,
      currentStock: inv.quantity,
      unit: inv.unit,
      avgDailyConsumption: null,
      daysRemaining: null,
      predictedEmptyDate: null,
      observedDays: est?.observedDays ?? 0,
      purchaseCount: est?.purchaseCount ?? 0,
      sufficient: false,
      note: est?.note ?? 'Belum ada catatan pembelian untuk produk ini.',
      urgency: 'low' as const,
    };
  });
}

export interface WasteSummary {
  totalKg: number;
  co2Kg: number;
  byCategory: Array<{ category: WasteCategory; kg: number; co2Kg: number }>;
  unconvertible: WasteLogEntry[];
  perCapitaDailyKg: number;
  nationalPerCapitaDailyKg: number;
  ratioToNational: number; // 1 = setara rata-rata nasional
  logCount: number;
}

function factorForCategory(id: string): { value: number; basis: string } {
  const cat = WASTE_CATEGORIES.find((c) => c.id === id);
  if (!cat) return { value: 0, basis: 'Tidak ada faktor' };
  if (cat.emissionKey) {
    return { value: EMISSION_FACTORS.food[cat.emissionKey], basis: `Poore & Nemecek (2018)` };
  }
  if (cat.materialKey) {
    return { value: MATERIAL_FACTORS[cat.materialKey], basis: 'ADEME (indikatif)' };
  }
  return { value: 0, basis: 'Limbah B3 di luar cakupan estimasi' };
}

/** Faktor emisi publik untuk sebuah kategori sampah (kg CO₂e per kg). */
export function wasteFactor(categoryId: string): number {
  return factorForCategory(categoryId).value;
}

/** Agregasi log sampah -> kg, CO₂e, per kapita, dan pembanding nasional. */
export function summarizeWaste(logs: WasteLogEntry[], householdSize: number): WasteSummary {
  let totalKg = 0;
  let co2Kg = 0;
  const unconvertible: WasteLogEntry[] = [];
  const perCat = new Map<string, number>();

  for (const log of logs) {
    const kg = toKg(Number(log.quantity) || 0, log.unit);
    if (kg === null) {
      unconvertible.push(log);
      continue;
    }
    totalKg += kg;
    const { value } = factorForCategory(log.categoryId);
    co2Kg += kg * value;
    perCat.set(log.categoryId, (perCat.get(log.categoryId) ?? 0) + kg);
  }

  const byCategory = WASTE_CATEGORIES.map((category) => {
    const kg = Number((perCat.get(category.id) ?? 0).toFixed(2));
    const { value } = factorForCategory(category.id);
    return { category, kg, co2Kg: Number((kg * value).toFixed(2)) };
  }).filter((c) => c.kg > 0);

  // Asumsi: log mencakup 30 hari terakhir untuk per kapita harian.
  const days = 30;
  const perCapitaDailyKg =
    householdSize > 0 ? Number((totalKg / householdSize / days).toFixed(3)) : 0;

  return {
    totalKg: Number(totalKg.toFixed(2)),
    co2Kg: Number(co2Kg.toFixed(2)),
    byCategory,
    unconvertible,
    perCapitaDailyKg,
    nationalPerCapitaDailyKg: NATIONAL_PER_CAPITA_DAILY_KG,
    ratioToNational:
      NATIONAL_PER_CAPITA_DAILY_KG > 0
        ? Number((perCapitaDailyKg / NATIONAL_PER_CAPITA_DAILY_KG).toFixed(2))
        : 0,
    logCount: logs.length,
  };
}
