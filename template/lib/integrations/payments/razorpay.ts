import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { PaymentsAdapter, CreateOrderInput, PaymentOrder, VerifyInput } from './index';

/**
 * Razorpay adapter — STUB. `verifyPayment` is real (signature security matters);
 * `createOrder` is wired but needs the SDK + live keys to actually call the API.
 *
 * To finish: `npm i razorpay`, then replace the createOrder body with a real SDK
 * call. Keys come from env (server only): RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET.
 * The webhook handler must be IDEMPOTENT (Bugadi must-hold) — dedupe by payment
 * id with lib/logic/idempotency.ts before crediting an order.
 */
export class RazorpayAdapter implements PaymentsAdapter {
  readonly provider = 'razorpay';

  async createOrder(input: CreateOrderInput): Promise<PaymentOrder> {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error(
        'RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing — set them in .env.local (test keys; never commit).'
      );
    }
    // TODO: real call — `new Razorpay({ key_id, key_secret }).orders.create({...})`
    // returning a PaymentOrder shaped like:
    //   { id, amount: input.amount, currency: input.currency ?? 'INR', receipt, status: 'created' }
    void input;
    throw new Error('RazorpayAdapter.createOrder is a stub — install the SDK and implement the API call.');
  }

  /**
   * Verify the Razorpay callback signature: HMAC-SHA256(orderId|paymentId, secret).
   * Constant-time compare. This part is REAL — it's the security boundary.
   */
  verifyPayment({ orderId, paymentId, signature }: VerifyInput): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error('RAZORPAY_KEY_SECRET missing');
    const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signature, 'utf8');
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
