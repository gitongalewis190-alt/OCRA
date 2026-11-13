import styles from './dashboard.module.css';
import { DashboardShell } from './DashboardShell';
import { ActionGrid } from './ActionGrid';
import { GrowthChart } from './GrowthChart';
import { DataTable } from './DataTable';
import { MentalStates, ProgressCell, ViewLink } from './Widgets';
import { FAMILY_GROWTH_2026, SAMPLE_BANNER, SAMPLE_STUDENTS, TERM_LABELS } from '@/features/dashboard/sample';

// Organisation account. Same dashboard logic as family, with the professional panels and a side menu.
export function OrganisationDashboard() {
  const improving = SAMPLE_STUDENTS.filter((s) => s.progressDelta > 0).length;
  const struggling = SAMPLE_STUDENTS.filter((s) => s.progressDelta < 0).length;
  const average = Math.round(SAMPLE_STUDENTS.reduce((sum, s) => sum + s.progress, 0) / SAMPLE_STUDENTS.length);

  return (
    <DashboardShell title="Organisation dashboard">
      <div className={styles.layout}>
        <aside className={`${styles.glass} ${styles.sidebar}`} aria-label="Organisation menu">
          <nav aria-label="Sections">
            <a href="#overview" aria-current="page">Dashboard</a>
            <a href="#students">Students</a>
            <a href="#performance">Performance</a>
            <a href="#reports">Reports</a>
            <a href="#data">Data management</a>
            <a href="#advice">Operational advice</a>
            <a href="#news">News and updates</a>
          </nav>
        </aside>

        <div style={{ display: 'grid', gap: '1rem', minWidth: 0 }}>
          <div className={styles.stats} id="overview">
            <section className={styles.glass} aria-label="Data review"><p className={styles.label}>Data review</p><p className={styles.muted}>Review and validate student data for accuracy.</p></section>
            <section className={styles.glass} aria-label="Operational advice" id="advice"><p className={styles.label}>Operational advice</p><p className={styles.muted}>AI-guided insights to improve performance.</p></section>
            <section className={styles.glass} aria-label="News" id="news"><p className={styles.label}>News and updates</p><p className={styles.muted}>Important alerts and announcements.</p></section>
          </div>

          <section className={styles.glass} aria-labelledby="data" id="data">
            <p className={styles.label} id="data">Data management</p>
            <ActionGrid actions={[{ label: 'New data', tone: 'primary' }, { label: 'Edit data' }, { label: 'Delete data', tone: 'danger' }, { label: 'View data' }, { label: 'Sync data' }, { label: 'Export data' }, { label: 'Backup data' }]} />
          </section>

          <section className={styles.glass} aria-labelledby="students" id="students">
            <p className={styles.label} id="students">Students performance overview</p>
            <p className={styles.muted}>{SAMPLE_BANNER}</p>
            <DataTable
              headers={['#', 'Student name', 'Grade and system', 'Progress', 'Mental state', 'Action']}
              rows={SAMPLE_STUDENTS.map((s, i) => [
                i + 1,
                s.name,
                `${s.system} · ${s.level}`,
                <ProgressCell key={`p-${s.id}`} value={s.progress} delta={s.progressDelta} />,
                <MentalStates key={`m-${s.id}`} mental={s.mental} />,
                <ViewLink key={`v-${s.id}`} id={s.id} />,
              ])}
            />
          </section>

          <section className={styles.glass} aria-labelledby="performance" id="performance">
            <p className={styles.label} id="performance">Performance analytics</p>
            <div className={styles.stats}>
              <div className={styles.stat}><span className={styles.statValue}>{average}%</span><span className={styles.muted}>Average progress</span></div>
              <div className={styles.stat}><span className={styles.statValue}>{improving}</span><span className={styles.muted}>Students improving</span></div>
              <div className={styles.stat}><span className={styles.statValue}>{struggling}</span><span className={styles.muted}>Students struggling</span></div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <GrowthChart labels={TERM_LABELS} series={FAMILY_GROWTH_2026} />
            </div>
          </section>

          <section className={styles.glass} aria-labelledby="reports" id="reports">
            <p className={styles.label} id="reports">Reports and quick actions</p>
            <ActionGrid actions={[{ label: 'Create report' }, { label: 'Restore' }, { label: 'System status' }]} />
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
