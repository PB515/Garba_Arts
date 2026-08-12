import { HONEYPOT_FIELD } from '@/lib/security';
import { currentNavratriTier } from '@/lib/navratri-config';
import { submitRegistration } from './actions';
import { SubmitButton } from '@/lib/patterns/submit-button';

export default async function NavratriPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const tier = currentNavratriTier();

  async function action(formData: FormData) {
    'use server';
    const result = await submitRegistration(formData);
    if (result?.error) {
      const { redirect } = await import('next/navigation');
      redirect(`/navratri?error=${encodeURIComponent(result.error)}`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-2xl font-semibold">The Garba Arts: Navratri Passes</h1>
          <p className="text-sm text-muted">Register your group for a pass. One person can register for everyone coming with them.</p>
        </div>

        {tier.status === 'closed' ? (
          <div className="rounded-[var(--radius)] border border-border p-4 text-center text-sm">
            Pass registration is closed.
          </div>
        ) : (
          <>
            <div className="rounded-[var(--radius)] border border-border p-4 text-center text-sm">
              {tier.status === 'early_bird' ? 'Early-bird price' : 'Current price'}:{' '}
              <span className="font-semibold">₹{tier.pricePerPass} / pass</span>
            </div>

            <form action={action} className="space-y-4">
              {/* Honeypot — real visitors never see or fill this. */}
              <input
                type="text"
                name={HONEYPOT_FIELD}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <div className="space-y-1">
                <label htmlFor="representative_name" className="text-sm font-medium">
                  Your full name
                </label>
                <input
                  id="representative_name"
                  name="representative_name"
                  required
                  className="w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="representative_phone" className="text-sm font-medium">
                  Your phone number
                </label>
                <input
                  id="representative_phone"
                  name="representative_phone"
                  required
                  className="w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="pass_count" className="text-sm font-medium">
                  How many passes (including yourself)?
                </label>
                <input
                  id="pass_count"
                  name="pass_count"
                  type="number"
                  min={1}
                  required
                  defaultValue={1}
                  className="w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="remarks" className="text-sm font-medium">
                  Anything else? (optional)
                </label>
                <input
                  id="remarks"
                  name="remarks"
                  className="w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
                />
              </div>

              {params.error && (
                <p role="alert" className="text-sm text-red-600">
                  {params.error}
                </p>
              )}

              <SubmitButton className="w-full rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
                Register
              </SubmitButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
