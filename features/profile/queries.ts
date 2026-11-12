import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from './types';

export async function getProfile(supabase: SupabaseClient, userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, account_type, role, phone, country, locale, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('Your profile could not be loaded.');
  }
  return data as Profile;
}
