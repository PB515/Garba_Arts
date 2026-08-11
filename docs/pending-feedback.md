# Pending feedback — active revision phase

*Owner is reviewing the live app and giving feedback in a batch, not one item at a time. Confirmed working method: owner gives the idea → Claude reflects back its understanding in plain terms → owner corrects if it's off → only then does it get logged here as confirmed. Log each item with enough detail to implement later; don't chase them individually mid-review unless told to. Once a batch is confirmed/resolved, implement, verify, update `CLAUDE.md`/docs as usual, then clear the entries that shipped (keep this file to *pending* items only, not a permanent changelog — that's `CLAUDE.md`'s job).*

---

*(Add further items below as they come in. Each entry: what's wrong in the owner's words, what's wanted, what it actually touches technically.)*

---

## 1. Split the Source dropdown between Lead and Inquiry

**Owner's words:** "Source dropdown in lead and in inquiry is same we need different in lead will be 4: society, corporate, navrangpura and aalay — in inquiry will be whatsapp, instagram, referral, walkin. In both, others and source detail optional should be there."

**What's wanted:** Right now `SourceField` (`template/app/students/source-field.tsx`) is one shared component with one option list (WhatsApp, Instagram, Referral, Walk-in, Society, Corporate, 4 loudly-marked `[Placeholder source N, TBD]` slots, Other) used identically in three places:
- `template/app/students/leads/add-lead-form.tsx` (Lead tab's add form)
- `template/app/students/add-inquiry-form.tsx` (Inquiry tab's add form)
- `template/app/students/student-edit-form.tsx` (the Details/edit form, reused for both Lead-origin and Inquiry-origin records)

Split into two option lists, finally resolving the long-open placeholder-source item (decision #52):
- **Lead's Source** (4 real options): Society, Corporate, Navrangpura, Aalay
- **Inquiry's Source** (4 real options): WhatsApp, Instagram, Referral, Walk-in
- Both keep "Other" and the optional free-text `source_detail` field, unchanged.

**What it touches:** `source` is a plain `text` column with no DB constraint (decision #52's expansion needed no migration) — this is a pure UI change, no schema work. `SourceField` needs a variant prop (e.g. `variant: 'lead' | 'inquiry'`) so each add-form passes the right list. Open question to resolve before building: what should `student-edit-form.tsx` (used for BOTH a still-unclaimed Lead's own detail page and a claimed/Inquiry record's detail page) show — the Lead list, the Inquiry list, or pick based on whether the record currently has a `location_id`/`is_lead`? Also need to handle a record whose stored `source` value isn't in the new list for its context (e.g. an old Inquiry-origin record with `source = 'society'` once that's Lead-only) — probably still render the stored value as a selectable option even if it's not in that variant's list, same spirit as never silently dropping existing data.

## 2. Disable-on-click everywhere

**Owner's words:** "Like we did in leads, adding button after click it disables — I want to do that everywhere in the site."

**What's wanted:** `SubmitButton` (`template/app/students/submit-button.tsx`, `useFormStatus`-based) already disables itself the instant its parent form's action is in flight — currently used on the Lead/Inquiry add-forms and a few others. Audit every remaining save/submit button across the app and switch them to this same pattern, so no button anywhere can be double-tapped into a duplicate/inconsistent action. Likely spots still using a plain `<button type="submit">`: Fees' payment-log form, Fee-total/Demo-fee-amount save forms, the student Details edit form's Save, WhatsApp template add/edit, Seasons' "Start new season," Events' add-event/add-registration/edit-registration forms, Navratri admin's mark-paid, the public Navratri/event-registration forms. Needs a pass through each form component to confirm which already use `SubmitButton` vs. a raw button.

## 3. Confirmation popups on more major actions

**Owner's words:** "Like the confirmation popup for Aalay/Sportsclub claim selection, I want a similar popup across the site confirming before major decisions — before we revert or move to Joined, in the Fees section while saving fees, etc."

**What's wanted:** Extend the existing confirm-modal pattern (already used for claim/revert on Lead, and marking someone Joined) to more consequential actions elsewhere in the app. Owner explicitly named "saving fees" as an example, so this isn't only about destructive/reversal actions — it's about any action that meaningfully changes a record's state on a single click. Needs a follow-up discussion before building to pin down the exact list (open questions: does *every* fee save get a popup, including small edits, or only certain ones like Fee total/Demo fee amount? Do the existing soft-delete/archive and permanently-remove actions count, or are those already sufficiently guarded? Should routine list-level actions like the Inquiry quick-set's Ask-again/Dropped stay instant, matching decision #41's original "only Joined needs confirmation" reasoning, or does the owner now want those confirmed too?) — resolve scope first, then build using the same modal shape already established in `status-quick-set.tsx`/`claim-lead-buttons.tsx`/`revert-claim-button.tsx`.

*Item #4 (Male/Female on Lead, Residential area on Inquiry) shipped — see CLAUDE.md decision #79 and Build Log Phase 25.*
