'use server';

import { getSupabaseServerClient } from '@/lib/supabase/server';

export type ActionResult = { ok: boolean; error?: string };

/**
 * Log a download and bump the counter for a published curriculum.
 * Backed by the SECURITY DEFINER `increment_download` RPC so anonymous
 * readers can call it without write access to the tables.
 */
export async function incrementDownload(curriculumId: string): Promise<ActionResult> {
  if (!curriculumId) return { ok: false, error: 'missing id' };
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: true }; // no backend yet — treat as no-op

  const { error } = await supabase.rpc('increment_download', {
    p_curriculum_id: curriculumId,
  });
  if (error) {
    console.error('incrementDownload error:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

const ALLOWED_REASONS = new Set(['copyright', 'inappropriate', 'broken_file', 'other']);

/** File a content report (anyone may submit; admins review in /admin). */
export async function submitReport(input: {
  curriculumId: string;
  reason: string;
  message?: string;
  email?: string;
}): Promise<ActionResult> {
  const reason = ALLOWED_REASONS.has(input.reason) ? input.reason : 'other';
  if (!input.curriculumId) return { ok: false, error: 'missing id' };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: true };

  const { error } = await supabase.from('reports').insert({
    curriculum_id: input.curriculumId,
    reason,
    message: input.message?.slice(0, 2000) || null,
    reporter_email: input.email?.slice(0, 320) || null,
  });
  if (error) {
    console.error('submitReport error:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
