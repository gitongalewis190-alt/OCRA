// Letters without I or O, and digits without 0 or 1, so serials read clearly on paper.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SERIAL_PATTERN = /^OCRA-\d{6}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

function randomChars(length: number): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  // 32 characters divide 256 evenly, so there is no modulo bias.
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
}

/** Serial printed on every report and checked when someone searches for it. Format: OCRA-YYMMDD-XXXX-XXXX. */
export function generateSerial(date: Date = new Date()): string {
  const yy = String(date.getUTCFullYear() % 100).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `OCRA-${yy}${mm}${dd}-${randomChars(4)}-${randomChars(4)}`;
}

export function isValidSerial(value: string): boolean {
  return SERIAL_PATTERN.test(value);
}
