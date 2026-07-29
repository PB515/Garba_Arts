import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/login/actions';
import { site } from '@/lib/site';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="font-display text-lg font-semibold">{site.name}</h1>
        <form action={signOut} className="flex items-center gap-3">
          <span className="text-sm text-muted">{user?.email}</span>
          <button type="submit" className="text-sm underline">
            Sign out
          </button>
        </form>
      </header>
      <main className="p-6">
        <p className="text-muted">
          Dashboard summary cards land here (Task #7: inquiries, conversion, headcount,
          fees collected/pending).
        </p>
      </main>
    </div>
  );
}
