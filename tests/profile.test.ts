import { describe, expect, it } from 'vitest';
import { validateProfileInput } from '../lib/validation/profile';

const valid = { fullName: 'Lewis Gitonga', phone: '', country: 'KE', locale: 'en' };

describe('validateProfileInput', () => {
  it('accepts a complete valid profile', () => {
    const result = validateProfileInput(valid);
    expect(result.ok).toBe(true);
  });

  it('trims the name and normalises the country code', () => {
    const result = validateProfileInput({ ...valid, fullName: '  Amina  ', country: 'ke' });
    expect(result).toEqual({
      ok: true,
      value: { fullName: 'Amina', phone: null, country: 'KE', locale: 'en' },
    });
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(validateProfileInput({ ...valid, fullName: 'A' }).ok).toBe(false);
  });

  it('accepts a phone number with spaces and a plus sign', () => {
    const result = validateProfileInput({ ...valid, phone: '+254 712 345 678' });
    expect(result.ok && result.value.phone).toBe('+254712345678');
  });

  it('rejects a phone number that is too short', () => {
    expect(validateProfileInput({ ...valid, phone: '12345' }).ok).toBe(false);
  });

  it('rejects a country that is not a two-letter code', () => {
    expect(validateProfileInput({ ...valid, country: 'Kenya' }).ok).toBe(false);
  });

  it('rejects a language outside the supported list', () => {
    expect(validateProfileInput({ ...valid, locale: 'fr' }).ok).toBe(false);
  });
});
