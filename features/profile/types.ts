export type AccountType = 'personal' | 'family' | 'organization' | 'developer';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  account_type: AccountType;
  role: 'user' | 'admin' | 'developer';
  phone: string | null;
  country: string | null;
  locale: string;
  created_at: string;
};
