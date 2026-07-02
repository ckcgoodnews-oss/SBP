'use client';

import { useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export default function LogoutPage() {
  useEffect(() => {
    async function logout() {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    }

    logout();
  }, []);

  return (
    <main className="main">
      <h1>Signing out...</h1>
    </main>
  );
}
