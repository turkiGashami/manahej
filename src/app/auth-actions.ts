'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isValidLocale, defaultLocale } from '@/i18n/routing';

export type AuthState = { error?: string };

function readLocale(formData: FormData): string {
  const raw = String(formData.get('locale') || '');
  return isValidLocale(raw) ? raw : defaultLocale;
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const locale = readLocale(formData);

  if (!email || !password) return { error: 'invalid' };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: 'not-configured' };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect(`/${locale}`);
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const displayName = String(formData.get('displayName') || '').trim();
  const locale = readLocale(formData);

  if (!email || password.length < 6) return { error: 'weak' };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: 'not-configured' };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName || null } },
  });
  if (error) return { error: error.message };

  // If email confirmation is enabled in the project, the user must confirm
  // before a session exists. Redirecting home is safe either way.
  redirect(`/${locale}`);
}

export async function signOutAction(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
}
