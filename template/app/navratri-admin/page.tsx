import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { currentNavratriTier } from '@/lib/navratri-config';
import { updateAmountPaid, archiveRegistration, permanentlyDeleteRegistration } from './actions';

export default async function NavratriAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: registrations, error } = await supabase
    .from('navratri_registrations')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const tier = currentNavratriTier();

  const totalPasses = (registrations ?? []).reduce((sum, r) => sum + r.pass_count, 0);
  const totalExpected = (registrations ?? []).reduce((sum, r) => sum + r.total_amount, 0);
  const totalCollected = (registrations ?? []).reduce((sum, r) => sum + r.amount_paid, 0);

  const cards = [
    { label: 'Total passes', value: totalPasses },
    { label: 'Total expected', value: totalExpected.toFixed(2) },
    { label: 'Total collected', value: totalCollected.toFixed(2) },
    {
      label: 'Current price tier',
      value: tier.status === 'closed' ? 'Closed' : `₹${tier.pricePerPass} (${tier.status === 'early_bird' ? 'early-bird' : 'standard'})`,
    },
  ];

  return (
    <AppShell active="navratri" userEmail={user?.email}>
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-[var(--radius)] border border-border p-4">
              <p className="text-xs text-muted">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold">{c.value}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted">
          Pricing/dates are placeholders (see <code>lib/navratri-config.ts</code>) until the owner confirms
          the real ones, 1-2 weeks before Navratri. Public form: <code>/navratri</code>.
        </p>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Registrations</h2>
          {error ? (
            <p className="text-sm text-red-600">Could not load registrations: {error.message}</p>
          ) : !registrations?.length ? (
            <EmptyState title="No registrations yet" message="Share the /navratri link to start collecting them." />
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/10 text-left">
                  <tr>
                    <th className="p-3">Representative</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Passes</th>
                    <th className="p-3">Price/pass</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Paid</th>
                    <th className="p-3">Remarks</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="p-3">{r.representative_name}</td>
                      <td className="p-3">{r.representative_phone}</td>
                      <td className="p-3">{r.pass_count}</td>
                      <td className="p-3">{r.price_per_pass.toFixed(2)}</td>
                      <td className="p-3">{r.total_amount.toFixed(2)}</td>
                      <td className="p-3">
                        <form action={updateAmountPaid.bind(null, r.id)} className="flex items-center gap-2">
                          <input
                            name="amount_paid"
                            type="number"
                            step="0.01"
                            defaultValue={r.amount_paid}
                            className="w-20 rounded-[var(--radius)] border border-border px-2 py-1 text-sm"
                          />
                          <button type="submit" className="underline">
                            Save
                          </button>
                        </form>
                      </td>
                      <td className="p-3">{r.remarks ?? '-'}</td>
                      <td className="p-3">
                        <div className="flex gap-3">
                          <form action={archiveRegistration.bind(null, r.id)}>
                            <button type="submit" className="underline">
                              Archive
                            </button>
                          </form>
                          <form action={permanentlyDeleteRegistration.bind(null, r.id)}>
                            <button type="submit" className="text-red-600 underline">
                              Remove
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
