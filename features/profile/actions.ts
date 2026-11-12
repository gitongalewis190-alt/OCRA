'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { validateProfileInput } from '@/lib/validation/profile';

export type ProfileState = { error?: string; saved?: boolean };

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const { supabase, user } = await requireUser();

  const result = validateProfileInput({
    fullName: text(formData, 'fullName'),
    phone: text(formData, 'phone'),
    country: text(formData, 'country'),
    locale: text(formData, 'locale'),
  });
  if (!result.ok) {
    return { error: result.error };
  }

  // Column grants on the database allow only these four fields. Type and role cannot be written here.
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: result.value.fullName,
      phone: result.value.phone,
      country: result.value.country,
      locale: result.value.locale,
    })
    .eq('id', user.id);

  if (error) {
    return { error: 'Your changes could not be saved. Try again.' };
  }

  revalidatePath('/');
  return { saved: true };
}
