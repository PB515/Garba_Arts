# Discovery Brief — The Garba Arts (admin/CRM tool)

*Produced via the IDP's `discovery` skill, run live in chat before any code was written. Site name: `garba-arts-admin`.*

---

## Raw idea (verbatim, as first given)

> i am running a garba class i have 2 locations 6 batches
> I am right now in process of admission so lot of people come for admission and take demo some join pother dont i am currently tracking all in excel also who paid fees how much upi, cash
> also multiple user 2 atleast can input from core team no client or student show require purely admin site
> may be extracxt csv
> name number starting date fees status how fees are paid remarks etc

---

## Forced early questions — resolved

**Audience → device → network.** Core team only (5–8 people), no client/student access at all. Laptop-primary; occasional phone use for quick updates. No network concerns (not a low-end/rural-connectivity build).

**The one action = success.** Adding a new inquiry/lead fast, as it comes in (source: WhatsApp, Instagram, past-student referral, or a walk-in straight to a demo/class). This must be the lowest-friction action in the app.

**What data actually exists.** Currently tracked in Excel: name, number, starting date, fees, status, how fees are paid (cash/UPI), remarks. The business explicitly does **not** have a fixed enrollment pipeline — a person can enter the system at any stage (e.g. walk straight into class and join without ever being logged as an "inquiry" first). Status must be a flexible field/tag, not an enforced sequence (no forced Inquiry → Demo → Joined state machine).

**Goal vs. the ask.** The underlying goal is "easy to track and observe" — both (a) at-a-glance summary numbers and (b) fast search/filter over the full list. CSV export was independently flagged as important for deeper analysis outside the app. No request for anything client-facing was ever made — this is explicitly and only an internal ops tool.

**Constraints.**
- Timeline: tight — admissions are actively happening right now. Build fast and plain.
- Login: real, separate per-person login for each of the 5–8 core team members (not a shared login) — explicitly requested so activity/attribution is traceable per person via normal session identity, not a manual "entered by" picker.
- Accounts are created by the team itself (invite-only) — no public sign-up surface anywhere.
- Existing Excel data: the owner wants to import it; the file will be shared once the build reaches that point. Not a blocker to starting.

---

## Feature → IDP capability → craft tier table

| Feature | IDP capability | Craft tier | Perf/effort note |
|---|---|---|---|
| Add new inquiry/lead (fast entry, any source) | Custom form + data model, closest golden-path analog: `portal.md`'s staff-data pattern, adapted (no client accounts) | Essential | Fastest, most frequent action — minimal required fields |
| Student/lead record with flexible status (no locked pipeline) | Custom data model | Essential | Status = free tag/field, not an enforced state machine |
| Location (2) + Batch (6, each batch belongs to exactly one location) | Custom lookup data | Essential | Simple reference tables |
| Fees: one-time custom amount per student; multi-mode payments (cash/UPI, can split); partial/installment payments; auto balance-due | Custom `lib/logic` — payments modeled as line items summed against a fee total (adapted from the `billing-gst` module's line-item idea, but no tax/invoicing involved) | Essential | balance = fee − Σ(payments); needs its own small logic module + tests |
| Dashboard (inquiries this period, demo→joined conversion, headcount per batch/location, total collected/pending) | Custom reporting view over the same tables | Essential | Plain summary cards/numbers; no charting library needed for v1 |
| Smart table (search/filter/sort, e.g. "Batch 3, unpaid") | Standard admin table pattern | Essential | |
| CSV export | Custom export utility | Essential | First-class feature, not an afterthought |
| CSV import of existing Excel data | Custom one-time import utility | Essential | File pending from owner; not a v1 launch blocker, slot in when available |
| Per-person login (5–8 real accounts, invite-only, no public signup) | `portal.md`'s auth pattern (PART 7: auth → RLS → prove denial → features), scoped to staff-only, zero client accounts | Essential | Real Supabase auth; RLS restricts all data to authenticated staff |
| Any client/student-facing page | **Explicitly out of scope** | — | — |

**Capability axis note:** this is a **new site type** for the IDP's golden-paths catalog — a staff-only internal ops/CRM tool with zero external users, zero marketing surface, and zero client accounts. Closest existing recipe is `portal.md`, adapted down (no client-side half at all). Worth adding as a golden path to the master IDP after this build ships (retro → `BACKLOG.md` loop).

## Craft tier — scored

| Signal | Score | Why |
|---|---|---|
| Budget/timeline | 0 | Tight — admissions active now |
| Brand sells on | 0 | Pure utility, not brand/feeling |
| "Wow" matters to goal | 0 | Internal tool, not a persuasion surface |
| Audience devices | 1 | Laptop-primary, mixed with occasional phone |
| Content vs experience | 0 | Users came to enter/find data, not to experience anything |

**Total: 1/10 → Essential.** Reinforced independently by two hard overrides: *"content the user came to do/read"* (data entry) and the tight timeline. **No cinematic/motion craft anywhere in this build** — at most `reveal`/`smooth-scroll` if it even comes up; there is no public-facing surface to apply craft to in the first place.

## Site map (all Essential tier, 100% staff-only)

| Route | Purpose |
|---|---|
| `/login` | Per-person credential login |
| `/dashboard` | Summary numbers (inquiries, conversion, headcount, fees collected/pending) |
| `/students` | Add + list + filter/search all records |
| `/students/[id]` | Record detail: status, location/batch, payment history (line items), remarks |
| CSV export | Button/action on the students list, not a separate marketing-style page |
| CSV import | One-time admin utility, run once the Excel file is shared |

## Perf budget

Trivial — internal tool, laptop-primary, no public traffic, no network constraint. Standard Next.js defaults are more than sufficient; no special performance strategy required.

## What's explicitly out of scope

- Any client-facing, student-facing, or public page of any kind.
- Public sign-up / self-registration — accounts are invite-only, created by the core team.
- Enforced pipeline/status state machine — status is deliberately flexible.
- GST/invoicing — fees are tracked as simple payments, not formal invoices.
- Cinematic/motion craft — this is a pure utility tool (Essential tier, confirmed by score + hard overrides).

## Open items still to resolve during build (not blockers to starting)

1. **Excel import file** — owner will share it; import utility should be built to match whatever columns actually show up in that file (name, number, starting date, fees, status, payment mode, remarks were named, but confirm exact columns/format once received).
2. **Batch/location naming** — the 2 locations and 6 batches need their actual names/labels before the lookup tables are seeded (placeholder data until then, never fabricated real-sounding names).
3. **Team member list for accounts** — need the actual 5–8 names/emails to create invite-only accounts.
