import type { AccountType, Profile } from '@/features/profile/types';

const TYPE_LABELS: Record<AccountType, string> = {
  personal: 'Personal',
  family: 'Family',
  organization: 'Organisation',
  developer: 'Developer',
};

export function AccountSummary({ profile }: { profile: Profile }) {
  const joined = new Date(profile.created_at).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="glass panel" aria-labelledby="account-heading">
      <p className="eyebrow">{TYPE_LABELS[profile.account_type]} account</p>
      <h2 id="account-heading">Welcome, {profile.full_name}</h2>
      <div className="account-grid">
        <div className="row">
          <span>Email</span>
          <span>{profile.email}</span>
        </div>
        <div className="row">
          <span>Account type</span>
          <span>{TYPE_LABELS[profile.account_type]}</span>
        </div>
        <div className="row">
          <span>Member since</span>
          <span>{joined}</span>
        </div>
      </div>
    </section>
  );
}
