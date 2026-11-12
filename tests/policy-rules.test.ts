import { describe, expect, it } from 'vitest';
import {
  buildNextTarget,
  canRestoreAccount,
  deletionFinalAt,
  isEditRequestExpired,
  isGuestLinkExpired,
  requiredApprovals,
  resolveDecision,
  shouldHoldNotification,
  shouldLockOut,
} from '../features/policy/rules';

const H = 60 * 60 * 1000;
const D = 24 * H;

describe('expiry windows', () => {
  it('expires an unanswered edit request after 48 hours', () => {
    const created = new Date('2026-11-01T10:00:00Z');
    expect(isEditRequestExpired(created, new Date(created.getTime() + 47 * H))).toBe(false);
    expect(isEditRequestExpired(created, new Date(created.getTime() + 48 * H))).toBe(true);
  });

  it('stops a guest link after 24 hours of inactivity', () => {
    const last = new Date('2026-11-01T10:00:00Z');
    expect(isGuestLinkExpired(last, new Date(last.getTime() + 23 * H))).toBe(false);
    expect(isGuestLinkExpired(last, new Date(last.getTime() + 24 * H))).toBe(true);
  });

  it('keeps a deleted account restorable for exactly 60 days', () => {
    const deleted = new Date('2026-11-01T00:00:00Z');
    expect(deletionFinalAt(deleted).getTime() - deleted.getTime()).toBe(60 * D);
    expect(canRestoreAccount(deleted, new Date(deleted.getTime() + 59 * D))).toBe(true);
    expect(canRestoreAccount(deleted, new Date(deleted.getTime() + 60 * D))).toBe(false);
  });
});

describe('lockout', () => {
  it('locks out after two wrong passwords, not before', () => {
    expect(shouldLockOut(1)).toBe(false);
    expect(shouldLockOut(2)).toBe(true);
  });
});

describe('two-owner approval', () => {
  it('needs both owners for a sensitive request when two are linked', () => {
    expect(requiredApprovals(2, true)).toBe(2);
    expect(requiredApprovals(1, true)).toBe(1);
    expect(requiredApprovals(2, false)).toBe(1);
  });

  it('never approves by default, and any decline ends the request', () => {
    expect(resolveDecision(['a'], [], 2, true)).toBe('pending');
    expect(resolveDecision(['a', 'b'], [], 2, true)).toBe('approved');
    expect(resolveDecision(['a'], ['b'], 2, true)).toBe('declined');
    expect(resolveDecision([], [], 1, false)).toBe('pending');
  });

  it('counts the same owner only once', () => {
    expect(resolveDecision(['a', 'a'], [], 2, true)).toBe('pending');
  });
});

describe('next target logging', () => {
  it('logs the score, target and gap as whole numbers', () => {
    expect(buildNextTarget(' Mathematics ', 50, 65)).toEqual({ subject: 'Mathematics', score: 50, target: 65, gap: 15 });
  });

  it('sets the gap to zero once the target is met', () => {
    expect(buildNextTarget('English', 80, 70).gap).toBe(0);
  });

  it('rejects scores outside 0 to 100, fractions and blank subjects', () => {
    expect(() => buildNextTarget('Math', 101, 90)).toThrow(RangeError);
    expect(() => buildNextTarget('Math', 50.5, 60)).toThrow(RangeError);
    expect(() => buildNextTarget('  ', 50, 60)).toThrow(RangeError);
  });
});

describe('quiet hours', () => {
  it('holds routine notifications overnight but never critical ones', () => {
    expect(shouldHoldNotification('routine', 23, 22, 7)).toBe(true);
    expect(shouldHoldNotification('routine', 3, 22, 7)).toBe(true);
    expect(shouldHoldNotification('routine', 12, 22, 7)).toBe(false);
    expect(shouldHoldNotification('critical', 3, 22, 7)).toBe(false);
  });
});
