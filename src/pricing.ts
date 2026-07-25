// Pricing logic based on seasonal demand and duration

export function calculatePrice(basePricePerDay: number, days: number, startDate: Date): number {
  if (days <= 0) return 0;

  // Seasonal Multiplier Logic for Corbett National Park
  // Peak Season: Nov (11) - June (6) -> 1.2x
  // Off Season: July (7) - Oct (10) -> 0.8x
  const month = startDate.getMonth() + 1; // getMonth is 0-indexed
  const isPeakSeason = month >= 11 || month <= 6;
  const seasonalMultiplier = isPeakSeason ? 1.2 : 0.8;

  // Duration Discount Logic
  // 3-6 days: 5% off
  // 7+ days: 10% off
  let discountMultiplier = 1.0;
  if (days >= 7) {
    discountMultiplier = 0.9;
  } else if (days >= 3) {
    discountMultiplier = 0.95;
  }

  const rawPrice = basePricePerDay * days * seasonalMultiplier * discountMultiplier;
  
  // Round to nearest integer for clean display
  return Math.round(rawPrice);
}
