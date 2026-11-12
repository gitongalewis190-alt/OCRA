'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signIn, type AuthState } from '../auth/actions';

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <main className="auth-wrap">
      <section className="glass auth-card">
        <p className="eyebrow">OCRA · Personal account</p>
        <h1>Sign in</h1>
        <form action={action} className="stack">
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {state.error && <p role="alert" className="error">{state.error}</p>}
          <button type="submit" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="muted">
          New here? <Link href="/signup">Create a personal account</Link>
        </p>
      </section>
    </main>
  );
}
