import { NextRequest, NextResponse } from 'next/server';
import { SEED_PRODUCTS, ProductData } from '@/data/seedData';
import { calculateProductEcoScore } from '@/lib/algorithms';

async function getProductByBarcode(barcode: string): Promise<ProductData | null> {
  const local = SEED_PRODUCTS.find((p) => p.barcode === barcode);
  if (local) return local;

  // Try Open Food Facts fallback with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const offRes = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { 
        next: { revalidate: 3600 },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);
    const offData = await offRes.json();

    if (offData.status === 1 && offData.product) {
      const p = offData.product;
      const offGrade = (p.ecoscore_grade || 'c').toUpperCase();
      const validGrade = ['A', 'B', 'C', 'D', 'E'].includes(offGrade)
        ? (offGrade as 'A' | 'B' | 'C' | 'D' | 'E')
        : 'C';

      return {
        id: `off-${barcode}`,
        barcode,
        name: p.product_name || p.product_name_id || p.generic_name || 'Produk OpenFoodFacts',
        brand: p.brands || 'Merek Terdaftar',
        category: 'Makanan & Minuman',
        ecoScore: p.ecoscore_score || 55,
        grade: validGrade,
        carbonFootprint: 0.55,
        sourcingScore: 0.55,
        packagingScore: 0.50,
        certificationScore: 0.55,
        transparencyScore: 0.60,
        certifications: p.labels_tags || [],
        imageUrl: p.image_url || p.image_front_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        price: 25000,
        unit: p.quantity || '1 pcs',
        avgLifespanDays: 14,
        description: p.generic_name || p.ingredients_text || '',
        origin: p.countries || 'Indonesia',
        ingredients: p.ingredients_text || 'Komposisi terdaftar di kemasan',
        packagingType: p.packaging || 'Kemasan Komersial',
        co2PerUnitKg: 2.5,
      };
    }
  } catch {
    // ignore
  }

  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('barcode');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode required' }, { status: 400 });
  }

  const product = await getProductByBarcode(barcode);

  if (!product) {
    return NextResponse.json({ error: 'Produk belum terdaftar dalam database atau katalog.', barcode }, { status: 404 });
  }

  const result = calculateProductEcoScore(product);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { barcode } = body;

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode required' }, { status: 400 });
  }

  const product = await getProductByBarcode(barcode);

  if (!product) {
    return NextResponse.json({ error: 'Produk belum terdaftar dalam database atau katalog.', barcode }, { status: 404 });
  }

  const result = calculateProductEcoScore(product);
  return NextResponse.json(result);
}
