'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type State = { loading: boolean; signedIn: boolean; isAdmin: boolean };

export function AuthMenu() {
  const t = useTranslations('auth');
  const tn = useTranslations('nav');
  const router = useRouter();
  const [state, setState] = useState<State>({ loading: true, signedIn: false, isAdmin: false });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setState({ loading: false, signedIn: false, isAdmin: false });
      return;
    }
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase!.auth.getUser();
      let isAdmin = false;
      if (user) {
        const { data } = await supabase!
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        isAdmin = (data as { role?: string } | null)?.role === 'admin';
      }
      if (active) setState({ loading: false, signedIn: Boolean(user), isAdmin });
    }

    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setState({ loading: false, signedIn: false, isAdmin: false });
    router.refresh();
  }

  if (state.loading) {
    return <span className="hidden h-9 w-16 animate-pulse rounded-lg bg-surface-2 sm:block" />;
  }

  if (!state.signedIn) {
    return (
      <Link href="/signin" className="btn-ghost h-9">
        {t('signIn')}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/upload"
        className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg sm:inline-block"
      >
        {tn('upload')}
      </Link>
      {state.isAdmin ? (
        <Link
          href="/admin"
          className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg sm:inline-block"
        >
          {tn('admin')}
        </Link>
      ) : null}
      <button type="button" onClick={signOut} className="btn-ghost h-9">
        {t('signOut')}
      </button>
    </div>
  );
}
