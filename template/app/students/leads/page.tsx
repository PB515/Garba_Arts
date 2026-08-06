import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createStudent, claimLead, setStudentStatus } from '../actions';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { STATUS_OPTIONS, statusLabel, statusColor } from '@/lib/status';
import { StatusDot } from '../status-dot';
import { StatusQuickSet } from '../status-quick-set';
import { SourceField } from '../source-field';
import { orIlikeValue, buildQueryString } from '@/lib/form';
import { getStaffRole, isSuperAdmin, isTriageAdmin } from '@/lib/roles';
import { ClaimLeadButtons } from './claim-lead-buttons';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

/**
 * The shared, unclaimed pool — a caller who hasn't decided Aalay vs.
 * Sportsclub yet. Nobody owns these (RLS's `location_id is null` branch,
 * decision #51), so every location_admin and super_admin sees the exact
 * same list here, not just their own location's slice. One-click "Claim
 * for X" moves a row out of this tab permanently — once claimed it behaves
 * like any normal Inquiry record.
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
  const triageAdmin = isTriageAdmin(staffRole);

  const { data: allLocations } = await supabase.from('locations').select('id, name').order('name');

  // A location_admin only ever gets their own claim button — RLS enforces
  // this is more than cosmetic (see claimLead's comment), but no reason to
  // even show a button that would just be rejected. super_admin and
  // triage_admin can claim into either location.
  const claimableLocations = superAdmin || triageAdmin
    ? (allLocations ?? [])
    : (allLocations ?? []).filter((l) => l.id === staffRole?.locationId);

  let query = supabase
    .from('students')
    .select('id, name, phone_number, status, source, remarks, deleted_at')
    .is('deleted_at', null)
    .is('location_id', null)
    .order('created_at', { ascending: false });

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
          <form action={createStudent} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <input name="name" placeholder="Full Name" required className={FIELD_CLASS} />
            <input name="phone_number" placeholder="Phone" required className={FIELD_CLASS} />
            <input name="whatsapp_number" placeholder="WhatsApp (if different)" className={FIELD_CLASS} />
            <SourceField className={FIELD_CLASS} />
            <input name="remarks" placeholder="Remarks" className={`col-span-2 sm:col-span-3 ${FIELD_CLASS}`} />
            <button type="submit" className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              Add
            </button>
          </form>
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
            <EmptyState title="No leads waiting" message="Everyone who's called in has already picked a location." />
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/10 text-left">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Remarks</th>
                    <th className="p-3">Quick set</th>
                    <th className="p-3">Claim</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="p-3">
                        <StatusDot color={statusColor(s.status)} label={statusLabel(s.status)} />
                      </td>
                      <td className="p-3">
                        <Link href={`/students/${s.id}?from=leads`} className="font-medium underline">
                          {s.name}
                        </Link>
                      </td>
                      <td className="p-3">{s.phone_number}</td>
                      <td className="p-3">{s.source ?? '-'}</td>
                      <td className="p-3 max-w-[16rem] truncate">{s.remarks ?? '-'}</td>
                      <td className="p-3">
                        <StatusQuickSet
                          studentName={s.name}
                          options={STATUS_OPTIONS.map((opt) => ({
                            value: opt,
                            label: statusLabel(opt),
                            color: statusColor(opt),
                            action: setStudentStatus.bind(null, s.id, opt),
                          }))}
                        />
                      </td>
                      <td className="p-3">
                        <ClaimLeadButtons locations={claimableLocations} onClaim={claimLead.bind(null, s.id)} />
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
