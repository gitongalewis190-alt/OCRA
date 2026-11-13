'use client';

import { useActionState } from 'react';
import { deleteAccount, type DeleteState } from '@/app/settings/actions';
import { DELETION_REASONS } from '@/features/account/deletion';
import styles from '@/components/dashboard/dashboard.module.css';

const initial: DeleteState = {};

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccount, initial);

  return (
    <form action={formAction} className={styles.stack}>
      <fieldset style={{ border: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
        <legend className={styles.label}>Why are you deleting your account?</legend>
        {DELETION_REASONS.map((r) => (
          <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit' }}>
            <input type="radio" name="reason" value={r.id} required />
            {r.label}
          </label>
        ))}
      </fieldset>

      <label>
        Add a note (optional)
        <textarea name="note" maxLength={500} rows={3} />
      </label>

      <label>
        Password
        <input type="password" name="password" autoComplete="current-password" required />
      </label>

      {state.error && <p role="alert" className="error">{state.error}</p>}

      <button type="submit" disabled={pending} className={`${styles.btn} ${styles.btnDanger}`}>
        {pending ? 'Checking…' : 'Delete account'}
      </button>
    </form>
  );
}
