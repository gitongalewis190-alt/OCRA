'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './dashboard.module.css';

type Props = { title: string; backHref?: string; backLabel?: string; showSearch?: boolean };

// Top bar shared by every dashboard. Dark mode and auto guide are switches; search is wired next build.
export function Topbar({ title, backHref, backLabel = 'Back', showSearch = true }: Props) {
  const [dark, setDark] = useState(false);
  const [guide, setGuide] = useState(false);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
  }

  return (
    <header className={`${styles.topbar} ${styles.glass}`}>
      <div className={styles.topLeft}>
        {backHref ? (
          <Link href={backHref} className={styles.btn}>{backLabel}</Link>
        ) : (
          <button type="button" className={styles.iconBtn} aria-label="Open menu">☰</button>
        )}
        <span className={styles.wordmark}>OCRA</span>
        <span className={styles.topTitle}>{title}</span>
      </div>

      {showSearch && (
        <div className={styles.topSearch}>
          <input aria-label="Search students and data" placeholder="Search students or data" />
          <button type="button" className={styles.btn}>Search</button>
        </div>
      )}

      <div className={styles.topRight}>
        <span className={styles.muted}>Dark</span>
        <button type="button" className={styles.toggle} aria-pressed={dark} aria-label="Dark mode" onClick={toggleDark} />
        <span className={styles.muted}>Auto guide</span>
        <button type="button" className={styles.toggle} aria-pressed={guide} aria-label="Auto guide" onClick={() => setGuide(!guide)} />
        <button type="button" className={styles.btn}>Settings</button>
      </div>
    </header>
  );
}
