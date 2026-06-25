import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { SALES_HEADERS } from '@/lib/sheet-schema';

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

type Ctx = { params: Promise<{ saleId: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { salesSheetId, sheetId, lines } = await req.json();
  if (!salesSheetId) return NextResponse.json({ error: 'Missing salesSheetId' }, { status: 400 });

  const { saleId } = await ctx.params;
  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  const now = new Date();
  const tabName = `${now.toLocaleString('en-US', { month: 'long' })}-${now.getFullYear()}`;

  // Ensure current month tab exists for the undo marker
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
      requestBody: { values: [SALES_HEADERS] },
    });
  }

  const undoDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const undoTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  await sheetsApi.spreadsheets.values.append({
    spreadsheetId: salesSheetId,
    range: `'${tabName}'!A:N`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[saleId, undoDate, undoTime, '', '', 'UNDO MARKER', '', '', '', '', '', '', '', 'UNDO']],
    },
  });

  if (sheetId && Array.isArray(lines) && lines.length) {
    const invRes = await sheetsApi.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Products!A:G' });
    const invRows = (invRes.data.values ?? []) as string[][];
    const skuMap = new Map<string, { rowNum: number; stock: number }>();
    invRows.forEach((row, i) => {
      if (i === 0 || !row[0]) return;
      skuMap.set(row[0], { rowNum: i + 1, stock: parseInt(row[6]) || 0 });
    });
    const updates = (lines as { sku: string; qty: number }[]).flatMap(l => {
      const e = skuMap.get(l.sku) ?? skuMap.get(l.sku.toUpperCase());
      return e ? [{ range: `Products!G${e.rowNum}`, values: [[e.stock + l.qty]] }] : [];
    });
    if (updates.length) {
      await sheetsApi.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: { valueInputOption: 'RAW', data: updates },
      });
    }
  }

  revalidateTag(`sales:${salesSheetId}`);
  return NextResponse.json({ ok: true });
}
