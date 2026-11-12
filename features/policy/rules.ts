// Pure rules taken from the approved OCRA decisions. No database or network calls here,
// so each rule can be tested on its own and reused by server actions and jobs.

export const EDIT_REQUEST_EXPIRY_HOURS = 48;
export const GUEST_LINK_INACTIVITY_HOURS = 24;
export const DELETION_WINDOW_DAYS = 60;
export const LOCKOUT_FAILED_ATTEMPTS = 2;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** An edit request expires if no owner responds within 48 hours. */
export function editRequestExpiresAt(createdAt: Date): Date {
  return new Date(createdAt.getTime() + EDIT_REQUEST_EXPIRY_HOURS * HOUR_MS);
}

export function isEditRequestExpired(createdAt: Date, now: Date): boolean {
  return now.getTime() >= editRequestExpiresAt(createdAt).getTime();
}

/** A guest link stops working after 24 hours without activity. */
export function isGuestLinkExpired(lastActivityAt: Date, now: Date): boolean {
  return now.getTime() - lastActivityAt.getTime() >= GUEST_LINK_INACTIVITY_HOURS * HOUR_MS;
}

/** The date after which a soft-deleted account is removed for good (60 days). */
export function deletionFinalAt(deletedAt: Date): Date {
  return new Date(deletedAt.getTime() + DELETION_WINDOW_DAYS * DAY_MS);
}

export function canRestoreAccount(deletedAt: Date, now: Date): boolean {
  return now.getTime() < deletionFinalAt(deletedAt).getTime();
}

/** Two consecutive wrong passwords log the person out completely. */
export function shouldLockOut(failedAttempts: number): boolean {
  return failedAttempts >= LOCKOUT_FAILED_ATTEMPTS;
}

/** Sensitive requests need both owners when two are linked. A single owner is enough otherwise. */
export function requiredApprovals(linkedOwnerCount: number, sensitive: boolean): number {
  if (!sensitive) return 1;
  return linkedOwnerCount >= 2 ? 2 : 1;
}

export type DecisionState = 'approved' | 'pending' | 'declined';

/**
 * Works out where a request stands. A request is never approved by default:
 * any decline ends it, and approval needs the full number of owners.
 */
export function resolveDecision(
  approvals: string[],
  declines: string[],
  linkedOwnerCount: number,
  sensitive: boolean,
): DecisionState {
  if (declines.length > 0) return 'declined';
  const needed = requiredApprovals(linkedOwnerCount, sensitive);
  const unique = new Set(approvals).size;
  return unique >= needed ? 'approved' : 'pending';
}

export type NextTargetRecord = { subject: string; score: number; target: number; gap: number };

/**
 * Builds the next-target entry logged with each result. Scores and targets are whole numbers 0 to 100.
 * The gap is target minus score, and is 0 once the target is met.
 */
export function buildNextTarget(subject: string, score: number, target: number): NextTargetRecord {
  for (const [label, value] of [['score', score], ['target', target]] as const) {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      throw new RangeError(`${label} must be a whole number from 0 to 100`);
    }
  }
  if (!subject.trim()) throw new RangeError('subject is required');
  return { subject: subject.trim(), score, target, gap: Math.max(0, target - score) };
}

/** Critical events are never held. Routine events wait during quiet hours. */
export function shouldHoldNotification(
  severity: 'critical' | 'routine',
  localHour: number,
  quietStartHour: number,
  quietEndHour: number,
): boolean {
  if (severity === 'critical') return false;
  if (quietStartHour === quietEndHour) return false;
  return quietStartHour < quietEndHour
    ? localHour >= quietStartHour && localHour < quietEndHour
    : localHour >= quietStartHour || localHour < quietEndHour;
}
