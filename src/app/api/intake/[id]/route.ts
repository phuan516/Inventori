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

// DELETE /api/intake/[id] — permanently delete this intake
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const auth = makeAuth(session.accessToken);
  const drive = google.drive({ version: 'v3', auth });

  await drive.files.delete({ fileId: id });
  return NextResponse.json({ ok: true });
}

// GET /api/intake/[id] — read intake lines
export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: id,
    range: 'Lines!A2:K',
  });

  const rows = (res.data.values ?? []) as string[][];
  const lines = rows.filter(r => r.some(c => c !== '' && c != null)).map(rowToLine);

  return NextResponse.json({ lines });
}

// PUT /api/intake/[id] — save lines, update status, and on commit update inventory
export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const { lines, status, sheetId } = (await req.json()) as {
    lines: IntakeLine[];
    status: 'draft' | 'committed';
    sheetId?: string;
  };

  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  // Save intake lines
  await sheetsApi.spreadsheets.values.clear({ spreadsheetId: id, range: 'Lines!A2:K' });
  if (lines.length > 0) {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: id,
      range: 'Lines!A2',
      valueInputOption: 'RAW',
      requestBody: { values: lines.map(lineToRow) },
    });
  }

  // Update status in Drive appProperties
  await drive.files.update({
    fileId: id,
    requestBody: { appProperties: { status } },
    fields: 'id',
  });

  // On commit: update inventory stock
  if (status === 'committed' && sheetId && lines.length > 0) {
    await applyToInventory(sheetsApi, sheetId, lines);
    revalidateTag(`products:${sheetId}`);
  }

  return NextResponse.json({ ok: true });
}

async function applyToInventory(
  sheetsApi: ReturnType<typeof google.sheets>,
  sheetId: string,
  lines: IntakeLine[],
) {
  // Read current inventory (11-col layout: A=SKU B=UPC C=Name D=Cat E=Mfr F=Series G=Stock …)
  const invRes = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Products!A:K',
  });
  const invRows = (invRes.data.values ?? []) as string[][];

  // Map SKU and UPC → { rowNum (1-based), currentStock }
  const skuMap = new Map<string, { rowNum: number; stock: number }>();
  invRows.forEach((row, i) => {
    if (i === 0) return;
    if (row[0]) skuMap.set(row[0], { rowNum: i + 1, stock: parseInt(row[6]) || 0 });
    if (row[1]) skuMap.set(row[1], { rowNum: i + 1, stock: parseInt(row[6]) || 0 });
  });

  const stockUpdates: { range: string; values: number[][] }[] = [];
  const newRows: (string | number)[][] = [];

  for (const line of lines) {
    const existing = skuMap.get(line.sku) ?? skuMap.get(line.sku.toUpperCase());
    if (existing) {
      stockUpdates.push({
        range: `Products!G${existing.rowNum}`,
        values: [[existing.stock + line.qty]],
      });
    } else {
      newRows.push([
        line.sku,
        '',
        line.name,
        line.cat || '',
        line.mfr || '',
        line.series || '',
        line.qty,
        0,
        line.price || 0,
        line.cost || 0,
        line.hue || 0,
      ]);
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
      spreadsheetId: sheetId,
      range: 'Products!A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: newRows },
    });
  }
}
