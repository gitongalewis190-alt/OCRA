import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Returns the signed-in user and a Supabase client bound to their session.
 * Redirects to /login when there is no session. Use it at the top of every protected page or action.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }
  return { supabase, user };
}
