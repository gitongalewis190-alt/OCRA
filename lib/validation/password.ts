export const PASSWORD_MIN_LENGTH = 9;

/**
 * Returns the rules a password fails. An empty array means it passes.
 * Rules: 9+ characters, one capital letter, one number, one symbol.
 */
export function passwordProblems(password: string): string[] {
  const problems: string[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) problems.push(`at least ${PASSWORD_MIN_LENGTH} characters`);
  if (!/[A-Z]/.test(password)) problems.push('one capital letter');
  if (!/[0-9]/.test(password)) problems.push('one number');
  if (!/[^A-Za-z0-9]/.test(password)) problems.push('one symbol');
  return problems;
}
