/**
 * Klien Open Food Facts (OFF) — data produk NYATA & terbuka (crowd-sourced).
 * Tidak ada API key. Semua nilai berasal dari respons OFF, bukan karangan.
 * Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
 */

const OFF_BASE = 'https://world.openfoodfacts.org';
const USER_AGENT = 'EcoConsumeAI/1.0 (https://example.org; educational project)';

export interface OffScore {
  grade: string; // 'a'-'e'
  score: number | null; // 0-100 (bila tersedia)
}

export interface OffProduct {
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string;
  quantity: string;
  categories: string[];
  labels: string[];
  packaging: string;
  origin: string;
  ingredients: string;
  ecoscore: OffScore | null;
  nutriscore: OffScore | null;
}

interface OffRawProduct {
  product_name?: string;
  product_name_id?: string;
  generic_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  quantity?: string;
  categories_tags?: string[];
  labels_tags?: string[];
  packaging?: string;
  countries_tags?: string[];
  ingredients_text?: string;
  ecoscore_grade?: string;
  ecoscore_score?: number;
  nutriscore_grade?: string;
  nutriscore_score?: number;
}

function humanizeTag(tag: string): string {
  return tag
    .replace(/^[a-z]{2}:/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizeGrade(g: string | undefined): string | null {
  if (!g) return null;
  const up = g.toLowerCase();
  return ['a', 'b', 'c', 'd', 'e'].includes(up) ? up : null;
}

function mapProduct(barcode: string, p: OffRawProduct): OffProduct {
  const ecoGrade = normalizeGrade(p.ecoscore_grade);
  const nutGrade = normalizeGrade(p.nutriscore_grade);
  return {
    barcode,
    name: p.product_name || p.product_name_id || p.generic_name || 'Produk tanpa nama',
    brand: p.brands || 'Merek tidak tercatat',
    imageUrl: p.image_front_url || p.image_url || '',
    quantity: p.quantity || '',
    categories: (p.categories_tags || []).slice(0, 6).map(humanizeTag),
    labels: (p.labels_tags || []).slice(0, 8).map(humanizeTag),
    packaging: p.packaging || '',
    origin: (p.countries_tags || []).map(humanizeTag).join(', '),
    ingredients: p.ingredients_text || '',
    ecoscore: ecoGrade ? { grade: ecoGrade, score: p.ecoscore_score ?? null } : null,
    nutriscore: nutGrade ? { grade: nutGrade, score: p.nutriscore_score ?? null } : null,
  };
}

/** Ambil produk OFF berdasarkan barcode. Mengembalikan null bila tidak ditemukan. */
export async function fetchOffProduct(barcode: string): Promise<OffProduct | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${OFF_BASE}/api/v2/product/${encodeURIComponent(barcode)}.json`, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.status !== 1 || !data?.product) return null;
    return mapProduct(barcode, data.product as OffRawProduct);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Cari produk OFF berdasarkan kata kunci. Mengembalikan daftar kosong bila gagal. */
export async function searchOffProducts(term: string, limit = 12, country?: string): Promise<OffProduct[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const params = new URLSearchParams({
      search_terms: term,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: String(limit),
      fields: 'code,product_name,brands,image_front_url,image_url,quantity,categories_tags,labels_tags,packaging,countries_tags,ingredients_text,ecoscore_grade,ecoscore_score,nutriscore_grade,nutriscore_score',
    });
    if (country) {
      params.set('tagtype_0', 'countries');
      params.set('tag_contains_0', 'contains');
      params.set('tag_0', country);
    }
    const res = await fetch(`${OFF_BASE}/cgi/search.pl?${params.toString()}`, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products = Array.isArray(data?.products) ? data.products : [];
    return products
      .filter((p: { code?: string }) => p?.code)
      .map((p: { code: string } & OffRawProduct) => mapProduct(p.code, p));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
