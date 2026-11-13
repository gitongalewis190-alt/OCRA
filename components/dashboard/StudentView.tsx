import styles from './dashboard.module.css';
import { DashboardShell } from './DashboardShell';
import { ActionGrid } from './ActionGrid';
import { EDIT_HISTORY_SAMPLE, SAMPLE_BANNER, type SampleStudent } from '@/features/dashboard/sample';

const TERMS = ['Term 1', 'Term 2', 'Term 3', 'Compilation'];

const PERSONAL_FIELDS = ['Name', 'Age', 'Talent', 'Abilities', 'Vision ID', 'School'];
const ACADEMIC_FIELDS = ['Class', 'Academics', 'Scores', 'Data registered'];

// Student data view, opened from the View button on family and organisation dashboards.
export function StudentView({ student, backHref }: { student: SampleStudent; backHref: string }) {
  return (
    <DashboardShell title={`${student.name} · Student data`} backHref={backHref} backLabel="Back" showSearch={false}>
      <section className={`${styles.glass} ${styles.tint}`} aria-label="Year">
        <div className={styles.tabs}>
          <span className={styles.tab}>Year 2026 ▾</span>
          <span className={styles.muted}>{SAMPLE_BANNER}</span>
        </div>
      </section>

      <div className={styles.studentGrid}>
        <section className={`${styles.glass} ${styles.tint}`} aria-labelledby="transcript">
          <p className={styles.label} id="transcript">Transcript</p>
          <div className={styles.tabs} role="tablist" aria-label="Transcript terms">
            {TERMS.map((t, i) => (
              <span key={t} role="tab" aria-selected={i === 0} className={`${styles.tab} ${i === 0 ? styles.tabActive : ''}`}>{t}</span>
            ))}
          </div>
          <div className={styles.transcriptGrid} style={{ marginTop: '0.9rem' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.transcriptCell}>
                <div className={styles.placeholderBox}>Record {n}</div>
                <ActionGrid actions={[{ label: 'Download' }, { label: 'Print' }, { label: 'Recreate' }]} />
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.glass} ${styles.tint}`} aria-labelledby="personal">
          <p className={styles.heading} id="personal">{student.name}</p>
          <p className={styles.label}>Personal info</p>
          {PERSONAL_FIELDS.map((f) => (
            <div key={f} className={styles.fieldRow}>
              <span>{f}</span>
              <span>Not yet recorded <span className={styles.editMark}>Edit</span></span>
            </div>
          ))}
          <p className={styles.label} style={{ marginTop: '1rem' }}>Academic info</p>
          {ACADEMIC_FIELDS.map((f) => (
            <div key={f} className={styles.fieldRow}>
              <span>{f}</span>
              <span>{f === 'Academics' ? `${student.system} · ${student.level}` : 'Not yet recorded'} <span className={styles.editMark}>Edit</span></span>
            </div>
          ))}
          <div style={{ marginTop: '1rem' }}>
            <ActionGrid actions={[{ label: 'Edit', tone: 'primary' }, { label: 'Monitor' }]} />
          </div>
        </section>

        <section className={`${styles.glass} ${styles.tint}`} aria-labelledby="history">
          <p className={styles.label} id="history">Edit history</p>
          <div className={styles.historyStack}>
            {EDIT_HISTORY_SAMPLE.map((h, i) => (
              <div key={i} className={styles.historyItem}>
                <span>{h.time}</span>
                <span>{h.event}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.8rem' }}>
            <ActionGrid actions={[{ label: 'History' }]} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
