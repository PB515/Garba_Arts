# tests/

*Pre-written unit tests for the **risky pure logic** — the calculations that, if wrong, cause real damage (wrong tax, oversold stock, double charge). Run with `npm test` (Vitest).*

| Test | Guards | Logic |
|---|---|---|
| `tax.test.ts` | GST + place-of-supply (intra → CGST+SGST, inter → IGST; rounding) | `lib/logic/tax.ts` |
| `stock-ledger.test.ts` | running balance, oversell protection | `lib/logic/stock-ledger.ts` |
| `idempotency.test.ts` | run-once-by-key, dedupe retries | `lib/logic/idempotency.ts` |

These are **reference implementations** — adapt the rate tables / rules per site, keep the tests. Pure functions, no DB.

For **DB-backed** verification (seed real data → assert end-to-end → teardown clean), use the harness at `tooling/verify` (`npm run verify:selftest`) against the non-prod local DB — the verify-then-rollback rail.
