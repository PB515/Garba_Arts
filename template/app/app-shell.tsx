import Link from 'next/link';
import { site } from '@/lib/site';
import { signOut } from '@/app/login/actions';

export function AppShell({
  active,
  userEmail,
  children,
}: {
  active: 'dashboard' | 'students';
  userEmail: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg font-semibold">{site.name}</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className={active === 'dashboard' ? 'font-semibold' : 'text-muted'}>
              Dashboard
            </Link>
            <Link href="/students" className={active === 'students' ? 'font-semibold' : 'text-muted'}>
              Students
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
