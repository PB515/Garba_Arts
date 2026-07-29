# Runbook — Deploy + Smoke Test

*Going live is real-world steps, not code — and it was the biggest revealed gap in the retros. Treat it as a named phase with its own gates. Target host: Vercel.*

## The hard rule

**Run the production build locally before every push** — `cd template && npm run build`, not just `npm run dev`. The dev server silently runs past type errors; the production build runs the strict check the host runs, and catches them on your machine instead of as a red deploy. *(Bit the CA build twice — a type error invisible in `dev`.)*

## Pre-flight (automatable — run these first)

```bash
npm run env:validate        # no secret-shaped NEXT_PUBLIC_, keys well-formed, required present
npm run deploy:check        # readiness manifest: env + placeholders replaced + smoke list
cd template && npm run build # production build passes LOCALLY
npm run db:check            # (if the site has a DB) no migration drift
```

Fix every blocker before pushing. `deploy-check` exits non-zero until the per-site constants in `lib/site.ts` are replaced.

## Deploy mechanics checklist

```
[ ] Production build passes LOCALLY before pushing
[ ] Connect repo to host (expect a GitHub/account-link step the first time)
[ ] Add env keys in the host's settings (NOT in code) — names exactly, secrets as secret
[ ] EXPECT the first build may fail — read the log, fix, re-push (normal, not alarming)
[ ] Set the production site URL (canonical/sitemap/OG depend on it; lib/site.ts `url`)
[ ] Enable analytics in the host AND redeploy — it only collects from the deployed site
[ ] Email: verify a sending domain so mail reaches anyone, not just your own inbox
```

## Content & compliance

```
[ ] Replace ALL placeholders — copy, team, testimonials, logo, AND contact details
    everywhere (footer, contact page, schema, the wa.me + tel: links)
[ ] Real images in (06b image plan), icons stay, compress
[ ] Privacy policy is real and MATCHES the deployed analytics (tool, cookies, where data goes)
[ ] Rendered <title> correct per page TYPE — site name once, not doubled (check real output)
[ ] Domain-logic review by the expert (if the site computes anything consequential)
```

## The live-URL smoke test (a formal gate — "works locally" ≠ "works live")

```
[ ] On the DEPLOYED url: submit a form → it saves + email arrives
[ ] WhatsApp/call links open the REAL number (wa.me digits-only ≠ displayed format)
[ ] Analytics dashboard receives events (after the processing delay)
[ ] Walk it on a real phone — images render, nothing overflows at 360px
```

## Soft vs full launch

- **Soft launch** — live at the host URL for testing; you control who sees it; placeholders elsewhere tolerable.
- **Full launch** — promoted, real traffic, all compliance done. Don't mistake one for the other.

Share the **production alias** (the stable domain), never a deployment-hash URL — see `platform-constraints.md`.
