// Sample data for laying out the dashboards only. It is not real and is not stored.
// The live data source replaces these values once the database is connected.
import type { Trend } from './format';

export const SAMPLE_BANNER =
  'Sample data for layout only. Live records replace this once the database is connected.';

export type Mental = { reasoning: number; memory: number; development: number; stress: number };

export type SampleStudent = {
  id: string;
  name: string;
  gender: 'male' | 'female';
  system: string;
  level: string;
  progress: number;
  progressDelta: number;
  match: string;
  matchPercent: number;
  mental: Mental;
};

export const SAMPLE_STUDENTS: SampleStudent[] = [
  { id: 'student-a', name: 'Student A', gender: 'female', system: 'CBE', level: 'Grade 9', progress: 80, progressDelta: 20, match: 'University', matchPercent: 60, mental: { reasoning: 71, memory: 18, development: 60, stress: 40 } },
  { id: 'student-b', name: 'Student B', gender: 'male', system: '8-4-4', level: 'Form 4', progress: 10, progressDelta: -5, match: 'University', matchPercent: 60, mental: { reasoning: 50, memory: 40, development: 55, stress: 60 } },
  { id: 'student-c', name: 'Student C', gender: 'female', system: 'CBE', level: 'Grade 10', progress: 18, progressDelta: -30, match: 'TVET', matchPercent: 85, mental: { reasoning: 55, memory: 50, development: 50, stress: 50 } },
  { id: 'student-d', name: 'Student D', gender: 'male', system: '8-4-4', level: 'Form 3', progress: 80, progressDelta: 30, match: 'TVET', matchPercent: 85, mental: { reasoning: 70, memory: 70, development: 60, stress: 30 } },
  { id: 'student-e', name: 'Student E', gender: 'female', system: 'CBE', level: 'Grade 6', progress: 10, progressDelta: -15, match: 'University', matchPercent: 90, mental: { reasoning: 40, memory: 30, development: 40, stress: 70 } },
  { id: 'student-f', name: 'Student F', gender: 'male', system: 'CBE', level: 'Grade 7', progress: 18, progressDelta: -30, match: 'University', matchPercent: 80, mental: { reasoning: 45, memory: 40, development: 50, stress: 60 } },
  { id: 'student-g', name: 'Student G', gender: 'female', system: 'KCSE', level: 'L-2', progress: 100, progressDelta: 50, match: 'University', matchPercent: 95, mental: { reasoning: 95, memory: 90, development: 85, stress: 15 } },
];

export type GrowthSeries = { name: string; color: string; values: number[] };
export type GrowthYear = { year: number; series: GrowthSeries[] };

export const TERM_LABELS = ['Term 1', 'Term 2', 'Term 3'];

export const PERSONAL_GROWTH: GrowthYear[] = [
  { year: 2026, series: [
    { name: 'Opener', color: '#26201a', values: [30, 48, 62] },
    { name: 'Mid term', color: '#2f6fd6', values: [45, 70, 82] },
    { name: 'End of term', color: '#d63b5b', values: [35, 52, 66] },
  ] },
  { year: 2025, series: [
    { name: 'Opener', color: '#26201a', values: [20, 35, 44] },
    { name: 'Mid term', color: '#2f6fd6', values: [30, 42, 58] },
    { name: 'End of term', color: '#d63b5b', values: [25, 38, 50] },
  ] },
  { year: 2024, series: [
    { name: 'Opener', color: '#26201a', values: [15, 22, 30] },
    { name: 'Mid term', color: '#2f6fd6', values: [20, 33, 40] },
    { name: 'End of term', color: '#d63b5b', values: [18, 28, 36] },
  ] },
];

export const FAMILY_GROWTH_2026: GrowthSeries[] = [
  { name: 'Student A', color: '#2f6fd6', values: [40, 62, 80] },
  { name: 'Student B', color: '#d63b5b', values: [30, 42, 48] },
  { name: 'Student C', color: '#1f7a4d', values: [20, 35, 44] },
];

export const EDIT_HISTORY_SAMPLE = [
  { time: '11:59 AM', event: 'Name changed' },
  { time: '11:58 AM', event: 'Score updated' },
  { time: '11:58 AM', event: 'Name changed' },
  { time: '12:09 PM', event: 'Name changed' },
  { time: '11:08 AM', event: 'Score updated' },
];

export function trendOf(delta: number): Trend {
  return delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
}
