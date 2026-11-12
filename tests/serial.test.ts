import { describe, expect, it } from 'vitest';
import { generateSerial, isValidSerial } from '../features/reports/serial';

describe('generateSerial', () => {
  it('builds the date part from UTC year, month and day', () => {
    const serial = generateSerial(new Date('2026-11-12T08:00:00Z'));
    expect(serial.startsWith('OCRA-261112-')).toBe(true);
  });

  it('always produces a serial that passes validation', () => {
    for (let i = 0; i < 50; i++) {
      expect(isValidSerial(generateSerial())).toBe(true);
    }
  });

  it('never uses letters that look like digits, or digits that look like letters', () => {
    for (let i = 0; i < 50; i++) {
      const body = generateSerial().replace(/^OCRA-\d{6}-/, '');
      expect(body).not.toMatch(/[IO01]/);
    }
  });
});

describe('isValidSerial', () => {
  it('rejects serials with the wrong shape', () => {
    expect(isValidSerial('OCRA-261112-ABCD')).toBe(false);
    expect(isValidSerial('ocra-261112-ABCD-EFGH')).toBe(false);
    expect(isValidSerial('OCRA-261112-ABIO-EFGH')).toBe(false);
  });
});
