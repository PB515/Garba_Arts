/**
 * payments — the adapter BOUNDARY (Tier-2 #11 adapter-boundary, #7 billing).
 *
 * Use when: any checkout / payment flow. Call sites depend on this interface,
 * never on a provider SDK — so switching Razorpay → Stripe → Cashfree is a new
 * adapter, not a rewrite. (Bugadi: two payment pivots made trivial by this.)
 *
 * The GST/tax calculation is separate and lives in lib/logic/tax.ts.
 */

export interface PaymentOrder {
  id: string;
  amount: number; // in the smallest unit (paise) — providers expect integers
  currency: string;
  receipt?: string;
  status: 'created' | 'paid' | 'failed';
}

export interface CreateOrderInput {
  amount: number; // smallest unit (paise)
  currency?: string; // default 'INR'
  receipt?: string;
  notes?: Record<string, string>;
}

export interface VerifyInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

/** Every payment provider is wrapped to satisfy this. */
export interface PaymentsAdapter {
  readonly provider: string;
  createOrder(input: CreateOrderInput): Promise<PaymentOrder>;
  /** Verify a payment callback/webhook signature. MUST be exact + constant-time. */
  verifyPayment(input: VerifyInput): boolean;
}

/**
 * Resolve the active adapter. Pick by env so call sites never name a provider.
 * Defaults to Razorpay (the shipped stub). Add a case when you add a provider.
 */
export async function getPayments(): Promise<PaymentsAdapter> {
  const provider = process.env.PAYMENTS_PROVIDER?.trim() || 'razorpay';
  switch (provider) {
    case 'razorpay': {
      const { RazorpayAdapter } = await import('./razorpay');
      return new RazorpayAdapter();
    }
    default:
      throw new Error(`unknown PAYMENTS_PROVIDER "${provider}" — add an adapter in lib/integrations/payments/`);
  }
}
