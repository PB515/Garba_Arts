# Metrics — token/cost track record across site builds

*Why this exists: the IDP's core bet is that pre-built infrastructure + deterministic tooling reduces LLM token spend per site (less generation, less debugging-loop, less re-derivation) versus building each site from scratch. That was a plausible claim, not a measured one (see `CLAUDE.md`'s discussion of it). This folder is where it gets measured, one real build at a time — starting with `jules` (site 1 of 5).*

## What goes here

- `token-usage.md` — one row per (site, phase/session). Filled in **manually** after each working session — nothing in this repo auto-captures it (see "Why manual" below).

## How to fill in a row after a session

1. In the Claude Code session that did the work, run `/cost` (or check whatever usage indicator your client shows).
2. Add a row to `token-usage.md` with the site name, a short phase/session label, the date, and whatever the client reported (tokens and/or cost — record whichever it gives you).
3. Note the **source** (`/cost` in Claude Code · Anthropic Console · estimated) — the numbers aren't directly comparable across sources, so don't average across them without checking.

## Why manual

There's no tool available to this session (or any session) that can query a *different* session's token/cost usage after the fact — sessions aren't introspectable from outside themselves. If you're on a subscription plan (Pro/Max) rather than pay-per-token API billing, there may be no dollar cost at all, only a token count. `/cost` inside the session that did the work is the most reliable source; do it before closing that session, since it may not be recoverable afterward.

## Reading the numbers later

Once a few sites have at least one comparable phase logged (e.g. "Phase 1 — Foundation" across sites 1–3), it becomes possible to say something real about whether the IDP is actually saving tokens per site versus the first build's cost — that comparison is the point. Don't over-read a single data point; site 1 (`jules`) also carries one-time signal-finding cost (this project's own hardening pass, first real run of `doc-gen-master`-adjacent judgment calls) that later sites shouldn't repeat.
