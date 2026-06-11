import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

// 13-column schema — A:M
// A=ID  B=Date  C=Time  D=Customer  E=SKU  F=Name  G=Qty  H=Unit Price
// I=Discount JSON  J=Effective Price  K=Line Total  L=Sale Discount JSON  M=Total
const HOLD_HEADERS = [
  'ID', 'Date', 'Time', 'Customer', 'SKU', 'Name', 'Qty', 'Unit Price',
  'Discount JSON', 'Effective Price', 'Line Total', 'Sale Discount JSON', 'Total',
];

interface DiscountObj { type: 'pct' | 'amt' | 'set'; value: number; applyToAll: boolean; partialQty: number; reason: string }
interface SaleDiscObj  { type: 'pct' | 'amt'; value: number; reason: string }

function effectiveUnitPrice(price: number, d: DiscountObj | undefined): number {
  if (!d || d.value === 0) return price;
  if (d.type === 'pct') return price * (1 - Math.min(d.value, 100) / 100);
  if (d.type === 'amt') return Math.max(0, price - d.value);
  return Math.max(0, d.value);
}

function effectiveLineTotal(price: number, qty: number, d: DiscountObj | undefined): number {
  if (!d || d.value === 0) return price * qty;
  const effPrice = effectiveUnitPrice(price, d);
  if (d.applyToAll) return effPrice * qty;
  const partial = Math.min(d.partialQty, qty);
  return effPrice * partial + price * (qty - partial);
}

// GET /api/hold?holdSheetId=xxx — load all held tickets
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const holdSheetId = req.nextUrl.searchParams.get('holdSheetId');
  if (!holdSheetId) return NextResponse.json({ error: 'holdSheetId required' }, { status: 400 });

  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: holdSheetId,
    range: 'Hold!A:M',
  });

  const rows = res.data.values ?? [];
  if (rows.length <= 1) return NextResponse.json({ tickets: [] });

  const ticketMap = new Map<string, { id: string; customer: string; lines: { sku: string; name: string; qty: number; price: number }[]; discounts: Record<string, unknown>; saleDiscount: unknown }>();
  for (const row of rows.slice(1)) {
    // A=ID  B=Date  C=Time  D=Customer  E=SKU  F=Name  G=Qty  H=UnitPrice
    // I=DiscountJSON  J=EffPrice  K=LineTotal  L=SaleDiscJSON  M=Total
    const [id, , , customer, sku, name, qty, price, itemDiscJson, , , saleDiscJson] = row;
    if (!id || !sku) continue;
    if (!ticketMap.has(id)) {
      let saleDiscount = null;
      try { saleDiscount = saleDiscJson ? JSON.parse(saleDiscJson) : null; } catch {}
      ticketMap.set(id, { id, customer: customer ?? '', lines: [], discounts: {}, saleDiscount });
    }
    const ticket = ticketMap.get(id)!;
    ticket.lines.push({ sku, name: name ?? '', qty: Number(qty) || 1, price: Number(price) || 0 });
    if (itemDiscJson) {
      try { const d = JSON.parse(itemDiscJson); if (d?.value != null) ticket.discounts[sku] = d; } catch {}
    }
  }

  return NextResponse.json({ tickets: Array.from(ticketMap.values()) });
}

// POST /api/hold — save a held ticket
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { holdSheetId, ticketId, customer, lines, discounts, saleDiscount, ticketTotal } = await req.json();
  if (!holdSheetId || !ticketId || !Array.isArray(lines) || !lines.length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const auth = makeAuth(session.accessToken);
  const sheetsApi = google.sheets({ version: 'v4', auth });

  const now = new Date();
  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const rows = lines.map((l: { sku: string; name: string; qty: number; price: number }, i: number) => {
    const itemDisc: DiscountObj | undefined = discounts?.[l.sku];
    const effPrice = effectiveUnitPrice(l.price, itemDisc);
    const lineTotal = effectiveLineTotal(l.price, l.qty, itemDisc);
    return [
      ticketId,                                                              // A: ID
      date,                                                                  // B: Date
      time,                                                                  // C: Time
      customer ?? '',                                                        // D: Customer
      l.sku,                                                                 // E: SKU
      l.name,                                                                // F: Name
      l.qty,                                                                 // G: Qty
      Number(l.price).toFixed(2),                                            // H: Unit Price
      itemDisc ? JSON.stringify(itemDisc) : '',                              // I: Discount JSON
      Number(effPrice).toFixed(2),                                           // J: Effective Price
      Number(lineTotal).toFixed(2),                                          // K: Line Total
      i === 0 && saleDiscount ? JSON.stringify(saleDiscount as SaleDiscObj) : '', // L: Sale Discount JSON
      i === 0 ? Number(ticketTotal).toFixed(2) : '',                         // M: Total
    ];
  });

  // Write header row if sheet is empty
  const existing = await sheetsApi.spreadsheets.values.get({ spreadsheetId: holdSheetId, range: 'Hold!A1' });
  if (!existing.data.values?.length) {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: holdSheetId, range: 'Hold!A1', valueInputOption: 'RAW',
      requestBody: { values: [HOLD_HEADERS] },
    });
  }

  await sheetsApi.spreadsheets.values.append({
    spreadsheetId: holdSheetId,
    range: 'Hold!A:M',
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });

  return NextResponse.json({ ok: true });
}
