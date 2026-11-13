// Rules for deleting an account. Pure functions only, so they can be tested without a database.

/** Cookie that counts wrong password attempts during deletion. */
export const STRIKE_COOKIE = 'ocra_delete_strikes';

export const DELETION_REASONS = [
  { id: 'not-needed', label: 'I no longer need OCRA' },
  { id: 'privacy', label: 'Privacy concerns' },
  { id: 'switching', label: 'Moving to another service' },
  { id: 'cost', label: 'Cost' },
  { id: 'technical', label: 'Technical problems' },
  { id: 'other', label: 'Something else' },
] as const;

export type DeletionReasonId = (typeof DELETION_REASONS)[number]['id'];

export type ReasonCheck =
  | { ok: true; reasonId: DeletionReasonId; note: string }
  | { ok: false; error: string };

/**
 * Checks the chosen reason and the optional note.
 * "Something else" needs at least 5 characters of explanation. Notes are capped at 500 characters.
 */
export function validateDeletionReason(reasonId: string, note: string): ReasonCheck {
  const option = DELETION_REASONS.find((r) => r.id === reasonId);
  if (!option) return { ok: false, error: 'Choose a reason for deleting your account.' };

  const trimmed = note.trim();
  if (trimmed.length > 500) return { ok: false, error: 'Keep your note under 500 characters.' };
  if (option.id === 'other' && trimmed.length < 5) {
    return { ok: false, error: 'Tell us a little more about your reason.' };
  }
  return { ok: true, reasonId: option.id, note: trimmed };
}
