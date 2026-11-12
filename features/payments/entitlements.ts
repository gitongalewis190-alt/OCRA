import type { SupabaseClient } from '@supabase/supabase-js';

/** True when the profile (and, if given, the student) has an unexpired entitlement for this purpose. */
export async function hasActiveEntitlement(
  supabase: SupabaseClient,
  profileId: string,
  purpose: string,
  studentId?: string
): Promise<boolean> {
  let query = supabase
    .from('entitlements')
    .select('id')
    .eq('profile_id', profileId)
    .eq('purpose', purpose)
    .gt('expires_at', new Date().toISOString())
    .limit(1);

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  const { data } = await query;
  return (data?.length ?? 0) > 0;
}
