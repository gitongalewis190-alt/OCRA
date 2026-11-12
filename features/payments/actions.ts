'use server';

import { requireUser } from '@/lib/auth/session';
import { initiateStkPush } from '@/lib/external/mpesa';
import { createAdminClient } from '@/lib/supabase/admin';
import { normaliseKenyanPhone } from '@/lib/validation/phone';
import { PRICES, type PaymentPurpose } from './pricing';

export type PaymentState = { error?: string; message?: string };

export async function startMpesaPayment(_prev: PaymentState, formData: FormData): Promise<PaymentState> {
  const { supabase, user } = await requireUser();

  const purpose = String(formData.get('purpose') ?? '') as PaymentPurpose;
  const price = PRICES[purpose];
  if (!price) {
    return { error: 'Choose what you are paying for.' };
  }

  const phone = normaliseKenyanPhone(String(formData.get('phone') ?? ''));
  if (!phone) {
    return { error: 'Enter a Safaricom number, for example 0712 345 678.' };
  }

  // The student must be one this user can already see. Row-level security enforces that.
  const studentId = String(formData.get('studentId') ?? '') || null;
  if (studentId) {
    const { data: student } = await supabase.from('students').select('id').eq('id', studentId).maybeSingle();
    if (!student) {
      return { error: 'That student could not be found.' };
    }
  }

  const admin = createAdminClient();
  const { data: payment, error } = await admin
    .from('payments')
    .insert({
      profile_id: user.id,
      student_id: studentId,
      provider: 'mpesa',
      purpose,
      amount: price.amountKes,
      currency: 'KES',
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !payment) {
    return { error: 'The payment could not be started. Try again.' };
  }

  try {
    const { checkoutRequestId, merchantRequestId } = await initiateStkPush({
      phone,
      amount: price.amountKes,
      reference: payment.id.slice(0, 12),
      description: price.label,
    });

    await admin
      .from('payments')
      .update({ checkout_request_id: checkoutRequestId, provider_reference: merchantRequestId })
      .eq('id', payment.id);

    return { message: 'Check your phone and enter your M-Pesa PIN to finish paying.' };
  } catch (err) {
    await admin.from('payments').update({ status: 'failed' }).eq('id', payment.id);
    return { error: err instanceof Error ? err.message : 'The payment could not be started.' };
  }
}
