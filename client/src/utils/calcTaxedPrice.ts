export function calcTaxedPrice(cost: number, taxPercent: number): number {
  return cost + (cost * taxPercent) / 100;
}
