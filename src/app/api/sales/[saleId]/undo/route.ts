import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

const HEADERS = ['ID', 'Date', 'Time', 'Customer', 'SKU', 'Name', 'Qty', 'Unit Price', 'Discount', 'Effective Price', 'Line Total', 'Sale Discount', 'Total'];

type Ctx = { params: Promise<{ saleId: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { salesSheetId } = await req.json();
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
      requestBody: { values: [HEADERS] },
    });
  }

  const undoDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const undoTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  await sheetsApi.spreadsheets.values.append({
    spreadsheetId: salesSheetId,
    range: `'${tabName}'!A:M`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[`UNDO-${saleId}`, undoDate, undoTime, '', '', 'UNDO MARKER', '', '', '', '', '', '', '']],
    },
  });

  revalidateTag(`sales:${salesSheetId}`);
  return NextResponse.json({ ok: true });
}
