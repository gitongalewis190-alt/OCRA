import type { SupabaseClient } from '@supabase/supabase-js';
import type { StudentSummary } from './types';

/** Students the signed-in user can see. Row-level security decides which ones. */
export async function listStudents(supabase: SupabaseClient): Promise<StudentSummary[]> {
  const { data, error } = await supabase
    .from('students')
    .select('id, full_name, family_id, organisation_id, working_language, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Students could not be loaded.');
  }
  return (data ?? []) as StudentSummary[];
}
