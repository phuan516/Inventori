import type { Product } from './types';

export interface IntakeSession {
  id: string;
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
  onHand: number | null;
}

export const INTAKES: IntakeSession[] = [];

let _lid = 0;
function lineId() { return 'L' + (++_lid); }

export function matchedLineFromProduct(p: Product, qty = 1, fallbackSku?: string): IntakeLine {
  return {
    id: lineId(), sku: p.sku || fallbackSku || p.upc || '', qty,
    matched: true,
    name: p.name, mfr: p.mfr, cat: p.cat,
    grade: '—',
    series: p.series, hue: p.hue, cost: p.cost, price: p.price,
    onHand: p.stock,
  };
}

export function pendingLine(sku: string, qty = 1): IntakeLine {
  return {
    id: lineId(), sku, qty,
    matched: false,
    name: '', mfr: '', cat: 'Gunpla', grade: 'HG',
    series: '', hue: 30 + (sku.length * 37) % 300, cost: 0, price: 0,
    onHand: null,
  };
}

