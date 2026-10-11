import { NextRequest, NextResponse } from 'next/server';
import { SEED_PRODUCTS, type ProductData } from '@/data/seedData';
import { searchOffProducts } from '@/lib/openfoodfacts';

const GRADE_LABEL: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'> = { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E' };

function offToProductData(off: {
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
  ecoscore: { grade: string; score: number | null } | null;
  nutriscore: { grade: string; score: number | null } | null;
}): ProductData {
  return {
    id: `off-${off.barcode}`,
    barcode: off.barcode,
    name: off.name,
    brand: off.brand,
    category: 'Makanan & Minuman',
    ecoScore: off.ecoscore?.score ?? 0,
    grade: off.ecoscore ? GRADE_LABEL[off.ecoscore.grade] ?? 'C' : 'C',
    carbonFootprint: 0.5,
    sourcingScore: 0.5,
    packagingScore: 0.5,
    certificationScore: 0.5,
    transparencyScore: 0.5,
    certifications: off.labels,
    imageUrl:
      off.imageUrl ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    price: 0,
    unit: off.quantity || '1 pcs',
    avgLifespanDays: 14,
    description: off.ingredients || off.categories.join(', '),
    origin: off.origin || 'Tidak diketahui',
    ingredients: off.ingredients || 'Tidak tercatat',
    packagingType: off.packaging || 'Tidak tercatat',
    co2PerUnitKg: 0,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const source = searchParams.get('source') || 'curated';

  // Live search dari Open Food Facts
  if (source === 'off') {
    if (!q) return NextResponse.json({ total: 0, products: [], source: 'openfoodfacts' });
    const country = searchParams.get('country')?.trim() || '';
    const off = await searchOffProducts(q, 16, country || undefined);
    const products = off.map(offToProductData);
    return NextResponse.json({ total: products.length, source: 'openfoodfacts', products });
  }

  // Katalog kurasi lokal (contoh terdokumentasi)
  const category = searchParams.get('category') || '';
  const grade = searchParams.get('grade') || '';
  const certification = searchParams.get('cert') || '';

  let list = SEED_PRODUCTS;
  if (q) {
    const lq = q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(lq) ||
        p.brand.toLowerCase().includes(lq) ||
        p.barcode.includes(lq) ||
        p.ingredients.toLowerCase().includes(lq)
    );
  }
  if (category && category !== 'Semua') list = list.filter((p) => p.category === category);
  if (grade && grade !== 'Semua') list = list.filter((p) => p.grade === grade);
  if (certification && certification !== 'Semua') {
    list = list.filter((p) =>
      p.certifications.some((c) => c.toLowerCase().includes(certification.toLowerCase()))
    );
  }

  return NextResponse.json({ total: list.length, source: 'curated', products: list });
}
