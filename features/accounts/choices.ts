import type { AccountType } from '@/features/profile/types';

// The four account choices shown on the first screen. Each opens its own dashboard.
export type AccountChoice = {
  type: AccountType;
  label: string;
  description: string;
  href: string;
};

export const ACCOUNT_CHOICES: AccountChoice[] = [
  {
    type: 'personal',
    label: 'Personal',
    description: 'You or your child, with your own results and documents.',
    href: '/dashboard/personal',
  },
  {
    type: 'organization',
    label: 'Organisation',
    description: 'A school or institution managing a group of students.',
    href: '/dashboard/organization',
  },
  {
    type: 'family',
    label: 'Family',
    description: 'Parents or guardians comparing and managing several children.',
    href: '/dashboard/family',
  },
  {
    type: 'developer',
    label: 'Developer',
    description: 'Staff access for the OCRA owner. Built in a later phase.',
    href: '/dashboard/developer',
  },
];
