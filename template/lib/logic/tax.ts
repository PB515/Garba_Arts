/**
 * tax.ts — GST + place-of-supply (risky pure logic; tested in tests/tax.test.ts).
 *
 * The classic India GST rule: intra-state supply splits into CGST + SGST (half
 * the rate each); inter-state supply is a single IGST (the full rate). Which one
 * applies is decided by place of supply — seller state vs buyer state.
 *
 * Pure + deterministic so it can be unit-tested without a DB. Getting this wrong
 * means wrong tax on every order — review by the domain expert before launch
 * (Safety Rail) and keep the rate table in config, not scattered in code.
 */

export type GstKind = 'intra-state' | 'inter-state';

export interface GstBreakdown {
  taxableAmount: number;
  rate: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  total: number;
  kind: GstKind;
}

/** Round to 2 decimals, half-up, avoiding binary float drift. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeGst(params: {
  amount: number; // taxable amount, exclusive of tax
  rate: number; // percent, e.g. 18 for 18%
  sellerState: string;
  buyerState: string;
}): GstBreakdown {
  const { amount, rate, sellerState, buyerState } = params;
  if (!Number.isFinite(amount) || amount < 0) throw new Error('amount must be a number >= 0');
  if (!Number.isFinite(rate) || rate < 0) throw new Error('rate must be a number >= 0');

  const intra = norm(sellerState) === norm(buyerState);
  const totalTax = round2((amount * rate) / 100);

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  if (intra) {
    cgst = round2(totalTax / 2);
    // derive sgst as the remainder so cgst + sgst === totalTax exactly (no drift)
    sgst = round2(totalTax - cgst);
  } else {
    igst = totalTax;
  }

  return {
    taxableAmount: round2(amount),
    rate,
    cgst,
    sgst,
    igst,
    totalTax,
    total: round2(amount + totalTax),
    kind: intra ? 'intra-state' : 'inter-state',
  };
}

function norm(state: string): string {
  return state.trim().toLowerCase();
}
