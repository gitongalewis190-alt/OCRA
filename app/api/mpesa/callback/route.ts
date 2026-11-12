import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PRICES, type PaymentPurpose } from '@/features/payments/pricing';

const ACCEPTED = NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });

type CallbackItem = { Name: string; Value?: string | number };

/**
 * Daraja result webhook. Public by design (Safaricom cannot sign in).
 * Trust comes from matching a pending payment by CheckoutRequestID and checking the paid amount.
 */
export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const callback = payload?.Body?.stkCallback as
    | { CheckoutRequestID?: string; ResultCode?: number; CallbackMetadata?: { Item?: CallbackItem[] } }
    | undefined;

  if (!callback?.CheckoutRequestID) {
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Malformed callback' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from('payments')
    .select('id, profile_id, student_id, amount, purpose, status')
    .eq('checkout_request_id', callback.CheckoutRequestID)
    .maybeSingle();

  if (!payment || payment.status !== 'pending') {
    return ACCEPTED;
  }

  if (callback.ResultCode !== 0) {
    await admin.from('payments').update({ status: 'failed' }).eq('id', payment.id).eq('status', 'pending');
    return ACCEPTED;
  }

  const items = callback.CallbackMetadata?.Item ?? [];
  const paidAmount = Number(items.find((item) => item.Name === 'Amount')?.Value);
  const receipt = String(items.find((item) => item.Name === 'MpesaReceiptNumber')?.Value ?? '');

  if (paidAmount !== Number(payment.amount)) {
    await admin.from('payments').update({ status: 'failed' }).eq('id', payment.id).eq('status', 'pending');
    return ACCEPTED;
  }

  // Only the request that changes status from pending creates the entitlement, so retries cannot double-grant.
  const { data: updated } = await admin
    .from('payments')
    .update({ status: 'succeeded', provider_reference: receipt || null })
    .eq('id', payment.id)
    .eq('status', 'pending')
    .select('id');

  if (updated && updated.length > 0) {
    const price = PRICES[payment.purpose as PaymentPurpose];
    const expiresAt = new Date(Date.now() + price.unlockDays * 24 * 60 * 60 * 1000).toISOString();

    await admin.from('entitlements').insert({
      profile_id: payment.profile_id,
      student_id: payment.student_id,
      purpose: payment.purpose,
      expires_at: expiresAt,
      payment_id: payment.id,
    });
  }

  return ACCEPTED;
}
