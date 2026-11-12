import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AccountSummary } from '@/components/dashboard/AccountSummary';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import type { Profile } from '@/features/profile/types';

// Shown while sign-in is disabled. No account is created and no session is required.
const previewProfile: Profile = {
  id: 'preview',
  email: 'you@ocra.app',
  full_name: 'Guest',
  account_type: 'personal',
  role: 'user',
  phone: null,
  country: 'KE',
  locale: 'en',
  created_at: '2026-11-12T00:00:00.000Z',
};

export default function PersonalDashboardPage() {
  return (
    <DashboardShell title="Personal dashboard">
      <AccountSummary profile={previewProfile} />
      <ProfileForm profile={previewProfile} />
    </DashboardShell>
  );
}
