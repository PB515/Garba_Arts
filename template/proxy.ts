import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// /navratri is a deliberate public surface (proof-of-concept pass
// registration, no login) — see docs/data-model-security.md and CLAUDE.md
// decision #25. Everything else in this app stays staff-only.
const PUBLIC_PATHS = ['/login', '/navratri'];

// /events/[id]/register (and its /thank-you) is public too, but /events and
// /events/[id] themselves are staff-only — a prefix match would wrongly open
// the whole admin events section, so this needs its own pattern.
const PUBLIC_EVENT_REGISTER = /^\/events\/[^/]+\/register(\/thank-you)?$/;

// The short /e/[slug] link (0032) - just a lookup+redirect to the path
// above, but it needs to be reachable pre-redirect with no session too.
const PUBLIC_EVENT_SHORT_LINK = /^\/e\/[^/]+$/;

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const path = request.nextUrl.pathname;
  const isPublic =
    PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`)) ||
    PUBLIC_EVENT_REGISTER.test(path) ||
    PUBLIC_EVENT_SHORT_LINK.test(path);

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if (user && path === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Every path except static assets, images, favicon, and PUBLIC_PATHS
    // above — everything else in this app is protected by default.
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)',
  ],
};
