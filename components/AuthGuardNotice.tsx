'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export function AuthGuardNotice() {
  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || null);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  if (!email) {
    return (
      <div className="notice">
        <p>You are viewing the local development app without an active login. Create a Supabase Auth user and sign in before production testing.</p>
      </div>
    );
  }

  return (
    <div className="notice">
      <p>Signed in as {email}. API tenant authorization hardening is the next step.</p>
    </div>
  );
}
