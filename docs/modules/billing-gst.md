# Billing & GST — Reusable Module

*The block and the steps for **any** site that takes a payment and (in India) charges GST — a store, a SaaS subscription, an LMS paywall, paid bookings. Capture it once here so it's a solved, repeatable capability, not re-figured each build.*

**Status:** v5 reference, written from research + the e-com scoping. The e-commerce build is its first real exercise; whatever survives contact gets hardened into the verified **billing-gst skill** afterward (per the Skills SOP — the build proves it before it becomes a skill). Until then, this doc guides the build.

**Pairs with:** `ecommerce-build-requirements.md` (the first build that exercises this), the Skills SOP (where the agent-facing parts become a skill), and the toolkit's financial/legal safety rail (a CA verifies before live).

---

## What's reusable vs what changes per site

- **Reusable (the block):** the tax data model, place-of-supply logic, the compliant-invoice generator, credit-note-on-refund, and the gateway-integration pattern (hosted checkout + webhook + idempotency). Identical on a store, a subscription, or a paywall.
- **Per-site (data, not code):** your GSTIN + registered state; the product/plan list with each one's HSN code + GST rate; and whether GST applies at all (India vs not).

The block is the same every time. Only the data changes.

---

## How it plugs into a build (the process)

This module isn't a separate build phase — it enters the toolkit flow at two points, with a human track running alongside.

1. **At doc-gen (Step 3)** — feed this module to `doc-gen-master` as a *fourth input* beside the Playbook (structure), the Research (strategy), and the Brief (substance). The generated docs then come out already carrying it: the data-model doc has products-with-HSN-and-rate, orders-with-a-tax-snapshot, and an invoices table; the feature spec has the checkout that captures the shipping address → computes place-of-supply → hands to the gateway, plus the admin tax-settings page. GST isn't bolted on afterward; it's in the spec the agent builds from.
2. **At build (Step 5)** — the agent implements those docs applying the five design rules below (admin-editable rates, snapshot-on-invoice, place-of-supply, card-data-off-server, the adapter boundary). The skills library is copied in as usual.
3. **On the human track, in parallel** — the founder runs the setup steps (GSTIN, the Razorpay/Shiprocket accounts, the CA-verification gate before live). The agent never touches accounts or keys.
4. **After it's proven** — the agent-facing half distils into the `billing-gst` skill (see the end of this doc), so the *next* billing site self-activates it with no doc needed. That's the end-state; the first build is what earns it.

---

## Core design rules (non-negotiable)

1. **Rates and HSN are admin-editable data — never hard-coded.** Every product/plan has an editable GST-rate and HSN field in the admin; a tax-settings area holds your GSTIN, registered state, and default rate. *Why:* GST rates get revised by the government and products get reclassified — that must be an admin edit, not a code change and redeploy. *(Your "admin can change the GST % and number.")*
2. **Snapshot the rate onto the invoice at time of sale.** Compute tax at checkout and write the rate + CGST/SGST/IGST amounts onto the order/invoice row. An invoice is a legal record of what was actually charged — editing a product's rate later affects **future** invoices only and must never rewrite a past one.
3. **Place of supply decides the split.** Your registered state vs the buyer's shipping state → same = CGST + SGST, different = IGST. Computed at checkout from the shipping address.
4. **Card data never touches your server.** Gateway-hosted checkout only. Your server holds API keys (server-side) and verifies the webhook — nothing more.
5. **A CA verifies before live.** Rates, HSN, invoice format, and the place-of-supply logic are human-checked. The site does *point-of-sale* GST (charge + invoice); *filing* (GSTR returns) is separate off-site accounting — don't try to build it.

---

## Which integrations, and how

**Payments — Razorpay (India primary).** UPI, cards, netbanking, wallets, COD.
*How:* hosted checkout collects the payment → your server creates the order → a Razorpay **webhook** confirms payment → you mark the order paid. Make it **idempotent** (handle duplicate/late webhooks; never mark paid from the client alone). Keys server-side; start with test keys (`rzp_test_…`).
*Alternatives:* Stripe, Cashfree, PayU.

**Shipping + label/invoice-in-box — Shiprocket (India primary).** Generates the shipping label with AWB barcode (print and stick on the box), the packing slip/invoice for inside, pickup scheduling, tracking, customer SMS/email, COD, and returns.
*How:* REST API (auth → create order → request AWB → fetch tracking); a Shiprocket MCP server also exists, which fits the stack.
*Alternatives:* Delhivery direct, iThink Logistics, NimbusPost.

**(Optional) GST invoicing.** Razorpay or Zoho can produce GST invoices; or generate your own from the snapshot data — more control, and the path the toolkit takes.

---

## Migration — don't get locked in (your "if we want to migrate" point)

Keep **your** data model as the source of truth: orders, invoices, customers, and tax snapshots live in **your** database, not the provider's dashboard. Each provider sits behind a thin **adapter** — one module that talks to Razorpay, one that talks to Shiprocket. Switching providers later means rewriting that one adapter; your checkout, admin, invoices, and history are untouched.

Two rules enforce it: never scatter provider-specific calls through the codebase, and never let data live *only* in the provider's dashboard. That's what makes Razorpay → Stripe, or Shiprocket → Delhivery, a swap rather than a rebuild.

---

## The human setup steps (what YOU do — not the agent)

1. **Register for GST → get your GSTIN** (mandatory for online sellers regardless of turnover). Set your registered state in tax-settings.
2. **Classify every product: HSN code + GST rate**, CA-verified. Enter them in the admin.
3. **Create the Razorpay account**; complete KYC for live; start in test mode. You hold the keys — not the agent.
4. **Create the Shiprocket account**; fund it when you want real labels and pickups.
5. **Generate a sample invoice → have the CA verify** the format and the tax split on both an intra-state and an inter-state order.
6. **Returns → issue a credit note** (reverses the GST) within the same financial year.
7. **Test → live:** swap test keys for live keys once it's a registered business. Filing (GSTR) is your CA's / accounting tool's job, off-site.

> Boundary: account creation, KYC, and entering API keys are yours to do. The agent builds and wires; it never creates accounts or enters credentials.

---

## What to do when something changes

- **GST rate revised, or a product reclassified** → admin edits the field. Future invoices update; past ones stay as issued. No redeploy.
- **Your GSTIN or registered state changes** → edit the tax-settings area.
- **Switching payment or courier provider** → rewrite that one adapter; the rest of the site is untouched (see Migration).

---

## Relationship to the skills library

This doc is the **spec + the human steps**. The **agent-facing patterns** inside it — the tax data model, place-of-supply logic, the invoice generator, the gateway webhook/idempotency pattern, and the adapter boundary — become the verified **billing-gst skill** *after* the e-com build proves them (lift + trigger, per the Skills SOP). Don't pre-bake the skill; the build validates it first. The human steps above stay here permanently — they're not something the agent does.
