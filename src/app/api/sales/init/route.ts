import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

const SALES_HEADERS = ['ID', 'Date', 'Time', 'Customer', 'SKU', 'Name', 'Qty', 'Unit Price', 'Discount',      'Effective Price', 'Line Total', 'Sale Discount',      'Total'];
const HOLD_HEADERS  = ['ID', 'Date', 'Time', 'Customer', 'SKU', 'Name', 'Qty', 'Unit Price', 'Discount JSON', 'Effective Price', 'Line Total', 'Sale Discount JSON', 'Total'];

// POST /api/sales/init — idempotent: finds or creates Sales folder, Sales sheet, Hold sheet
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { storeId } = await req.json();
  if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 });

  const auth = makeAuth(session.accessToken);
  const drive = google.drive({ version: 'v3', auth });
  const sheetsApi = google.sheets({ version: 'v4', auth });

  // 1. Find or create the "Sales" subfolder inside the store folder
  const folderSearch = await drive.files.list({
    q: `name='Sales' and '${storeId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
    pageSize: 1,
  });
  let salesFolderId = folderSearch.data.files?.[0]?.id;
  if (!salesFolderId) {
    const created = await drive.files.create({
      requestBody: { name: 'Sales', mimeType: 'application/vnd.google-apps.folder', parents: [storeId] },
      fields: 'id',
    });
    salesFolderId = created.data.id!;
  }

  // 2. Find or create the "Sales" spreadsheet
  const salesSearch = await drive.files.list({
    q: `name='Sales' and '${salesFolderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id)',
    pageSize: 1,
  });
  let salesSheetId = salesSearch.data.files?.[0]?.id;
  if (!salesSheetId) {
    const now = new Date();
    const tabName = `${now.toLocaleString('en-US', { month: 'long' })}-${now.getFullYear()}`;
    const ss = await sheetsApi.spreadsheets.create({
      requestBody: { properties: { title: 'Sales' } },
      fields: 'spreadsheetId,sheets/properties/sheetId',
    });
    salesSheetId = ss.data.spreadsheetId!;
    const defaultId = ss.data.sheets?.[0]?.properties?.sheetId ?? 0;
    await sheetsApi.spreadsheets.batchUpdate({
      spreadsheetId: salesSheetId,
      requestBody: { requests: [{ updateSheetProperties: { properties: { sheetId: defaultId, title: tabName }, fields: 'title' } }] },
    });
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: salesSheetId,
      range: `'${tabName}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [SALES_HEADERS] },
    });
    await drive.files.update({ fileId: salesSheetId, addParents: salesFolderId, removeParents: 'root', fields: 'id' });
  }

  // 3. Find or create the "Hold" spreadsheet
  const holdSearch = await drive.files.list({
    q: `name='Hold' and '${salesFolderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id)',
    pageSize: 1,
  });
  let holdSheetId = holdSearch.data.files?.[0]?.id;
  if (!holdSheetId) {
    const ss = await sheetsApi.spreadsheets.create({
      requestBody: { properties: { title: 'Hold' } },
      fields: 'spreadsheetId,sheets/properties/sheetId',
    });
    holdSheetId = ss.data.spreadsheetId!;
    const defaultId = ss.data.sheets?.[0]?.properties?.sheetId ?? 0;
    await sheetsApi.spreadsheets.batchUpdate({
      spreadsheetId: holdSheetId,
      requestBody: { requests: [{ updateSheetProperties: { properties: { sheetId: defaultId, title: 'Hold' }, fields: 'title' } }] },
    });
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: holdSheetId,
      range: 'Hold!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [HOLD_HEADERS] },
    });
    await drive.files.update({ fileId: holdSheetId, addParents: salesFolderId, removeParents: 'root', fields: 'id' });
  }

  return NextResponse.json({ salesSheetId, holdSheetId });
}
