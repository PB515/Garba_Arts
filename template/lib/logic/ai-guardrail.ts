/**
 * ai-guardrail.ts — keep AI / generated content honest (risky pure logic;
 * tested in tests/ai-guardrail.test.ts). Harvested + generalized from a real
 * build (a report writer that must never invent a figure).
 *
 * Two pure gates:
 *  - hasNoFabrication: an LLM may only rephrase facts it was GIVEN — it must
 *    never introduce a number/figure not present in its input. Run this on
 *    every AI rewrite before showing it to a user.
 *  - assertGated: only safe data leaves the server — a payload sent to the
 *    browser must contain none of the internal/banned keys.
 *
 * Pure + deterministic so they unit-test without a model or a network.
 */

/** Extract normalized numeric tokens (commas stripped) from text. */
export function extractNumbers(text: string): Set<string> {
  const out = new Set<string>();
  const cleaned = text.replace(/,(?=\d)/g, ''); // 1,240 → 1240
  for (const m of cleaned.matchAll(/\d+(?:\.\d+)?/g)) {
    out.add(m[0].replace(/\.0+$/, '')); // 12.0 → 12
  }
  return out;
}

/**
 * True iff every number in `output` also appears in `inputFacts`.
 * Use when: gating an LLM rewrite — if it introduced a figure that wasn't in
 * the source facts, it fabricated; reject and fall back to the source text.
 */
export function hasNoFabrication(
  inputFacts: string,
  output: string
): { ok: boolean; offending: string[] } {
  const allowed = extractNumbers(inputFacts);
  const offending: string[] = [];
  for (const n of extractNumbers(output)) {
    if (!allowed.has(n)) offending.push(n);
  }
  return { ok: offending.length === 0, offending };
}

/** Sensible default of internal keys that must never reach the browser. */
export const DEFAULT_BANNED_KEYS = [
  'weight',
  'weights',
  'internal',
  'internal_payload',
  'recommendation',
  'recommendations',
  'raw_signals',
  'prompt',
  'system_prompt',
  'secret',
];

/**
 * Recursively assert a payload contains none of the banned keys.
 * Use when: building the object you send to the client — only the safe payload
 * leaves the server; internal scoring/recommendations/prompts stay server-side.
 */
export function assertGated(
  payload: unknown,
  bannedKeys: string[] = DEFAULT_BANNED_KEYS
): { ok: boolean; offending: string[] } {
  const banned = new Set(bannedKeys.map((k) => k.toLowerCase()));
  const offending: string[] = [];
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === 'object') {
      for (const k of Object.keys(node as Record<string, unknown>)) {
        if (banned.has(k.toLowerCase())) offending.push(k);
        walk((node as Record<string, unknown>)[k]);
      }
    }
  };
  walk(payload);
  return { ok: offending.length === 0, offending };
}
