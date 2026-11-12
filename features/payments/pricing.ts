// Prices in KES. Only the document-download price is confirmed; add others here when they are agreed.
export const PRICES = {
  document_download: {
    amountKes: 40,
    unlockDays: 30,
    label: 'Document download',
  },
} as const;

export type PaymentPurpose = keyof typeof PRICES;
