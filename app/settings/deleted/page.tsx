import styles from '@/components/dashboard/dashboard.module.css';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function AccountDeletedPage() {
  return (
    <DashboardShell title="Account deleted" backHref="/" backLabel="Back to start" showSearch={false}>
      <section className={styles.glass} aria-labelledby="deleted-heading">
        <p className={styles.heading} id="deleted-heading">Your account has been deleted</p>
        <p className={styles.muted}>
          You have 60 days to restore it. Sign in and choose Cancel deletion on your dashboard. After 60 days the account
          is removed permanently.
        </p>
      </section>
    </DashboardShell>
  );
}
