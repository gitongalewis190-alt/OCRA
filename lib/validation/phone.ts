/**
 * Converts a Kenyan mobile number to the 2547XXXXXXXX or 2541XXXXXXXX form Daraja expects.
 * Accepts 07…, 01…, 254…, +254… and spaces or dashes. Returns null when the number is not valid.
 */
export function normaliseKenyanPhone(input: string): string | null {
  const digits = input.replace(/[\s()+-]/g, '');

  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  return null;
}
