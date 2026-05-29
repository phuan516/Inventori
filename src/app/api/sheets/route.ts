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
            ['categories',    DEFAULT_SETTINGS.categories.join(',')],
            ['manufacturers', DEFAULT_SETTINGS.manufacturers.join(',')],
            ['series',        DEFAULT_SETTINGS.series.join(',')],
          ],
        },
      ],
    },
  });

  // 4. Create Intake Records subfolder
  await drive.files.create({
    requestBody: {
      name: 'Intake Records',
      mimeType: 'application/vnd.google-apps.folder',
      parents: [folderId],
    },
    fields: 'id',
  });

  return NextResponse.json({
    folderId,
    sheetId: spreadsheetId,
    name: folderRes.data.name,
    modifiedTime: folderRes.data.modifiedTime,
  }, { status: 201 });
}
