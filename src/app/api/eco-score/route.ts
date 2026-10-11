import { NextRequest, NextResponse } from 'next/server';
import { fetchOffProduct, type OffProduct } from '@/lib/openfoodfacts';
import type { ProductData } from '@/data/seedData';

const GRADE_LABEL: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'> = {
  a: 'A',
  b: 'B',
  c: 'C',
  d: 'D',
  e: 'E',
};

/** Ubah data OFF nyata menjadi ProductData untuk aksi stok/belanja. */
function toProductData(off: OffProduct): ProductData {
  const grade = off.ecoscore ? GRADE_LABEL[off.ecoscore.grade] ?? 'C' : 'C';
  return {
    id: `off-${off.barcode}`,
    barcode: off.barcode,
    name: off.name,
    brand: off.brand,
    category: 'Makanan & Minuman',
    ecoScore: off.ecoscore?.score ?? 0,
    grade,
    // OFF tidak menyediakan subskor LCA — nilai netral, tidak ditampilkan sebagai fakta.
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
    ingredients: off.ingredients || 'Tidak tercatat di Open Food Facts',
    packagingType: off.packaging || 'Tidak tercatat',
    co2PerUnitKg: 0,
  };
}

async function handle(barcode: string) {
  const off = await fetchOffProduct(barcode);
  if (!off) {
    return NextResponse.json(
      {
        found: false,
        error:
          'Produk tidak ditemukan di Open Food Facts. Coba barcode lain, atau gunakan tab Deteksi Foto / input manual.',
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    found: true,
    source: 'openfoodfacts',
    sourceUrl: `https://world.openfoodfacts.org/product/${barcode}`,
    barcode,
    product: toProductData(off),
    ecoscore: off.ecoscore,
    nutriscore: off.nutriscore,
    labels: off.labels,
    categories: off.categories,
    packaging: off.packaging,
    origin: off.origin,
    ingredients: off.ingredients,
    verified: off.labels.length > 0,
    nutriscoreAvailable: !!off.nutriscore,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('barcode');
  if (!barcode) return NextResponse.json({ error: 'Barcode required' }, { status: 400 });
  return handle(barcode);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const barcode = String(body?.barcode || '');
  if (!barcode) return NextResponse.json({ error: 'Barcode required' }, { status: 400 });
  return handle(barcode);
}
