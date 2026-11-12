import { describe, expect, it } from 'vitest';
import { passwordProblems } from '../lib/validation/password';

describe('passwordProblems', () => {
  it('accepts a password that meets every rule', () => {
    expect(passwordProblems('Ocra-2026!')).toEqual([]);
  });

  it('rejects passwords shorter than 9 characters', () => {
    expect(passwordProblems('Ab1!xyz')).toContain('at least 9 characters');
  });

  it('requires a capital letter', () => {
    expect(passwordProblems('ocra-2026!')).toEqual(['one capital letter']);
  });

  it('requires a number', () => {
    expect(passwordProblems('Ocra-test!')).toEqual(['one number']);
  });

  it('requires a symbol', () => {
    expect(passwordProblems('Ocra2026abc')).toEqual(['one symbol']);
  });

  it('reports every failing rule at once', () => {
    expect(passwordProblems('abc')).toEqual([
      'at least 9 characters',
      'one capital letter',
      'one number',
      'one symbol',
    ]);
  });
});
