import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { serverConfig } from '@/lib/config/server';
import { supabaseEnv } from './env';

/**
 * Service-role client. Bypasses row-level security.
 * Use only in trusted server code: webhooks, payments, AI cache, career enrichment.
 * Never pass unchecked user input straight into a query with this client.
 */
export function createAdminClient() {
  return createClient(supabaseEnv.url, serverConfig.supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
