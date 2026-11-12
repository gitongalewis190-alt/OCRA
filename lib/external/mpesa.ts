import 'server-only';
import { serverConfig } from '@/lib/config/server';

type StkPushRequest = {
  phone: string; // 2547XXXXXXXX
  amount: number; // whole KES
  reference: string; // up to 12 characters
  description: string; // up to 13 characters
};

async function accessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${serverConfig.mpesa.consumerKey()}:${serverConfig.mpesa.consumerSecret()}`
  ).toString('base64');

  const res = await fetch(
    `${serverConfig.mpesa.baseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { authorization: `Basic ${credentials}` }, cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('M-Pesa authentication failed.');
  }
  const body = (await res.json()) as { access_token: string };
  return body.access_token;
}

// Daraja expects Africa/Nairobi time (UTC+3) in YYYYMMDDHHmmss.
function nairobiTimestamp(now: Date = new Date()): string {
  return new Date(now.getTime() + 3 * 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14);
}

/** Starts an M-Pesa STK push. The customer confirms with their PIN on the phone. */
export async function initiateStkPush({ phone, amount, reference, description }: StkPushRequest) {
  const token = await accessToken();
  const shortcode = serverConfig.mpesa.shortcode();
  const timestamp = nairobiTimestamp();
  const password = Buffer.from(`${shortcode}${serverConfig.mpesa.passkey()}${timestamp}`).toString('base64');

  const res = await fetch(`${serverConfig.mpesa.baseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: serverConfig.mpesa.callbackUrl(),
      AccountReference: reference.slice(0, 12),
      TransactionDesc: description.slice(0, 13),
    }),
    cache: 'no-store',
  });

  const body = (await res.json()) as {
    ResponseCode?: string;
    CheckoutRequestID?: string;
    MerchantRequestID?: string;
    errorMessage?: string;
  };

  if (!res.ok || body.ResponseCode !== '0' || !body.CheckoutRequestID || !body.MerchantRequestID) {
    throw new Error(body.errorMessage ?? 'M-Pesa did not accept the payment request.');
  }

  return {
    checkoutRequestId: body.CheckoutRequestID,
    merchantRequestId: body.MerchantRequestID,
  };
}
