import { NextRequest, NextResponse } from 'next/server';
import { estimateConsumption, type PurchaseLog } from '@/lib/tracking';
import { INITIAL_PURCHASES } from '@/data/seedData';

/**
 * POST /api/predict-consumption
 * Body: { purchases?: PurchaseLog[] }
 * Estimasi laju konsumsi dari histori pembelian NYATA (bukan katalog/skala karangan).
 * Bila purchases tidak dikirim, memakai contoh data awal.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const purchases: PurchaseLog[] =
      Array.isArray(body?.purchases) && body.purchases.length > 0 ? body.purchases : INITIAL_PURCHASES;

    const estimates = estimateConsumption(purchases);
    return NextResponse.json({
      success: true,
      method: 'histori pembelian (empiris)',
      total: estimates.length,
      sufficient: estimates.filter((e) => e.sufficient).length,
      estimates,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    method: 'POST /api/predict-consumption dengan { purchases: PurchaseLog[] }',
    note: 'Estimasi laju konsumsi dari histori pembelian pengguna. Produk dengan data <2 pembelian / <14 hari ditandai insufficient.',
  });
}
