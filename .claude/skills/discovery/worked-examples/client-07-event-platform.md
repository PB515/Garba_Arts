# Worked example — Event-Website Platform (REAL build · forward round-trip)

*Discovery run on a **real** founder brief (handwritten notes), via a live `discovery` skill invocation. **This is the forward round-trip** — the proof bar's last gap: brief → build → shipped, to be compared as the build proceeds. The heaviest brief to date: a multi-tenant platform, not a site.*

**Date:** 2026-06-22 · **Verdict: capability = HIGH (multi-tenant platform) · craft = per-surface (Signature catalogue/templates · Essential admin) · no Flagship**

---

## 1. Raw input (transcribed from handwriting — ambiguities flagged)
> A **catalogue** system where prospective clients browse example **event** websites and choose one. Then: every chosen site must be **editable** (photos, name, title, slogan, anything). Workflow: copy the chosen webpage → edit → deploy as the client's live site. Plus **management** for leads + per-client requirements ("so I don't forget what the client wants and what I need from them to launch"). Event types: **Marriage · Vastu · Birthday · Baby-shower (Shimant) · any other**. The event sites are **single-page, light (RSVP confirm button, nothing backend-heavy)** but each frontend **unique** (Birthday → Girl=pink / Boy=blue-red → varies by age, interest).

*Transcription notes: "Manige" = Marriage; "Vasto" = Vastu (griha-pravesh/housewarming puja); "Shimant" = Gujarati baby-shower ritual.*

## 2. Forced questions → answers (assumed; flag for the founder)
- **Audience → device?** TWO: (a) prospective **clients** browsing the catalogue (Indian event families/organizers, mobile-first); (b) event **guests** opening the deployed RSVP link (broadest — every phone, shared on WhatsApp, often low-end). → **mobile-first, especially the event pages.**
- **The one action = success?** TWO conversions: catalogue → **enquiry (the business lead)**; deployed site → **RSVP**.
- **Who edits?** Notes say *"I copy… edit… deploy"* → **founder edits (agency model) in v1.** Self-serve client editing = phase 2 (much bigger). **Confirm.**
- **Verifiable?** Catalogue examples = the founder's own demo templates (real). Event content = the client's (never fabricate; placeholder demo data clearly marked).
- **Goal vs ask?** Goal = sell event sites + run the pipeline without dropping client requirements. The heavy ask (editable, multi-tenant, CRM) genuinely serves it.

## 3. Research
Indian event semantics matter for the template designs: Marriage (shaadi), Vastu/Griha-Pravesh (housewarming puja — specific motifs), Birthday, Baby-shower (Shimant/Godh-bharai/Seemantham). Templates must respect these, not be generic.

## 4. The architecture (corrected by founder input — the KEEPSAKE requirement)
Initial discovery leaned "one multi-tenant app." **The founder corrected it, and was right:** event sites are *permanent memories* (a wedding at `richawedsrahul.com`) that ~90% of clients want **forever**, on a **custom domain**, possibly **transferred to their own hosting**. A tenant inside a shared app can't be permanent-and-transferable, and a keepsake must not die if the platform does. → **Hybrid (a factory that produces standalone sites — the IDP's own model, fractally):**
- **Central management platform (founder-owned):** the public **catalogue**, the **admin** (leads + per-client requirements + the editor), and **central RSVP collection** (every event site posts RSVPs here → host guest-lists).
- **Per-event standalone sites:** generated from a template + the client's content, deployed as their **own Vercel project + custom domain** (`richawedsrahul.com`; Vercel handles SSL/routing, ~₹1000–1200/yr), **permanent + transferable**. A static keepsake + an RSVP form that posts to the central platform (active in the event window).

Separate sites give permanence/ownership/custom-domain; the central platform gives the catalogue/CRM/RSVP. Both requirements honored. *(Lesson for the skill: probe the client's delivery/ownership model — "permanent keepsake, transferable" breaks multi-tenant and is a legit reason for standalone deploys.)*

## 5. Feature → capability → craft (two axes, split)
| Surface | Capability (moat) | Craft | Note |
|---|---|---|---|
| Public catalogue | marketing + content-model | **Signature** | the sales pitch — must impress |
| Enquiry → lead | forms + `lib/security` + CRM | **Essential** | conversion |
| Admin: leads + requirements checklist | portal/CRM + content-model | **Essential** | the "don't forget" system |
| Editor: clone → fill → publish | **multi-tenant instances + publish pipeline** | **Essential** | the heavy core |
| Deployed event site `/e/[slug]` | render-from-data + **RSVP** | **Signature + varied** | light logic, unique look (token-driven) |
| RSVP + host guest-list | forms + guests table (RLS per event) | **Essential** | host sees attendance |

**Moat (sell this):** multi-tenant auth + RLS, template→instance content model, publish pipeline, CRM/requirements, RSVP + guest lists.
**Light-but-many frontends:** event templates are single-page, **token-driven** — uniqueness is variant/token props on a shared engine, NOT N hand-coded sites. One template, many skins.

## 6. Site map (tier per surface)
Public: `/` catalogue (Signature) · `/templates/[type]` (Signature, varied) · enquiry (Essential) · `/e/[slug]` (Signature look + Essential RSVP).
Admin (authed, RLS): `/admin` · `/admin/leads` · `/admin/sites/[id]` editor · `…/requirements` · `…/rsvps` · `/admin/templates` — all Essential.

## 7. Perf budget
Event sites + catalogue = the public traffic → guests on low-end Android via WhatsApp → **mobile-first, LCP green, RSVP works on any phone**; unique craft degrades to clean static. Admin internal → just snappy.

## 8. Open questions (gate the build)
1. Architecture: multi-tenant single app (recommended) vs per-site deploys.
2. Editor in v1: founder-only (recommended) vs self-serve clients (phase 2).
3. Custom domains: `site.com/e/slug` (v1) vs `client.com` (phase 2 infra).
4. RSVP fields + host notification (email/WhatsApp)?
5. # templates at launch (the design long-pole).
6. Languages (EN + Hindi/Gujarati on event sites?).

## 9. Tightened brief (for doc-gen-master)
> An event-website **business as software**: a founder-owned **platform** (Signature public catalogue → enquiry → an Essential admin: leads + per-client requirement checklists + an editor that fills a chosen template with the client's content) that **generates standalone, permanent event sites** — each deployed to its **own Vercel project + custom domain** (`richawedsrahul.com`), single-page, visually unique (token-driven), with an **RSVP form that posts back to the platform** (central guest-lists). Founder-edits-v1 (self-serve = phase 2). The moat = the admin auth/RLS + the CRM/requirements + the template→site generation/deploy pipeline + central RSVP collection. The one action: catalogue → enquiry; event site → RSVP. Out (phase 2): self-serve client editing, in-platform payments.

## META — notes for the skill
- **Biggest value was an architecture reframe** (per-deploy → multi-tenant), not a tier call. The skill should explicitly probe "does the client's mental model of *how* it's delivered scale to their *goal*?" — surface scaling/architecture mismatches in discovery, before doc-gen.
- **Two audiences, two conversions** (client-enquiry + guest-RSVP) — the skill should ask "who ELSE opens this?" because a platform has multiple audiences with different devices/perf needs.
- **Capability-heavy + craft-light-but-varied** is a new shape (vs Inspire's capability-heavy/craft-Essential): here the *many light frontends* must each look unique via tokens — a third corner of the two-axis space.
- **This is the forward round-trip in progress** — compare the shipped build against this brief as the proof completes.
