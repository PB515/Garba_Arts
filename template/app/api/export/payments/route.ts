import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { paymentModeLabel } from '@/lib/fee-status';

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * The Fees tab's payment log, exported - one row per payment, not per
 * student (that's /api/export/students). Filtered by location/batch/mode,
 * matching the "All payments" table on the Fees page exactly, since that's
 * the thing this button sits next to.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const staffRole = await getStaffRole();
  if (!isSuperAdmin(staffRole)) {
    return NextResponse.json({ error: 'Only super admins can export combined fee data.' }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const location = params.get('location');
  const batch = params.get('batch');
  const mode = params.get('mode');

  const [{ data: payments, error }, { data: students }, { data: locations }, { data: batches }] = await Promise.all([
    supabase
      .from('payments')
      .select('id, student_id, amount, mode, cash_amount, upi_amount, paid_date, remarks')
      .is('deleted_at', null)
      .order('paid_date', { ascending: false }),
    supabase.from('students').select('id, name, location_id, batch_id').is('deleted_at', null),
    supabase.from('locations').select('id, name'),
    supabase.from('batches').select('id, name'),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const studentById = new Map((students ?? []).map((s) => [s.id, s]));
  const locationName = new Map((locations ?? []).map((l) => [l.id, l.name]));
  const batchName = new Map((batches ?? []).map((b) => [b.id, b.name]));

  const filteredPayments = (payments ?? []).filter((p) => {
    const student = studentById.get(p.student_id);
    if (location && student?.location_id !== location) return false;
    if (batch && student?.batch_id !== batch) return false;
    if (mode && p.mode !== mode) return false;
    return true;
  });

  const header = ['Date', 'Student', 'Location', 'Batch', 'Mode', 'Cash amount', 'UPI amount', 'Amount', 'Remarks'];

  const rows = filteredPayments.map((p) => {
    const student = studentById.get(p.student_id);
    return [
      p.paid_date,
      student?.name ?? '',
      student?.location_id ? (locationName.get(student.location_id) ?? '') : '',
      student?.batch_id ? (batchName.get(student.batch_id) ?? '') : '',
      paymentModeLabel(p.mode),
      p.cash_amount ?? '',
      p.upi_amount ?? '',
      p.amount,
      p.remarks ?? '',
    ];
  });

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
  const filename = `garba-arts-payments-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
