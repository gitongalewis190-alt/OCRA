'use client';

import { useActionState } from 'react';
import { updateProfile, type ProfileState } from '@/features/profile/actions';
import type { Profile } from '@/features/profile/types';
import { LOCALES } from '@/lib/validation/profile';

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  sw: 'Kiswahili',
};

const initialState: ProfileState = {};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);

  return (
    <section className="glass panel" id="profile" aria-labelledby="profile-heading">
      <h2 id="profile-heading">Profile</h2>
      <form action={action} className="stack">
        <label>
          Full name
          <input name="fullName" defaultValue={profile.full_name} minLength={2} maxLength={120} required />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" defaultValue={profile.phone ?? ''} placeholder="+254 712 345 678" />
        </label>
        <label>
          Country code
          <input name="country" defaultValue={profile.country ?? 'KE'} maxLength={2} />
        </label>
        <label>
          Language
          <select name="locale" defaultValue={profile.locale}>
            {LOCALES.map((locale) => (
              <option key={locale} value={locale}>
                {LOCALE_LABELS[locale]}
              </option>
            ))}
          </select>
        </label>
        {state.error && <p role="alert" className="error">{state.error}</p>}
        {state.saved && <p className="notice">Saved.</p>}
        <button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </section>
  );
}
