import styles from '@/components/dashboard/dashboard.module.css';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DeleteAccountForm } from '@/components/settings/DeleteAccountForm';

export default function DeleteAccountPage() {
  return (
    <DashboardShell title="Delete account" backHref="/settings" backLabel="Back to settings" showSearch={false}>
      <section className={styles.glass} aria-labelledby="delete-heading">
        <p className={styles.heading} id="delete-heading">Delete your account</p>
        <p className={styles.muted}>
          Your account is hidden straight away and kept for 60 days. You can restore it within that time by signing in
          and choosing Cancel deletion. After 60 days it is removed for good.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <DeleteAccountForm />
        </div>
      </section>
    </DashboardShell>
  );
}
