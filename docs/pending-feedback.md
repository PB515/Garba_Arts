# Pending feedback — active revision phase

*Owner is reviewing the live app and giving feedback in a batch, not one item at a time. Confirmed working method: owner gives the idea → Claude reflects back its understanding in plain terms → owner corrects if it's off → only then does it get logged here as confirmed. Log each item with enough detail to implement later; don't chase them individually mid-review unless told to. Once a batch is confirmed/resolved, implement, verify, update `CLAUDE.md`/docs as usual, then clear the entries that shipped (keep this file to *pending* items only, not a permanent changelog — that's `CLAUDE.md`'s job).*

---

## 1. Event registration — "extra people coming" UI is wrong shape — CONFIRMED

**What's wrong (owner's own words):** "for extra student there can be number written in box for eg 5 is written then 5 rows will come two column number and name and whatsapp number all we need to collect current is too complex and design is not good."

**Current implementation:** a single free-text textarea, "one name per line" — `event_attendees` table only has a `name` column, no phone/WhatsApp.

**What's wanted instead (confirmed, corrected from Claude's first restatement — it's 3 fields, not 2):**
1. A number input ("how many additional people are coming").
2. Entering a number dynamically generates that many rows.
3. Each row has **three fields: Name, Phone, WhatsApp** — same 3-field shape already used on the student record (`phone_number` + `whatsapp_number` as separate fields), applied per attendee.

**What this actually requires (not just a UI tweak):**
- Schema: `event_attendees` needs two new columns, `phone_number` and `whatsapp_number` (both nullable, mirroring how `students.whatsapp_number` is optional).
- A real dynamic-rows client component (number input drives how many name+phone+whatsapp row-triples render) — replaces the plain textarea in **both** places it's used: the admin "Add registration" form (`app/events/[id]/page.tsx`) and the public registration form (`app/events/[id]/register/page.tsx`). Both must produce the same shape of data, per the earlier "applies everywhere" decision (#37/#38 in `CLAUDE.md`).
- `lib/form.ts`'s `parseNameList()` becomes insufficient (it only parses names) — needs a replacement that reads triples of name+phone+whatsapp fields instead.
- The screenshot also showed a **visual layout bug** independent of the above — the textarea's grid cell rendered with extra empty box outlines next to it (something off in the grid-column spanning CSS in that row). Worth a clean look when rebuilding this section, not just patching the existing broken layout.

**Not yet asked, worth confirming when implementing:** are phone/WhatsApp required per attendee, or optional like the registrant's own phone? Any cap on how many extra people (the number input needs some sane max)?

---

*(Add further items below as they come in. Each entry: what's wrong in the owner's words, what's wanted, what it actually touches technically.)*
