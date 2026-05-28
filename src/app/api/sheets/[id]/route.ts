import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { unstable_cache, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import type { Product } from '@/lib/types';

const SHEET = 'Sheet1';

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

function rowToProduct(row: string[]): Product | null {
  if (!row[0]) return null;
  return {
    id:      row[0],
    sku:     row[1] ?? '',
    name:    row[2] ?? '',
    cat:     (row[3] as Product['cat']) ?? 'Gunpla',
    grade:   (row[4] as Product['grade']) ?? '—',
    mfr:     row[5] ?? '',
    series:  row[6] ?? '',
    stock:   parseInt(row[7]) || 0,
    low:     parseInt(row[8]) || 0,
    price:   parseFloat(row[9]) || 0,
    cost:    parseFloat(row[10]) || 0,
    hue:     parseInt(row[11]) || 0,
    barcode: row[12] ?? '',
  };
}

function productToRow(p: Product): (string | number)[] {
  return [p.id, p.sku, p.name, p.cat, p.grade, p.mfr, p.series, p.stock, p.low, p.price, p.cost, p.hue, p.barcode];
}

type Ctx = { params: Promise<{ id: string }> };

function productsCacheTag(sheetId: string) {
  return `products:${sheetId}`;
}

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return null;
  return session;
}

async function fetchProductsFromSheet(sheetId: string, accessToken: string): Promise<Product[]> {
  const auth = makeAuth(accessToken);
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET}!A:M`,
  });
  const rows = (res.data.values ?? []) as string[][];
  return rows.slice(1).map(rowToProduct).filter(Boolean) as Product[];
}

// GET — read all products (cached for 60 s; invalidated on any mutation)
export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const token = session.accessToken!;

  const products = await unstable_cache(
    () => fetchProductsFromSheet(id, token),
    [id],
    { revalidate: 60, tags: [productsCacheTag(id)] },
  )();

  return NextResponse.json({ products });
}

// POST — append a new product
export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const data = (await req.json()) as Omit<Product, 'id'>;
  const product: Product = { ...data, id: `p${Date.now()}` };

  const sheets = google.sheets({ version: 'v4', auth: makeAuth(session.accessToken!) });
  await sheets.spreadsheets.values.append({
    spreadsheetId: id,
    range: `${SHEET}!A:M`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [productToRow(product)] },
  });

  revalidateTag(productsCacheTag(id));
  return NextResponse.json({ product }, { status: 201 });
}

// PUT — update an existing product (finds row by id, updates it)
export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const product = (await req.json()) as Product;

  const sheets = google.sheets({ version: 'v4', auth: makeAuth(session.accessToken!) });

  const colA = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: `${SHEET}!A:A`,
  });
  const ids = ((colA.data.values ?? []) as string[][]).map(r => r[0]);
  const rowIndex = ids.indexOf(product.id);
  if (rowIndex < 1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const rowNum = rowIndex + 1;
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `${SHEET}!A${rowNum}:M${rowNum}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [productToRow(product)] },
  });

  revalidateTag(productsCacheTag(id));
  return NextResponse.json({ ok: true });
}

// DELETE — delete a product row by productId
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const { productId } = (await req.json()) as { productId: string };

  const sheets = google.sheets({ version: 'v4', auth: makeAuth(session.accessToken!) });

  const colA = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: `${SHEET}!A:A`,
  });
  const ids = ((colA.data.values ?? []) as string[][]).map(r => r[0]);
  const rowIndex = ids.indexOf(productId);
  if (rowIndex < 1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: id,
    fields: 'sheets/properties/sheetId',
  });
  const sheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: id,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
        },
      }],
    },
  });

  revalidateTag(productsCacheTag(id));
  return NextResponse.json({ ok: true });
}
