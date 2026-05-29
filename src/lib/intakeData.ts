import { SEED } from './data';

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

export const SCAN_QUEUE = [
  'BAN-2606107',
  'GSC-G94821',
  'BAN-7781002',
  'BAN-2554145',
  'BAN-2606107',
  'KOT-PP932',
  'TAM-49014',
  'BAN-5063385',
];

let _lid = 0;
function lineId() { return 'L' + (++_lid); }

export function matchedLine(sku: string, qty = 1): IntakeLine {
  const p = SEED.find(x => x.sku === sku);
  if (!p) return pendingLine(sku, qty);
  return {
    id: lineId(), sku: p.sku, qty,
    matched: true,
    name: p.name, mfr: p.mfr, cat: p.cat, grade: p.grade,
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

export function seedLines(): IntakeLine[] {
  return [
    pendingLine('BAN-7781002', 6),
    matchedLine('GSC-G94821', 12),
    matchedLine('BAN-2606107', 24),
    matchedLine('BAN-2554145', 4),
  ];
}
