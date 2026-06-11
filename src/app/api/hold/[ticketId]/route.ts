import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

type Ctx = { params: Promise<{ ticketId: string }> };

// DELETE /api/hold/[ticketId]?holdSheetId=xxx — remove a held ticket
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const holdSheetId = req.nextUrl.searchParams.get('holdSheetId');
  if (!holdSheetId) return NextResponse.json({ error: 'holdSheetId required' }, { status: 400 });

  const { ticketId } = await ctx.params;

  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  // Read all rows, filter out matching ticketId, rewrite
  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: holdSheetId,
    range: 'Hold!A:M',
  });

  const rows = res.data.values ?? [];
  const remaining = rows.filter((r, i) => i === 0 || r[0] !== ticketId);

  await sheetsApi.spreadsheets.values.clear({ spreadsheetId: holdSheetId, range: 'Hold!A:M' });

  if (remaining.length > 0) {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: holdSheetId,
      range: 'Hold!A1',
      valueInputOption: 'RAW',
      requestBody: { values: remaining },
    });
  }

  return NextResponse.json({ ok: true });
}
