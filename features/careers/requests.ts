import 'server-only';
import { askClaude, buildCacheKey } from '@/lib/external/claude';
import { createAdminClient } from '@/lib/supabase/admin';

const NEW_BADGE_DAYS = 60;

type Enrichment = {
  subject_minimums: Record<string, string> | null;
  cognitive_fit: Record<string, number> | null;
  salary_range_kes: { min: number; max: number } | null;
  training: { route: string; duration_years: number } | null;
};

const SYSTEM = 'You output only a single JSON object. No prose and no markdown fences. Use null for anything you are not confident about.';

/**
 * Adds a career that is not in the database yet. Claude drafts the structured fields,
 * the entry is saved as pending review, and staff approve it on /admin.
 * Identical names are answered from the cache and never re-analysed.
 */
export async function requestCareerAddition(rawName: string): Promise<{ id: string; created: boolean }> {
  const name = rawName.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 120) {
    throw new Error('Enter a career name between 2 and 120 characters.');
  }

  const normalised = name.toLowerCase();
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('career_requirements')
    .select('id')
    .eq('normalised_name', normalised)
    .maybeSingle();

  if (existing) {
    return { id: existing.id as string, created: false };
  }

  const prompt = [
    `Describe the career "${name}" for a secondary school student in Kenya.`,
    'Return a JSON object with these keys:',
    '- subject_minimums: object mapping each subject to the minimum grade usually required, or null.',
    '- cognitive_fit: object with keys logic, verbal, spatial, memory, numerical, focus, each a whole number from 0 to 100, or null.',
    '- salary_range_kes: {"min": number, "max": number} annual figure in Kenyan shillings, or null.',
    '- training: {"route": string, "duration_years": number} for the usual route, or null.',
  ].join('\n');

  let enrichment: Enrichment | null = null;
  try {
    const text = await askClaude({
      cacheKey: buildCacheKey(['career-enrichment', normalised]),
      system: SYSTEM,
      prompt,
      maxTokens: 800,
    });
    enrichment = JSON.parse(text) as Enrichment;
  } catch {
    enrichment = null;
  }

  const { data, error } = await admin
    .from('career_requirements')
    .insert({
      name,
      normalised_name: normalised,
      subject_minimums: enrichment?.subject_minimums ?? {},
      cognitive_fit: enrichment?.cognitive_fit ?? {},
      salary_range: enrichment?.salary_range_kes ?? null,
      training: enrichment?.training ?? null,
      source: 'backdoor',
      review_status: enrichment ? 'pending_review' : 'analysis_pending',
      new_until: new Date(Date.now() + NEW_BADGE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('The career could not be saved.');
  }
  return { id: data.id as string, created: true };
}
