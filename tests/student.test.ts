import { describe, expect, it } from 'vitest';
import { validateStudentInput } from '../lib/validation/student';

const base = {
  fullName: 'Amina Wanjiru',
  dateOfBirth: '',
  motto: '',
  workingLanguage: 'en',
  documentLanguage: 'en',
  guardianName: '',
  guardianPhone: '',
};

describe('validateStudentInput', () => {
  it('accepts a minimal valid student', () => {
    expect(validateStudentInput(base).ok).toBe(true);
  });

  it('rejects a name that is too short', () => {
    expect(validateStudentInput({ ...base, fullName: 'A' }).ok).toBe(false);
  });

  it('rejects a date of birth in the future', () => {
    expect(validateStudentInput({ ...base, dateOfBirth: '2999-01-01' }).ok).toBe(false);
  });

  it('rejects an unsupported working language', () => {
    expect(validateStudentInput({ ...base, workingLanguage: 'fr' }).ok).toBe(false);
  });

  it('normalises a guardian phone number', () => {
    const result = validateStudentInput({ ...base, guardianPhone: '0712345678' });
    expect(result.ok && result.value.guardianPhone).toBe('254712345678');
  });

  it('rejects an invalid guardian phone number', () => {
    expect(validateStudentInput({ ...base, guardianPhone: '123' }).ok).toBe(false);
  });
});
