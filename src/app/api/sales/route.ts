import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

const HEADERS = ['ID', 'Date', 'Time', 'Customer', 'SKU', 'Name', 'Qty', 'Unit Price', 'Discount', 'Effective Price', 'Line Total', 'Sale Discount', 'Total'];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const salesSheetId = searchParams.get('salesSheetId');
  if (!salesSheetId) return NextResponse.json({ error: 'Missing salesSheetId' }, { status: 400 });

  const fromStr = searchParams.get('from');
  const toStr = searchParams.get('to');
  const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const filterByDate = !!(fromStr || toStr);
  const fromYMD = fromStr ?? '';
  const toYMD_ = toStr ?? '';
  const fromDate = filterByDate ? new Date(fromYMD) : null;
  const toDate = filterByDate ? (() => { const d = new Date(toYMD_); d.setUTCHours(23, 59, 59, 999); return d; })() : null;

  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  const ss = await sheetsApi.spreadsheets.get({ spreadsheetId: salesSheetId, fields: 'sheets/properties' });
  const allTabs = ss.data.sheets?.map(s => s.properties?.title ?? '').filter(Boolean) ?? [];

  const relevantTabs = allTabs.filter(name => {
    const match = name.match(/^(\w+)-(\d{4})$/);
    if (!match) return false;
    if (!filterByDate) return true;
    const tabDate = new Date(`${match[1]} 1, ${match[2]}`);
    if (isNaN(tabDate.getTime())) return false;
    const tabEnd = new Date(tabDate.getFullYear(), tabDate.getMonth() + 1, 0);
    tabEnd.setHours(23, 59, 59, 999);
    return tabDate <= toDate! && tabEnd >= fromDate!;
  });

  const undoneIds = new Set<string>();
  const salesMap = new Map<string, {
    id: string; date: string; time: string; customer: string;
    lines: { sku: string; name: string; qty: number; unitPrice: number; discount: string; effectivePrice: number; lineTotal: number }[];
    saleDiscount: string; total: number;
  }>();

  for (const tab of relevantTabs) {
    let resp;
    try {
      resp = await sheetsApi.spreadsheets.values.get({
        spreadsheetId: salesSheetId,
        range: `'${tab}'!A:M`,
      });
    } catch {
      continue;
    }
    const rows = resp.data.values ?? [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row?.[0]) continue;
      const id = String(row[0]);

      if (id.startsWith('UNDO-')) {
        undoneIds.add(id.slice(5));
        continue;
      }

      const dateStr = String(row[1] ?? '');
      if (filterByDate) {
        const parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) continue;
        const rowYMD = toYMD(parsedDate);
        if (rowYMD < fromYMD || rowYMD > toYMD_) continue;
      }

      const line = {
        sku: String(row[4] ?? ''),
        name: String(row[5] ?? ''),
        qty: parseInt(String(row[6] ?? '0'), 10) || 0,
        unitPrice: parseFloat(String(row[7] ?? '0')) || 0,
        discount: String(row[8] ?? ''),
        effectivePrice: parseFloat(String(row[9] ?? '0')) || 0,
        lineTotal: parseFloat(String(row[10] ?? '0')) || 0,
      };

      if (salesMap.has(id)) {
        salesMap.get(id)!.lines.push(line);
      } else {
        salesMap.set(id, {
          id,
          date: dateStr,
          time: String(row[2] ?? ''),
          customer: String(row[3] ?? ''),
          lines: [line],
          saleDiscount: String(row[11] ?? ''),
          total: parseFloat(String(row[12] ?? '0')) || 0,
        });
      }
    }
  }

  const sales = Array.from(salesMap.values())
    .map(s => ({ ...s, status: undoneIds.has(s.id) ? 'undone' : 'recorded' as const }))
    .sort((a, b) => {
      const da = new Date(`${a.date} ${a.time}`).getTime();
      const db = new Date(`${b.date} ${b.time}`).getTime();
      return db - da;
    });

  return NextResponse.json({ sales });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { salesSheetId, saleId, date, time, customer, lines, saleDiscount, saleTotal } = await req.json();
  if (!salesSheetId || !Array.isArray(lines) || !lines.length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  const now = new Date();
  const tabName = `${now.toLocaleString('en-US', { month: 'long' })}-${now.getFullYear()}`;

  const ss = await sheetsApi.spreadsheets.get({ spreadsheetId: salesSheetId, fields: 'sheets/properties' });
  const tabExists = ss.data.sheets?.some(s => s.properties?.title === tabName);
  if (!tabExists) {
    await sheetsApi.spreadsheets.batchUpdate({
      spreadsheetId: salesSheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
    });
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: salesSheetId,
      range: `'${tabName}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
  }

  const rows = lines.map((l: { sku: string; name: string; qty: number; unitPrice: number; discount: string; effectivePrice: number; lineTotal: number }, i: number) => [
    saleId, date, time, customer ?? '',
    l.sku, l.name, l.qty,
    Number(l.unitPrice).toFixed(2),
    l.discount ?? '',
    Number(l.effectivePrice).toFixed(2),
    Number(l.lineTotal).toFixed(2),
    i === 0 ? (saleDiscount ?? '') : '',
    i === 0 ? Number(saleTotal).toFixed(2) : '',
  ]);

  await sheetsApi.spreadsheets.values.append({
    spreadsheetId: salesSheetId,
    range: `'${tabName}'!A:M`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });

  return NextResponse.json({ ok: true });
}
