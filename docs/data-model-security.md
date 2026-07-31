# Data Model & Security — garba-arts-admin

*Companion to [`app-prd.md`](app-prd.md). Schema plus, for every table, exactly who may read/write which rows. Deny by default — RLS specified, not assumed. Migration format: the IDP's plain-SQL `-- migrate:up` / `-- migrate:down` convention, one file per table/change under `template/db/migrations/`.*

---

## Security posture (applies to every table below)

- **RLS is enabled on every table, no exceptions.**
- **The `anon` role gets zero grants anywhere — including `navratri_registrations`, the one table a public page writes to.** `/navratri` (proof-of-concept public pass registration, no login — see `app-prd.md`'s No-List update) writes through a **server action using the service-role client**, not a direct anon RLS grant. This matters for a real reason: the price must be computed server-side from the trusted clock, never trusted from the client — a direct anon-writable table would let someone submit their own price via a raw API call. `verify-denial.ts` proves both halves: the public page can write (tested live), and a direct anon API call cannot (RLS still denies it).
- **Roles, not flat permissions, as of `0008_roles_and_location_scoping.sql`.** The original v1 model (every authenticated user equal) held only through the first live pass — the owner then asked for a real split: `super_admin` (owner + family, sees everything merged) and `location_admin` (tied to exactly one location, zero access — not even read — to any other location's `students`/`payments`). `locations`/`batches`/`events`/`event_registrations`/`navratri_registrations`/`audit_log` are **not** location-scoped (not asked for yet; `events` explicitly flagged by the owner as "need to verify first"). `is_super_admin()` / `staff_location_id()` are `SECURITY DEFINER` helpers reading a new `staff_roles` table, same pattern as the IDP's `has_role.sql`.
- **Soft-delete via `deleted_at` / `deleted_by`** on every mutable table — normal "delete" sets these columns; normal queries filter `deleted_at is null`.
- **Permanent removal is a real `DELETE`**, gated in the app layer behind its own confirmation step, and **always followed by a `writeAuditLog()` call** (the IDP's `lib/patterns/audit-log.ts`), never preceded — writing the log first would leave a false "deleted" trail if the delete then failed (a real bug hit and fixed during the students build, see `CLAUDE.md`'s Phase 2 log).
- Every insert/update captures `created_by` / `updated_by` from the authenticated session (never client-supplied) — this is how "who entered/edited this" attribution works, per the discovery decision to use real per-person logins instead of a manual picker.

---

## Tables

### `staff_roles`
The role/location-assignment table. Never written to by the app itself — only `tooling/create-account.ts` (service-role) sets it, so there's exactly one place role assignment happens.

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid, pk, fk → auth.users | One role per user |
| `role` | text, not null, check in ('super_admin','location_admin') | |
| `location_id` | uuid, fk → locations, nullable | Required (constraint-enforced) when `role = 'location_admin'`; must be null for `super_admin` |
| `created_at` | timestamptz, default now() | |

**RLS:** authenticated: read-only (every user can read the role table — the app needs it for UI decisions like hiding the Fees link). No authenticated insert/update/delete — only `service_role` can write.

### `locations`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `name` | text, not null, unique | Placeholder values until the real 2 names are confirmed |
| `created_at` | timestamptz, default now() | |

**RLS:** authenticated: full read/write. anon: none.

### `batches`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `location_id` | uuid, fk → locations, not null | Each batch belongs to exactly one location (confirmed) |
| `name` | text, not null | Placeholder values until the real 6 names are confirmed |
| `created_at` | timestamptz, default now() | |

**RLS:** authenticated: full read/write. anon: none.

### `students`
The core record — an inquiry/lead and, later, a student, are the same row (status changes in place; no separate "lead" table, since a person can enter at any stage per the discovery decision that status is not an enforced pipeline).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `name` | text, not null | |
| `phone_number` | text, not null | |
| `source` | text | e.g. whatsapp / instagram / referral / walk-in / other — free text, not an enforced enum (sources will vary) |
| `referred_by` | text, nullable | The referrer's name, captured when `source = 'referral'`. Added after owner feedback on the first live pass. |
| `status` | text | Free tag, no enforced transitions. **The 3-color simplification, confirmed** (replaces the earlier 6-value scheme): `follow_up` (yellow, "ask again"), `dropped` (red, not interested at any stage), `joined` (green). A record never leaves the Inquiry list once created — it's a permanent historical log; "joined" just means it *also* shows up in the Joined list. Still plain text, not a CHECK constraint (status stays a flexible field, not an enforced pipeline). |
| `location_id` | uuid, fk → locations | Also the location-scoping key for RLS — see the security posture note above |
| `batch_id` | uuid, fk → batches | |
| `inquiry_date` | date, nullable | The date this lead/inquiry came in — renamed from `starting_date` after owner feedback that the original name read as "class start date," which wasn't the intent. Defaults to today on the add-inquiry form but stays editable (backdateable) for retroactive entry. |
| `fee_total` | numeric(10,2), nullable | One-time, custom per student (confirmed). Null until a fee is agreed |
| `demo_fee_amount` | numeric(10,2), nullable | A small, separate fee for attending the trial/demo lecture — independent of `fee_total` and independent of outcome (charged whether the lead ends up joined or dropped). Added `0008_roles_and_location_scoping.sql`. |
| `demo_fee_paid` | numeric(10,2), not null, default 0 | |
| `remarks` | text | Free text (confirmed — no structured follow-up/reminder field for v1). Also where the "why" behind a dropped lead lives (took demo but not interested vs. never took demo vs. filled the form and went cold) rather than more status enum values. |
| `created_by` | uuid, fk → auth.users, not null | From session, never client-supplied |
| `created_at` | timestamptz, default now() | |
| `updated_by` | uuid, fk → auth.users | |
| `updated_at` | timestamptz | |
| `deleted_by` | uuid, fk → auth.users, nullable | Soft-delete |
| `deleted_at` | timestamptz, nullable | Soft-delete |

**RLS:** `is_super_admin() or location_id = staff_location_id()`, both for read and write (`with check` mirrors `using`, so a `location_admin` can't insert/update a row into another location either — attempting it is a straight RLS rejection, not a silent no-op). anon: none. Hard `DELETE` is included in the same policy (both roles can permanently remove within their access), gated in the app UI behind a confirmation step and an `audit_log` entry.

### `payments`
Line items, not a single "amount paid" field — required because fees can split across modes and installments (confirmed).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `student_id` | uuid, fk → students, not null | |
| `amount` | numeric(10,2), not null | |
| `mode` | text, not null | `cash` \| `upi` (extend if a third mode ever appears — free text with these two as the only UI options for now) |
| `paid_date` | date, not null | |
| `remarks` | text, nullable | e.g. "part payment" |
| `created_by` | uuid, fk → auth.users, not null | |
| `created_at` | timestamptz, default now() | |
| `deleted_by` | uuid, fk → auth.users, nullable | Soft-delete (correcting a mis-entered payment) |
| `deleted_at` | timestamptz, nullable | |

**RLS:** location-scoped through the parent student — `is_super_admin() or exists (select 1 from students s where s.id = payments.student_id and s.location_id = staff_location_id())`. anon: none. Same hard-delete-with-audit-log rule as `students`. Also visible on an individual student's own detail page regardless of role (that's "individual," not "combined") — the combined view (`/fees`, CSV export) is a separate, app-level, super-admin-only restriction on top of this (RLS wouldn't naturally block a `location_admin` from combining just their own location's numbers — the restriction there is "no combined view at all for them," enforced in the route, not the database).

**Derived, not stored:** `balance_due = students.fee_total - sum(payments.amount where deleted_at is null and student_id = students.id)`. Computed in a view or query, never written to a column — this is the "auto balance-due" the discovery brief called for, and storing it redundantly would let it drift out of sync with the payment log.

### `audit_log`
Already the IDP's standard shape (`lib/patterns/audit-log.ts`) — append-only, never updated or deleted.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `actor_id` | uuid, fk → auth.users, nullable | |
| `action` | text, not null | e.g. `student.permanently_deleted`, `payment.permanently_deleted` |
| `entity` | text, not null | e.g. `student`, `payment` |
| `entity_id` | uuid, not null | |
| `meta` | jsonb | Snapshot of the row being removed, so the record isn't fully lost even after a hard delete |
| `created_at` | timestamptz, default now() | |

**RLS:** authenticated: insert + read only. **No update, no delete for anyone** — append-only is enforced at the RLS level, not just by convention.

### `events` / `event_registrations`
Admin-entered (staff logs who's coming after a student tells them), not public — same flat RLS/grants as every other table. `event_registrations.friend_count` + 1 = headcount per registration. Permanent-delete of an event cascades its registrations first (no `ON DELETE CASCADE` — done explicitly in `events/actions.ts` so each deletion is deliberate and audit-logged).

### `navratri_registrations`
The one table with a public write path — see the security posture note above. Proof-of-concept: pricing/dates in `lib/navratri-config.ts` are placeholders.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `representative_name` | text, not null | The group's contact person — not an individual student account |
| `representative_phone` | text, not null | |
| `pass_count` | integer, not null, `>= 1` | How many passes this registration covers |
| `price_per_pass` | numeric(10,2), not null | Snapshotted at submission time from the tier active then — never recomputed later, so a price-tier change doesn't retroactively alter past registrations |
| `total_amount` | numeric(10,2), not null | `price_per_pass * pass_count`, computed server-side |
| `amount_paid` | numeric(10,2), not null, default 0 | Logged manually by staff (no payment gateway, per decision #24) |
| `remarks`, `deleted_by`, `deleted_at`, `updated_by`, `updated_at` | | Same shape as other tables |

No `created_by` — there's no authenticated session to attribute a public submission to.

---

## Auth model

Real per-person Supabase Auth accounts, **invite-only** (`tooling/create-account.ts`, service-role, never public self-signup). Every account now needs a `staff_roles` row, assigned at creation time by the same script:

```bash
npm run create-account -- <email> <password> super_admin
npm run create-account -- <email> <password> location_admin "Aliya"
```

Two roles: **`super_admin`** (owner + family — sees everything merged across locations) and **`location_admin`** (tied to exactly one location — full CRUD within it, zero access, not even read, to any other location's students/payments). This reverses the original flat-permission model (every user equal) from the first live pass — the owner asked for a real split once the app was actually in use. `create-account.ts` is safe to re-run against an existing email (it looks the account up and re-assigns the role instead of failing), which also makes it the tool for "fix someone's role."

## Cross-user denial proof (required before any feature ships)

Two separate gates, both must pass before any feature that touches these tables:

1. **`tooling/verify-denial.ts`** — the anon-vs-authenticated boundary. Proves an unauthenticated request is refused, read and write, on every table (12 checks across 7 tables as of the Navratri feature).
2. **`tooling/verify-location-denial.ts`** — the `location_admin`-vs-`location_admin` boundary, added when the role split shipped. Signs in as real test accounts (an Aliya admin, a Sportsclub admin, and the super-admin) and proves: each sees their own location's students/payments; neither sees the other's, for both read *and* write; the super-admin sees both merged. This is a materially different property from #1 — passing #1 alone would not have caught a bug where two authenticated users can see each other's location.

Both are pass/fail gates, not a suggestion, per the IDP's app golden path — extended here because the golden path's own "cross-user denial" language undersold what this build actually needed (cross-*location*-among-authenticated-users, not just anon-vs-authenticated).

## Open items (carried from discovery / App PRD, still unresolved)

1. Excel import column mapping — depends on the file, not yet shared.
2. Real names/emails for the location admins beyond the owner + family super-admins, if there end up being more than one location admin per location.
3. Whether `events`/`event_registrations` also need location-scoping — the owner flagged "need to verify first" rather than confirming either way.
