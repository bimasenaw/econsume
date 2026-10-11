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

export interface PredictionInput {
  userId: string;
  householdSize: number;
  items: Array<{
    productId: string;
    currentQuantity: number;
    lastPurchasedAt: string;
    avgDailyConsumption?: number;
  }>;
}

export interface PredictionResultItem {
  productId: string;
  productName: string;
  product: ProductData;
  currentStock: number;
  avgDailyConsumption: number;
  daysRemaining: number;
  predictedEmptyDate: string;
  confidence: number;
  urgency: 'high' | 'medium' | 'low';
}

/**
 * Estimasi sederhana kapan stok habis berdasarkan laju harian & skala rumah tangga.
 * Bukan model ML: hanya perhitungan deterministik dari data stok saat ini.
 */
export function predictConsumption(input: PredictionInput): PredictionResultItem[] {
  const { householdSize, items } = input;
  const householdScale = Math.max(0.5, householdSize / 3);

  const now = new Date();

  return items.map((item) => {
    const product =
      SEED_PRODUCTS.find((p) => p.id === item.productId) || SEED_PRODUCTS[0];

    // Laju harian: pakai data pengguna bila ada, jika tidak estimasi dari lifespan katalog
    const baseLifespan = product.avgLifespanDays || 14;
    const hasMeasuredRate = !!item.avgDailyConsumption && item.avgDailyConsumption > 0;
    let avgDaily: number = item.avgDailyConsumption ?? 0;
    if (!hasMeasuredRate) {
      avgDaily = (1 / baseLifespan) * householdScale;
    }
    if (!avgDaily || avgDaily <= 0) avgDaily = (1 / baseLifespan) * householdScale;

    const daysRemaining = Math.max(0, Math.floor(item.currentQuantity / avgDaily));
    const emptyDateObj = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
    const predictedEmptyDate = emptyDateObj.toISOString().split('T')[0];

    let urgency: 'high' | 'medium' | 'low' = 'low';
    if (daysRemaining <= 3) urgency = 'high';
    else if (daysRemaining <= 7) urgency = 'medium';

    // Kejujuran data: 0.75 bila laju dari pengukuran pengguna, 0.5 bila hanya estimasi katalog
    const confidence = hasMeasuredRate ? 0.75 : 0.5;

    return {
      productId: product.id,
      productName: product.name,
      product,
      currentStock: item.currentQuantity,
      avgDailyConsumption: Number(avgDaily.toFixed(3)),
      daysRemaining,
      predictedEmptyDate,
      confidence,
      urgency,
    };
  });
}
