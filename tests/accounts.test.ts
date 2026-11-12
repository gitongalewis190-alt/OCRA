import { describe, expect, it } from 'vitest';
import { ACCOUNT_CHOICES } from '../features/accounts/choices';

describe('account chooser', () => {
  it('offers the four account types, each with its own dashboard route', () => {
    expect(ACCOUNT_CHOICES.map((c) => c.type).sort()).toEqual(['developer', 'family', 'organization', 'personal']);
    for (const choice of ACCOUNT_CHOICES) {
      expect(choice.href).toBe(`/dashboard/${choice.type}`);
    }
  });
});
