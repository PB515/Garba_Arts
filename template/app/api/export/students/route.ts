import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { orIlikeValue } from '@/lib/form';
import { feeStatus, isFeePending } from '@/lib/fee-status';

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // CSV export is a combined, cross-student view of fee data - same
  // "individual fees ok, combined fees super-admin-only" rule as /fees.
  const staffRole = await getStaffRole();
  if (!isSuperAdmin(staffRole)) {
    return NextResponse.json({ error: 'Only super admins can export combined fee data.' }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;

  let query = supabase
    .from('students')
    .select(
      'id, name, phone_number, whatsapp_number, source, source_detail, status, location_id, batch_id, inquiry_date, fee_total, demo_fee_amount, demo_fee_paid, remarks, created_at'
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const location = params.get('location');
  const batch = params.get('batch');
  const status = params.get('status');
  const q = params.get('q');
  const pending = params.get('pending');
  const unclaimed = params.get('unclaimed');
  if (unclaimed === '1') {
    // The Lead tab's export - the tab itself is now a permanent log
    // (decision #61), so this mirrors the full is_lead list (both still-
    // unclaimed and already-claimed rows), not just the unclaimed slice.
    query = query.eq('is_lead', true);
  } else {
    if (location) query = query.eq('location_id', location);
    if (batch) query = query.eq('batch_id', batch);
  }
  if (status) query = query.eq('status', status);
  if (q) {
    const v = orIlikeValue(q);
    query = query.or(`name.ilike.${v},phone_number.ilike.${v}`);
  }

  const [{ data: students, error }, { data: locations }, { data: batches }] = await Promise.all([
    query,
    supabase.from('locations').select('id, name'),
    supabase.from('batches').select('id, name'),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (students ?? []).map((s) => s.id);
  const paidByStudent = new Map<string, number>();
  if (ids.length) {
    const { data: payments } = await supabase
      .from('payments')
      .select('student_id, amount')
      .is('deleted_at', null)
      .in('student_id', ids);
    for (const p of payments ?? []) {
      paidByStudent.set(p.student_id, (paidByStudent.get(p.student_id) ?? 0) + p.amount);
    }
  }

  const locationName = new Map((locations ?? []).map((l) => [l.id, l.name]));
  const batchName = new Map((batches ?? []).map((b) => [b.id, b.name]));

  const header = [
    'Name',
    'Phone',
    'WhatsApp',
    'Source',
    'Source detail',
    'Status',
    'Location',
    'Batch',
    'Inquiry date',
    'Fee total',
    'Paid',
    'Balance',
    'Demo fee amount',
    'Demo fee paid',
    'Remarks',
    'Created at',
  ];

  // "pending" mirrors the Joined tab's own filter (Not Paid/Half Paid) - fee
  // status is derived from a separate payments query, so this narrows the
  // already-fetched student list rather than being a SQL filter.
  const studentsForExport = pending === '1'
    ? (students ?? []).filter((s) => isFeePending(feeStatus(s.fee_total, paidByStudent.get(s.id) ?? 0)))
    : (students ?? []);

  const rows = studentsForExport.map((s) => {
    const paid = paidByStudent.get(s.id) ?? 0;
    const balance = s.fee_total !== null ? s.fee_total - paid : '';
    return [
      s.name,
      s.phone_number,
      s.whatsapp_number ?? '',
      s.source ?? '',
      s.source_detail ?? '',
      s.status ?? '',
      s.location_id ? (locationName.get(s.location_id) ?? '') : '',
      s.batch_id ? (batchName.get(s.batch_id) ?? '') : '',
      s.inquiry_date ?? '',
      s.fee_total ?? '',
      paid,
      balance,
      s.demo_fee_amount ?? '',
      s.demo_fee_paid,
      s.remarks ?? '',
      s.created_at,
    ];
  });

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
  const filename = `garba-arts-students-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
