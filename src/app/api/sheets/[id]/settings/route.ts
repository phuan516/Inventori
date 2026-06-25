import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import type { AppSettings } from '@/lib/settings';
import { DEFAULT_SETTINGS } from '@/lib/settings';

const SETTINGS_RANGE = 'Settings!A:B';

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

type Ctx = { params: Promise<{ id: string }> };

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return null;
  return session;
}

function parseSettings(rows: string[][]): AppSettings {
  const map: Record<string, string> = {};
  for (const [key, val] of rows.slice(1)) {
    if (key) map[key] = val ?? '';
  }
  return {
    categories:    map.categories    ? map.categories.split(',').filter(Boolean)    : DEFAULT_SETTINGS.categories,
    manufacturers: map.manufacturers ? map.manufacturers.split(',').filter(Boolean) : DEFAULT_SETTINGS.manufacturers,
    series:        map.series        ? map.series.split(',').filter(Boolean)        : DEFAULT_SETTINGS.series,
  };
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const sheets = google.sheets({ version: 'v4', auth: makeAuth(session.accessToken!) });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: SETTINGS_RANGE,
  });

  const rows = (res.data.values ?? []) as string[][];
  return NextResponse.json({ settings: parseSettings(rows) });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const body = (await req.json()) as AppSettings;

  const sheets = google.sheets({ version: 'v4', auth: makeAuth(session.accessToken!) });

  const putValues = [
    ['Setting', 'Values'],
    ['categories',    body.categories.join(',')],
    ['manufacturers', body.manufacturers.join(',')],
    ['series',        body.series.join(',')],
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `Settings!A1:B${putValues.length}`,
    valueInputOption: 'RAW',
    requestBody: { values: putValues },
  });

  return NextResponse.json({ ok: true });
}
