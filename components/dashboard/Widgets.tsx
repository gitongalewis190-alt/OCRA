import Link from 'next/link';
import styles from './dashboard.module.css';
import { isHighStress, trendFromDelta, trendSymbol } from '@/features/dashboard/format';
import type { Mental } from '@/features/dashboard/sample';

export function ProgressCell({ value, delta }: { value: number; delta: number }) {
  const trend = trendFromDelta(delta);
  const cls = trend === 'up' ? styles.up : trend === 'down' ? styles.down : styles.flat;
  return (
    <span>
      {value}% <span className={cls}>{trendSymbol(trend)} {Math.abs(delta)}</span>
    </span>
  );
}

export function MentalStates({ mental }: { mental: Mental }) {
  return (
    <div className={styles.mental}>
      <span><em>Reasoning</em> {mental.reasoning}</span>
      <span><em>Memory</em> {mental.memory}</span>
      <span><em>Development</em> {mental.development}</span>
      <span className={isHighStress(mental.stress) ? styles.high : undefined}>
        <em>Stress</em> {mental.stress}
      </span>
    </div>
  );
}

export function ViewLink({ id }: { id: string }) {
  return (
    <Link href={`/dashboard/student/${id}`} className={styles.btn} aria-label="View student data">
      View
    </Link>
  );
}

export function Descriptors({ excellent, trying, oops }: { excellent: number; trying: number; oops: number }) {
  return (
    <div>
      <p className={styles.label}>Descriptors</p>
      <div className={styles.dotRow}>
        <span><span className={styles.swatch} style={{ background: '#2f6fd6' }} /> Excellent {excellent}</span>
        <span><span className={styles.swatch} style={{ background: '#8a8a8a' }} /> Trying {trying}</span>
        <span><span className={styles.swatch} style={{ background: '#d63b5b' }} /> Oops {oops}</span>
      </div>
    </div>
  );
}

export function PsychologicalRemark() {
  return (
    <div>
      <p className={styles.label}>Psychological remark</p>
      <p className={styles.remark}>The remark appears here once the analysis for this record is complete.</p>
    </div>
  );
}
