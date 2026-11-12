export const LOCALES = ['en', 'sw'] as const;
export type Locale = (typeof LOCALES)[number];

export type ProfileInput = {
  fullName: string;
  phone: string | null;
  country: string | null;
  locale: Locale;
};

export type ProfileValidation = { ok: true; value: ProfileInput } | { ok: false; error: string };

// Kenyan and international numbers: optional leading +, 9 to 15 digits.
const PHONE_PATTERN = /^\+?[0-9]{9,15}$/;
const COUNTRY_PATTERN = /^[A-Z]{2}$/;

export function validateProfileInput(raw: {
  fullName: string;
  phone: string;
  country: string;
  locale: string;
}): ProfileValidation {
  const fullName = raw.fullName.trim();
  if (fullName.length < 2 || fullName.length > 120) {
    return { ok: false, error: 'Full name must be 2 to 120 characters.' };
  }

  const phone = raw.phone.replace(/[\s-]/g, '');
  if (phone && !PHONE_PATTERN.test(phone)) {
    return { ok: false, error: 'Enter a valid phone number, for example +254712345678.' };
  }

  const country = raw.country.trim().toUpperCase();
  if (country && !COUNTRY_PATTERN.test(country)) {
    return { ok: false, error: 'Country must be a two-letter code, for example KE.' };
  }

  if (!(LOCALES as readonly string[]).includes(raw.locale)) {
    return { ok: false, error: 'Choose a language.' };
  }

  return {
    ok: true,
    value: {
      fullName,
      phone: phone || null,
      country: country || null,
      locale: raw.locale as Locale,
    },
  };
}
