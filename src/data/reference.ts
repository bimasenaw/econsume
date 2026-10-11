/**
 * Data referensi empiris — SEMUA angka di sini berasal dari sumber publik ter-sitasi.
 * Aplikasi TIDAK mengarang angka: setiap metrik yang ditampilkan harus berjejak
 * ke tabel ini atau ke input/log pengguna sendiri.
 */

// ─────────────────────────────────────────────────────────────
// 1. Benchmark nasional (SIPSN KLHK) — timbulan sampah rumah tangga
// ─────────────────────────────────────────────────────────────
export const NATIONAL_WASTE = {
  totalTonsPerYear: 19_184_579.01,
  year: 2024,
  source: 'Sistem Informasi Pengelolaan Sampah Nasional (SIPSN), KLHK',
  sourceUrl: 'https://sipsn.menlhk.go.id/',
  note: 'Total timbulan sampah nasional (ton/tahun).',
} as const;

export const POPULATION = {
  total: 281_603_800,
  year: 2024,
  source: 'Badan Pusat Statistik (BPS) — proyeksi penduduk',
  sourceUrl: 'https://www.bps.go.id/',
} as const;

/** kg sampah per orang per hari (nasional). Diturunkan dari SIPSN & BPS. */
export const NATIONAL_PER_CAPITA_DAILY_KG = Number(
  ((NATIONAL_WASTE.totalTonsPerYear * 1000) / POPULATION.total / 365).toFixed(3)
);

// ─────────────────────────────────────────────────────────────
// 2. Faktor emisi (kg CO₂e per kg) — Poore & Nemecek (2018), Science
//    "Reducing food's environmental impacts through producers and consumers"
// ─────────────────────────────────────────────────────────────
export const EMISSION_FACTORS = {
  source: 'Poore & Nemecek (2018), Science 360:987-992',
  sourceUrl: 'https://doi.org/10.1126/science.aaq0216',
  note: 'Nilai indikatif kg CO₂e per kg bahan. Dibulatkan untuk edukasi.',
  food: {
    sayur_buah: 0.4,
    beras_sereal: 2.7,
    gula: 1.8,
    minyak: 4.8,
    telur: 4.8,
    susu: 3.2,
    ayam: 6.0,
    daging_sapi: 60.0,
  } as Record<string, number>,
} as const;

/** Faktor emisi material kemasan (kg CO₂e/kg) — indikatif, untuk edukasi. */
export const MATERIAL_FACTORS = {
  source: 'ADEME / literature (nilai indikatif, dibulatkan)',
  sourceUrl: 'https://impactco2.fr/',
  note: 'Estimasi indikatif, bukan LCA resmi produk tertentu.',
  plastik: 2.5,
  kertas: 1.0,
  kaca: 1.3,
  logam: 2.0,
  multilayer: 2.8,
} as const;

// ─────────────────────────────────────────────────────────────
// 3. Kategori pemilahan sampah (mengikuti alur KLHK: Organik/Anorganik/B3/Residu)
// ─────────────────────────────────────────────────────────────
export interface WasteCategory {
  id: string;
  label: string;
  emojiFree: string; // dipakai sebagai label teks, bukan ikon
  color: string; // kelas tailwind
  examples: string[];
  handling: string;
  emissionKey?: keyof typeof EMISSION_FACTORS.food;
  materialKey?: 'plastik' | 'kertas' | 'kaca' | 'logam' | 'multilayer';
}

export const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: 'organik',
    label: 'Organik',
    emojiFree: 'Organik',
    color: 'emerald',
    examples: ['Sisa sayur & buah', 'Nasi/bahan makanan basi', 'Sisa dapur', 'Daun & ranting'],
    handling:
      'Jadikan kompos (takakura/lubang biopori), pakan maggot BSF, atau eco-enzyme. Jangan campur dengan plastik.',
    emissionKey: 'sayur_buah',
  },
  {
    id: 'anorganik_daur',
    label: 'Anorganik Dapat Didaur',
    emojiFree: 'Anorganik',
    color: 'sky',
    examples: ['Botol PET & HDPE', 'Kertas/kardus bersih', 'Kaleng logam', 'Botol kaca'],
    handling:
      'Bersihkan, keringkan, lalu setor ke bank sampah atau pengepul. Pilah per jenis (plastik, kertas, logam, kaca).',
    materialKey: 'plastik',
  },
  {
    id: 'residu',
    label: 'Residu',
    emojiFree: 'Residu',
    color: 'slate',
    examples: ['Sachet multilayer/foil', 'Styrofoam', 'Puntung & diaper', 'Plastik kotor tak terurai'],
    handling:
      'Sulit didaur — minimalkan sejak awal. Buang ke TPA sesuai aturan daerah; jangan dibakar.',
    materialKey: 'multilayer',
  },
  {
    id: 'b3',
    label: 'B3 / Limbah Berbahaya',
    emojiFree: 'B3',
    color: 'rose',
    examples: ['Baterai', 'Lampu TL', 'Obat kedaluwarsa', 'Cat & pelarut', 'Elektronik kecil'],
    handling:
      'Pisahkan — jangan campur rumah tangga. Setor ke titik pengumpulan limbah B3 resmi/e-waste.',
  },
];

