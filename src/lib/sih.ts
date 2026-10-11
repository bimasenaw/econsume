import { ProductData, calculateEcoScoreAndGrade } from '@/data/seedData';

// ── Standar Industri Hijau (SIH) — estimator rule-based transparan ──
// Bukan model vision ML. Semua angka adalah proksi literatur yang disederhanakan
// dan ditampilkan sebagai ESTIMASI agar juri/pengguna tidak terkecoh klaim "AI".
// Faktor emisi acuan gaya Poore & Nemecek (2018) & ADEME, dibulatkan untuk edukasi.

export type SihProductTypeId =
  | 'beras'
  | 'minyak_goreng'
  | 'telur'
  | 'gula'
  | 'kopi'
  | 'susu_sapi'
  | 'teh'
  | 'deterjen'
  | 'sabun'
  | 'kacang_kedelai';

export type SihPackagingId =
  | 'curah'
  | 'kertas_kraft'
  | 'kardus'
  | 'tray_kertas'
  | 'botol_kaca'
  | 'kaleng'
  | 'galon_guna_ulang'
  | 'rPET'
  | 'plastik_sekali_pakai'
  | 'multilayer_sachet'
  | 'styrofoam'
  | 'tetra_pak';

export type SihOriginId = 'lokal' | 'nasional' | 'impor';

export interface SihDetectInput {
  productType: SihProductTypeId;
  weightKg: number;
  priceRp: number;
  packaging: SihPackagingId;
  origin: SihOriginId;
  hasPhoto?: boolean;
  /** Label teks bebas (mis. dari AI / ketikan pengguna). Dipakai untuk nama tampilan. */
  customLabel?: string;
}

interface ProductPreset {
  label: string;
  category: ProductData['category'];
  co2PerKg: number; // kg CO2e / kg produk (proksi literatur)
  organicFraction: number; // 0-1 fraksi sisa yang organik/komposabel
  avgLifespanDaysPerKg: number; // hari habis per kg untuk keluarga 3 orang
  renewableBase: number; // 0-100 skor bahan terbarukan dasar
  energyBase: number; // 0-100 efisiensi energi/air dasar prosesnya
}

const PRODUCT_PRESETS: Record<SihProductTypeId, ProductPreset> = {
  beras: { label: 'Beras', category: 'Makanan & Minuman', co2PerKg: 2.7, organicFraction: 0.95, avgLifespanDaysPerKg: 6, renewableBase: 85, energyBase: 60 },
  minyak_goreng: { label: 'Minyak Goreng (Sawit)', category: 'Makanan & Minuman', co2PerKg: 4.8, organicFraction: 0.1, avgLifespanDaysPerKg: 12, renewableBase: 55, energyBase: 55 },
  telur: { label: 'Telur Ayam', category: 'Makanan & Minuman', co2PerKg: 4.8, organicFraction: 0.6, avgLifespanDaysPerKg: 8, renewableBase: 80, energyBase: 60 },
  gula: { label: 'Gula Pasir / Aren', category: 'Dapur & Pantry', co2PerKg: 1.8, organicFraction: 0.9, avgLifespanDaysPerKg: 20, renewableBase: 85, energyBase: 65 },
  kopi: { label: 'Kopi Bubuk', category: 'Makanan & Minuman', co2PerKg: 10.5, organicFraction: 0.95, avgLifespanDaysPerKg: 15, renewableBase: 80, energyBase: 55 },
  susu_sapi: { label: 'Susu Sapi Cair', category: 'Makanan & Minuman', co2PerKg: 3.2, organicFraction: 0.9, avgLifespanDaysPerKg: 3, renewableBase: 70, energyBase: 55 },
  teh: { label: 'Teh', category: 'Makanan & Minuman', co2PerKg: 3.5, organicFraction: 0.95, avgLifespanDaysPerKg: 18, renewableBase: 85, energyBase: 65 },
  deterjen: { label: 'Deterjen', category: 'Pembersih Rumah', co2PerKg: 5.5, organicFraction: 0.05, avgLifespanDaysPerKg: 15, renewableBase: 40, energyBase: 50 },
  sabun: { label: 'Sabun', category: 'Perawatan Diri', co2PerKg: 2.2, organicFraction: 0.3, avgLifespanDaysPerKg: 20, renewableBase: 60, energyBase: 60 },
  kacang_kedelai: { label: 'Kacang Kedelai', category: 'Dapur & Pantry', co2PerKg: 1.2, organicFraction: 0.9, avgLifespanDaysPerKg: 25, renewableBase: 90, energyBase: 70 },
};

