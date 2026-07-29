import { describe, it, expect, vi } from 'vitest';
import { IdempotencyStore, isDuplicate } from '../lib/logic/idempotency';

describe('IdempotencyStore.once', () => {
  it('runs the operation once and dedupes the retry', async () => {
    const store = new IdempotencyStore<number>();
    const fn = vi.fn(async () => 42);

    const first = await store.once('charge:order-1', fn);
    const second = await store.once('charge:order-1', fn);

    expect(first).toEqual({ result: 42, deduped: false });
    expect(second).toEqual({ result: 42, deduped: true });
    expect(fn).toHaveBeenCalledTimes(1); // the side effect ran exactly once
  });

  it('treats different keys as independent', async () => {
    const store = new IdempotencyStore<string>();
    await store.once('a', async () => 'x');
    const b = await store.once('b', async () => 'y');
    expect(b.deduped).toBe(false);
    expect(store.has('a')).toBe(true);
  });

  it('requires a key', async () => {
    const store = new IdempotencyStore();
    await expect(store.once('', async () => 1)).rejects.toThrow();
  });
});

describe('isDuplicate', () => {
  it('detects a key already in the processed set', () => {
    expect(isDuplicate('k1', ['k0', 'k1'])).toBe(true);
    expect(isDuplicate('k2', ['k0', 'k1'])).toBe(false);
  });
});
