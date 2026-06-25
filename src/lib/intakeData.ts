import type { Product } from './types';

export interface IntakeSession {
  id: string;
  intakeSheetId: string;
  title: string;
  supplier: string;
  date: string;
  status: 'draft' | 'committed';
  skus?: number;
  units?: number;
  value?: number;
  current?: boolean;
}

export interface IntakeLine {
  id: string;
  sku: string;
  upc: string;
  qty: number;
  matched: boolean;
  name: string;
  mfr: string;
  cat: string;
  grade: string;
  series: string;
  hue: number;
  cost: number;
  price: number;
  low: number;
  onHand: number | null;
}

export const INTAKES: IntakeSession[] = [];

let _lid = 0;
function lineId() { return 'L' + (++_lid); }

export function matchedLineFromProduct(p: Product, qty = 1, scannedUpc?: string): IntakeLine {
  return {
    id: lineId(), sku: p.sku, upc: scannedUpc || p.upc || '', qty,
    matched: true,
    name: p.name, mfr: p.mfr, cat: p.cat,
    grade: '—',
    series: p.series, hue: p.hue, cost: p.cost, price: p.price, low: p.low,
    onHand: p.stock,
  };
}

export function pendingLine(upc: string, qty = 1): IntakeLine {
  return {
    id: lineId(), sku: '', upc, qty,
    matched: false,
    name: '', mfr: '', cat: '', grade: 'HG',
    series: '', hue: 30 + (upc.length * 37) % 300, cost: 0, price: 0, low: 0,
    onHand: null,
  };
}