interface PackagingPreset {
  label: string;
  co2ExtraPerKg: number; // tambahan jejak kemasan per kg produk
  wasteKgPerKg: number; // sampah kemasan per kg produk
  score: number; // 0-1 kemasan lestari
  recyclable: boolean;
  compostable: boolean;
  reusable: boolean;
  qualityScore: number; // 0-100 mutu/food-grade & daur ulang
}

const PACKAGING_PRESETS: Record<SihPackagingId, PackagingPreset> = {
  curah: { label: 'Curah / Tanpa Kemasan (bawa wadah)', co2ExtraPerKg: 0.05, wasteKgPerKg: 0.0, score: 1.0, recyclable: true, compostable: true, reusable: true, qualityScore: 85 },
  kertas_kraft: { label: 'Kertas Kraft / Kantong Kertas', co2ExtraPerKg: 0.25, wasteKgPerKg: 0.05, score: 0.9, recyclable: true, compostable: true, reusable: false, qualityScore: 85 },
  kardus: { label: 'Kardus', co2ExtraPerKg: 0.3, wasteKgPerKg: 0.08, score: 0.85, recyclable: true, compostable: true, reusable: false, qualityScore: 80 },
  tray_kertas: { label: 'Tray Kertas Telur', co2ExtraPerKg: 0.2, wasteKgPerKg: 0.06, score: 0.95, recyclable: true, compostable: true, reusable: false, qualityScore: 85 },
  botol_kaca: { label: 'Botol Kaca (guna ulang)', co2ExtraPerKg: 0.6, wasteKgPerKg: 0.02, score: 0.75, recyclable: true, compostable: false, reusable: true, qualityScore: 90 },
  kaleng: { label: 'Kaleng Logam', co2ExtraPerKg: 0.8, wasteKgPerKg: 0.1, score: 0.7, recyclable: true, compostable: false, reusable: false, qualityScore: 80 },
  galon_guna_ulang: { label: 'Galon / Jerigen Guna Ulang', co2ExtraPerKg: 0.15, wasteKgPerKg: 0.01, score: 0.95, recyclable: true, compostable: false, reusable: true, qualityScore: 88 },
  rPET: { label: 'Plastik Daur Ulang (rPET/HDPE)', co2ExtraPerKg: 0.5, wasteKgPerKg: 0.06, score: 0.6, recyclable: true, compostable: false, reusable: false, qualityScore: 70 },
  plastik_sekali_pakai: { label: 'Plastik Sekali Pakai (PP/PE)', co2ExtraPerKg: 1.1, wasteKgPerKg: 0.08, score: 0.35, recyclable: false, compostable: false, reusable: false, qualityScore: 55 },
  multilayer_sachet: { label: 'Sachet Multilayer / Foil', co2ExtraPerKg: 1.4, wasteKgPerKg: 0.08, score: 0.15, recyclable: false, compostable: false, reusable: false, qualityScore: 40 },
  styrofoam: { label: 'Styrofoam', co2ExtraPerKg: 1.6, wasteKgPerKg: 0.06, score: 0.1, recyclable: false, compostable: false, reusable: false, qualityScore: 35 },
  tetra_pak: { label: 'Tetra Pak / Karton Multilayer', co2ExtraPerKg: 0.9, wasteKgPerKg: 0.09, score: 0.55, recyclable: false, compostable: false, reusable: false, qualityScore: 65 },
};

const ORIGIN_MULTIPLIER: Record<SihOriginId, number> = {
  lokal: 1.0,
  nasional: 1.12,
  impor: 1.35,
};

