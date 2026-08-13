import { site } from '@/lib/site';
import { signOut } from '@/app/login/actions';
import { getStaffRole, isSuperAdmin, isTriageAdmin } from '@/lib/roles';
import { AppHeader } from './app-header';

export async function AppShell({
  active,
  userEmail,
  children,
}: {
  active: 'dashboard' | 'leads' | 'inquiry' | 'joined' | 'fees' | 'events' | 'event-fees' | 'navratri' | 'seasons' | 'whatsapp';
  userEmail: string | undefined;
  children: React.ReactNode;
}) {
  // Nav visibility is a UX nicety, not the security boundary — RLS + each
  // route's own check (e.g. /fees, the CSV export) are what actually
  // enforce it. This just avoids showing a link that would 403.
  const staffRole = await getStaffRole();
  const superAdmin = isSuperAdmin(staffRole);
  const triageAdmin = isTriageAdmin(staffRole);

  // triage_admin's access ends at the claim — nothing past Lead is reachable
  // for them anyway (RLS), so don't show a link that would just land on an
  // empty/403'd page.
  const links = [
    { href: '/dashboard', label: 'Dashboard', active: active === 'dashboard' },
    { href: '/students/leads', label: 'Lead', active: active === 'leads' },
    // Open to every role (decision, 0027) - unlike everything else below,
    // this isn't gated by triageAdmin at all.
    { href: '/whatsapp', label: 'WhatsApp', active: active === 'whatsapp' },
    ...(!triageAdmin
      ? [
          { href: '/students', label: 'Inquiry', active: active === 'inquiry' },
          { href: '/students/joined', label: 'Joined', active: active === 'joined' },
          ...(superAdmin ? [{ href: '/fees', label: 'Fees', active: active === 'fees' }] : []),
          { href: '/events', label: 'Events', active: active === 'events' },
          ...(superAdmin ? [{ href: '/events/fees', label: 'Event Fees', active: active === 'event-fees' }] : []),
          { href: '/navratri-admin', label: 'Navratri', active: active === 'navratri' },
          ...(superAdmin ? [{ href: '/seasons', label: 'Seasons', active: active === 'seasons' }] : []),
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader siteName={site.name} links={links} userEmail={userEmail} signOutAction={signOut} />
      <main className="p-6">{children}</main>
    </div>
  );
}
