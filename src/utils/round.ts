export function round(value: number, decimal = 1): number {
  return Math.round(value * decimal) / decimal;
}
