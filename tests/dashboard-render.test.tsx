import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PersonalDashboard } from '../components/dashboard/PersonalDashboard';
import { FamilyDashboard } from '../components/dashboard/FamilyDashboard';
import { OrganisationDashboard } from '../components/dashboard/OrganisationDashboard';
import { StudentView } from '../components/dashboard/StudentView';
import { SAMPLE_STUDENTS } from '../features/dashboard/sample';

describe('dashboard rendering', () => {
  it('renders the personal dashboard without the profile form', () => {
    const html = renderToStaticMarkup(<PersonalDashboard />);
    expect(html).toContain('Mr. Lees.');
    expect(html).toContain('Personal console');
    expect(html).toContain('Alerts');
    expect(html).toContain('See my profile');
    expect(html).toContain('Your growth');
    expect(html).toContain('Data panel');
    expect(html).toContain('Psychological remark');
    expect(html).not.toContain('Cancel deletion');
    expect(html).not.toMatch(/save profile|full name/i);
  });

  it('shows the restore notice only when a deletion can still be cancelled', () => {
    const html = renderToStaticMarkup(<PersonalDashboard restore={{ action: async () => {} }} />);
    expect(html).toContain('This account was deleted');
    expect(html).toContain('Cancel deletion');
  });

  it('renders the family dashboard with a View link for each sample student', () => {
    const html = renderToStaticMarkup(<FamilyDashboard />);
    expect(html).toContain('Family dashboard');
    expect(html).toContain('Family console');
    for (const s of SAMPLE_STUDENTS.slice(0, 4)) {
      expect(html).toContain(`/dashboard/student/${s.id}`);
    }
  });

  it('renders the organisation dashboard with every sample student', () => {
    const html = renderToStaticMarkup(<OrganisationDashboard />);
    expect(html).toContain('Organisation dashboard');
    expect(html).toContain('Students performance overview');
    for (const s of SAMPLE_STUDENTS) {
      expect(html).toContain(s.name);
    }
  });

  it('renders the student data view with transcript, personal info and history', () => {
    const html = renderToStaticMarkup(<StudentView student={SAMPLE_STUDENTS[0]} backHref="/" />);
    expect(html).toContain('Transcript');
    expect(html).toContain('Personal info');
    expect(html).toContain('Academic info');
    expect(html).toContain('Edit history');
    expect(html).toContain('Compilation');
  });
});
