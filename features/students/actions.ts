'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { validateStudentInput } from '@/lib/validation/student';

export type StudentState = { error?: string; saved?: boolean };

function fields(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') result[key] = value;
  }
  return result;
}

/** Adds a student to a family (scope "family") or an organisation (scope "organisation"). */
export async function createStudent(_prev: StudentState, formData: FormData): Promise<StudentState> {
  const { supabase, user } = await requireUser();
  const input = fields(formData);

  const scope = input.scope;
  const scopeId = input.scopeId;
  if (!scopeId || (scope !== 'family' && scope !== 'organisation')) {
    return { error: 'Choose where this student belongs.' };
  }

  const result = validateStudentInput(input);
  if (!result.ok) {
    return { error: result.error };
  }
  const v = result.value;

  // Row-level security checks that the user owns the family or belongs to the organisation.
  const { error } = await supabase.from('students').insert({
    full_name: v.fullName,
    date_of_birth: v.dateOfBirth,
    motto: v.motto,
    working_language: v.workingLanguage,
    document_language: v.documentLanguage,
    guardian_name: v.guardianName,
    guardian_phone: v.guardianPhone,
    family_id: scope === 'family' ? scopeId : null,
    organisation_id: scope === 'organisation' ? scopeId : null,
    created_by: user.id,
  });

  if (error) {
    if (error.message.includes('up to 5 children')) {
      return { error: 'A family account can hold up to 5 children.' };
    }
    return { error: 'The student could not be saved.' };
  }

  revalidatePath('/');
  return { saved: true };
}
