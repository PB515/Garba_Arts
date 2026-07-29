import { describe, it, expect } from 'vitest';
import { computeGst, round2 } from '../lib/logic/tax';

describe('computeGst', () => {
  it('splits intra-state supply into equal CGST + SGST', () => {
    const r = computeGst({ amount: 1000, rate: 18, sellerState: 'MH', buyerState: 'MH' });
    expect(r.kind).toBe('intra-state');
    expect(r.cgst).toBe(90);
    expect(r.sgst).toBe(90);
    expect(r.igst).toBe(0);
    expect(r.totalTax).toBe(180);
    expect(r.total).toBe(1180);
  });

  it('charges a single IGST for inter-state supply', () => {
    const r = computeGst({ amount: 1000, rate: 18, sellerState: 'MH', buyerState: 'KA' });
    expect(r.kind).toBe('inter-state');
    expect(r.igst).toBe(180);
    expect(r.cgst).toBe(0);
    expect(r.sgst).toBe(0);
    expect(r.total).toBe(1180);
  });

  it('keeps cgst + sgst exactly equal to totalTax under odd rounding', () => {
    // 999.99 * 5% = 49.9995 → 50.00 total; halves must re-sum to 50.00 with no drift
    const r = computeGst({ amount: 999.99, rate: 5, sellerState: 'mh', buyerState: 'MH' });
    expect(round2(r.cgst + r.sgst)).toBe(r.totalTax);
  });

  it('is state-name case/whitespace insensitive', () => {
    const r = computeGst({ amount: 100, rate: 12, sellerState: ' Maharashtra ', buyerState: 'maharashtra' });
    expect(r.kind).toBe('intra-state');
  });

  it('handles a zero rate', () => {
    const r = computeGst({ amount: 500, rate: 0, sellerState: 'MH', buyerState: 'KA' });
    expect(r.totalTax).toBe(0);
    expect(r.total).toBe(500);
  });

  it('rejects negative amount or rate', () => {
    expect(() => computeGst({ amount: -1, rate: 18, sellerState: 'MH', buyerState: 'MH' })).toThrow();
    expect(() => computeGst({ amount: 1, rate: -5, sellerState: 'MH', buyerState: 'MH' })).toThrow();
  });
});
