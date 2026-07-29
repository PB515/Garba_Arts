/**
 * stock-ledger.ts — running stock balance from movements (risky pure logic;
 * tested in tests/stock-ledger.test.ts).
 *
 * A stock level is the sum of movements, not a field you mutate — that's how you
 * avoid lost updates and overselling. This computes the running balance and, by
 * default, refuses any sequence that would drive stock negative (an oversell).
 *
 * Pure + deterministic. The matching DB pattern is an append-only movements
 * table; this is the calculation over it.
 */

export type MovementKind = 'in' | 'out';

export interface Movement {
  id?: string;
  qty: number; // always >= 0; direction is `kind`
  kind: MovementKind;
  ref?: string;
}

export interface LedgerEntry extends Movement {
  running: number;
}

export interface LedgerResult {
  balance: number;
  entries: LedgerEntry[];
}

export function runLedger(
  opening: number,
  movements: Movement[],
  opts: { allowNegative?: boolean } = {}
): LedgerResult {
  if (!Number.isFinite(opening)) throw new Error('opening must be a number');
  let running = opening;
  const entries: LedgerEntry[] = [];

  movements.forEach((m, i) => {
    if (!Number.isFinite(m.qty) || m.qty < 0)
      throw new Error(`movement ${label(m, i)}: qty must be >= 0 (use kind for direction)`);
    running += m.kind === 'in' ? m.qty : -m.qty;
    if (!opts.allowNegative && running < 0)
      throw new Error(`stock would go negative (${running}) at movement ${label(m, i)}`);
    entries.push({ ...m, running });
  });

  return { balance: running, entries };
}

/** Can `qty` units be taken out of `balance` without going negative? */
export function canFulfill(balance: number, qty: number): boolean {
  return Number.isFinite(qty) && qty >= 0 && balance - qty >= 0;
}

function label(m: Movement, i: number): string {
  return m.id ?? m.ref ?? `#${i}`;
}
