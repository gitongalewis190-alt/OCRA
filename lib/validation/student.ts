import { normaliseKenyanPhone } from './phone';

export const WORKING_LANGUAGES = ['en', 'sw'] as const;

export type StudentInput = {
  fullName: string;
  dateOfBirth: string | null;
  motto: string | null;
  workingLanguage: string;
  documentLanguage: string;
  guardianName: string | null;
  guardianPhone: string | null;
};

export type StudentValidation = { ok: true; value: StudentInput } | { ok: false; error: string };

export function validateStudentInput(raw: Record<string, string>): StudentValidation {
  const fullName = (raw.fullName ?? '').trim();
  if (fullName.length < 2 || fullName.length > 120) {
    return { ok: false, error: 'Student name must be 2 to 120 characters.' };
  }

  const dob = (raw.dateOfBirth ?? '').trim();
  if (dob) {
    const date = new Date(dob);
    const now = new Date();
    if (Number.isNaN(date.getTime()) || date > now) {
      return { ok: false, error: 'Enter a valid date of birth.' };
    }
  }

  const motto = (raw.motto ?? '').trim();
  if (motto.length > 280) {
    return { ok: false, error: 'The motto must be 280 characters or fewer.' };
  }

  if (!(WORKING_LANGUAGES as readonly string[]).includes(raw.workingLanguage)) {
    return { ok: false, error: 'Choose a working language.' };
  }
  if (!(WORKING_LANGUAGES as readonly string[]).includes(raw.documentLanguage)) {
    return { ok: false, error: 'Choose a document language.' };
  }

  let guardianPhone: string | null = null;
  const phoneInput = (raw.guardianPhone ?? '').trim();
  if (phoneInput) {
    guardianPhone = normaliseKenyanPhone(phoneInput);
    if (!guardianPhone) {
      return { ok: false, error: 'Enter a valid guardian phone number.' };
    }
  }

  const guardianName = (raw.guardianName ?? '').trim();

  return {
    ok: true,
    value: {
      fullName,
      dateOfBirth: dob || null,
      motto: motto || null,
      workingLanguage: raw.workingLanguage,
      documentLanguage: raw.documentLanguage,
      guardianName: guardianName || null,
      guardianPhone,
    },
  };
}
