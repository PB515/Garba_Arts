# Process Gates (Tier-2 #12, #14, #16)

*Three lightweight gates that caught real problems across the builds. Checklists, not phases — fold them into the SOP's existing gates.*

---

## Re-plan gate (#12 — scope growth)

*Plans that 5×'d on Inspire Academy and Patel CA without a checkpoint.*

**Trigger:** when a phase's real scope grows materially past its plan (a new role, a new subsystem, "while we're here…"), STOP and re-plan before building.

```
[ ] Name what grew and why (one line in the Build Log).
[ ] Is it in the No-List? → it's out, or it's a deliberate, logged scope change.
[ ] Re-slice: does the roadmap still hold, or does it need new phases?
[ ] Update the frozen docs FIRST (separate commit), then build (Safety Rail 7).
```

Don't silently absorb scope — a 5× phase is how a 2-week build becomes 8.

---

## Mobile / theme review gate (#14 — per UI phase)

*Mobile jank + a theme bug shipped on Purven / Inspire because review happened only at the end.*

Before any UI phase is "done":

```
[ ] 360px mobile — nothing overflows, tap targets OK, images render
[ ] Both themes (light + dark) if the site has them — no unreadable contrast
[ ] Reduced-motion honored (motion drops to static) — see the motion skill
[ ] WCAG AA contrast, including the CTA/accent pair (--accent / --accent-foreground)
[ ] No AI-tell copy (npm run lint:ai-tell)
```

This is the per-phase form of the anti-AI-look gate.

---

## Split the No-List (#16 — "never" vs "phase 2+")

*Inspire's v1 "no portal" was reversed mid-build because the No-List didn't distinguish "never" from "not yet".*

In the PRD, split the No-List into two:

- **Never (v1 boundary, and staying out)** — out of scope by decision; reversing it is a real scope change.
- **Phase 2+ (deferred, expected later)** — not now, but planned; design v1 so it doesn't block these.

The difference tells you what to *architect for* now vs what to *wall off*. A deferred item that's mislabeled "never" gets built with no seam for it; a "never" mislabeled "phase 2" invites scope creep.
