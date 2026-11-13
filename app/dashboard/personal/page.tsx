import { PersonalDashboard } from '@/components/dashboard/PersonalDashboard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canRestoreAccount } from '@/features/policy/rules';
import { cancelDeletion } from '@/app/settings/actions';

// Opens straight onto the personal dashboard. Shows a restore notice only when the signed-in account
// was deleted and is still inside the 60-day window.
export default async function PersonalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let restore: { action: () => Promise<void> } | null = null;
  if (user) {
    const admin = createAdminClient();
    const { data } = await admin.from('profiles').select('deleted_at').eq('id', user.id).maybeSingle();
    if (data?.deleted_at && canRestoreAccount(new Date(data.deleted_at), new Date())) {
      restore = { action: cancelDeletion };
    }
  }

  return <PersonalDashboard restore={restore} />;
}
