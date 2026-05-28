import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_SETTINGS } from '@/lib/settings';

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
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    fields: 'files(id,name,modifiedTime,webViewLink)',
    orderBy: 'modifiedTime desc',
    pageSize: 200,
  });

  const files = (res.data.files ?? []).filter(f => f.name?.includes('Inventori'));
  return NextResponse.json({ sheets: files });
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
  const sheetsApi = google.sheets({ version: 'v4', auth });
  const res = await sheetsApi.spreadsheets.create({
    requestBody: { properties: { title: name } },
    fields: 'spreadsheetId,sheets/properties/sheetId',
  });

  const spreadsheetId = res.data.spreadsheetId!;
  const defaultSheetId = res.data.sheets?.[0]?.properties?.sheetId ?? 0;

  await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        { addSheet: { properties: { title: 'Settings' } } },
        { addSheet: { properties: { title: 'Products' } } },
        { deleteSheet: { sheetId: defaultSheetId } },
      ],
    },
  });

  await sheetsApi.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        {
          range: 'Products!A1:M1',
          values: [['ID', 'SKU', 'Name', 'Category', 'Grade', 'Manufacturer', 'Series', 'Stock', 'Low Stock', 'Price', 'Cost', 'Hue', 'Barcode']],
        },
        {
          range: 'Settings!A1:B4',
          values: [
            ['Setting', 'Values'],
            ['categories',    DEFAULT_SETTINGS.categories.join(',')],
            ['manufacturers', DEFAULT_SETTINGS.manufacturers.join(',')],
            ['series',        DEFAULT_SETTINGS.series.join(',')],
          ],
        },
      ],
    },
  });

  const drive = google.drive({ version: 'v3', auth });
  const file = await drive.files.get({
    fileId: spreadsheetId,
    fields: 'id,name,modifiedTime,webViewLink',
  });

  return NextResponse.json({ sheet: file.data }, { status: 201 });
}
