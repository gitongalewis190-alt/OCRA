'use client';

import { useState } from 'react';
import styles from './dashboard.module.css';

export type ActionItem = { label: string; tone?: 'primary' | 'danger' | 'green' };

// Buttons are in place. Their logic is designed and wired in the next build.
export function ActionGrid({ actions }: { actions: ActionItem[] }) {
  const [note, setNote] = useState<string | null>(null);

  return (
    <div>
      <div className={styles.btnGrid}>
        {actions.map((a) => {
          const tone = a.tone === 'primary' ? styles.btnPrimary : a.tone === 'danger' ? styles.btnDanger : a.tone === 'green' ? styles.btnGreen : '';
          return (
            <button
              key={a.label}
              type="button"
              className={`${styles.btn} ${tone}`}
              onClick={() => setNote(`${a.label} is wired in the next build.`)}
            >
              {a.label}
            </button>
          );
        })}
      </div>
      {note && <p role="status" className={styles.notice}>{note}</p>}
    </div>
  );
}
