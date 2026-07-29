# Golden Path — Portfolio / Personal Brand

*Personal brand · identity-led · often a light CMS. Source: Purven Bhavsar portfolio (personal brand + authenticated CMS).*

**Use when:** the site wins on authentic identity, not a competitor comparison — a founder, creator, consultant, or portfolio.

## Phase order

```
0. Setup + tokens — distinctive type/colour matters MOST here (it IS the brand)
1. Research — the PERSONAL-BRAND path (deep-research-personal-brand: inspirations →
   positioning differentiator), NOT the competitor path
2. Content-model — most content is CMS-editable (projects, posts, about) so the owner
   updates without a deploy; legal/static in code
3. Public site — home, work/projects, about, contact; strong composition, motion with restraint
4. CMS (if owner-edited) — security-first auth → RLS (owner-only) → prove denial → editor screens
5. Polish + deploy
```

## Pulls in

- Research: `deep-research-personal-brand` (the Step-2a choice)
- Skills: `frontend-design` + `taste-skill` + `motion` — this is where craft earns its keep
- Modules: `anti-ai-look` (distinctive type/colour), `content-model`
- If CMS: the portal path's auth + RLS + `view-edit-form` / `chip-list-editor`

## Gotchas (from Purven)

- **Use the personal-brand research prompt** — the competitor prompt produces a nonsense competitor table for a portfolio.
- **Identity > features** — the differentiator is who this person is; don't bolt on a generic feature set.
- **Design tokens are the brand** — a generic palette/font here reads as a template; this is the highest-stakes anti-AI-look case.
- A portfolio that's *also* an authed CMS still owes the full PART 7 security pass.
