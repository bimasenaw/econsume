/**
 * Helper Gemini Vision — klasifikasi foto kemasan menjadi jenis barang SIH
 * + tebakan kata kunci untuk pencarian Open Food Facts.
 *
 * Dipakai server-side oleh /api/gemini-detect agar API key tidak bocor ke client.
 */

export const SIH_PRODUCT_IDS = [
  'beras',
  'minyak_goreng',
  'telur',
  'gula',
  'kopi',
  'susu_sapi',
  'teh',
  'deterjen',
  'sabun',
  'kacang_kedelai',
] as const;

export const SIH_PACKAGING_IDS = [
  'curah',
  'kertas_kraft',
  'kardus',
  'tray_kertas',
  'botol_kaca',
  'kaleng',
  'galon_guna_ulang',
  'rPET',
  'plastik_sekali_pakai',
  'multilayer_sachet',
  'styrofoam',
  'tetra_pak',
] as const;

export const SIH_ORIGIN_IDS = ['lokal', 'nasional', 'impor'] as const;

export interface GeminiDetectResult {
  /** Nama/jenis barang TEKS BEBAS sesuai yang terbaca di kemasan (mis. "Indomie Goreng"). */
  productType: string;
  productName: string;
  brand: string;
  /**
   * Kategori SIH terdekat untuk mesin hitung rule-based.
   * Wajib salah satu dari SIH_PRODUCT_IDS.
   */
  sihCategory: (typeof SIH_PRODUCT_IDS)[number];
  packaging: (typeof SIH_PACKAGING_IDS)[number];
  origin: (typeof SIH_ORIGIN_IDS)[number];
  confidence: number; // 0-1
  reasoning: string;
  /** Perkiraan berat total isi produk (gram) — dipakai untuk mengisi otomatis kolom berat. */
  weightGrams?: number;
  /** Perkiraan harga eceran (Rupiah) — dipakai untuk mengisi otomatis kolom harga. */
  priceRp?: number;
}

const SYSTEM_PROMPT = `Kamu adalah asisten klasifikasi kemasan produk rumah tangga Indonesia untuk aplikasi EcoConsume AI.
Lihat foto kemasan/produk yang diberikan pengguna.

Tugas:
1. Baca NAMA/JENIS BARANG apa adanya dari kemasan (teks bebas, mis. "Indomie Goreng",
   "Teh Botol Sosro", "Beras Pandan Wangi 5kg"). Tulis di "productType" dan "productName".
   Jangan dipaksa ke kategori baku — tulis sesuai label yang terlihat/terbaca.
2. Petakan ke KATEGORI SIH terdekat di "sihCategory" — WAJIB salah satu dari:
   beras, minyak_goreng, telur, gula, kopi, susu_sapi, teh, deterjen, sabun, kacang_kedelai.
   - Aturan: mie instan/makanan kemasan -> pilih bahan dasarnya (mie telur -> telur,
     mie beras/bihun -> beras, lainnya -> kacang_kedelai sebagai proksi nabati).
     Minyak goreng/sawit/minyak kelapa -> minyak_goreng. Susu cair/UHT -> susu_sapi.
     Sabun mandi/cuci piring/shampo -> sabun. Deterjen/pembersih lantai -> deterjen.
     Teh/kopi/susu sachet -> teh/kopi/susu_sapi. Gula/permen -> gula.
     Bila benar-benar jauh, pilih yang jejak karbonnya paling mirip.
2. Tentukan KEMASAN — WAJIB salah satu dari:
   curah, kertas_kraft, kardus, tray_kertas, botol_kaca, kaleng, galon_guna_ulang,
   rPET, plastik_sekali_pakai, multilayer_sachet, styrofoam, tetra_pak.
   - Botol plastik sekali pakai -> plastik_sekali_pakai. Botol PET daur ulang berlabel rPET -> rPET.
     Sachet foil/plastik berlapis -> multilayer_sachet. Kemasan karton minuman (Ultra Milk dsb) -> tetra_pak.
     Tanpa kemasan / bawa wadah sendiri -> curah.
3. Tebak nama produk + merek yang terlihat di kemasan (OCR label bila bisa dibaca).
4. Tentukan asal barang: lokal (produk daerah/pasar), nasional (merek Indonesia antar-pulau),
   impor (merek luar / label impor). Bila ragu pilih nasional.
5. Perkirakan BERAT total isi produk dalam gram ("weightGrams") dan HARGA eceran dalam Rupiah
   ("priceRp"). Ini hanya perkiraan dari ukuran kemasan & jenis barang; bila sangat tidak yakin,
   beri angka wajar (mis. 500, 1000) dan harga umumnya.

BALAS HANYA JSON valid tanpa markdown, tanpa penjelasan di luar JSON, dengan skema persis:
{
  "productType": "teks bebas sesuai label kemasan",
  "productName": "nama produk spesifik bila terbaca, bila tidak samakan dengan productType",
  "brand": "...",
  "sihCategory": "salah satu dari 10 ID SIH",
  "packaging": "...",
  "origin": "...",
  "confidence": 0.0-1.0,
  "weightGrams": 0,
  "priceRp": 0,
  "reasoning": "satu kalimat Bahasa Indonesia"
}`;

function stripDataUrl(input: string): { data: string; mimeType: string } {
  const m = /^data:(.+?);base64,([\s\S]+)$/.exec(input.trim());
  if (m) return { mimeType: m[1], data: m[2] };
  return { mimeType: 'image/jpeg', data: input.trim() };
}

