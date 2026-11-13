import styles from './dashboard.module.css';
import type { GrowthSeries } from '@/features/dashboard/sample';

type Props = { title?: string; labels: string[]; series: GrowthSeries[]; max?: number };

// Plain SVG line chart. No charting library is needed for these simple lines.
export function GrowthChart({ title, labels, series, max = 100 }: Props) {
  const width = 320;
  const height = 130;
  const pad = 22;
  const stepX = (width - pad * 2) / Math.max(labels.length - 1, 1);
  const toY = (v: number) => height - pad - (Math.min(max, Math.max(0, v)) / max) * (height - pad * 2);

  return (
    <figure className={styles.chart}>
      {title && <figcaption className={styles.label}>{title}</figcaption>}
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title ?? 'Growth chart'} className={styles.chartSvg}>
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={pad} x2={width - pad} y1={toY(max * t)} y2={toY(max * t)} stroke="rgba(38,32,26,0.1)" />
        ))}
        {labels.map((label, i) => (
          <text
            key={label}
            x={pad + i * stepX}
            y={height - 4}
            fontSize="10"
            fill="#736a5f"
            textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}
          >
            {label}
          </text>
        ))}
        {series.map((s) => (
          <polyline
            key={s.name}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={s.values.map((v, i) => `${pad + i * stepX},${toY(v)}`).join(' ')}
          />
        ))}
      </svg>
      <ul className={styles.legend}>
        {series.map((s) => (
          <li key={s.name}>
            <span className={styles.swatch} style={{ background: s.color }} />
            {s.name}
          </li>
        ))}
      </ul>
    </figure>
  );
}
