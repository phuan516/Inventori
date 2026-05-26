import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auth = makeAuth(session.accessToken);
  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false and name contains 'Inventori'",
    fields: 'files(id,name,modifiedTime,webViewLink)',
    orderBy: 'modifiedTime desc',
    pageSize: 50,
  });

  return NextResponse.json({ sheets: res.data.files ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const auth = makeAuth(session.accessToken);
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.create({
    requestBody: { properties: { title: name } },
    fields: 'spreadsheetId,properties/title,spreadsheetUrl',
  });

  const drive = google.drive({ version: 'v3', auth });
  const file = await drive.files.get({
    fileId: res.data.spreadsheetId!,
    fields: 'id,name,modifiedTime,webViewLink',
  });

  return NextResponse.json({ sheet: file.data }, { status: 201 });
}
