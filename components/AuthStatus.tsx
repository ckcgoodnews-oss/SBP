'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || null);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (!email) {
    return <a href="/login">Login</a>;
  }

  return (
    <>
      <span className="badge">{email}</span>
      <a href="/logout">Logout</a>
    </>
  );
}
