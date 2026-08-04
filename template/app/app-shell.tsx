import Link from 'next/link';
import { site } from '@/lib/site';
import { signOut } from '@/app/login/actions';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';

export async function AppShell({
  active,
  userEmail,
  children,
}: {
  active: 'dashboard' | 'leads' | 'inquiry' | 'joined' | 'fees' | 'events' | 'navratri';
  userEmail: string | undefined;
  children: React.ReactNode;
}) {
  // Nav visibility is a UX nicety, not the security boundary — RLS + each
  // route's own check (e.g. /fees, the CSV export) are what actually
  // enforce it. This just avoids showing a link that would 403.
  const staffRole = await getStaffRole();
  const superAdmin = isSuperAdmin(staffRole);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg font-semibold">{site.name}</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className={active === 'dashboard' ? 'font-semibold' : 'text-muted'}>
              Dashboard
            </Link>
            <Link href="/students/leads" className={active === 'leads' ? 'font-semibold' : 'text-muted'}>
              Lead
            </Link>
            <Link href="/students" className={active === 'inquiry' ? 'font-semibold' : 'text-muted'}>
              Inquiry
            </Link>
            <Link href="/students/joined" className={active === 'joined' ? 'font-semibold' : 'text-muted'}>
              Joined
            </Link>
            {superAdmin ? (
              <Link href="/fees" className={active === 'fees' ? 'font-semibold' : 'text-muted'}>
                Fees
              </Link>
            ) : null}
            <Link href="/events" className={active === 'events' ? 'font-semibold' : 'text-muted'}>
              Events
            </Link>
            <Link href="/navratri-admin" className={active === 'navratri' ? 'font-semibold' : 'text-muted'}>
              Navratri
            </Link>
          </nav>
        </div>
        <form action={signOut} className="flex items-center gap-3">
          <span className="text-sm text-muted">{userEmail}</span>
          <button type="submit" className="text-sm underline">
            Sign out
          </button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
