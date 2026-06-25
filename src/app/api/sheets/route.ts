import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { SALES_HEADERS, HOLD_HEADERS } from '@/lib/sheet-schema';

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

  const foldersRes = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder' and name contains 'Inventori' and trashed=false",
    fields: 'files(id,name,modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: 100,
  });

  const folders = foldersRes.data.files ?? [];

  const stores = await Promise.all(
    folders.map(async (folder) => {
      const sheetsRes = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.spreadsheet' and '${folder.id}' in parents and trashed=false`,
        fields: 'files(id,modifiedTime)',
        pageSize: 1,
      });
      const sheet = sheetsRes.data.files?.[0];
      return {
        id: folder.id,
        sheetId: sheet?.id ?? null,
        name: folder.name,
        modifiedTime: folder.modifiedTime,
      };
    })
  );

  return NextResponse.json({ stores: stores.filter(s => s.sheetId !== null) });
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
  const drive = google.drive({ version: 'v3', auth });
  const sheetsApi = google.sheets({ version: 'v4', auth });

  // 1. Create store folder
  const folderRes = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id,name,modifiedTime',
  });
  const folderId = folderRes.data.id!;

  // 2. Create inventory spreadsheet
  const spreadsheetRes = await sheetsApi.spreadsheets.create({
    requestBody: { properties: { title: 'Inventory' } },
    fields: 'spreadsheetId,sheets/properties/sheetId',
  });
  const spreadsheetId = spreadsheetRes.data.spreadsheetId!;
  const defaultSheetId = spreadsheetRes.data.sheets?.[0]?.properties?.sheetId ?? 0;

  // Move spreadsheet into store folder
  await drive.files.update({
    fileId: spreadsheetId,
    addParents: folderId,
    removeParents: 'root',
    fields: 'id,parents',
  });

  // 3. Set up Products and Settings tabs
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
          range: 'Products!A1:K1',
          values: [['SKU', 'UPC', 'Name', 'Category', 'Manufacturer', 'Series', 'Stock', 'Low Stock', 'Price', 'Cost', 'Hue']],
        },
        {
          range: 'Settings!A1:B4',
          values: [
            ['Setting', 'Values'],
            ['categories',    DEFAULT_SETTINGS.categories.join('|')],
            ['manufacturers', DEFAULT_SETTINGS.manufacturers.join('|')],
            ['series',        DEFAULT_SETTINGS.series.join('|')],
          ],
        },
      ],
    },
  });

  // 4. Create Intake spreadsheet with Sessions tab
  const intakeSsRes = await sheetsApi.spreadsheets.create({
    requestBody: { properties: { title: 'Intake' } },
    fields: 'spreadsheetId,sheets/properties/sheetId',
  });
  const intakeSheetId = intakeSsRes.data.spreadsheetId!;
  const intakeDefaultSheetId = intakeSsRes.data.sheets?.[0]?.properties?.sheetId ?? 0;

  await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId: intakeSheetId,
    requestBody: { requests: [{ updateSheetProperties: { properties: { sheetId: intakeDefaultSheetId, title: 'Sessions' }, fields: 'title' } }] },
  });
  await sheetsApi.spreadsheets.values.update({
    spreadsheetId: intakeSheetId, range: 'Sessions!A1:C1', valueInputOption: 'RAW',
    requestBody: { values: [['TabName', 'Status', 'Date']] },
  });
  await drive.files.update({ fileId: intakeSheetId, addParents: folderId, removeParents: 'root', fields: 'id' });

  // 5. Create Sales subfolder
  const salesFolderRes = await drive.files.create({
    requestBody: {
      name: 'Sales',
      mimeType: 'application/vnd.google-apps.folder',
      parents: [folderId],
    },
    fields: 'id',
  });
  const salesFolderId = salesFolderRes.data.id!;

  // 6. Create Sales spreadsheet with current month tab
  const salesSsRes = await sheetsApi.spreadsheets.create({
    requestBody: { properties: { title: 'Sales' } },
    fields: 'spreadsheetId,sheets/properties/sheetId',
  });
  const salesSheetId = salesSsRes.data.spreadsheetId!;
  const salesDefaultSheetId = salesSsRes.data.sheets?.[0]?.properties?.sheetId ?? 0;

  const now = new Date();
  const monthTabName = `${now.toLocaleString('en-US', { month: 'long' })}-${now.getFullYear()}`;

  await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId: salesSheetId,
    requestBody: {
      requests: [{ updateSheetProperties: { properties: { sheetId: salesDefaultSheetId, title: monthTabName }, fields: 'title' } }],
    },
  });
  await sheetsApi.spreadsheets.values.update({
    spreadsheetId: salesSheetId,
    range: `'${monthTabName}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [SALES_HEADERS] },
  });
  await drive.files.update({
    fileId: salesSheetId,
    addParents: salesFolderId,
    removeParents: 'root',
    fields: 'id',
  });

  // 7. Create Hold spreadsheet
  const holdSsRes = await sheetsApi.spreadsheets.create({
    requestBody: { properties: { title: 'Hold' } },
    fields: 'spreadsheetId,sheets/properties/sheetId',
  });
  const holdSheetId = holdSsRes.data.spreadsheetId!;
  const holdDefaultSheetId = holdSsRes.data.sheets?.[0]?.properties?.sheetId ?? 0;

  await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId: holdSheetId,
    requestBody: {
      requests: [{ updateSheetProperties: { properties: { sheetId: holdDefaultSheetId, title: 'Hold' }, fields: 'title' } }],
    },
  });
  await sheetsApi.spreadsheets.values.update({
    spreadsheetId: holdSheetId,
    range: 'Hold!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [HOLD_HEADERS] },
  });
  await drive.files.update({
    fileId: holdSheetId,
    addParents: salesFolderId,
    removeParents: 'root',
    fields: 'id',
  });

  return NextResponse.json({
    folderId,
    sheetId: spreadsheetId,
    salesSheetId,
    holdSheetId,
    intakeSheetId,
    name: folderRes.data.name,
    modifiedTime: folderRes.data.modifiedTime,
  }, { status: 201 });
}
