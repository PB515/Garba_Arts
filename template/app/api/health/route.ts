import { createClient } from '@/lib/supabase/server';

/**
 * Health check + free-tier keep-alive.
 *
 * Returns 200 when the DB answers. A daily external cron (see
 * .github/workflows/keepalive.yml) hits this so the real DB query resets
 * Supabase's 7-day inactivity timer and the free project doesn't pause.
 * See docs/runbooks/free-tier-uptime.md.
 */
export const dynamic = 'force-dynamic'; // never cache — a cached 200 wouldn't touch the DB

export async function GET() {
  try {
    const supabase = await createClient();
    // keepalive() ships in migration 0002. Cast so the route compiles even before
    // a fresh clone has regenerated database.types.ts via `migrate up` — the
    // route's build must not depend on the per-site generated types.
    type RpcFn = (fn: string) => Promise<{ error: { message: string } | null }>;
    const { error } = await (supabase.rpc as unknown as RpcFn)('keepalive'); // a real DB round-trip
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }
    return Response.json({ ok: true, at: new Date().toISOString() });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
