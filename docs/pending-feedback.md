# Pending feedback — active revision phase

*Owner is reviewing the live app and giving feedback in a batch, not one item at a time. Confirmed working method: owner gives the idea → Claude reflects back its understanding in plain terms → owner corrects if it's off → only then does it get logged here as confirmed. Log each item with enough detail to implement later; don't chase them individually mid-review unless told to. Once a batch is confirmed/resolved, implement, verify, update `CLAUDE.md`/docs as usual, then clear the entries that shipped (keep this file to *pending* items only, not a permanent changelog — that's `CLAUDE.md`'s job).*

---

*(Add further items below as they come in. Each entry: what's wrong in the owner's words, what's wanted, what it actually touches technically.)*

---

*Items #1 (Source dropdown split) and #2 (disable-on-click everywhere) shipped — see CLAUDE.md decisions #80-81 and Build Log Phase 26.*

## 3. Confirmation popups on more major actions

**Owner's words:** "Like the confirmation popup for Aalay/Sportsclub claim selection, I want a similar popup across the site confirming before major decisions — before we revert or move to Joined, in the Fees section while saving fees, etc."

**What's wanted:** Extend the existing confirm-modal pattern (already used for claim/revert on Lead, and marking someone Joined) to more consequential actions elsewhere in the app. Owner explicitly named "saving fees" as an example, so this isn't only about destructive/reversal actions — it's about any action that meaningfully changes a record's state on a single click. Needs a follow-up discussion before building to pin down the exact list (open questions: does *every* fee save get a popup, including small edits, or only certain ones like Fee total/Demo fee amount? Do the existing soft-delete/archive and permanently-remove actions count, or are those already sufficiently guarded? Should routine list-level actions like the Inquiry quick-set's Ask-again/Dropped stay instant, matching decision #41's original "only Joined needs confirmation" reasoning, or does the owner now want those confirmed too?) — resolve scope first, then build using the same modal shape already established in `status-quick-set.tsx`/`claim-lead-buttons.tsx`/`revert-claim-button.tsx`.

*Item #4 (Male/Female on Lead, Residential area on Inquiry) shipped — see CLAUDE.md decision #79 and Build Log Phase 25.*

*Item #5 (desktop split layout) shipped — see CLAUDE.md decision #88 and Build Log Phase 32.*

## 5. Event poster — desktop split layout

**Owner's words:** "Regarding desktop... we can have title and banner inside and form on other, left right divide there on desktop, can display bigger banner than mobile."

**What's wanted:** Above a breakpoint (proposed 1024px), the event poster page (`events/[id]/register/page.tsx`) splits into two columns instead of the current single mobile-first stacked layout — one side content (title/ticket-date/description/form), the other a larger banner. Mobile layout (the existing build) is unchanged below the breakpoint. Open question: does the circular diya-ring stay circular at desktop size (just bigger), or does desktop get a different treatment of the same image? Recommended: keep the ring — it's the one signature visual element of this design — just scale it up.

*Gallery half of item #6 shipped — see CLAUDE.md decision #90 and Build Log Phase 34. The promo-content half stays open below, still needs the owner's own answer.*

## 6. Event poster — redesigned thank-you page (full banner, past-events gallery, promo content)

**Owner's words:** "When clicked register a new page thank you for registration and on that a full size banner and other past events and images and some promotional content can be displayed there."

**What's wanted:** `events/[id]/register/thank-you/page.tsx` (currently minimal — eyebrow/title/body only) gets a real redesign: full-size banner, a gallery of past events, and promotional content.

**Past-events gallery — resolved:** hybrid, per owner's answer ("pull automatically or give option while creating event will be better") — default to auto-pulling from already-created events in the `events` table (past date + has a banner image), but also give the admin an option at event-creation/edit time to override which past events are included (e.g. an include/exclude toggle or manual picker), rather than pure automation with no admin control.

**Still open:** what exactly "promotional content" means — a text blurb, an upcoming-event teaser, social links, testimonials? Needs a real spec before building, not just "yes let's do it."

*Items #7 (public attendee cap → 10) and #8 (short event link) shipped — see CLAUDE.md decision #85 and Build Log Phase 29.*

## 7. Public registration attendee cap lowered to 10

**Owner's words:** "1 person can do more than 1 registration like in admin site, same system, but here we will cap odd on 10 people." Confirmed: "yes do 10."

**What's wanted:** The public poster form already uses the same `AttendeeRows` dynamic-rows component as the admin forms (decision #50), currently capped at `MAX_ATTENDEES = 20` for all three usages. Add a `maxAttendees` prop; keep admin add/edit forms at 20, drop the **public** registration form specifically to 10.

## 8. Short public event link via slug

**Owner's words:** Asked whether the public register link could be shorter/memorable ("event then event name then register nothing else") instead of the current UUID-based path. Confirmed direction: "let's go with b" (see discussion — option b was: a separate, additive short route, not touching existing admin/UUID routes).

**What's wanted:** Add a `slug` column to `events` (auto-generated from the event name, e.g. "Garba Night 2026" → `garba-night-2026`, with a uniqueness rule for repeated names). New short public route, e.g. `/e/{slug}`, resolving to the same poster page — purely additive, existing `/events/[id]` admin routes and `/events/[id]/register` public route stay exactly as they are. Also worth doing regardless: the admin event page currently shows the public link as a bare relative path (`/events/.../register`), not a full clickable URL — caused a real mix-up (pasted into Google's search box instead of the address bar since there's no domain). Fix: show the full absolute URL as a real clickable/copyable link.

*Item #9 (banner image spec + Open Graph preview) shipped — see CLAUDE.md decision #89 and Build Log Phase 33.*

## 9. Event banner image spec + Open Graph / WhatsApp link-preview image

**Owner's words:** Asked for a defined image spec ("what size or what to use, this pixels this format eg 1200×1200 px and landscape") and separately, "when we share link on WhatsApp there can image come... connected to site."

**What's wanted:** One upload per event (not five separate sizes for the admin to manage) — recommended spec: square-ish, center-weighted source image, **1600×1600px minimum, JPG/PNG/WebP, under 5MB**. CSS (`object-fit: cover`) handles different crops per placement (circular poster ring, desktop landscape banner from item #5, thank-you page full banner from item #6) from the same single upload. This same image also becomes the `og:image` for WhatsApp/social link previews (Open Graph metadata — `generateMetadata` on the register page, currently has none) — recommended OG crop 1200×630, which a centered square source crops well into. Needs an absolute URL (not relative) to work as a link preview.

## 10. Optional Instagram Reel embed

**Owner's words:** "Even we can have an insta reel there somewhere."

**What's wanted:** Not yet scoped. Open questions: which page (poster page, thank-you page, or both)? One fixed reel per event (an event-specific highlight) or a generic account feed?

*Item #11 (WhatsApp event broadcasts + manual sent-tracking) shipped — see CLAUDE.md decision #87 and Build Log Phase 31.*

## 11. WhatsApp event messaging with manual sent-tracking (big item) — RESOLVED, ready to build

**Owner's words:** "No WhatsApp will send manually, like in Leads and Inquiry, just an add-on here, like a button, while template can be created in WhatsApp button... person can select this, message has gone to this person — a new button that can create in table, new column regarding new message which needs to be tracked." Then, on the two broadcast types: "generic like thank you for registration to this event at this date and this venue, so generic but with name... venue data and time can be inputted while creating event itself in events and will directly know what event in so what to select." And on tracking: "yes manually click done."

**Confirmed model:**
- **Not** the WhatsApp Business API/Meta route — same manual `wa.me` click-to-chat as Lead/Inquiry (decisions #75-76): staff clicks, their own WhatsApp opens pre-filled, they hit send themselves. No automatic delivery confirmation is possible (hard `wa.me` limitation, same as already documented) — tracking is self-reported.
- **`events` gains a `venue` field**, captured at event creation/edit alongside name/date/description — needed so generic broadcast templates can auto-fill without retyping, and because the broadcast is always created from inside a specific event's own admin page, so which event it's for is never ambiguous.
- **Two broadcast types:**
  - **Generic/templated** — reusable wording (e.g. "Thank you for registering for {event_name} on {event_date} at {venue}, {name}!") pulled from the existing shared `message_templates` library (decision #76), with `fillTemplate()` extended to substitute `{event_name}`/`{event_date}`/`{venue}` alongside the existing `{name}`, sourced automatically from the event the broadcast was created under.
  - **Ad hoc** — free-typed one-off text at broadcast-creation time (e.g. "Venue changed to X"), not from the template library.
  - Both produce the same trackable object: a new "broadcast" scoped to one event, becoming a column against that event's registrant list.
- **Sent-tracking is a separate manual checkbox** per registrant per broadcast, ticked by staff themselves after actually sending — confirmed NOT auto-tied to clicking the WhatsApp button (clicking it doesn't guarantee the message was actually sent). Event page shows a live count per broadcast: "Venue change: sent to 5, 10 remaining."
- Sits **alongside** the existing single-link WhatsApp pattern already used on Lead/Inquiry, not replacing anything there.

**Ready to build** once the owner gives the go-ahead — needs: `events.venue` column, a new `event_broadcasts` table (event_id, message body or template reference, created_at) + `event_broadcast_sends` (broadcast_id, registration_id, sent boolean, sent_at, sent_by), `fillTemplate()` extended with the 3 new placeholders, and the event admin page's registrant table gaining one column per active broadcast (WhatsApp button + sent checkbox).

*Item #12 (Event Fees tab + fee-per-person auto-calc) shipped — see CLAUDE.md decision #86 and Build Log Phase 30.*

## 12. New "Event Fees" tab + how registrants actually pay — RESOLVED (no gateway), ready to build

**Owner's words:** "I want similar treatment like we have in normal students but I don't want all going in fees tab, this is different, we need new event fee tab." On the payment question — "yes no razorpay, manual staff confirm — 1 and 2 is doable."

**Confirmed: no payment gateway, decision #24 stays exactly as it was — not reopened.** Real online self-service payment (the original option 2's "pays online, status auto-updates") is explicitly ruled out. What's confirmed doable instead, combining the spirit of options 1 and 2 without a gateway:
- A registrant's fee/paid/balance is tracked in-app (`fee_amount`/`amount_paid` on `event_registrations`, same math as student fees) — this is the "tag: fees remaining" from option 2, but as an **admin-side status**, not something a registrant sees via any login (this app still has no client accounts, decision #1 — the only public surface stays the poster/registration form itself).
- Staff can share a payment link (their own UPI ID/GPay-style link, not an integrated gateway) manually via the new WhatsApp broadcast system (item #11) or however they already do it — this is option 1.
- Staff marks a registration paid once money is actually received, whether via that manual link or in person on event day (option 3) — same `addPayment`-style manual logging already used everywhere else in this app.

**New Event Fees tab — access level RESOLVED, mirrors decision #28 exactly:** the combined tally/breakdown/reconciliation view is `super_admin`-only, same as `/fees`. Individual per-registration fee status (paid/not paid, logging a payment against one registrant) stays open to **every** admin — same "individual fees ok, combined fees restricted" split already established for students. This needs no new access-control work for the per-registration side — the admin "Add registration"/edit forms already let any admin set `fee_amount`/log payments per registration today; only the new combined tab itself gets the `super_admin` gate.

**New wrinkle raised by the owner, needs confirmation before building:** "5 people, fee per person is 200, one main [registrant] who registers gives 1000 — how do we track that?" Today `event_registrations.fee_amount` is a single manually-typed total per registration (like a student's `fee_total`), with no connection to attendee count — so a staff member has to do the 5×200=1000 math themselves and could get it wrong, and there's no way to *see* it reconciles.

**Recommended fix** (same pattern this app already uses for Navratri — `pass_count × price_per_pass`, see `lib/navratri-config.ts`): add an optional **fee-per-person** rate on the event itself (set at event creation, editable after), and auto-compute a registration's default `fee_amount` as `(1 + attendee_count) × fee_per_person` instead of a blank manual field — still shown/editable so staff can override for a genuine exception (discount, a free plus-one, etc.), same as every other "typical but overridable" number in this app. `amount_paid` stays exactly as it is today — one lump sum logged against the registration's total, since that's genuinely how it's collected (one person pays for the group). Needs the owner's confirmation this is the right mechanism before building it — flagging it as a real design choice, not just a formula tweak.

**Ready to build** — needs: `events.fee_per_person` (nullable, events with no fee stay free-form/zero like today), registration-form default-fee auto-calc wired to `AttendeeRows`' count, a payment-log table for events (mirroring `payments`, reusing the Cash/UPI/split shape from decisions #25-27), the new `/events/fees`-style tab (`super_admin`-only), and the payment-log-form UI adapted from the existing student one.
