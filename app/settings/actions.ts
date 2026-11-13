'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { STRIKE_COOKIE, validateDeletionReason } from '@/features/account/deletion';
import { canRestoreAccount, shouldLockOut } from '@/features/policy/rules';

export type DeleteState = { error?: string };

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

/**
 * Soft-deletes the signed-in account after a password check.
 * Two wrong passwords log the person out and send a security notice.
 * The developer is notified with the reason id only, never the free-text note.
 */
export async function deleteAccount(_prev: DeleteState, formData: FormData): Promise<DeleteState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: 'Sign in to delete your account. Sign-in is paused right now, so deletion is not available yet.' };
  }

  const checked = validateDeletionReason(text(formData, 'reason'), text(formData, 'note'));
  if (!checked.ok) return { error: checked.error };

  const password = text(formData, 'password');
  if (!password) return { error: 'Enter your password to confirm.' };

  const jar = await cookies();
  const { error: passwordError } = await supabase.auth.signInWithPassword({ email: user.email, password });

  if (passwordError) {
    const strikes = Number(jar.get(STRIKE_COOKIE)?.value ?? '0') + 1;
    if (shouldLockOut(strikes)) {
      jar.delete(STRIKE_COOKIE);
      await supabase.auth.signOut();
      const admin = createAdminClient();
      await admin.from('notifications').insert({
        profile_id: user.id,
        kind: 'security',
        title: 'Check your account security',
        body: 'Two incorrect passwords were entered while trying to delete your account. Change your password to keep your account safe.',
      });
      redirect('/');
    }
    jar.set(STRIKE_COOKIE, String(strikes), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 15 * 60 });
    return { error: 'That password is not correct. One more wrong attempt will log you out.' };
  }

  jar.delete(STRIKE_COOKIE);
  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', user.id);
  if (error) return { error: 'We could not delete the account. Nothing was changed. Try again.' };

  const { data: developers } = await admin.from('profiles').select('id').eq('role', 'developer').is('deleted_at', null);
  if (developers && developers.length > 0) {
    await admin.from('notifications').insert(
      developers.map((d) => ({
        profile_id: d.id,
        kind: 'account_deleted',
        title: 'An account was deleted',
        body: `Reason: ${checked.reasonId}. The account can be restored for 60 days.`,
      })),
    );
  }

  await supabase.auth.signOut();
  redirect('/settings/deleted');
}

/** Cancels a pending deletion while it is still inside the 60-day window. */
export async function cancelDeletion(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('deleted_at').eq('id', user.id).maybeSingle();
  if (!profile?.deleted_at || !canRestoreAccount(new Date(profile.deleted_at), new Date())) return;

  await admin.from('profiles').update({ deleted_at: null }).eq('id', user.id);
  revalidatePath('/dashboard/personal');
}
