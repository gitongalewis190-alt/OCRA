import type { SupabaseClient } from '@supabase/supabase-js';

export type BrainTestQuestion = {
  id: string;
  dimension: string;
  prompt: string;
  kind: 'single' | 'multi' | 'scale' | 'spatial';
  options: unknown;
  image_path: string | null;
  version: number;
};

export async function getActiveQuestions(supabase: SupabaseClient): Promise<BrainTestQuestion[]> {
  const { data, error } = await supabase
    .from('brain_test_questions')
    .select('id, dimension, prompt, kind, options, image_path, version')
    .eq('is_active', true)
    .order('id');

  if (error) {
    throw new Error('Brain Test questions could not be loaded.');
  }
  return (data ?? []) as BrainTestQuestion[];
}

/** Opens a new sitting for a student the user can write to. Returns the sitting id. */
export async function startSitting(supabase: SupabaseClient, studentId: string): Promise<string> {
  const { data, error } = await supabase
    .from('brain_test_sittings')
    .insert({ student_id: studentId })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('The Brain Test could not be started.');
  }
  return data.id as string;
}
