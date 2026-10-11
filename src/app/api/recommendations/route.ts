import { NextRequest, NextResponse } from 'next/server';
import { SEED_PRODUCTS } from '@/data/seedData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const excludeId = searchParams.get('excludeId');

  let filtered = SEED_PRODUCTS;
  if (category) {
    filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  if (excludeId) {
    filtered = filtered.filter((p) => p.id !== excludeId);
  }

  // Formula: score = 0.5*eco_score + 0.3*price_score + 0.2*availability_score
  const recommendations = filtered
    .map((product) => {
      const ecoNorm = product.ecoScore / 100;
      const priceScore = Math.max(0, 1 - product.price / 80000);
      const availabilityScore = 0.95;
      const score = 0.5 * ecoNorm + 0.3 * priceScore + 0.2 * availabilityScore;

      return {
        ...product,
        recommendationScore: Number(score.toFixed(3)),
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 3);

  return NextResponse.json({
    category: category || 'all',
    count: recommendations.length,
    recommendations,
  });
}
