import { requireRole } from '@/lib/auth/roles';

export default async function AdminPage() {
  const { supabase } = await requireRole(['admin', 'developer']);

  const { data, error } = await supabase
    .from('career_requirements')
    .select('id, name, source, review_status, new_until, created_at')
    .neq('review_status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Career entries could not be loaded.');
  }

  return (
    <main className="dashboard">
      <section className="glass panel">
        <p className="eyebrow">Staff</p>
        <h1>Careers awaiting review</h1>
        {!data || data.length === 0 ? (
          <p className="muted">Nothing is waiting for review.</p>
        ) : (
          <div className="account-grid">
            {data.map((career) => (
              <div className="row" key={career.id}>
                <span>{career.name}</span>
                <span>{career.review_status === 'analysis_pending' ? 'Analysis pending' : 'Review needed'}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
