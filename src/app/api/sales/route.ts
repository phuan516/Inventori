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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { salesSheetId, saleId, date, time, customer, lines, saleDiscount, saleTotal } = await req.json();
  if (!salesSheetId || !Array.isArray(lines) || !lines.length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  // Tab name for current month: e.g. "June-2026"
  const now = new Date();
  const tabName = `${now.toLocaleString('en-US', { month: 'long' })}-${now.getFullYear()}`;

  // Create the month tab if it doesn't exist yet
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

  // One row per line item; sale discount and sale total only on first row
  const rows = lines.map((l: { sku: string; name: string; qty: number; unitPrice: number; discount: string; effectivePrice: number; lineTotal: number }, i: number) => [
    saleId,
    date,
    time,
    customer ?? '',
    l.sku,
    l.name,
    l.qty,
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
