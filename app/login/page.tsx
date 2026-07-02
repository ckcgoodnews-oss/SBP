'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const [email, setEmail] = useState('owner@example.com');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const supabase = createBrowserSupabaseClient();

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      setError(loginError.message);
      setSaving(false);
      return;
    }

    setMessage('Login successful. Redirecting...');
    window.location.href = '/admin';
  }

  return (
    <main className="main">
      <h1>Login</h1>
      <p>Sign in with a Supabase Authentication user.</p>

      <form className="form" onSubmit={login}>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button type="submit" disabled={saving}>{saving ? 'Signing in...' : 'Sign In'}</button>
      </form>

      {message && <div className="card"><p>{message}</p></div>}
      {error && <div className="card"><h2>Login Error</h2><p>{error}</p></div>}

      <div className="notice">
        <p>Create this user in Supabase Authentication first. For local testing, use the same email as your `tenant_users` demo record, such as owner@example.com.</p>
      </div>
    </main>
  );
}
