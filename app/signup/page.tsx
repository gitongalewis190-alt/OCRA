'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signUp, type AuthState } from '../auth/actions';

const initialState: AuthState = {};

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUp, initialState);

  return (
    <main className="auth-wrap">
      <section className="glass auth-card">
        <p className="eyebrow">OCRA · Personal account</p>
        <h1>Create your account</h1>
        <form action={action} className="stack">
          <label>
            Full name
            <input name="fullName" autoComplete="name" minLength={2} maxLength={120} required />
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="new-password" minLength={9} required />
          </label>
          <label>
            Confirm password
            <input name="confirm" type="password" autoComplete="new-password" minLength={9} required />
          </label>
          <p className="hint">
            At least 9 characters, with one capital letter, one number and one symbol.
          </p>
          {state.error && <p role="alert" className="error">{state.error}</p>}
          {state.message && <p className="notice">{state.message}</p>}
          <button type="submit" disabled={pending}>
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="muted">
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
