import { ProductData, SEED_PRODUCTS, calculateEcoScoreAndGrade } from '@/data/seedData';

export interface EcoScoreResult {
  product: ProductData;
  ecoScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  breakdown: {
    carbonFootprint: number; // 0-1
    sourcing: number;        // 0-1
    packaging: number;       // 0-1
    certification: number;   // 0-1
    transparency: number;    // 0-1
  };
  alternatives: Array<ProductData & { recommendationScore: number; co2SavedKg: number }>;
}

/**
 * Calculates complete Eco-Score breakdown & finds top green alternatives
 */
export function calculateProductEcoScore(product: ProductData): EcoScoreResult {
  const { score, grade } = calculateEcoScoreAndGrade(
    product.carbonFootprint,
    product.sourcingScore,
    product.packagingScore,
    product.certificationScore,
    product.transparencyScore
  );

  // Find alternative products in same category with higher eco-score
  const sameCategory = SEED_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  const alternatives = sameCategory
    .map((alt) => {
      // price_score normalized relative to category
      const avgPrice = 35000;
      const priceScore = Math.max(0, 1 - alt.price / (avgPrice * 2));
      const availabilityScore = 0.9; // stock availability

      // Formula: score = 0.5*eco_score + 0.3*price_score + 0.2*availability
      const altEcoNorm = alt.ecoScore / 100;
      const recScore = 0.5 * altEcoNorm + 0.3 * priceScore + 0.2 * availabilityScore;
      
      const co2SavedKg = Math.max(0, (product.co2PerUnitKg || 3.0) - (alt.co2PerUnitKg || 1.0));

      return {
        ...alt,
        recommendationScore: Number(recScore.toFixed(2)),
        co2SavedKg: Number(co2SavedKg.toFixed(2)),
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 3);

  return {
    product,
    ecoScore: score,
    grade,
    breakdown: {
      carbonFootprint: product.carbonFootprint,
      sourcing: product.sourcingScore,
      packaging: product.packagingScore,
      certification: product.certificationScore,
      transparency: product.transparencyScore,
    },
    alternatives,
  };
}
