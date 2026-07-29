/**
 * invoice.ts — invoice build with GST snapshot + credit-note reversal
 * (Tier-2 #7 billing; tested in tests/invoice.test.ts).
 *
 * Bugadi must-holds: snapshot the GST onto each invoice at the time of sale (so
 * a later rate change never alters a past invoice), and a credit note REVERSES
 * the GST (negates it). Pure logic over lib/logic/tax.ts.
 */

import { computeGst, round2, type GstBreakdown } from './tax';

export interface InvoiceLine {
  description: string;
  qty: number;
  unitPrice: number; // per unit, exclusive of tax
  gstRate: number; // percent, snapshotted onto the line
}

export interface InvoiceLineComputed extends InvoiceLine {
  lineTotal: number;
  gst: GstBreakdown;
}

export interface Invoice {
  number: string;
  sellerState: string;
  buyerState: string;
  lines: InvoiceLineComputed[];
  subtotal: number;
  totalGst: number;
  total: number;
  isCreditNote: boolean;
}

export function buildInvoice(params: {
  number: string;
  sellerState: string;
  buyerState: string;
  lines: InvoiceLine[];
}): Invoice {
  const lines: InvoiceLineComputed[] = params.lines.map((l) => {
    const lineTotal = round2(l.qty * l.unitPrice);
    const gst = computeGst({
      amount: lineTotal,
      rate: l.gstRate,
      sellerState: params.sellerState,
      buyerState: params.buyerState,
    });
    return { ...l, lineTotal, gst };
  });

  const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
  const totalGst = round2(lines.reduce((s, l) => s + l.gst.totalTax, 0));

  return {
    number: params.number,
    sellerState: params.sellerState,
    buyerState: params.buyerState,
    lines,
    subtotal,
    totalGst,
    total: round2(subtotal + totalGst),
    isCreditNote: false,
  };
}

/**
 * A credit note reverses an invoice — every amount (and its GST) negated, so the
 * ledger and the tax both unwind. Pass the new credit-note number.
 */
export function creditNote(invoice: Invoice, number: string): Invoice {
  const negGst = (g: GstBreakdown): GstBreakdown => ({
    ...g,
    taxableAmount: -g.taxableAmount,
    cgst: -g.cgst,
    sgst: -g.sgst,
    igst: -g.igst,
    totalTax: -g.totalTax,
    total: -g.total,
  });

  return {
    ...invoice,
    number,
    lines: invoice.lines.map((l) => ({
      ...l,
      qty: -l.qty,
      lineTotal: -l.lineTotal,
      gst: negGst(l.gst),
    })),
    subtotal: -invoice.subtotal,
    totalGst: -invoice.totalGst,
    total: -invoice.total,
    isCreditNote: true,
  };
}
