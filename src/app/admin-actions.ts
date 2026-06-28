'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAuthContext, isAdmin } from '@/lib/auth';
import type { CurriculumStatus, ReportStatus } from '@/types/database';

export type ActionResult = { ok: boolean; error?: string };

async function requireAdminClient() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: 'not-configured' as const };
  const ctx = await getAuthContext();
  if (!isAdmin(ctx)) return { error: 'forbidden' as const };
  return { supabase };
}

export async function setCurriculumStatus(
  id: string,
  status: CurriculumStatus,
): Promise<ActionResult> {
  const guard = await requireAdminClient();
  if ('error' in guard) return { ok: false, error: guard.error };

  const { error } = await guard.supabase
    .from('curricula')
    .update({ status })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin');
  return { ok: true };
}

export async function setEditorPick(id: string, value: boolean): Promise<ActionResult> {
  const guard = await requireAdminClient();
  if ('error' in guard) return { ok: false, error: guard.error };

  const { error } = await guard.supabase
    .from('curricula')
    .update({ is_editor_pick: value })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin');
  return { ok: true };
}

export async function setReportStatus(
  id: string,
  status: ReportStatus,
): Promise<ActionResult> {
  const guard = await requireAdminClient();
  if ('error' in guard) return { ok: false, error: guard.error };

  const { error } = await guard.supabase.from('reports').update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin');
  return { ok: true };
}
