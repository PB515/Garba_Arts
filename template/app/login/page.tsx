import { signIn } from './actions';
import { site } from '@/lib/site';
import { SubmitButton } from '@/lib/patterns/submit-button';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  async function action(formData: FormData) {
    'use server';
    const result = await signIn(formData);
    if (result?.error) {
      // Server actions can't return state to a plain form without JS, so we
      // redirect back with the error in the query string. No client JS required.
      const { redirect } = await import('next/navigation');
      const next = String(formData.get('next') ?? '/dashboard');
      redirect(`/login?error=${encodeURIComponent(result.error)}&next=${encodeURIComponent(next)}`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold font-display">{site.name}</h1>
          <p className="text-sm text-muted">Core team sign-in</p>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="next" value={params.next ?? '/dashboard'} />

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
            />
          </div>

          {params.error && (
            <p role="alert" className="text-sm text-red-600">
              {params.error}
            </p>
          )}

          <SubmitButton className="w-full rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
            Sign in
          </SubmitButton>
        </form>

        <p className="text-center text-xs text-muted">
          Accounts are invite-only. Contact the team to get set up.
        </p>
      </div>
    </div>
  );
}
