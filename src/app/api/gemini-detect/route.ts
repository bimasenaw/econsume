import { NextRequest, NextResponse } from 'next/server';
import { classifyPackagingWithGemini, GeminiOverloadedError } from '@/lib/gemini';

/**
 * POST /api/gemini-detect
 * Body: { image: "data:image/jpeg;base64,..." ATAU base64 mentah }
 * Menentukan JENIS BARANG (productType) + kemasan + kata kunci OFF via Gemini Vision.
 *
 * Butuh env: GEMINI_API_KEY (https://aistudio.google.com/app/apikey)
 * Opsional: GEMINI_MODEL (default gemini-3.8-flash)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const image = String(body?.image || '');

    if (!image || image.length < 500) {
      return NextResponse.json(
        { error: 'Foto kemasan wajib diunggah (base64 image).' },
        { status: 400 }
      );
    }
    // Batasi ~6 MB base64 agar tidak membebani API
    if (image.length > 8_000_000) {
      return NextResponse.json(
        { error: 'Ukuran foto terlalu besar (maks ~6 MB). Kompres dulu.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY belum diset di server. Tambahkan ke .env.local lalu restart dev server. Sementara itu pilih jenis barang manual.',
          needSetup: true,
        },
        { status: 503 }
      );
    }

    const result = await classifyPackagingWithGemini(image, apiKey);

    return NextResponse.json({
      success: true,
      provider: 'gemini',
      ...result,
    });
  } catch (e) {
    if (e instanceof GeminiOverloadedError) {
      return NextResponse.json({ error: `Gagal klasifikasi Gemini: ${e.message}`, retryable: true }, { status: 503 });
    }
    const message = e instanceof Error ? e.message : 'Unknown error';
    const status = /abort|timeout/i.test(message) ? 504 : 500;
    return NextResponse.json({ error: `Gagal klasifikasi Gemini: ${message}` }, { status });
  }
}

export async function GET() {
  const configured = !!process.env.GEMINI_API_KEY;
  return NextResponse.json({
    endpoint: 'POST /api/gemini-detect dengan { image: base64 dataURL }',
    provider: 'google-gemini-vision',
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    configured,
    hint: configured
      ? 'Siap. Kirim foto kemasan untuk klasifikasi jenis barang.'
      : 'Set GEMINI_API_KEY di .env.local (lihat .env.example).',
  });
}
