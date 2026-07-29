/**
 * timeline.ts — the one place that controls pacing for pinned scroll sequences
 * (scene-reels, guided tours, future chapters).
 *
 * Give each beat a WEIGHT (relative scroll length). buildTimeline turns the weights
 * into a [start, end] progress window per beat and the total section height in vh.
 * Two knobs, no magic numbers scattered around:
 *   • bump a beat's weight  → that beat gets more scroll (reads slower)
 *   • bump vhPerUnit        → the whole sequence gets longer (more scroll overall)
 *
 * Example:
 *   const { heightVh, windows } = buildTimeline([1, 1, 1.5, 2], 100);
 *   // windows[i] = [start, end] in 0..1 ; heightVh drives <section style={{height}}>
 */
export type Win = [number, number];

export function buildTimeline(weights: number[], vhPerUnit = 100): { heightVh: number; windows: Win[] } {
  const total = weights.reduce((s, w) => s + w, 0) || 1;
  let acc = 0;
  const windows: Win[] = weights.map((w) => {
    const start = acc / total;
    acc += w;
    return [start, acc / total];
  });
  return { heightVh: total * vhPerUnit, windows };
}
