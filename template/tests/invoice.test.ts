import { describe, it, expect } from 'vitest';
import { buildInvoice, creditNote } from '../lib/logic/invoice';

describe('buildInvoice', () => {
  const inv = buildInvoice({
    number: 'INV-001',
    sellerState: 'MH',
    buyerState: 'MH',
    lines: [
      { description: 'Earrings', qty: 2, unitPrice: 500, gstRate: 12 },
      { description: 'Necklace', qty: 1, unitPrice: 1000, gstRate: 12 },
    ],
  });

  it('totals lines + snapshots GST per line', () => {
    expect(inv.subtotal).toBe(2000); // 2*500 + 1000
    expect(inv.totalGst).toBe(240); // 12% of 2000
    expect(inv.total).toBe(2240);
    expect(inv.lines[0].gst.kind).toBe('intra-state'); // MH→MH
    expect(inv.lines[0].gst.cgst).toBe(60); // line 0 = 2×500 = 1000; 12% = 120; CGST = 60
  });

  it('snapshots the rate onto the line (later changes do not apply)', () => {
    expect(inv.lines.every((l) => l.gstRate === 12)).toBe(true);
  });
});

describe('creditNote', () => {
  const inv = buildInvoice({
    number: 'INV-002',
    sellerState: 'MH',
    buyerState: 'KA',
    lines: [{ description: 'Ring', qty: 1, unitPrice: 1000, gstRate: 18 }],
  });
  const cn = creditNote(inv, 'CN-002');

  it('reverses the totals and the GST', () => {
    expect(cn.isCreditNote).toBe(true);
    expect(cn.total).toBe(-inv.total);
    expect(cn.totalGst).toBe(-inv.totalGst);
    expect(cn.lines[0].gst.igst).toBe(-inv.lines[0].gst.igst); // inter-state, reversed
  });

  it('an invoice + its credit note nets to zero', () => {
    expect(inv.total + cn.total).toBe(0);
    expect(inv.totalGst + cn.totalGst).toBe(0);
  });
});
