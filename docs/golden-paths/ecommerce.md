# Golden Path — E-commerce

*Catalog · cart · checkout · payments · OMS. Source: Bugadi.co (oxidised-jewellery store + admin/OMS).*

**Use when:** the site sells products with stock, prices, tax, and order fulfilment.

## Phase order

```
0. Setup + tokens (anti-AI-look) + content-model decision (products = CMS-editable)
1. Schema + migrations — products, variants, stock movements, orders, order_items
   · stock is a LEDGER (lib/logic/stock-ledger), not a mutable field
2. Catalog (public) — list + detail, real empty states, image plan (06b)
3. Cart — client state; price + GST computed server-side at checkout (never trust client)
4. Checkout + payments — lib/integrations/payments adapter; compute GST with
   lib/logic/tax BEFORE creating the order; webhook is IDEMPOTENT (lib/logic/idempotency)
5. Orders / OMS (admin) — security-first: auth → RLS (staff role via has_role) →
   PROVE a customer can't read another's order → then the admin screens
6. Invoices — snapshot GST onto each invoice (lib/logic/invoice); credit note reverses it
7. Polish + deploy (env-validate, deploy-check, smoke test on the live URL)
```

## Pulls in

- Logic: `tax` · `stock-ledger` · `idempotency` · `invoice` (all tested)
- Integrations: `payments` (Razorpay stub) · `shipping` (Shiprocket stub)
- Modules: `billing-gst` · `adapter-boundary` · `content-model`
- Patterns: `two-query-write` (order + items), `audit-log` (status changes), `empty-state`

## Gotchas (from Bugadi)

- **Stock is a ledger** — never a column you mutate; oversell is a real bug.
- **Snapshot GST** onto the invoice at sale time; rates change.
- **Webhook idempotency** — payment callbacks fire twice; dedupe by payment id.
- **Single-brand store** — no marketplace TCS; don't over-model.
- Card data never touches your server; the webhook confirms payment.