const ORIGIN_LABEL: Record<SihOriginId, string> = {
  lokal: 'Lokal (<100 km)',
  nasional: 'Nasional (antar pulau)',
  impor: 'Impor (antar benua)',
};

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

export interface SihAspect {
  id: string;
  label: string;
  score: number; // 0-100
  desc: string;
}

export interface SihDetectResult {
  productLabel: string;
  weightKg: number;
  priceRp: number;
  co2PerKg: number;
  co2TotalKg: number;
  co2IntensityPerJutaRp: number;
  waste: {
    kategori: 'Organik Dominan' | 'Anorganik Dominan' | 'Campuran';
    organikKg: number;
    anorganikKg: number;
    dapatDidaurUlang: boolean;
    dapatDikompos: boolean;
    saranPilah: string;
  };
  sih: {
    aspects: SihAspect[];
    total: number;
    predikat: 'Layak SIH' | 'Menuju SIH' | 'Cukup' | 'Kurang' | 'Belum Memenuhi SIH';
  };
  ecoScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  suggestions: string[];
  product: ProductData;
}

export function getSihOptions() {
  return {
    products: (Object.keys(PRODUCT_PRESETS) as SihProductTypeId[]).map((id) => ({
      id,
      label: PRODUCT_PRESETS[id].label,
    })),
    packagings: (Object.keys(PACKAGING_PRESETS) as SihPackagingId[]).map((id) => ({
      id,
      label: PACKAGING_PRESETS[id].label,
    })),
    origins: (Object.keys(ORIGIN_MULTIPLIER) as SihOriginId[]).map((id) => ({
      id,
      label: ORIGIN_LABEL[id],
    })),
  };
}

/**
 * Tebak kategori SIH dari label teks bebas (ketikan manual tanpa AI).
 * Dipakai agar kolom "Jenis barang" bisa berupa text bar biasa.
 */
export function guessSihCategoryId(label: string, fallback: SihProductTypeId = 'beras'): SihProductTypeId {
  const t = (label || '').toLowerCase();
  const has = (...kw: string[]) => kw.some((k) => t.includes(k));
  if (has('deterjen', 'pembersih', 'pemutih', 'pewangi pakaian', 'molto', 'rinso', 'daia')) return 'deterjen';
  if (has('sabun', 'shampo', 'sampo', 'odol', 'pasta gigi', 'sikat gigi')) return 'sabun';
  if (has('minyak', 'margarin', 'mentega', 'butter')) return 'minyak_goreng';
  if (has('susu', 'yogurt', 'yoghurt', 'keju', 'yakult')) return 'susu_sapi';
  if (has('kopi', 'coffee', 'kapal api', 'nescafe')) return 'kopi';
  if (has('teh', 'tea', 'sosro', 'sariwangi')) return 'teh';
  if (has('telur', 'mie', 'mi ', 'indomie', 'sarimi', 'supermi')) return 'telur';
  if (has('beras', 'bihun', 'kwetiau', 'nasi')) return 'beras';
  if (has('gula', 'permen', 'coklat', 'cokelat', 'kecap', 'saus', ' Sirup', 'sirup', 'roti', 'biskuit', 'kue')) return 'gula';
  if (has('kedelai', 'tahu', 'tempe', 'kacang')) return 'kacang_kedelai';
  return fallback;
}

