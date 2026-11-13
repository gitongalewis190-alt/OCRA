// Small pure helpers shared by the dashboards. No data access here.

export type Trend = 'up' | 'down' | 'flat';

export function trendFromDelta(delta: number): Trend {
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'flat';
}

export function trendSymbol(trend: Trend): string {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
}

/** Keeps a percentage between 0 and 100 and rounds it to a whole number. */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Stress at or above 60 is shown as a warning. */
export function isHighStress(stress: number): boolean {
  return stress >= 60;
}
