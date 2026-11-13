import { describe, expect, it } from 'vitest';
import { clampPercent, isHighStress, trendFromDelta, trendSymbol } from '../features/dashboard/format';
import { SAMPLE_STUDENTS } from '../features/dashboard/sample';

describe('dashboard formatting', () => {
  it('maps a change in progress to an arrow', () => {
    expect(trendSymbol(trendFromDelta(20))).toBe('↑');
    expect(trendSymbol(trendFromDelta(-5))).toBe('↓');
    expect(trendSymbol(trendFromDelta(0))).toBe('→');
  });

  it('keeps percentages between 0 and 100 as whole numbers', () => {
    expect(clampPercent(120)).toBe(100);
    expect(clampPercent(-4)).toBe(0);
    expect(clampPercent(59.6)).toBe(60);
    expect(clampPercent(Number.NaN)).toBe(0);
  });

  it('flags stress at 60 and above', () => {
    expect(isHighStress(59)).toBe(false);
    expect(isHighStress(60)).toBe(true);
  });

  it('keeps every sample student with a unique id and valid numbers', () => {
    const ids = new Set(SAMPLE_STUDENTS.map((s) => s.id));
    expect(ids.size).toBe(SAMPLE_STUDENTS.length);
    for (const s of SAMPLE_STUDENTS) {
      expect(s.progress).toBeGreaterThanOrEqual(0);
      expect(s.progress).toBeLessThanOrEqual(100);
    }
  });
});
