import { notFound } from 'next/navigation';
import { StudentView } from '@/components/dashboard/StudentView';
import { SAMPLE_STUDENTS } from '@/features/dashboard/sample';

// Student data view. Family and organisation dashboards open this from the View button.
export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = SAMPLE_STUDENTS.find((s) => s.id === id);
  if (!student) notFound();
  return <StudentView student={student} backHref="/" />;
}
