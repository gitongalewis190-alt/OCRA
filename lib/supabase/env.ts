// Public client values. Dashboard env overrides these when it is actually set.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ivjabanparsaaqblhsbm.supabase.co';
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2amFiYW5wYXJzYWFxYmxoc2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0Njg3NzksImV4cCI6MjExMDA0NDc3OX0.ABqGiAlpADM05G4Q1WYmJSATI7J58GkgZrLAqAGEXug';

export const supabaseEnv = { url, anonKey };
