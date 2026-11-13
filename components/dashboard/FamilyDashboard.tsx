import styles from './dashboard.module.css';
import { DashboardShell } from './DashboardShell';
import { ActionGrid } from './ActionGrid';
import { GrowthChart } from './GrowthChart';
import { DataTable } from './DataTable';
import { Descriptors, MentalStates, ProgressCell, ViewLink } from './Widgets';
import { FAMILY_GROWTH_2026, SAMPLE_BANNER, SAMPLE_STUDENTS, TERM_LABELS } from '@/features/dashboard/sample';

// Family account. The console on the left, the data panel and growth on the right.
export function FamilyDashboard() {
  const males = SAMPLE_STUDENTS.filter((s) => s.gender === 'male').length;
  const females = SAMPLE_STUDENTS.filter((s) => s.gender === 'female').length;

  return (
    <DashboardShell title="Family dashboard">
      <div className={styles.layout}>
        <aside className={`${styles.glass} ${styles.sidebar}`} aria-label="Family console">
          <p className={styles.label}>Family console</p>
          <p className={styles.label}>Data management</p>
          <ActionGrid actions={[{ label: 'New data', tone: 'primary' }, { label: 'New member' }, { label: 'New dept.' }, { label: 'Print data' }, { label: 'Clear data', tone: 'danger' }]} />
          <p className={styles.label} style={{ marginTop: '1rem' }}>System</p>
          <ActionGrid actions={[{ label: 'System restart' }, { label: 'Backup' }]} />
          <p className={styles.label} style={{ marginTop: '1rem' }}>News and updates</p>
          <ActionGrid actions={[{ label: 'Family advice' }, { label: 'Data review' }]} />
        </aside>

        <div style={{ display: 'grid', gap: '1rem', minWidth: 0 }}>
          <section className={styles.glass} aria-label="Family totals">
            <div className={styles.stats}>
              <div className={styles.stat}><span className={styles.label}>Male</span><span className={styles.statValue}>{males}</span></div>
              <div className={styles.stat}><span className={styles.label}>Female</span><span className={styles.statValue}>{females}</span></div>
              <div className={styles.stat}><span className={styles.label}>Total</span><span className={styles.statValue}>{SAMPLE_STUDENTS.length}</span></div>
            </div>
          </section>

          <section className={styles.glass} aria-labelledby="family-panel">
            <p className={styles.label} id="family-panel">Data panel</p>
            <p className={styles.muted}>{SAMPLE_BANNER}</p>
            <DataTable
              headers={['Student name', 'System and level', 'Progress made', 'University or TVET match', 'Mental states', 'Action']}
              rows={SAMPLE_STUDENTS.slice(0, 4).map((s) => [
                s.name,
                `${s.system} · ${s.level}`,
                <ProgressCell key={`p-${s.id}`} value={s.progress} delta={s.progressDelta} />,
                `${s.match} ${s.matchPercent}%`,
                <MentalStates key={`m-${s.id}`} mental={s.mental} />,
                <ViewLink key={`v-${s.id}`} id={s.id} />,
              ])}
            />
            <div style={{ marginTop: '0.8rem' }}>
              <ActionGrid actions={[{ label: 'View all' }]} />
            </div>
          </section>

          <section className={styles.glass} aria-labelledby="family-growth">
            <p className={styles.label} id="family-growth">Growth rate · 2026</p>
            <GrowthChart labels={TERM_LABELS} series={FAMILY_GROWTH_2026} />
          </section>

          <section className={styles.glass} aria-label="Descriptors">
            <Descriptors excellent={5} trying={2} oops={0} />
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
