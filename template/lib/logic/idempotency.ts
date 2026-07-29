/**
 * idempotency.ts — run-once-by-key (risky pure logic; tested in
 * tests/idempotency.test.ts).
 *
 * Payment webhooks and "submit" buttons fire twice. Without an idempotency key,
 * the second fire double-charges or double-writes. This is the pure tracking
 * core: given a key, decide whether the operation already ran, and cache its
 * result so a retry returns the same answer instead of repeating the effect.
 *
 * In production back the store with a DB table (a unique constraint on the key);
 * this in-memory store is the logic + the test double.
 */

export class IdempotencyStore<T = unknown> {
  private readonly seen = new Map<string, T>();

  has(key: string): boolean {
    return this.seen.has(key);
  }

  get(key: string): T | undefined {
    return this.seen.get(key);
  }

  remember(key: string, result: T): T {
    this.seen.set(key, result);
    return result;
  }

  /**
   * Run `fn` only if `key` hasn't been seen; otherwise return the cached result.
   * Returns whether it was a duplicate so callers can skip side effects.
   */
  async once(key: string, fn: () => Promise<T>): Promise<{ result: T; deduped: boolean }> {
    if (!key) throw new Error('idempotency key is required');
    if (this.seen.has(key)) {
      return { result: this.seen.get(key) as T, deduped: true };
    }
    const result = await fn();
    this.seen.set(key, result);
    return { result, deduped: false };
  }
}

/** Pure helper: is this key already in the processed set? */
export function isDuplicate(key: string, processed: Iterable<string>): boolean {
  for (const k of processed) if (k === key) return true;
  return false;
}
