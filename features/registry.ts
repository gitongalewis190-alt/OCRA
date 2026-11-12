// Every dashboard module is listed here. A module shows on the personal dashboard once it has an entry.
export type ModuleEntry = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export const MODULES: ModuleEntry[] = [
  {
    id: 'profile',
    label: 'Profile',
    description: 'Your name, contact details and language.',
    href: '#profile',
  },
];
