/** Rounds to 2 decimals (EGP piasters) avoiding binary float artefacts. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
