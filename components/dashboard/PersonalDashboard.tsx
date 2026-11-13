import styles from './dashboard.module.css';
import { DashboardShell } from './DashboardShell';
import { ActionGrid } from './ActionGrid';
import { GrowthChart } from './GrowthChart';
import { DataTable } from './DataTable';
import { Descriptors, MentalStates, ProgressCell, PsychologicalRemark } from './Widgets';
import { PERSONAL_GROWTH, SAMPLE_BANNER, SAMPLE_STUDENTS, TERM_LABELS } from '@/features/dashboard/sample';

type Restore = { action: () => Promise<void> } | null;

// Personal account. Laid out as in the sketch: console and news on the left, hero and data panel in the
// middle, growth on the right. Phones and tablets stack the same blocks in a different order.
export function PersonalDashboard({ name = 'Lewis Gitonga', nickname = 'leez', restore = null }: { name?: string; nickname?: string; restore?: Restore }) {
  const you = SAMPLE_STUDENTS[0];
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('');

  return (
    <DashboardShell title="Mr. Lees.">
      <div className={styles.personal}>
        <section className={`${styles.glass} ${styles.hero} ${styles.aHero}`} aria-label="Welcome">
          <div className={styles.logoCircle} aria-hidden="true">OCRA</div>

          <div className={styles.identity}>
            <span className={styles.avatar} aria-hidden="true">{initials}</span>
            <span className={styles.identityName}>{name} · {nickname}</span>
          </div>

          <div className={styles.heroSearch}>
            <input aria-label="Search your data" placeholder="Search" />
            <button type="button" className={styles.btn}>How to</button>
          </div>

          {restore && (
            <div className={styles.restore}>
              <p className={styles.heading}>This account was deleted</p>
              <p className={styles.muted}>You can cancel the deletion within 60 days. Your data is kept as it was.</p>
              <form action={restore.action}>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Cancel deletion</button>
              </form>
            </div>
          )}
        </section>

        <section className={`${styles.glass} ${styles.aConsole}`} aria-labelledby="console">
          <p className={styles.label} id="console">Data management · Personal console</p>
          <ActionGrid
            columns={3}
            actions={[
              { label: 'New data', tone: 'primary' },
              { label: 'Print data' },
              { label: 'About me' },
              { label: 'Download' },
              { label: 'Clear all', tone: 'danger' },
              { label: '+ ♡' },
              { label: 'Recover' },
              { label: 'Signature', span: 2 },
            ]}
          />
        </section>

        <section className={`${styles.glass} ${styles.aNews}`} aria-labelledby="news">
          <p className={styles.label} id="news">News and updates</p>
          <ActionGrid
            columns={2}
            actions={[
              { label: 'Alerts' },
              { label: 'Data review' },
              { label: 'See my profile', tone: 'primary', span: 2 },
            ]}
          />
        </section>

        <section className={`${styles.glass} ${styles.aPanel}`} aria-labelledby="panel">
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

        <section className={`${styles.glass} ${styles.aGrowth}`} aria-labelledby="growth">
          <p className={styles.label} id="growth">Your growth</p>
          <div className={styles.growthStack}>
            {PERSONAL_GROWTH.map((y) => (
              <GrowthChart key={y.year} title={String(y.year)} labels={TERM_LABELS} series={y.series} />
            ))}
          </div>
        </section>

        <section className={`${styles.glass} ${styles.aRemark}`} aria-label="Psychological remark">
          <PsychologicalRemark />
        </section>

        <section className={`${styles.glass} ${styles.aDesc}`} aria-label="Descriptors">
          <Descriptors excellent={12} trying={6} oops={1} />
        </section>
      </div>
    </DashboardShell>
  );
}