function sanitizeResult(raw: unknown): GeminiDetectResult {
  const r = (raw ?? {}) as Record<string, unknown>;
  const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
    typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
  const num = Number(r.confidence);
  const weightGrams = Number(r.weightGrams);
  const priceRp = Number(r.priceRp);
  const freeText = (v: unknown, fallback: string) =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, 120) : fallback;
  return {
    productType: freeText(r.productType, freeText(r.productName, 'Produk Kemasan')),
    productName: freeText(r.productName, freeText(r.productType, 'Produk Kemasan')),
    brand: typeof r.brand === 'string' ? r.brand.slice(0, 120) : '',
    // Kompatibel mundur: AI lama hanya mengembalikan productType berupa ID SIH
    sihCategory: pick(
      r.sihCategory ?? (typeof r.productType === 'string' && (SIH_PRODUCT_IDS as readonly string[]).includes(r.productType) ? r.productType : undefined),
      SIH_PRODUCT_IDS,
      'beras'
    ),
    packaging: pick(r.packaging, SIH_PACKAGING_IDS, 'plastik_sekali_pakai'),
    origin: pick(r.origin, SIH_ORIGIN_IDS, 'nasional'),
    confidence: Number.isFinite(num) ? Math.min(1, Math.max(0, num)) : 0.5,
    reasoning: typeof r.reasoning === 'string' ? r.reasoning.slice(0, 300) : '',
    weightGrams: Number.isFinite(weightGrams) && weightGrams > 0 ? Math.round(weightGrams) : undefined,
    priceRp: Number.isFinite(priceRp) && priceRp > 0 ? Math.round(priceRp) : undefined,
  };
}

/**
 * Rantai model (generasi 3.x saja).
 * Key baru tidak bisa memakai generasi 2.x (Google mempensiunkannya:
 * 2.0-flash → 2.5-flash → 2.5-flash-lite, semua 404 untuk key baru),
 * dan endpoint daftar model tidak bisa dipercaya — hanya generateContent
 * asli yang membuktikan sebuah model hidup. Urutan = prioritas coba.
 */
const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite', // primer: rekomendasi resmi Google utk key baru, terverifikasi hidup & cepat
  'gemini-3.8-flash', // paling mumpuni, kadang overload → jadi cadangan pertama
  'gemini-3.5-flash',
  'gemini-flash-latest', // alias "terbaru", mengikuti pensiun model lama
];

const DEFAULT_MODEL = process.env.GEMINI_MODEL || FALLBACK_MODELS[0];

function getCandidateModels(primary: string): string[] {
  return [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Error yang layak di-retry: rate limit & overload sementara. */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 503 || status === 529;
}

export class GeminiOverloadedError extends Error {
  retryable = true;
  constructor(message: string) {
    super(message);
    this.name = 'GeminiOverloadedError';
  }
}

async function callGeminiOnce(
  imageData: string,
  mimeType: string,
  apiKey: string,
  model: string
): Promise<GeminiDetectResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: SYSTEM_PROMPT }, { inlineData: { mimeType: mimeType, data: imageData } }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err = new Error(`Gemini API ${res.status}: ${text.slice(0, 200) || res.statusText}`);
      (err as Error & { httpStatus?: number }).httpStatus = res.status;
      const retryAfter = res.headers.get('retry-after');
      if (retryAfter) (err as Error & { retryAfterSec?: number }).retryAfterSec = Number(retryAfter) || undefined;
      throw err;
    }

    const json = await res.json();
    const textPart: string =
      json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';

    if (!textPart) throw new Error('Respons Gemini kosong.');
    // Buang pembungkus markdown bila ada
    const cleaned = textPart.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return sanitizeResult(parsed);
  } finally {
    clearTimeout(timeout);
  }
}

export async function classifyPackagingWithGemini(
  imageBase64: string,
  apiKey: string,
  model = DEFAULT_MODEL
): Promise<GeminiDetectResult & { model: string }> {
  const { data, mimeType } = stripDataUrl(imageBase64);
  if (!data || data.length < 100) throw new Error('Gambar tidak valid / terlalu kecil.');

  const candidates = getCandidateModels(model);
  const attempts: Array<{ model: string; status: string }> = [];

  for (const candidate of candidates) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await callGeminiOnce(data, mimeType, apiKey, candidate);
        return { ...result, model: candidate };
      } catch (e) {
        const status = (e as Error & { httpStatus?: number }).httpStatus ?? 0;
        const message = e instanceof Error ? e.message : 'Unknown error';
        attempts.push({ model: candidate, status: status ? `HTTP ${status}` : message.slice(0, 80) });

        // 404 = model pensiun/tidak tersedia → langsung pindah ke cadangan
        if (status === 404) break;
        // 400 = request bermasalah (bukan overload) → jangan buang waktu retry
        if (status === 400) throw e;

        if (isRetryableStatus(status) && attempt < 2) {
          const retryAfter = (e as Error & { retryAfterSec?: number }).retryAfterSec;
          await sleep(retryAfter ? Math.min(retryAfter, 10) * 1000 : attempt * 2000);
          continue;
        }
        break; // pindah ke model cadangan
      }
    }
  }

  // Semua kandidat gagal → ringkas semua percobaan, jangan lempar 1 error mentah.
  const summary = attempts.map((a) => `${a.model} (${a.status})`).join(', ');
  const allOverloaded = attempts.length > 0 && attempts.every((a) => /HTTP (429|503|529)/.test(a.status));
  if (allOverloaded) {
    throw new GeminiOverloadedError(
      'Server Gemini sedang penuh (overload sementara). Coba lagi dalam 1–2 menit, atau tekan tombol analisis ulang.'
    );
  }
  throw new Error(
    `Semua model Gemini gagal dicoba: ${summary}. Bila ini 404 model, set model 3.x yang hidup via env GEMINI_MODEL.`
  );
}
