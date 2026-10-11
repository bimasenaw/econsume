import { NextRequest, NextResponse } from 'next/server';
import { estimateSih, getSihOptions } from '@/lib/sih';

export async function GET() {
  return NextResponse.json({
    method: 'POST /api/ai-detect dengan { productType (ID kategori SIH), productName (teks bebas opsional), weightKg, priceRp, packaging, origin, hasPhoto }',
    ...getSihOptions(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // productType = ID kategori SIH untuk hitungan; productName = teks bebas untuk tampilan.
    // Dukung juga sihCategory sebagai alias productType (format baru dari AI).
    const { productType, sihCategory, productName, weightKg, priceRp, packaging, origin, hasPhoto } = body ?? {};
    const categoryId = sihCategory || productType;

    if (!categoryId || !packaging || !origin) {
      return NextResponse.json(
        { error: 'Kategori SIH (productType/sihCategory), packaging, dan origin wajib diisi.' },
        { status: 400 }
      );
    }

    const w = Number(weightKg);
    const p = Number(priceRp);
    if (!Number.isFinite(w) || w <= 0 || w > 1000) {
      return NextResponse.json({ error: 'weightKg harus 0,01–1000 kg.' }, { status: 400 });
    }
    if (!Number.isFinite(p) || p < 0 || p > 100_000_000) {
      return NextResponse.json({ error: 'priceRp harus 0–100 juta.' }, { status: 400 });
    }

    const result = estimateSih({
      productType: categoryId,
      customLabel: typeof productName === 'string' ? productName.slice(0, 120) : undefined,
      weightKg: w,
      priceRp: p,
      packaging,
      origin,
      hasPhoto: !!hasPhoto,
    });

    return NextResponse.json({ success: true, disclaimer: 'Estimasi rule-based SIH, bukan hasil lab/sertifikasi resmi.', ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
