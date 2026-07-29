import { describe, it, expect } from 'vitest';
import { extractNumbers, hasNoFabrication, assertGated } from '../lib/logic/ai-guardrail';

describe('extractNumbers', () => {
  it('normalizes commas and trailing zeros', () => {
    expect(extractNumbers('we found 1,240 visits and 12.0 leads')).toEqual(new Set(['1240', '12']));
  });
});

describe('hasNoFabrication', () => {
  const facts = 'Traffic was 1,240 visits/mo with a 3% conversion rate.';

  it('passes when the rewrite uses only given numbers', () => {
    const out = 'You get about 1240 visits a month and convert 3%.';
    expect(hasNoFabrication(facts, out)).toEqual({ ok: true, offending: [] });
  });

  it('catches an invented figure', () => {
    const out = '1240 visits a month — and 87% of them bounce.'; // 87 was never given
    const r = hasNoFabrication(facts, out);
    expect(r.ok).toBe(false);
    expect(r.offending).toContain('87');
  });
});

describe('assertGated', () => {
  it('passes a clean client payload', () => {
    expect(assertGated({ score: 72, headline: 'Strong' }).ok).toBe(true);
  });

  it('catches an internal key nested anywhere', () => {
    const payload = { score: 72, sections: [{ title: 'x', recommendations: ['fix it'] }] };
    const r = assertGated(payload);
    expect(r.ok).toBe(false);
    expect(r.offending).toContain('recommendations');
  });

  it('honors a custom banned-key list', () => {
    expect(assertGated({ cost: 5 }, ['cost']).ok).toBe(false);
  });
});
