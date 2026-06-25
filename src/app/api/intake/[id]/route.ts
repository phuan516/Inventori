import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import type { IntakeLine } from '@/lib/intakeData';

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

let _lineId = 0;
function lineId() { return `RL${++_lineId}`; }

function rowToLine(row: string[]): IntakeLine {
  return {
    id: lineId(),
    sku: row[0] ?? '',
    upc: row[1] ?? '',
    name: row[2] ?? '',
    qty: parseInt(row[3]) || 0,
    cost: parseFloat(row[4]) || 0,
    price: parseFloat(row[5]) || 0,
    mfr: row[6] ?? '',
    cat: row[7] ?? '',
    grade: (row[8] as IntakeLine['grade']) || '—',
    series: row[9] ?? '',
    hue: parseInt(row[10]) || 0,
    matched: row[11] === 'TRUE' || row[11] === 'true',
    low: parseInt(row[12]) || 0,
    onHand: null,
  };
}

function lineToRow(l: IntakeLine): (string | number)[] {
  return [l.sku, l.upc, l.name, l.qty, l.cost, l.price, l.mfr, l.cat, l.grade, l.series, l.hue, String(l.matched), l.low];
}

type Ctx = { params: Promise<{ id: string }> };

// GET /api/intake/[tabName]?intakeSheetId=xxx — read intake lines
export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const intakeSheetId = req.nextUrl.searchParams.get('intakeSheetId');
  if (!intakeSheetId) return NextResponse.json({ error: 'intakeSheetId required' }, { status: 400 });

  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: intakeSheetId,
    range: `'${id}'!A2:M`,
  });

  const rows = (res.data.values ?? []) as string[][];
  const lines = rows.filter(r => r.some(c => c !== '' && c != null)).map(rowToLine);

  return NextResponse.json({ lines });
}

// PUT /api/intake/[tabName]?intakeSheetId=xxx — save lines and update status
export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const intakeSheetId = req.nextUrl.searchParams.get('intakeSheetId');
  if (!intakeSheetId) return NextResponse.json({ error: 'intakeSheetId required' }, { status: 400 });

  const { lines, status, sheetId } = (await req.json()) as {
    lines: IntakeLine[];
    status: 'draft' | 'committed';
    sheetId?: string;
  };

  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  await sheetsApi.spreadsheets.values.clear({ spreadsheetId: intakeSheetId, range: `'${id}'!A2:M` });
  if (lines.length > 0) {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: intakeSheetId,
      range: `'${id}'!A2`,
      valueInputOption: 'RAW',
      requestBody: { values: lines.map(lineToRow) },
    });
  }

  // Update status in Sessions tab
  const sessRes = await sheetsApi.spreadsheets.values.get({ spreadsheetId: intakeSheetId, range: 'Sessions!A:A' });
  const tabNames = (sessRes.data.values ?? []) as string[][];
  const rowIdx = tabNames.findIndex((r, i) => i > 0 && r[0] === id);
  if (rowIdx > 0) {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: intakeSheetId,
      range: `Sessions!B${rowIdx + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[status]] },
    });
  }

  if (status === 'committed' && sheetId && lines.length > 0) {
    await applyToInventory(sheetsApi, sheetId, lines);
    revalidateTag(`products:${sheetId}`);
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/intake/[tabName]?intakeSheetId=xxx — delete this intake tab
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const intakeSheetId = req.nextUrl.searchParams.get('intakeSheetId');
  if (!intakeSheetId) return NextResponse.json({ error: 'intakeSheetId required' }, { status: 400 });

  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  const ss = await sheetsApi.spreadsheets.get({ spreadsheetId: intakeSheetId, fields: 'sheets/properties' });
  const sheetTab = ss.data.sheets?.find(s => s.properties?.title === id);
  if (!sheetTab?.properties?.sheetId) return NextResponse.json({ error: 'Tab not found' }, { status: 404 });

  await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId: intakeSheetId,
    requestBody: { requests: [{ deleteSheet: { sheetId: sheetTab.properties.sheetId } }] },
  });

  // Remove from Sessions tab
  const sessRes = await sheetsApi.spreadsheets.values.get({ spreadsheetId: intakeSheetId, range: 'Sessions!A:C' });
  const rows = (sessRes.data.values ?? []) as string[][];
  const remaining = rows.filter((r, i) => i === 0 || r[0] !== id);

  await sheetsApi.spreadsheets.values.clear({ spreadsheetId: intakeSheetId, range: 'Sessions!A:C' });
  if (remaining.length > 0) {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: intakeSheetId, range: 'Sessions!A1', valueInputOption: 'RAW',
      requestBody: { values: remaining },
    });
  }

  return NextResponse.json({ ok: true });
}

async function applyToInventory(
  sheetsApi: ReturnType<typeof google.sheets>,
  sheetId: string,
  lines: IntakeLine[],
) {
  const invRes = await sheetsApi.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Products!A:K' });
  const invRows = (invRes.data.values ?? []) as string[][];

  const skuMap = new Map<string, { rowNum: number; stock: number }>();
  const upcMap = new Map<string, { rowNum: number; stock: number }>();
  invRows.forEach((row, i) => {
    if (i === 0) return;
    const entry = { rowNum: i + 1, stock: parseInt(row[6]) || 0 };
    if (row[0]) skuMap.set(row[0], entry);
    if (row[1]) upcMap.set(row[1], entry);
  });

  const stockUpdates: { range: string; values: number[][] }[] = [];
  const newRows: (string | number)[][] = [];

  for (const line of lines) {
    const existing = skuMap.get(line.sku) ?? skuMap.get(line.sku.toUpperCase())
      ?? upcMap.get(line.sku) ?? upcMap.get(line.sku.toUpperCase());
    if (existing) {
      stockUpdates.push({ range: `Products!G${existing.rowNum}`, values: [[existing.stock + line.qty]] });
    } else {
      newRows.push([line.sku, '', line.name, line.cat || '', line.mfr || '', line.series || '', line.qty, 0, line.price || 0, line.cost || 0, line.hue || 0]);
    }
  }

  if (stockUpdates.length > 0) {
    await sheetsApi.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { valueInputOption: 'RAW', data: stockUpdates },
    });
  }
  if (newRows.length > 0) {
    await sheetsApi.spreadsheets.values.append({
      spreadsheetId: sheetId, range: 'Products!A:K', valueInputOption: 'USER_ENTERED',
      requestBody: { values: newRows },
    });
  }
}
