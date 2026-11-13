import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SettingsHub } from '../components/settings/SettingsHub';

describe('settings rendering', () => {
  it('has a Back button and a route to delete the account', () => {
    const html = renderToStaticMarkup(<SettingsHub />);
    expect(html).toContain('Back to dashboard');
    expect(html).toContain('href="/dashboard/personal"');
    expect(html).toContain('href="/settings/delete"');
    expect(html).toContain('Delete account');
  });
});
