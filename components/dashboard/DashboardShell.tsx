import type { ReactNode } from 'react';
import { MODULES } from '@/features/registry';

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <main className="dashboard">
      <header className="dashboard-header glass">
        <div>
          <p className="eyebrow">OCRA</p>
          <h1>Personal dashboard</h1>
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
