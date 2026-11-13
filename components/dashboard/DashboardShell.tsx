import type { ReactNode } from 'react';
import { Topbar } from './Topbar';
import styles from './dashboard.module.css';

type Props = { title: string; backHref?: string; backLabel?: string; showSearch?: boolean; children: ReactNode };

// Every dashboard shares this frame: a full-screen backdrop, the glass top bar, then the content.
export function DashboardShell({ title, backHref, backLabel, showSearch, children }: Props) {
  return (
    <>
      <div className={styles.backdrop} aria-hidden="true" />
      <main className={styles.page}>
        <Topbar title={title} backHref={backHref} backLabel={backLabel} showSearch={showSearch} />
        {children}
      </main>
    </>
  );
}
