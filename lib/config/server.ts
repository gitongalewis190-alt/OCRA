import 'server-only';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing server environment variable ${name}.`);
  }
  return value;
}

// Read lazily so a missing variable fails only the feature that needs it, not the whole app.
export const serverConfig = {
  supabaseServiceRoleKey: () => required('SUPABASE_SERVICE_ROLE_KEY'),
  anthropicApiKey: () => required('ANTHROPIC_API_KEY'),
  anthropicModel: () => required('ANTHROPIC_MODEL'),
  mpesa: {
    baseUrl: () => required('MPESA_BASE_URL'),
    consumerKey: () => required('MPESA_CONSUMER_KEY'),
    consumerSecret: () => required('MPESA_CONSUMER_SECRET'),
    shortcode: () => required('MPESA_SHORTCODE'),
    passkey: () => required('MPESA_PASSKEY'),
    callbackUrl: () => required('MPESA_CALLBACK_URL'),
  },
  africasTalking: {
    username: () => required('AFRICASTALKING_USERNAME'),
    apiKey: () => required('AFRICASTALKING_API_KEY'),
  },
};
