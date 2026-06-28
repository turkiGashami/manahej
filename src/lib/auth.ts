import 'server-only';
import { getSupabaseServerClient } from './supabase/server';
import type { Profile } from '@/types/database';

export type AuthContext = {
  userId: string;
  email: string | null;
  profile: Profile | null;
};

/** Current authenticated user + profile, or null. Safe when env is absent. */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: (profile as Profile) ?? null,
  };
}

export function isAdmin(ctx: AuthContext | null): boolean {
  return ctx?.profile?.role === 'admin';
}
