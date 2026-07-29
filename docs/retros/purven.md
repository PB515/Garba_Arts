# Toolkit Retrospective — Building the Purven Bhavsar Portfolio

A grounded review of building this site (a personal-brand portfolio that is *also* an
authenticated CMS app) with the **Vibe Coding Toolkit** (Playbook + PART 7 app extension).
Written to feed back into the toolkit: **what helped, what was missing, and what to change.**

Scope: Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres/Auth/Storage)
· Vercel. Built across Phases 0–5 + ongoing polish, by a single builder + an AI agent.

---

## 1. What the toolkit did well

These are the parts that demonstrably saved time and prevented mistakes:

- **Doc-driven planning (01–11 + 02a) gave a real spine.** Having the PRD, data model,
  RLS, build roadmap, and a *frozen* set of "decisions made" (e.g. "spine = personal brand,
  not a services pitch"; "launch empty, fill via admin, never invent content") stopped scope
  drift and endless re-litigation. When in doubt, the answer was already written down.
- **The Context Anchor (`AGENTS.md` / doc 07) was the single most valuable artifact.**
  Long build, multiple sessions, context resets — the status block + conventions + "gotchas"
  let the agent re-orient instantly and not repeat past mistakes. This is the toolkit's
  superpower.
- **Security-first build order + the logged-out denial gate** produced a genuinely safe
  authed app. RLS deny-by-default, `proxy.ts` guarding `/admin`, the four-client split
  (server/browser/public/admin-service-role), and verifying "anon can't read leads / can't
  write / drafts hidden" at each phase caught issues *before* they shipped.
- **Conventions as guardrails.** "Tokens only, no hardcoded hex," "no new dependencies
  without asking," "secrets in `.env.local` only" kept the codebase consistent and prevented
  dependency sprawl and theme drift over dozens of edits.
- **Honest empty-states + "never fabricate content."** The site launched truthful (empty
  Portfolio/Field Notes with real CTAs) and filled live via the CMS — integrity baked in.
- **PART 7 (authenticated-app extension)** made the CMS robust: server actions with
  `revalidatePath`, the cover/résumé upload patterns, the hard-cap-via-count-query pattern.

## 2. Where it fell short (specific friction we hit)

Real incidents from this build — each is a gap the toolkit could close:

1. **Framework-version drift.** Next 16 + Tailwind v4 differed from the agent's defaults:
   `middleware.ts` → `proxy.ts` (build fails if both exist), dynamic `params`/`searchParams`
   are Promises, Tailwind is CSS-first (`@theme inline`, no config file), dynamic route
   params arrive **URL-encoded**. The toolkit said "read `node_modules/next/dist/docs`," which
   helped — but the gotchas still bit us first, then got logged.
2. **Platform/deploy constraints weren't in the playbook.** Three separate hours-long
   detours: (a) **Vercel's ~4.5 MB serverless request-body limit** silently broke file
   uploads (had to re-architect to browser→Storage direct upload); (b) **deployment-hash
   URLs vs the production alias** caused phantom "401/404" reports (we were testing a frozen
   preview URL); (c) **Turbopack served stale CSS** after rapid edits (a hard refresh didn't
   fix it — a dev-server restart did).
3. **Secret handling was fragile.** The Supabase service-role key got pasted in a setup
   message, became load-bearing in the contact route, and needed rotation. There was no
   explicit "never paste secrets / rotate-on-exposure" runbook.
4. **"Works locally ≠ works live" for the database.** SQL migrations (featured flags, the
   message-delete policy, the site-images table) had to be run manually in the Supabase SQL
   editor, and it was easy to forget the live project. No migration runbook / parity check.
5. **Placeholders that should have been CMS-backed from day one.** The home "story image"
   was hardcoded; we later rebuilt it as an admin uploader. The toolkit defaults content to
   code when it should default to *DB-backed slots* for anything the owner will change.
6. **URL/slug safety wasn't enforced.** A project slug typed as "Test 3" (space + caps)
   404'd the detail page. Fix was slugify-on-write + decode-on-read — both should be toolkit
   defaults, not discoveries.
7. **Asset weight ignored until late.** Shipped a 5 MB OG image and ~1 MB favicon; the site
   carried ~17 MB of images before an optimization pass (sharp + next/image) cut it to ~1 MB.
8. **Design churn.** Many round-trips on opacity, plate color, layout (portraits, decor,
   "too WordPress-y" cards). Some was healthy iteration; some was avoidable with an upfront
   "show it in *both* themes + mobile, at the intended opacity" checkpoint.

## 3. Lessons learned

- **The Context Anchor is the engine — invest in it.** Its quality directly drove velocity.
  Keeping a tight status block + a running "gotchas/landmines" list paid off every session.
- **Security-first genuinely works** — but only because the denial gate was *re-run* at each
  phase, not assumed. Make verification recurring, not one-time.
- **The hardest bugs were environmental, not logical.** Platform limits, URL types, stale
  caches, env parity — not application code. The toolkit over-indexes on app structure and
  under-indexes on *the deploy/runtime environment*.
- **Anything the owner will edit must be DB-backed from the start.** Retrofitting a
  hardcoded value into a CMS slot is more work than starting there.
- **Polish is iterative and theme-dependent.** A two-theme system doubles the review surface;
  every visual change needs a both-themes + reduced-motion + mobile check.

## 4. Recommended toolkit updates (prioritized)

**P0 — close the environment gaps (these caused the worst detours):**
1. Add a **"Platform & Deploy Constraints" doc** to the planning set. For Vercel: the
   **4.5 MB function body limit** (→ upload files browser→Storage directly), **URL types**
   (production alias vs immutable deployment-hash URLs vs protected previews), ISR/
   `revalidate` + `revalidatePath`, and the **stale-dev-CSS → restart** quirk.
2. Add a **"Secrets onboarding & rotation" runbook**: never paste secrets in chat; how to set
   `.env.local` + the hosting env in parity; rotate-on-exposure steps; mark which keys are
   server-only/load-bearing.
3. Add a **"Migrations runbook"**: a numbered `db/migrations/` index, "run on local AND prod"
   reminder, and a parity check (query a column/policy on prod to confirm).

**P1 — make good defaults automatic:**
4. **Slug hygiene by default**: `slugify` on every write + `decodeURIComponent` on read for
   dynamic routes.
5. **CMS-backed content slots by default**: a tiny `site_images`-style table + an upload
   pattern for any owner-editable image/text (don't hardcode).
6. **Direct-to-Storage upload pattern** as the default file-upload recipe (not server-action
   passthrough), to dodge platform body limits.
7. **Image optimization in the asset step**: `next/image` everywhere + a `sharp` pass for
   static assets; flag any asset over ~300 KB.
8. **Framework version pinning**: at project start, capture the exact framework gotchas for
   the installed versions into the Context Anchor (the toolkit nailed the *instinct* — "read
   the local docs" — but should produce a concrete version-gotchas list).

**P2 — reduce review churn & raise polish quality:**
9. **A "live verification" recipe**: after deploy, poll the production URL for a known marker
   (we improvised this with `curl | grep`); bake it in.
10. **A theme/motion review checklist**: every visual change checked in both themes +
    reduced-motion + 360 px before "done."
11. **An optional "polish module"** documenting the patterns that worked here: token-recolored
    SVG decor (one source, themed via `currentColor`), scroll-reveal/lift/zoom gated behind
    `prefers-reduced-motion`, and an editorial-vs-card content-layout decision point (avoid
    the default "blog grid" look).

## 5. Quick wins to fold into the toolkit now

- A `db/migrations/` README that lists migrations and says "run on prod too."
- A `.env.example` + a one-line "secrets never go in chat" rule in the Context Anchor.
- A default `Portrait`/image component that uses `next/image` + sensible `sizes`.
- A starter `proxy.ts` (not `middleware.ts`) note in the Next-16 preset.
- A "deploy = push to main; share the production alias, not the deployment URL" line.

## 6. Bottom line

The toolkit's **planning + context-anchor + security-first** core is strong and was the main
reason this shipped fast and safely. The biggest opportunity is **a dedicated environment/
deploy layer** — the costliest detours were platform limits, URL confusion, secret handling,
and local↔prod DB parity, none of which were in the playbook. Adding those, plus making a few
good patterns (slug hygiene, CMS-backed slots, direct uploads, image optimization) into
defaults rather than discoveries, would meaningfully raise the toolkit's hit-rate on the next
build.
