# CSV export plan + audit follow-ups

*Written instead of code, per the owner's request: identify the problem in detail first, propose how to solve it, no edits until reviewed. Covers: (1) the CSV-download request for the Inquiry and Fees tabs, (2) a detailed explanation of findings #4 and #5 from the earlier full audit (the Cash+UPI null-split risk, and the unused `updateRegistration` function) plus recommended fixes, and (3) opening the events location-scoping question (the long-open item from decision #27).*

---

## 1. CSV export on Inquiry and Fees

### Current state

CSV export already exists today, but only in one place: a button on the **Joined** tab, pointing at `/api/export/students`. It's restricted to `super_admin` two separate ways — the button itself is only rendered if `isSuperAdmin(staffRole)`, and the API route independently re-checks the same thing before doing anything, so a `location_admin` can't reach it just by typing the URL (confirmed live in the last audit: a signed-in Aalay admin hitting the route directly got a 403 JSON error, not a page).

The route exports **one row per student**: Name, Phone, WhatsApp, Source, Source detail, Status, Location, Batch, Inquiry date, Fee total, Paid, Balance, Demo fee amount, Demo fee paid, Remarks, Created at. It already reads four filter params from the URL — `location`, `batch`, `status`, `q` — and narrows the export to match.

**A real bug in the existing button, found while planning this:** the Joined tab's "Export CSV" link is a plain, static `href="/api/export/students"` with no query string at all. It does not carry through the Joined tab's own current filters (search box, location/batch dropdowns, or the "Pending fees only" checkbox). So today, clicking Export CSV from Joined always exports the same thing regardless of what's currently filtered on-screen — it silently ignores the filters entirely. This is the opposite of "should work with all features," and needs fixing alongside the two new buttons, not left as-is.

### What each tab needs

**Inquiry tab — straightforward.** Reuses the exact same route and row shape as it already exists. Add an "Export CSV" link, `super_admin`-only (identical gating to Joined's button), that carries the Inquiry page's current `q`, `location`, `batch`, `status` params into the export URL. No backend changes required — the route already understands all four of these.

**Joined tab — a fix, not just an addition.** The existing link needs to actually carry `q`, `location`, `batch` from the page's live filters, plus an explicit `status=joined` (without it, the export wouldn't be scoped to joined students specifically the way the page itself is). The Joined tab also has a `pending=1` filter (Not Paid / Half Paid) that the export route doesn't understand at all today — since fee status is *derived* (computed from a separate join against `payments`, not a stored column), supporting this means computing `feeStatus()` per student inside the export route too (mirroring what the Joined page already does) and dropping any row that isn't pending when the flag is present.

**Fees tab — needs a real decision, not just plumbing.** This is the one that isn't a simple copy-paste of the other two, because the Fees page isn't a list of students. Its filterable content is a **payment log** — one row per payment (date, student, location, batch, mode, amount, remarks) — filtered by `location` / `batch` / **`mode`** (payment mode: Cash / UPI / Cash+UPI). The existing student-export route has no concept of payment mode at all, and exports one row per *student*, not per *payment*.

Two honest options:

