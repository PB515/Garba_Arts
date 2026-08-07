import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { claimLead } from '../actions';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { STATUS_OPTIONS, statusLabel } from '@/lib/status';
import { orIlikeValue, buildQueryString, whatsappLink } from '@/lib/form';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { ClaimLeadButtons } from './claim-lead-buttons';
import { AddLeadForm } from './add-lead-form';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

// Same light tint styling already used for Joined's fee status - red here
// means "hasn't moved to Inquiry/Joined yet", not a fee state.
const UNCLAIMED_TINT = '#dc262614';

/**
 * A permanent log of every call that ever came in undecided (decision #61) -
 * not a shrinking pool. `is_lead = true` marks a row as having originated
 * here; it stays true forever, so a row never disappears just because it
 * gets claimed. Red-tinted while still unclaimed (location_id null), white
 * once claimed. Sourced from `lead_log()` (0023), a SECURITY DEFINER
 * function - NOT a widened table-level RLS policy - so this shared view is
 * genuinely scoped to just this list. Clicking through to the full detail
 * page still respects normal location-scoped RLS: once claimed elsewhere,
 * only that location's admin and super_admin can open the real record, same
 * as everywhere else in the app. Any staff member, any role, can claim into
 * either location - claiming is no longer restricted to a location_admin's
 * own location (0022).
 */
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const staffRole = await getStaffRole();
  const superAdmin = isSuperAdmin(staffRole);

  const { data: allLocations } = await supabase.from('locations').select('id, name').order('name');
  const locationName = new Map((allLocations ?? []).map((l) => [l.id, l.name]));

  let query = supabase.rpc('lead_log');

  if (params.status) query = query.eq('status', params.status);
  if (params.q) {
    const v = orIlikeValue(params.q);
    query = query.or(`name.ilike.${v},phone_number.ilike.${v}`);
  }

  const { data: leads, error } = await query;

  return (
    <AppShell active="leads" userEmail={user?.email}>
      <div className="space-y-8">
        <section className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Add lead</h2>
          {/* Keyed on the current lead count: createLead doesn't redirect
              (staying here is the point, for back-to-back call intake), so
              this remount is what clears both the fields and any lingering
              error message after a successful add - same trick already used
              for the Joined filter form and the event AttendeeRows reset. */}
          <AddLeadForm key={leads?.length ?? 0} />
        </section>

        <section>
          <form key={JSON.stringify(params)} className="mb-4 flex flex-wrap gap-3" method="get">
            <input
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="Search name or phone"
              className={FIELD_CLASS}
            />
            <select name="status" defaultValue={params.status ?? ''} className={FIELD_CLASS}>
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
              Filter
            </button>
            {superAdmin ? (
              <a
                href={`/api/export/students${buildQueryString({ q: params.q, status: params.status, unclaimed: '1' })}`}
                className="ml-auto rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
              >
                Export CSV
              </a>
            ) : null}
          </form>

          {error ? (
            <p className="text-sm text-red-600">Could not load: {error.message}</p>
          ) : !leads?.length ? (
            <EmptyState title="No leads yet" message="Every call that comes in undecided will show up here, permanently." />
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/10 text-left">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Remarks</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">Claim</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((s) => {
                    const waLink = whatsappLink(s.phone_number, s.whatsapp_number);
                    return (
                      <tr
                        key={s.id}
                        className="border-t border-border"
                        style={{ backgroundColor: s.location_id ? undefined : UNCLAIMED_TINT }}
                      >
                        <td className="p-3">
                          <Link href={`/students/${s.id}?from=leads`} className="font-medium underline">
                            {s.name}
                          </Link>
                        </td>
                        <td className="p-3">{s.phone_number}</td>
                        <td className="p-3">{s.source ?? '-'}</td>
                        <td className="p-3 max-w-[16rem] truncate">{s.remarks ?? '-'}</td>
                        <td className="p-3">
                          {waLink ? (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-[var(--radius)] border border-border px-2 py-1 text-xs font-medium"
                            >
                              WhatsApp
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3">
                          {s.location_id ? (
                            <span className="text-muted">{locationName.get(s.location_id) ?? '-'}</span>
                          ) : (
                            <ClaimLeadButtons locations={allLocations ?? []} onClaim={claimLead.bind(null, s.id)} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