export function estimateSih(input: SihDetectInput): SihDetectResult {
  const preset = PRODUCT_PRESETS[input.productType];
  const pack = PACKAGING_PRESETS[input.packaging];
  const originMult = ORIGIN_MULTIPLIER[input.origin] ?? 1;

  const weightKg = Math.max(0.01, Number(input.weightKg) || 0);
  const priceRp = Math.max(0, Number(input.priceRp) || 0);

  // ── 1. Jejak karbon ──
  const co2PerKg = Number(((preset.co2PerKg + pack.co2ExtraPerKg) * originMult).toFixed(2));
  const co2TotalKg = Number((co2PerKg * weightKg).toFixed(2));
  const co2IntensityPerJutaRp =
    priceRp > 0 ? Number(((co2TotalKg / priceRp) * 1_000_000).toFixed(2)) : 0;

  // ── 2. Kategori sampah ──
  const organikKg = Number((weightKg * preset.organicFraction * 0.08).toFixed(2)); // asumsi 8% jadi sisa
  const anorganikKg = Number((weightKg * pack.wasteKgPerKg).toFixed(2));
  const totalWaste = organikKg + anorganikKg;
  let kategori: SihDetectResult['waste']['kategori'] = 'Campuran';
  if (totalWaste > 0) {
    if (organikKg >= anorganikKg * 2) kategori = 'Organik Dominan';
    else if (anorganikKg >= organikKg * 2) kategori = 'Anorganik Dominan';
  } else {
    kategori = 'Organik Dominan';
  }
  const saranPilah =
    kategori === 'Organik Dominan'
      ? 'Pisahkan sisa konsumsi ke kompos/lubang biopori. Kemasan minim, buang ke bank sampah bila ada.'
      : kategori === 'Anorganik Dominan'
        ? 'Sampah utama dari kemasan. Bersihkan, keringkan, setorkan ke bank sampah. Hindari dibakar.'
        : 'Pilah dua aliran: sisa organik ke kompos, kemasan dibersihkan lalu ke bank sampah.';

  // ── 3. Enam aspek SIH (0-100, transparan) ──
  const originBonus = input.origin === 'lokal' ? 8 : input.origin === 'nasional' ? 0 : -12;
  const packBonusRenew = pack.score >= 0.85 ? 10 : pack.score <= 0.35 ? -20 : 0;
  const reusableBonus = pack.reusable ? 8 : 0;

  const bahanBaku = clamp(preset.renewableBase + originBonus + packBonusRenew);
  const energiAir = clamp(preset.energyBase + reusableBonus + (pack.score <= 0.35 ? -10 : 0) + (input.origin === 'impor' ? -5 : 0));
  const prosesTeknologi = clamp(
    60 + (input.origin === 'lokal' && pack.score >= 0.7 ? 15 : 0) - (input.origin === 'impor' && pack.score <= 0.35 ? 15 : 0)
  );
  const limbah = clamp(Math.round(pack.score * 60 + preset.organicFraction * 40));
  const kualitas = pack.qualityScore;
  const manajemen = clamp(
    55 + (priceRp > 0 ? 10 : 0) + (weightKg > 0 ? 10 : 0) + (input.hasPhoto ? 10 : 0) + (input.origin === 'lokal' ? 5 : 0),
    0,
    95
  );

  const aspects: SihAspect[] = [
    { id: 'bahan', label: 'Bahan Baku & Penolong', score: Math.round(bahanBaku), desc: 'Hemat, terbarukan, sedikit bahan penolong' },
    { id: 'energi', label: 'Energi & Air (3R)', score: Math.round(energiAir), desc: 'Hemat energi/air, guna ulang' },
    { id: 'proses', label: 'Proses & Teknologi', score: Math.round(prosesTeknologi), desc: 'Rantai pendek, tekan emisi GRK' },
    { id: 'limbah', label: 'Pengelolaan Limbah', score: Math.round(limbah), desc: 'Kemasan & sisa aman, tidak mencemari' },
    { id: 'kualitas', label: 'Kualitas Produk', score: Math.round(kualitas), desc: 'Aman, food-grade, mudah didaur/terurai' },
    { id: 'manajemen', label: 'Manajemen & Keterlacakan', score: Math.round(manajemen), desc: 'Data lengkap, asal jelas, ada dokumentasi' },
  ];

  const total = Math.round(aspects.reduce((a, b) => a + b.score, 0) / aspects.length);
  const predikat: SihDetectResult['sih']['predikat'] =
    total >= 80 ? 'Layak SIH' : total >= 65 ? 'Menuju SIH' : total >= 50 ? 'Cukup' : total >= 35 ? 'Kurang' : 'Belum Memenuhi SIH';

  // ── 4. Petakan ke Eco-Score A-E agar kompatibel katalog ──
  const normCarbon = clamp(1 - co2PerKg / 12, 0, 1); // makin kecil CO2 makin hijau
  const normSourcing = clamp((preset.renewableBase + originBonus) / 100, 0, 1);
  const normPack = pack.score;
  const normCert = clamp(total / 100, 0, 1);
  const normTransparency = clamp((input.hasPhoto ? 0.85 : 0.6) + (priceRp > 0 ? 0.1 : 0), 0, 1);
  const { score: ecoScore, grade } = calculateEcoScoreAndGrade(normCarbon, normSourcing, normPack, normCert, normTransparency);

  // ── 5. Saran perbaikan konkret ──
  const suggestions: string[] = [];
  if (pack.score <= 0.35) suggestions.push(`Ganti kemasan ${pack.label.toLowerCase()} ke curah/kertas kraft/botol guna ulang untuk menaikkan aspek Limbah & Bahan Baku.`);
  if (input.origin === 'impor') suggestions.push('Cari pemasok lokal/nasional sejenis untuk memangkas emisi logistik (~12-35%).');
  if (preset.co2PerKg >= 4.5) suggestions.push(`${preset.label} berjejak karbon tinggi per kg — atur porsi, hindari sisa, dan olah sisa menjadi kompos/pakan.`);
  if (kategori === 'Anorganik Dominan') suggestions.push('Bersihkan & keringkan kemasan sebelum ke bank sampah agar laku daur ulang.');
  if (!input.hasPhoto) suggestions.push('Foto kemasan membantu verifikasi ulang (bahan, label, simbol daur ulang).');
  if (suggestions.length === 0) suggestions.push('Pertahankan pola ini: curah/lokal + minim sisa sudah selaras SIH.');

  // ── 6. Bentuk ProductData agar bisa masuk Stok/Belanja ──
  // Label tampilan boleh teks bebas (AI/ketikan), hitungan tetap pakai preset kategori.
  const displayLabel = (input.customLabel || '').trim().slice(0, 120) || preset.label;
  // Tampilan berat memakai gram bila di bawah 1 kg.
  const displayWeight = weightKg >= 1 ? `${Number(weightKg.toFixed(2))} kg` : `${Math.round(weightKg * 1000)} g`;
  const product: ProductData = {
    id: `sih-${input.productType}-${Date.now()}`,
    barcode: `SIH-${input.productType.toUpperCase().slice(0, 4)}-${Math.floor(weightKg * 1000)}G`,
    name: `${displayLabel} ${displayWeight} (Deteksi SIH)`,
    brand: ORIGIN_LABEL[input.origin],
    category: preset.category,
    ecoScore,
    grade,
    carbonFootprint: Number(normCarbon.toFixed(2)),
    sourcingScore: Number(normSourcing.toFixed(2)),
    packagingScore: Number(normPack.toFixed(2)),
    certificationScore: Number(normCert.toFixed(2)),
    transparencyScore: Number(normTransparency.toFixed(2)),
    certifications: total >= 80 ? ['Prediksi Layak SIH'] : total >= 65 ? ['Prediksi Menuju SIH'] : [],
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    price: priceRp,
    unit: displayWeight,
    avgLifespanDays: Math.max(3, Math.round(preset.avgLifespanDaysPerKg * weightKg)),
    description: `Estimasi SIH: ${displayLabel} ${displayWeight} (kategori hitung: ${preset.label}), kemasan ${pack.label}, asal ${ORIGIN_LABEL[input.origin]}. Total ${co2TotalKg} kg CO2e, sampah ${kategori.toLowerCase()}.`,
    origin: ORIGIN_LABEL[input.origin],
    ingredients: `${displayLabel}, kemasan: ${pack.label}`,
    packagingType: pack.label,
    co2PerUnitKg: co2TotalKg,
  };

  return {
    productLabel: displayLabel,
    weightKg,
    priceRp,
    co2PerKg,
    co2TotalKg,
    co2IntensityPerJutaRp,
    waste: {
      kategori,
      organikKg,
      anorganikKg,
      dapatDidaurUlang: pack.recyclable,
      dapatDikompos: pack.compostable,
      saranPilah,
    },
    sih: { aspects, total, predikat },
    ecoScore,
    grade,
    suggestions,
    product,
  };
}