- **Option A — reuse the student export as-is.** Point the Fees button at `/api/export/students`, passing only `location`/`batch` and dropping `mode` (since it doesn't map onto a per-student row). Zero new backend code, fastest to ship. Downside: it silently ignores the Mode filter — someone filters to "UPI only" on the Fees tab, exports, and gets every student regardless of payment mode, with no per-payment detail at all. Doesn't actually match "what's on screen."
- **Option B — a new payment-log export (recommended).** A new route, e.g. `/api/export/payments`, exporting one row per payment — Date, Student, Location, Batch, Mode, Cash amount, UPI amount, Amount, Remarks — filtered by `location`/`batch`/`mode`, matching the "All payments" table already on the Fees page exactly. Same double-gated `super_admin`-only pattern as the existing route (page-level button + independent route-level check). This is genuinely new code — a new file, roughly the same shape and size as the existing export route — not a big lift, but not just wiring a button either.

**Recommendation: Option B.** It's the only one that actually satisfies "should work with all features" for this specific page, since the Mode filter is the one thing that makes the Fees tab's filtering meaningfully different from Inquiry/Joined's.

### Access control (all three, confirmed unchanged)

Same double-check pattern throughout, nothing new to design: the CSV link is only rendered when `isSuperAdmin(staffRole)` is true (page-level), and every export route independently re-checks `isSuperAdmin` itself before doing any query (route-level) — so hiding the button isn't the actual security boundary, the route's own check is. A new `/api/export/payments` route would need this exact same independent check, not just inherit the page's gate.

### Summary of concrete changes (for when this is approved)

1. `lib/form.ts` — small `buildQueryString()` helper to carry current filters into each export link (shared by all three buttons).
2. `api/export/students/route.ts` — add `pending` param support (computes `feeStatus()` per row, filters if set).
3. `app/students/page.tsx` (Inquiry) — add the Export CSV button, passing `q`/`location`/`batch`/`status`.
4. `app/students/joined/page.tsx` — fix the existing button to pass `q`/`location`/`batch`/`pending` + hardcoded `status=joined`.
5. New `api/export/payments/route.ts` — payment-log export, `location`/`batch`/`mode` filters, `super_admin`-gated.
6. `app/fees/page.tsx` — add the Export CSV button, pointing at the new route, passing `location`/`batch`/`mode`.

---

## 2. Explaining concern #4 — the Cash+UPI null-split risk

**The setup:** `payments` has `amount` (always required — the total), `mode` (`cash` / `upi` / `cash_upi`), and `cash_amount`/`upi_amount` (nullable, meant to be filled in only when `mode = 'cash_upi'`).

The Fees tab does two different things with this data:

- **"Collected by payment mode"** (the older breakdown) sums `amount` grouped by `mode`. It never looks at `cash_amount`/`upi_amount` at all — so this bucket is correct no matter what.
- **"Total Cash" / "Total UPI"** (the newer reconciliation) is different: for plain `cash`/`upi` rows it adds `amount` directly, but for `cash_upi` rows it adds `cash_amount ?? 0` to Total Cash and `upi_amount ?? 0` to Total UPI — deliberately *not* `amount`, so a split payment's money lands in the real bucket it belongs to instead of a vague third category.

**The risk:** if a `cash_upi` row ever exists with `cash_amount`/`upi_amount` left `null` (while `amount` is still a real number, say ₹500), then "Collected by payment mode" would still correctly show that ₹500 under "Cash + UPI" — but "Total Cash" + "Total UPI" would silently **not include it at all**, since `null ?? 0` is `0`. No error, no warning — the two totals would just quietly stop adding up to Total Collected by exactly the missing amount, and the only way to notice would be doing the arithmetic by hand.

**Why it can't happen today:** the only way to create a payment is `addPayment()` in `students/actions.ts`, which explicitly rejects the submission — throws before touching the database — if `mode = 'cash_upi'` and either `cash_amount` or `upi_amount` is missing or ≤ 0. And there's no edit path for a payment once created (only Archive or Permanently remove exist) — so a correctly-created payment can't later be corrupted through the app either. I confirmed this by querying the actual data directly: zero `cash_upi` rows exist with a null split.

**Why it's still worth remembering, not dismissing:** the two ways this *would* become reachable are both already things on the roadmap, not hypothetical:

1. **The Excel/CSV import** (an explicitly open item — "pending from the owner" in the PRD). Historical payment data from the old sheet almost certainly didn't track a cash/UPI split the same way this app does. If any imported rows get mapped to `mode = 'cash_upi'` without a known split, they'd land with `cash_amount`/`upi_amount` null by default — and the reconciliation would break the moment the import runs, silently.
2. **Manual database correction** — if a data mistake ever gets fixed directly in the database rather than through the app (by either of us), the same gap applies.

**What I'd suggest when the import gets built** (not something to act on now): either require the import to decide a real split for any row mapped to `cash_upi`, or default any row where the split is genuinely unknown to a single mode (`cash` or `upi`) instead of `cash_upi` — that mapping decision belongs to whoever works through the actual Excel columns, not something to guess at in advance.

### Recommended fix

Don't just remember to be careful later — close the gap permanently with a database-level guarantee, so it can't happen regardless of what creates the row (this app today, a future import script, or a manual SQL correction nobody thought to double-check). A new migration adding a `CHECK` constraint on `payments`:

```sql
alter table payments add constraint payments_cash_upi_split_check
  check (
    (mode = 'cash_upi' and cash_amount is not null and upi_amount is not null and cash_amount + upi_amount = amount)
    or (mode <> 'cash_upi' and cash_amount is null and upi_amount is null)
  );
```

What this guarantees, enforced by Postgres itself rather than trusted to application code:
- A `cash_upi` row can never be saved with a missing split — not through this app, not through a bulk import, not through a manual `UPDATE`.
- The two halves must actually sum to the total `amount` — catches a typo like `cash_amount=200, upi_amount=200, amount=500` that the current app-level check wouldn't catch (it only checks both are `> 0`, not that they add up correctly).
- A plain `cash`/`upi` row can never accidentally carry stray split values left over from something else.

This is stronger than the alternative of making the Fees tab's math "defensive" (e.g. detecting a null split and showing a warning line) — that would only ever catch the problem after bad data already exists. A constraint prevents the bad data from being written in the first place, which matters most for the import path, since nobody will be reviewing that data row-by-row as it's inserted.

---

## 3. Explaining concern #5 — `updateRegistration` is dead code

`events/actions.ts` contains a fully-built function, `updateRegistration(registrationId, eventId, formData)`. It validates the registrant's name, updates name/phone/fee amount/amount paid/remarks, and replaces the attendee list wholesale (deletes the existing attendees for that registration, re-inserts from the submitted list) — a complete, correctly-written "edit an existing registration" action, built to the same standard as everything else in that file.

**The problem:** nothing calls it. I searched the entire `template/` tree for `updateRegistration` and the only match is its own definition — no form, no button, no edit page references it anywhere.

**What this means in practice:** once a registration is added on `/events/[id]`, there is currently no way to fix a mistake in it — a misspelled name, a wrong phone number, an amount typo, or an attendee list that needs correcting — except **Archive** (hides it, doesn't fix anything) or **Permanently remove** (deletes it outright, so fixing a typo means losing the original record and re-entering everything from scratch, including its original creation timestamp).

Two honest paths, and this is genuinely a product decision, not a technical one:

- **Path A — build the missing edit UI.** Add an "Edit" action per registration row, wired to the already-correct `updateRegistration`. Genuinely low-effort specifically *because* the hard part (the server action) is already written and correct — this would be UI-only work.
- **Path B — delete it as dead code.** If the intended workflow really is "mistakes get fixed by archiving and re-adding, never editing in place," then this function shouldn't exist unused — dead code is a quiet liability (e.g. if the `event_attendees` schema changes later, nobody will notice this function also needed updating, since nothing ever exercises it to catch the drift).

I didn't pick either, since it changes what staff can actually do day-to-day with event registrations, and it's grouped with the other event-related items (the attendee dynamic-rows redesign) you said you'd give direction on together.

### Recommended fix

Build the edit UI (Path A) — this matches the owner's own lean, for the same reason: every other entity in this app can already be corrected without delete-and-redo (students have a full edit page; a mis-logged payment can be archived and re-logged without losing the student record around it; events themselves are editable). A registration being the one thing where a typo means "delete it and start over, losing the original creation record" is inconsistent with how the rest of the app treats mistakes, and it's genuinely cheap here — the hard part, `updateRegistration`, is already written, already correct, already matches the same validation and "replace the attendee list wholesale" pattern used at creation. This is UI-only work.

**Proposed shape** (for when this is approved, not built yet): an "Edit" link next to each registration row on `/events/[id]`, next to the existing Archive/Remove actions. Clicking it swaps that row into an inline editable form — the same fields as "Add registration" (registrant full name, phone, fee amount, amount paid, attendee names, remarks), pre-filled with the registration's current values — with Save/Cancel buttons, submitting to the existing `updateRegistration` action. This needs one new small client component (matching the toggle-state pattern already used for `status-quick-set.tsx` and `payment-mode-fields.tsx`) to manage "is this row currently in edit mode." No schema or action changes required — `updateRegistration` doesn't need to change at all, it's already correct and already unused, just waiting for a caller.

Note: once the event-attendee redesign (dynamic name/phone/WhatsApp rows, still queued in `docs/pending-feedback.md`) lands, this edit form's attendee section should use whatever that redesign produces rather than the current one-name-per-line textarea, so the two stay consistent — worth sequencing the edit UI after that redesign, or building both together, rather than building the edit form against the textarea now and having to redo it right after.

---

## 4. Events location-scoping — opening the long-standing open item

*This is the question `app-prd.md` has carried since decision #27 as explicitly unresolved: "the owner explicitly flagged that `events` scoping needs separate verification before deciding either way; don't assume it should follow students without asking." The owner has now started resolving it. Recorded here as an open item being worked through, not yet a locked decision — nothing built.*

### What the owner said, and how it resolves the fork

Round 1: "now we will talk about event and that is split and can be seen by combined by admin only" — read back as: `location_admin` sees only their own location's slice of an event's registrations; `super_admin` sees the combined picture across both. Same pattern already shipped for the Fees tab (decision #28: individual visible to the location's admin, combined restricted to the owner).

Round 2, clarifying which of the two shapes from the original fork this actually is: **"event can occur at a party plot or some other place — location where event is occurring does not matter. how much student has registered from aalay and from sportsclub matters."** This confirms **Option 2** cleanly: the event's own venue is irrelevant to the app (it's not one of the two dance-class locations, so `events` itself does not need a `location_id`). What matters is attributing each *registration* to Aalay or Sportsclub, so both locations can register for the same event and each admin sees their own location's count while the owner sees both.

### What this actually requires — a real gap, not just an RLS policy

`event_registrations` today has **no location field at all**, and — this is the part worth being explicit about — the registrant isn't linked to an existing `students` row either. Per decision #23, registration was deliberately built as free-text (`registrant_name`, `registrant_phone`) so that a student's friends, who aren't enrolled anywhere, could also be registered. That means "which location does this registration belong to" can't be inherited automatically from a student record the way it can for `payments` (which does hang off `students.location_id` via a foreign key) — it needs to be its own new field, set explicitly at the point of registration.

Concretely, if this is built:
- **New column** on `event_registrations`: `location_id` (references `locations`).
- **RLS rewrite** for `event_registrations` (and `event_attendees`, inheriting via `registration_id`) to the same location-scoped pattern already used for `students`/`payments` — `is_super_admin() or location_id = staff_location_id()`.
- **Admin "Add registration" form** (`/events/[id]`) gains a Location field — locked to their own location for a `location_admin` (same UX as the student add form already does), a real dropdown for `super_admin`.
- **Event detail page summary** — currently one combined "Total registered / Fee expected / Collected" block — would need a by-location breakdown for `super_admin` (mirroring the Fees tab's "Collected by location" panel), while a `location_admin` viewing the same event would only see their own location's registrants and totals.

### The one question still genuinely open

The **public self-registration page** (`/events/[id]/register`) is filled out by someone with no login and no known location. Two different answers are both plausible, and they lead to different builds:
- The public form also asks "Aalay or Sportsclub?" — meaning public registrants are still assumed to belong to one of the two dance-class locations.
- Public self-registration is for people outside the two-location system entirely (general community, walk-ins to a public event), and only *admin-entered* registrations carry a location — public registrations would need some explicit "unattributed" handling (a third bucket, or simply excluded from the by-location breakdown and only counted in the combined total).

**Not deciding this here — flagging it as the one piece still needed before this is buildable**, since it changes whether the public form's fields change at all.

---

## 5. Consolidated build plan — SQL and file-level detail, for approval

*Everything above, made concrete: exact migrations, exact files, exact order. Still nothing built — this is the proposal to approve or adjust before any of it happens.*

### 5a. `payments` CHECK constraint (fix for #4)

New migration, `db/migrations/0014_payments_cash_upi_split_check.sql`:

```sql
-- 0014_payments_cash_upi_split_check — closes a latent gap found in a full
-- audit: a cash_upi payment with a null cash_amount/upi_amount would
-- silently under-count in the Fees tab's Total Cash/Total UPI reconciliation.
-- Unreachable through the app today (addPayment() already validates this),
-- but a future Excel import or manual DB fix wouldn't be protected without
-- a real database-level guarantee.

-- migrate:up
alter table payments add constraint payments_cash_upi_split_check
  check (
    (mode = 'cash_upi' and cash_amount is not null and upi_amount is not null and cash_amount + upi_amount = amount)
    or (mode <> 'cash_upi' and cash_amount is null and upi_amount is null)
  );

-- migrate:down
alter table payments drop constraint payments_cash_upi_split_check;
```

No app code changes needed — `addPayment()` already only ever produces rows that satisfy this constraint, so nothing existing should be able to fail it. Verification: `db:check` clean, re-run both security gates (unaffected — this doesn't touch RLS), and a quick negative-path check equivalent to the earlier audit (attempt an insert that violates the constraint directly via a service-role script, confirm Postgres rejects it).

### 5b. Event registration edit UI (fix for #5)

No schema/migration changes — `updateRegistration` in `events/actions.ts` already exists and is already correct.

File changes:
- New `app/events/registration-edit-row.tsx` (client component) — toggle state ("is this row in edit mode"), matching the pattern already used for `status-quick-set.tsx`/`payment-mode-fields.tsx`. Renders the normal row by default; when "Edit" is clicked, swaps to an inline form (registrant full name, phone, fee amount, amount paid, attendee names, remarks) pre-filled from the current row, with Save/Cancel.
- `app/events/[id]/page.tsx` — replace each registration `<li>`/row with `<RegistrationEditRow>`, passing the bound `updateRegistration` action alongside the existing bound `archiveRegistration`/`permanentlyDeleteRegistration`.

**Sequencing note (unchanged from Section 3):** if the attendee dynamic-rows redesign (queued in `docs/pending-feedback.md`) is being done in the same pass, build that first — the edit form's attendee section should use whatever shape that redesign produces, not the current textarea, to avoid building it twice.

### 5c. Events location-scoping (Section 4, made concrete)

**Proposed default for the one open question**, so this is buildable — flagged clearly for you to override, not assumed silently: `location_id` is **nullable** at the database level (so a public self-registration can stay unattributed), but **required at the app level for admin-entered registrations** (the "Add registration" form on `/events/[id]` won't submit without it, same as how `location_id` is effectively required on the student add form today). The **public registration form gets no new field** — public registrants stay unattributed (`location_id = null`), counted in the event's overall total but not in either location's specific breakdown, since a stranger filling out a public link generally isn't a known Aalay-or-Sportsclub student. If that's wrong — e.g. you do want the public form to ask — say so and this plan changes at 5c-iii and 5c-iv below.

**i. Migration**, `db/migrations/0015_event_registration_location_scoping.sql`:

```sql
-- 0015_event_registration_location_scoping — registrations (not events) get
-- a location; the event's own venue is irrelevant to scoping (owner: "event
-- can occur at a party plot or some other place... how much student has
-- registered from aalay and from sportsclub matters"). Nullable: a public
-- self-registration has no known location and stays unattributed, counted
-- in the combined total only, never in a location_admin's own view. Admin-
-- entered registrations are required to set one at the app level.

-- migrate:up
alter table event_registrations add column location_id uuid references locations(id);

drop policy if exists "authenticated full access" on event_registrations;

create policy "location-scoped access" on event_registrations
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id())
  with check (is_super_admin() or location_id = staff_location_id());

-- event_attendees scopes through its parent registration, same pattern as
-- payments scoping through students (0008_roles_and_location_scoping.sql).
drop policy if exists "authenticated full access" on event_attendees;

create policy "location-scoped access" on event_attendees
  for all
  to authenticated
  using (
    is_super_admin()
    or exists (
      select 1 from event_registrations r
      where r.id = event_attendees.registration_id
        and r.location_id = staff_location_id()
    )
  )
  with check (
    is_super_admin()
    or exists (
      select 1 from event_registrations r
      where r.id = event_attendees.registration_id
        and r.location_id = staff_location_id()
    )
  );

-- migrate:down
drop policy if exists "location-scoped access" on event_attendees;
create policy "authenticated full access" on event_attendees
  for all to authenticated using (true) with check (true);

drop policy if exists "location-scoped access" on event_registrations;
create policy "authenticated full access" on event_registrations
  for all to authenticated using (true) with check (true);

alter table event_registrations drop column location_id;
```

A `location_id = staff_location_id()` comparison is `false`/unknown for any row where `location_id` is `null` (standard SQL null-comparison behavior), so unattributed public registrations are automatically invisible to every `location_admin` and visible only to `super_admin` — no extra clause needed to get that behavior, it falls out of the comparison itself. This is also why the public write path (which uses the service-role client and bypasses RLS entirely, same as `/navratri`) doesn't interact with this policy at all — it was never subject to it.

**ii. `tooling/verify-location-denial.ts`** — extend with new checks proving the above live: an Aalay-created registration is invisible to the Sportsclub admin and vice versa, a `super_admin` sees both, and a null-location (simulated public) registration is invisible to both location admins but visible to `super_admin`. Same rigor as every other location-scoping change so far — proven with real signed-in test accounts, not just trusted from the policy text.

**iii. `app/events/actions.ts`** — `createRegistration` (and `updateRegistration`, if 5b ships in the same pass) gains a `location_id` param, required: `if (!location_id) throw new Error('Location is required.')`, passed straight through to the insert/update.

**iv. `app/events/[id]/page.tsx`** — "Add registration" form gains a Location field. Follows the exact pattern the student add form already uses: fetch `locations`, filter to just the signed-in admin's own location when `!superAdmin` (so a `location_admin` effectively has one pre-selected option, no `disabled` attribute needed — there's nothing else to pick), a real dropdown when `superAdmin`.

**v. `app/events/[id]/page.tsx` summary section** — currently one combined "Total registered / Fee expected / Collected" block. For a `location_admin`, this needs no change at all — RLS already filters their registrations list to their own location, so the existing combined numbers are automatically correct for them. For `super_admin`, add a by-location breakdown (mirroring the Fees tab's "Collected by location" panel: one row per location plus an "All" row) alongside the existing combined block.

**vi. `app/events/[id]/register/actions.ts` and `register/page.tsx`** — no changes, under the proposed default (public stays unattributed).

**vii. `docs/app-prd.md` / `docs/data-model-security.md`** — update to record events/event_registrations/event_attendees now being location-scoped (closing the open item from decision #27), and the public-registration exception (unattributed, combined-only).

### 5d. CSV export (Section 1, file list repeated here for one combined checklist)

1. `lib/form.ts` — `buildQueryString()` helper.
2. `api/export/students/route.ts` — add `pending` param support.
3. `app/students/page.tsx` — add Export CSV button (`q`/`location`/`batch`/`status`).
4. `app/students/joined/page.tsx` — fix existing button (`q`/`location`/`batch`/`pending` + `status=joined`).
5. New `api/export/payments/route.ts` — payment-log export (`location`/`batch`/`mode`).
6. `app/fees/page.tsx` — add Export CSV button, pointing at the new route.

### Proposed build order

1. **5a** (payments CHECK constraint) — smallest, zero app-code risk, closes a real gap immediately.
2. **5c** (events location-scoping) — the biggest one; do it before 5b so the registration edit form (if built in the same pass) includes the Location field from the start rather than needing a second pass.
3. **5b** (registration edit UI) — after 5c, for the reason above; can also be its own separate pass later if you'd rather ship location-scoping alone first and verify it live before adding the edit UI on top.
4. **5d** (CSV exports) — independent of the other three, can genuinely go in any order, including first if you'd rather see that ship fastest.

Every step keeps the same discipline used throughout this build: migration → `db:check` → both security gates re-run green → `tsc`/`next build` clean → live browser verification (including signed in as both location admins, not just the owner) → docs updated → commit.

**Waiting for your go-ahead on this plan (and specifically the 5c default) before writing any code.**
