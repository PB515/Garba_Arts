import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  const params = request.nextUrl.searchParams;

  let query = supabase
    .from('students')
    .select('id, name, phone_number, source, status, location_id, batch_id, starting_date, fee_total, remarks, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const location = params.get('location');
  const batch = params.get('batch');
  const status = params.get('status');
  const q = params.get('q');
  if (location) query = query.eq('location_id', location);
  if (batch) query = query.eq('batch_id', batch);
  if (status) query = query.eq('status', status);
  if (q) query = query.or(`name.ilike.%${q}%,phone_number.ilike.%${q}%`);

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
    'Source',
    'Status',
    'Location',
    'Batch',
    'Starting date',
    'Fee total',
    'Paid',
    'Balance',
    'Remarks',
    'Created at',
  ];

  const rows = (students ?? []).map((s) => {
    const paid = paidByStudent.get(s.id) ?? 0;
    const balance = s.fee_total !== null ? s.fee_total - paid : '';
    return [
      s.name,
      s.phone_number,
      s.source ?? '',
      s.status ?? '',
      s.location_id ? (locationName.get(s.location_id) ?? '') : '',
      s.batch_id ? (batchName.get(s.batch_id) ?? '') : '',
      s.starting_date ?? '',
      s.fee_total ?? '',
      paid,
      balance,
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
