import 'server-only';
import { serverConfig } from '@/lib/config/server';

/** Sends an SMS through Africa's Talking. `to` takes numbers in international format, e.g. +254712345678. */
export async function sendSms(to: string[], message: string): Promise<unknown> {
  const body = new URLSearchParams({
    username: serverConfig.africasTalking.username(),
    to: to.join(','),
    message,
  });

  const res = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      apiKey: serverConfig.africasTalking.apiKey(),
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('The SMS could not be sent.');
  }
  return res.json();
}
