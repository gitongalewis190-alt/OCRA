import 'server-only';
import { createHash } from 'node:crypto';
import { serverConfig } from '@/lib/config/server';
import { createAdminClient } from '@/lib/supabase/admin';

type ClaudeRequest = {
  cacheKey: string;
  system: string;
  prompt: string;
  maxTokens?: number;
};

/** Stable key from the inputs that define a request. Same inputs always reuse the cached answer. */
export function buildCacheKey(parts: string[]): string {
  return createHash('sha256').update(parts.join('\u001f')).digest('hex');
}

/**
 * Calls the Claude Messages API, caching the answer in ai_cache.
 * The cache is what keeps cost down: each unique request is paid for once.
 */
export async function askClaude({ cacheKey, system, prompt, maxTokens = 1024 }: ClaudeRequest): Promise<string> {
  const admin = createAdminClient();

  const { data: cached } = await admin
    .from('ai_cache')
    .select('response')
    .eq('cache_key', cacheKey)
    .maybeSingle();

  if (cached) {
    return (cached.response as { text: string }).text;
  }

  const model = serverConfig.anthropicModel();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': serverConfig.anthropicApiKey(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Claude request failed with status ${res.status}.`);
  }

  const body = (await res.json()) as { content: { type: string; text?: string }[] };
  const text = body.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('');

  await admin
    .from('ai_cache')
    .upsert({ cache_key: cacheKey, response: { text }, model }, { onConflict: 'cache_key', ignoreDuplicates: true });

  return text;
}
