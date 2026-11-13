import styles from './dashboard.module.css';
import { DashboardShell } from './DashboardShell';
import { ActionGrid } from './ActionGrid';
import { GrowthChart } from './GrowthChart';
import { DataTable } from './DataTable';
import { Descriptors, MentalStates, ProgressCell, PsychologicalRemark } from './Widgets';
import { PERSONAL_GROWTH, SAMPLE_BANNER, SAMPLE_STUDENTS, TERM_LABELS } from '@/features/dashboard/sample';

// Personal account. Opens straight onto the dashboard, with no profile form in front of it.
export function PersonalDashboard({ name = 'Mr. Lees' }: { name?: string }) {
  const you = SAMPLE_STUDENTS[0];

  return (
    <DashboardShell title="Personal dashboard">
      <section className={`${styles.glass} ${styles.hero}`} aria-label="Welcome">
        <div className={styles.logoCircle} aria-hidden="true">OCRA</div>
        <p className={styles.muted}>{name}</p>
        <div className={styles.heroSearch}>
          <input aria-label="Search your data" placeholder="Search your data" />
          <button type="button" className={styles.btn}>How to</button>
        </div>
      </section>

      <div className={styles.twoCol}>
        <section className={styles.glass} aria-labelledby="console">
          <p className={styles.label} id="console">Personal console · Data management</p>
          <ActionGrid
            actions={[
              { label: 'New data', tone: 'primary' },
              { label: 'Print data' },
              { label: 'About me' },
              { label: 'Download' },
              { label: 'Clear all', tone: 'danger' },
              { label: 'Favourite' },
              { label: 'Recover' },
              { label: 'Signature' },
            ]}
          />
        </section>

        <section className={styles.glass} aria-labelledby="growth">
          <p className={styles.label} id="growth">Your growth</p>
          <div className={styles.stats}>
            {PERSONAL_GROWTH.map((y) => (
              <GrowthChart key={y.year} title={String(y.year)} labels={TERM_LABELS} series={y.series} />
            ))}
          </div>
        </section>
      </div>

      <section className={styles.glass} aria-labelledby="news">
        <p className={styles.label} id="news">News and updates</p>
        <ActionGrid actions={[{ label: 'Notifications' }, { label: 'Data review' }, { label: 'View my profile', tone: 'primary' }]} />
      </section>

      <section className={styles.glass} aria-labelledby="panel">
        <p className={styles.label} id="panel">Data panel</p>
        <p className={styles.muted}>{SAMPLE_BANNER}</p>
        <DataTable
          headers={['Name', 'Academic system and level', 'Progress made', 'Mental state']}
          rows={[[
            you.name,
            `${you.system} · ${you.level}`,
            <ProgressCell key="p" value={you.progress} delta={you.progressDelta} />,
            <MentalStates key="m" mental={you.mental} />,
          ]]}
        />
      </section>

      <div className={styles.twoCol}>
        <section className={styles.glass} aria-label="Psychological remark">
          <PsychologicalRemark />
        </section>
        <section className={styles.glass} aria-label="Descriptors">
          <Descriptors excellent={12} trying={6} oops={1} />
        </section>
      </div>
    </DashboardShell>
  );
}
