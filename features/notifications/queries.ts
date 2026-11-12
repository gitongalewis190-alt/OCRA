import type { SupabaseClient } from '@supabase/supabase-js';

export type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  created_at: string;
};

/** Unread notifications for the signed-in user, newest first. */
export async function listUnreadNotifications(supabase: SupabaseClient): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, kind, title, body, created_at')
    .is('read_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Notifications could not be loaded.');
  }
  return (data ?? []) as NotificationItem[];
}
