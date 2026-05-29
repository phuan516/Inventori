import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

async function findIntakeFolder(drive: ReturnType<typeof google.drive>, storeId: string) {
  const res = await drive.files.list({
    q: `name='Intake Records' and '${storeId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
    pageSize: 1,
  });
  return res.data.files?.[0]?.id ?? null;
}

// GET /api/intake?storeId=xxx — list intake sessions for a store
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const storeId = req.nextUrl.searchParams.get('storeId');
  if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 });

  const auth = makeAuth(session.accessToken);
  const drive = google.drive({ version: 'v3', auth });

  const intakeFolderId = await findIntakeFolder(drive, storeId);
  if (!intakeFolderId) return NextResponse.json({ intakes: [] });

  const res = await drive.files.list({
    q: `'${intakeFolderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id,name,modifiedTime,appProperties)',
    orderBy: 'modifiedTime desc',
    pageSize: 100,
  });

  const intakes = (res.data.files ?? []).map(f => ({
    id: f.id,
    title: f.name,

    status: (f.appProperties?.status ?? 'draft') as 'draft' | 'committed',
    date: f.appProperties?.date ? formatDate(f.appProperties.date) : '—',
    supplier: '',
    modifiedTime: f.modifiedTime,
  }));

  return NextResponse.json({ intakes });
}

// POST /api/intake — create a new intake session sheet
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { storeId } = await req.json();
  if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 });

  const auth = makeAuth(session.accessToken);
  const drive = google.drive({ version: 'v3', auth });
  const sheetsApi = google.sheets({ version: 'v4', auth });

  const intakeFolderId = await findIntakeFolder(drive, storeId);
  if (!intakeFolderId) return NextResponse.json({ error: 'Intake Records folder not found' }, { status: 404 });

  const dateStr = new Date().toISOString().split('T')[0];
  const sheetTitle = `Intake - ${dateStr}`;

  // Create spreadsheet
  const created = await sheetsApi.spreadsheets.create({
    requestBody: { properties: { title: sheetTitle } },
    fields: 'spreadsheetId,sheets/properties/sheetId',
  });
  const spreadsheetId = created.data.spreadsheetId!;
  const defaultSheetId = created.data.sheets?.[0]?.properties?.sheetId ?? 0;

  // Rename default tab to Lines and add headers
  await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        { updateSheetProperties: { properties: { sheetId: defaultSheetId, title: 'Lines' }, fields: 'title' } },
      ],
    },
  });
  await sheetsApi.spreadsheets.values.update({
    spreadsheetId,
    range: 'Lines!A1:K1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['SKU', 'Name', 'Qty', 'Cost', 'Price', 'Manufacturer', 'Category', 'Grade', 'Series', 'Hue', 'Matched']],
    },
  });

  // Move into Intake Records folder and set appProperties
  await drive.files.update({
    fileId: spreadsheetId,
    addParents: intakeFolderId,
    removeParents: 'root',
    requestBody: {
      appProperties: { status: 'draft', date: dateStr, title: sheetTitle },
    },
    fields: 'id',
  });

  return NextResponse.json({
    intake: {
      id: spreadsheetId,
      title: sheetTitle,
      status: 'draft',
      date: formatDate(dateStr),
      supplier: '',
    },
  }, { status: 201 });
}
