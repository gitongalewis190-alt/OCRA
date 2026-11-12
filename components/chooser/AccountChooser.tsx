import Link from 'next/link';
import { ACCOUNT_CHOICES } from '@/features/accounts/choices';

// First screen. Choosing an account type opens that account's dashboard.
export function AccountChooser() {
  return (
    <main className="dashboard">
      <header className="dashboard-header glass">
        <div>
          <p className="eyebrow">OCRA</p>
          <h1>Which account do you want to open?</h1>
          <p className="muted">Sign-in is temporarily off. Pick an account type to continue.</p>
        </div>
      </header>

      <nav className="module-nav" aria-label="Account types">
        {ACCOUNT_CHOICES.map((choice) => (
          <Link key={choice.type} href={choice.href} className="glass module-link">
            <strong>{choice.label}</strong>
            <span className="muted">{choice.description}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
