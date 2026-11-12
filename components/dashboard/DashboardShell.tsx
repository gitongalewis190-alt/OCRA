import type { ReactNode } from 'react';
import Link from 'next/link';
import { MODULES } from '@/features/registry';

export function DashboardShell({ title = 'Personal dashboard', children }: { title?: string; children: ReactNode }) {
  return (
    <main className="dashboard">
      <header className="dashboard-header glass">
        <div>
          <p className="eyebrow">OCRA</p>
          <h1>{title}</h1>
          <Link href="/" className="muted">Back to account choice</Link>
        </div>
      </header>

      <nav className="module-nav" aria-label="Modules">
        {MODULES.map((module) => (
          <a key={module.id} href={module.href} className="glass module-link">
            <strong>{module.label}</strong>
            <span className="muted">{module.description}</span>
          </a>
        ))}
      </nav>

      {children}
    </main>
  );
}
