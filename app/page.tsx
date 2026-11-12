import { requireUser } from '@/lib/auth/session';
import { getProfile } from '@/features/profile/queries';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AccountSummary } from '@/components/dashboard/AccountSummary';
import { ProfileForm } from '@/components/dashboard/ProfileForm';

export default async function PersonalDashboardPage() {
  const { supabase, user } = await requireUser();
  const profile = await getProfile(supabase, user.id);

  return (
    <DashboardShell>
      <AccountSummary profile={profile} />
      <ProfileForm profile={profile} />
    </DashboardShell>
  );
}
