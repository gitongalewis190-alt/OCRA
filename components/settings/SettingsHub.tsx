import Link from 'next/link';
import styles from '@/components/dashboard/dashboard.module.css';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

// Settings home. Every settings page has a Back button to the dashboard or to this page.
export function SettingsHub() {
  return (
    <DashboardShell title="Settings" backHref="/dashboard/personal" backLabel="Back to dashboard" showSearch={false}>
      <section className={styles.glass} aria-labelledby="account-settings">
        <p className={styles.label} id="account-settings">Account</p>
        <div className={styles.btnGrid}>
          <Link href="/settings/delete" className={`${styles.btn} ${styles.btnDanger}`}>Delete account</Link>
        </div>
      </section>
    </DashboardShell>
  );
}
