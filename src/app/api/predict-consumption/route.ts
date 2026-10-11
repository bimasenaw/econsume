import { NextRequest, NextResponse } from 'next/server';
import { predictConsumption, PredictionInput } from '@/lib/algorithms';
import { INITIAL_INVENTORY } from '@/data/seedData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'usr-001', householdSize = 4, items } = body;

    let targetItems = items;
    if (!targetItems || !Array.isArray(targetItems) || targetItems.length === 0) {
      // Default to initial household inventory
      targetItems = INITIAL_INVENTORY.map((inv) => ({
        productId: inv.productId,
        currentQuantity: inv.quantity,
        lastPurchasedAt: inv.purchasedAt,
        avgDailyConsumption: inv.avgDailyConsumption,
      }));
    }

    const payload: PredictionInput = {
      userId,
      householdSize,
      items: targetItems,
    };

    const predictions = predictConsumption(payload);
    return NextResponse.json({
      success: true,
      householdSize,
      totalPredicted: predictions.length,
      predictions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
