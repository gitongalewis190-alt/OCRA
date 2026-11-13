import { describe, expect, it } from 'vitest';
import { DELETION_REASONS, STRIKE_COOKIE, validateDeletionReason } from '../features/account/deletion';

describe('account deletion reasons', () => {
  it('rejects a missing or unknown reason', () => {
    expect(validateDeletionReason('', '').ok).toBe(false);
    expect(validateDeletionReason('made-up', '').ok).toBe(false);
  });

  it('accepts every listed reason without a note', () => {
    for (const r of DELETION_REASONS) {
      if (r.id === 'other') continue;
      const result = validateDeletionReason(r.id, '');
      expect(result.ok).toBe(true);
    }
  });

  it('asks for a real explanation when the reason is something else', () => {
    expect(validateDeletionReason('other', 'abc').ok).toBe(false);
    const ok = validateDeletionReason('other', '  moving abroad  ');
    expect(ok).toEqual({ ok: true, reasonId: 'other', note: 'moving abroad' });
  });

  it('caps the note at 500 characters', () => {
    expect(validateDeletionReason('cost', 'x'.repeat(501)).ok).toBe(false);
    expect(validateDeletionReason('cost', 'x'.repeat(500)).ok).toBe(true);
  });

  it('names the wrong-password cookie consistently', () => {
    expect(STRIKE_COOKIE).toBe('ocra_delete_strikes');
  });
});
