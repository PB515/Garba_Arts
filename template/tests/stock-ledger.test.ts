import { describe, it, expect } from 'vitest';
import { runLedger, canFulfill } from '../lib/logic/stock-ledger';

describe('runLedger', () => {
  it('computes a running balance across in/out movements', () => {
    const r = runLedger(0, [
      { kind: 'in', qty: 100, ref: 'grn-1' },
      { kind: 'out', qty: 30, ref: 'order-1' },
      { kind: 'out', qty: 20, ref: 'order-2' },
    ]);
    expect(r.balance).toBe(50);
    expect(r.entries.map((e) => e.running)).toEqual([100, 70, 50]);
  });

  it('refuses a sequence that would oversell (go negative)', () => {
    expect(() =>
      runLedger(10, [{ kind: 'out', qty: 25, ref: 'order-x' }])
    ).toThrow(/negative/);
  });

  it('allows negative when explicitly opted in (e.g. backorder modelling)', () => {
    const r = runLedger(10, [{ kind: 'out', qty: 25 }], { allowNegative: true });
    expect(r.balance).toBe(-15);
  });

  it('rejects a negative movement qty (direction is `kind`)', () => {
    expect(() => runLedger(0, [{ kind: 'in', qty: -5 }])).toThrow();
  });
});

describe('canFulfill', () => {
  it('is true only when enough stock exists', () => {
    expect(canFulfill(50, 50)).toBe(true);
    expect(canFulfill(50, 51)).toBe(false);
    expect(canFulfill(50, 0)).toBe(true);
    expect(canFulfill(50, -1)).toBe(false);
  });
});