// ─────────────────────────────────────────────────────────────
// 4. Ekolabel & sertifikasi (dengan URL verifikasi resmi)
// ─────────────────────────────────────────────────────────────
export interface Ecolabel {
  id: string;
  name: string;
  scope: string;
  means: string;
  verifyUrl: string;
  greenwashingRisk: 'rendah' | 'sedang' | 'tinggi';
}

export const ECOLABELS: Ecolabel[] = [
  {
    id: 'ekolabel-id',
    name: 'Ekolabel Indonesia (SNI)',
    scope: 'Produk & jasa',
    means: 'Sertifikasi lingkungan Indonesia yang dikelola lembaga resmi; kriteria per kategori produk.',
    verifyUrl: 'https://sipsn.menlhk.go.id/',
    greenwashingRisk: 'rendah',
  },
  {
    id: 'fsc',
    name: 'FSC (Forest Stewardship Council)',
    scope: 'Kertas & kayu',
    means: 'Menjamin kayu/pulp dari hutan yang dikelola lestari & bisa dilacak (kode sertifikat).',
    verifyUrl: 'https://fsc.org/en/check-certificates',
    greenwashingRisk: 'rendah',
  },
  {
    id: 'rspo',
    name: 'RSPO',
    scope: 'Minyak sawit',
    means: 'Sawit berkelanjutan; wajib dicek status supply-chain (Mass Balance/Segregated) produknya.',
    verifyUrl: 'https://rspo.org/members/',
    greenwashingRisk: 'sedang',
  },
  {
    id: 'usda-organic',
    name: 'USDA Organic',
    scope: 'Pangan',
    means: 'Klaim organik AS dengan ambang bahan; label "Made with Organic" hanya sebagian.',
    verifyUrl: 'https://www.usda.gov/topics/organic',
    greenwashingRisk: 'sedang',
  },
  {
    id: 'eu-ecolabel',
    name: 'EU Ecolabel',
    scope: 'Produk & jasa',
    means: 'Kriteria siklus hidup ketat untuk produk di pasar Eropa.',
    verifyUrl: 'https://environment.ec.europa.eu/topics/circular-economy/eu-ecolabel-home_en',
    greenwashingRisk: 'rendah',
  },
  {
    id: 'fairtrade',
    name: 'Fair Trade',
    scope: 'Pertanian & kerajinan',
    means: 'Fokus kesejahteraan petani & harga adil — bukan jaminan rendah karbon.',
    verifyUrl: 'https://www.fairtrade.net/',
    greenwashingRisk: 'sedang',
  },
];

/** Sinyal umum klaim menyesatkan (greenwashing) untuk dicek pengguna. */
export const GREENWASHING_FLAGS = [
  'Klaim "ramah lingkungan" tanpa menyebut kriteria/standar spesifik.',
  'Ikon daun/hijau atau kata "eco", "green", "natural" tanpa sertifikasi resmi.',
  'Sertifikasi buatan sendiri tanpa lembaga pengakuan (cek kode di registry resmi).',
  '% daur ulang/komposisi tanpa dasar hitung & tanpa jejak audit.',
  'Menonjolkan satu aspek (mis. kemasan) tapi mengabaikan dampak lain (mis. emisi).',
  'Tidak ada data produsen, alamat, atau keterlacakan rantai pasok.',
];

// ─────────────────────────────────────────────────────────────
// 5. Konversi satuan → kg (indikatif, dapat diedit pengguna)
// ─────────────────────────────────────────────────────────────
export const UNIT_TO_KG: Record<string, number> = {
  kg: 1,
  kilogram: 1,
  gram: 0.001,
  g: 0.001,
  liter: 1,
  l: 1,
  ml: 0.001,
  botol: 0.5,
  kaleng: 0.35,
  sachet: 0.02,
  pcs: 0.1,
  pack: 0.5,
  sak: 5,
  pouch: 1,
  karton: 1,
};

export function toKg(quantity: number, unit: string): number | null {
  const key = (unit || '').trim().toLowerCase().replace(/\(.*\)/, '').trim();
  const factor = UNIT_TO_KG[key] ?? UNIT_TO_KG[unit];
  if (factor === undefined) return null;
  return Number((quantity * factor).toFixed(3));
}

export const DATA_DISCLAIMER =
  'Semua estimasi bertanda sumber. Angka pengguna berasal dari catatan Anda; faktor konversi & emisi bersifat indikatif dan tercantum sumbernya.';
