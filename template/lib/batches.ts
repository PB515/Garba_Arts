/**
 * Batch names ("8-9 PM", "9-10 PM", "10-11 PM") sort wrong alphabetically —
 * "10-11 PM" comes before "8-9 PM" as a string, since '1' < '8'. Every batch
 * list in the app should read in actual class-time order instead, so this
 * sorts by the leading number in the name (the start hour) rather than the
 * raw string. Ties (same time, different location) keep their original
 * relative order, since Array.prototype.sort is stable.
 */
export function sortBatches<T extends { name: string }>(batches: T[]): T[] {
  const startHour = (name: string): number => {
    const match = name.match(/\d+/);
    return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
  };
  return [...batches].sort((a, b) => startHour(a.name) - startHour(b.name));
}
