import { describe, expect, it } from 'vitest';
import { normaliseKenyanPhone } from '../lib/validation/phone';

describe('normaliseKenyanPhone', () => {
  it('converts a local 07 number', () => {
    expect(normaliseKenyanPhone('0712 345 678')).toBe('254712345678');
  });

  it('converts a local 01 number', () => {
    expect(normaliseKenyanPhone('0112345678')).toBe('254112345678');
  });

  it('accepts a +254 number', () => {
    expect(normaliseKenyanPhone('+254 712 345 678')).toBe('254712345678');
  });

  it('rejects numbers that are too short or not Kenyan', () => {
    expect(normaliseKenyanPhone('12345')).toBeNull();
    expect(normaliseKenyanPhone('+447700900123')).toBeNull();
  });
});
