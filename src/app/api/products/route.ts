import { NextRequest, NextResponse } from 'next/server';
import { SEED_PRODUCTS } from '@/data/seedData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';
  const category = searchParams.get('category') || '';
  const grade = searchParams.get('grade') || '';
  const certification = searchParams.get('cert') || '';

  let list = SEED_PRODUCTS;

  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.ingredients.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'Semua') {
    list = list.filter((p) => p.category === category);
  }

  if (grade && grade !== 'Semua') {
    list = list.filter((p) => p.grade === grade);
  }

  if (certification && certification !== 'Semua') {
    list = list.filter((p) =>
      p.certifications.some((c) => c.toLowerCase().includes(certification.toLowerCase()))
    );
  }

  return NextResponse.json({
    total: list.length,
    products: list,
  });
}
