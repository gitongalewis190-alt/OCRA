'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { passwordProblems } from '@/lib/validation/password';

export type AuthState = { error?: string; message?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function secret(formData: FormData, key: string): string {
  // Passwords are never trimmed.
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = text(formData, 'fullName');
  const email = text(formData, 'email').toLowerCase();
  const password = secret(formData, 'password');
  const confirm = secret(formData, 'confirm');

  if (fullName.length < 2 || fullName.length > 120) {
    return { error: 'Enter your full name.' };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: 'Enter a valid email address.' };
  }
  const problems = passwordProblems(password);
  if (problems.length > 0) {
    return { error: `Password needs ${problems.join(', ')}.` };
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: siteUrl ? `${siteUrl}/auth/callback` : undefined,
    },
  });

  if (error) {
    return { error: error.message };
  }
  if (data.session) {
    redirect('/');
  }
  return { message: 'Check your email to confirm your account, then sign in.' };
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, 'email').toLowerCase();
  const password = secret(formData, 'password');

  if (!EMAIL_PATTERN.test(email) || password.length === 0) {
    return { error: 'Enter your email and password.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Same message for unknown email and wrong password, so accounts cannot be probed.
    return { error: 'Email or password is incorrect.' };
  }
  redirect('/');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
