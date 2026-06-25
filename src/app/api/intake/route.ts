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

const INTAKE_HEADERS = ['SKU', 'UPC', 'Name', 'Qty', 'Cost', 'Price', 'Manufacturer', 'Category', 'Grade', 'Series', 'Hue', 'Matched', 'Low Stock'];

async function findIntakeSheet(drive: ReturnType<typeof google.drive>, storeId: string): Promise<string | null> {
  const res = await drive.files.list({
    q: `name='Intake' and '${storeId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id)',
    pageSize: 1,
  });
  return res.data.files?.[0]?.id ?? null;
}

async function createIntakeSheet(
  sheetsApi: ReturnType<typeof google.sheets>,
  drive: ReturnType<typeof google.drive>,
  storeId: string,
): Promise<string> {
  const res = await sheetsApi.spreadsheets.create({
    requestBody: { properties: { title: 'Intake' } },
    fields: 'spreadsheetId,sheets/properties/sheetId',
  });
  const intakeSheetId = res.data.spreadsheetId!;
  const defaultSheetId = res.data.sheets?.[0]?.properties?.sheetId ?? 0;

  await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId: intakeSheetId,
    requestBody: { requests: [{ updateSheetProperties: { properties: { sheetId: defaultSheetId, title: 'Sessions' }, fields: 'title' } }] },
  });
  await sheetsApi.spreadsheets.values.update({
    spreadsheetId: intakeSheetId, range: 'Sessions!A1:C1', valueInputOption: 'RAW',
    requestBody: { values: [['TabName', 'Status', 'Date']] },
  });
  await drive.files.update({ fileId: intakeSheetId, addParents: storeId, removeParents: 'root', fields: 'id' });

  return intakeSheetId;
}

// GET /api/intake?storeId=xxx — list intake sessions
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const storeId = req.nextUrl.searchParams.get('storeId');
  if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 });

  const auth = makeAuth(session.accessToken);
  const drive = google.drive({ version: 'v3', auth });

  const intakeSheetId = await findIntakeSheet(drive, storeId);
  if (!intakeSheetId) return NextResponse.json({ intakes: [], intakeSheetId: null });

  const sheetsApi = google.sheets({ version: 'v4', auth });
  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: intakeSheetId,
    range: 'Sessions!A:C',
  });

  const rows = ((res.data.values ?? []) as string[][]).slice(1).filter(r => r[0]);
  const intakes = rows
    .map(r => ({
      id: r[0],
      intakeSheetId,
      title: r[0],
      status: (r[1] ?? 'draft') as 'draft' | 'committed',
      date: r[2] ? formatDate(r[2]) : '—',
      supplier: '',
    }))
    .reverse(); // newest first

  return NextResponse.json({ intakes, intakeSheetId });
}

// POST /api/intake — create a new intake session tab
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { storeId, intakeSheetId: passedId } = await req.json();
  if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 });

  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  let intakeSheetId: string = passedId ?? await findIntakeSheet(drive, storeId);
  if (!intakeSheetId) {
    intakeSheetId = await createIntakeSheet(sheetsApi, drive, storeId);
  }

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const tabName = `Intake-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const dateStr = now.toISOString().split('T')[0];

  await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId: intakeSheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
  });
  await sheetsApi.spreadsheets.values.update({
    spreadsheetId: intakeSheetId,
    range: `'${tabName}'!A1:M1`,
    valueInputOption: 'RAW',
    requestBody: { values: [INTAKE_HEADERS] },
  });
  await sheetsApi.spreadsheets.values.append({
    spreadsheetId: intakeSheetId,
    range: 'Sessions!A:C',
    valueInputOption: 'RAW',
    requestBody: { values: [[tabName, 'draft', dateStr]] },
  });

  return NextResponse.json({
    intake: { id: tabName, intakeSheetId, title: tabName, status: 'draft', date: formatDate(dateStr), supplier: '' },
  }, { status: 201 });
}
