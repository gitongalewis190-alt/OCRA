'use client';

import { useState } from 'react';
import styles from './dashboard.module.css';

export type ActionItem = { label: string; tone?: 'primary' | 'danger' | 'green'; span?: 2 };

// Buttons are in place. Their logic is designed and wired in the next build.
export function ActionGrid({ actions, columns }: { actions: ActionItem[]; columns?: number }) {
  const [note, setNote] = useState<string | null>(null);

  return (
    <div>
      <div
        className={styles.btnGrid}
        style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
      >
        {actions.map((a) => {
          const tone = a.tone === 'primary' ? styles.btnPrimary : a.tone === 'danger' ? styles.btnDanger : a.tone === 'green' ? styles.btnGreen : '';
          return (
            <button
              key={a.label}
              type="button"
              className={`${styles.btn} ${tone}`}
              style={a.span ? { gridColumn: `span ${a.span}` } : undefined}
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
