import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PLACEHOLDER = 'https://placehold.co/600x400/FEF3C7/065F46?text=';

function fallback(label: string) {
  const text = encodeURIComponent(label || 'EcoConsume AI');
  const res = NextResponse.redirect(`${PLACEHOLDER}${text}`);
  res.headers.set('Cache-Control', 'public, max-age=3600');
  return res;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const label = searchParams.get('label')?.trim() || q;

  if (!q) return fallback(label);

  const api = new URL('https://commons.wikimedia.org/w/api.php');
  api.searchParams.set('action', 'query');
  api.searchParams.set('generator', 'search');
  api.searchParams.set('gsrsearch', q);
  api.searchParams.set('gsrnamespace', '6');
  api.searchParams.set('gsrlimit', '1');
  api.searchParams.set('prop', 'imageinfo');
  api.searchParams.set('iiprop', 'url');
  api.searchParams.set('iiurlwidth', '600');
  api.searchParams.set('format', 'json');
  api.searchParams.set('origin', '*');

  try {
    const res = await fetch(api.toString(), {
      headers: { 'User-Agent': 'EcoConsumeAI/1.0 (demo; product image lookup)' },
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = (await res.json()) as {
        query?: { pages?: Record<string, { imageinfo?: Array<{ thumburl?: string }> }> };
      };
      const pages = data.query?.pages ? Object.values(data.query.pages) : [];
      const source = pages.find((p) => p.imageinfo?.[0]?.thumburl)?.imageinfo?.[0]?.thumburl;
      if (source) {
        const redirect = NextResponse.redirect(source);
        redirect.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
        return redirect;
      }
    }
  } catch {
    // ignore and fall through to placeholder
  }

  return fallback(label);
}
