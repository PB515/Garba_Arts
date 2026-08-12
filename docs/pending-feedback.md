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
