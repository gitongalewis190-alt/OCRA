import { notFound } from 'next/navigation';
import { requireUser } from './session';

export type AccountRole = 'user' | 'admin' | 'developer';

/**
 * Lets only the listed roles through. Anyone else gets a 404, so staff pages are not revealed.
 * Redirects to /login when there is no session.
 */
export async function requireRole(allowed: AccountRole[]) {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (error || !data || !allowed.includes(data.role as AccountRole)) {
    notFound();
  }
  return { supabase, user, role: data.role as AccountRole };
}
