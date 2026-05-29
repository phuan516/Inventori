import { SEED } from './data';

export interface IntakeSession {
  id: string;
  ref: string;
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

export const INTAKES: IntakeSession[] = [
  { id: 'i00', ref: 'INT-0048', title: 'Bandai — Aug restock',     supplier: 'Bandai Spirits', date: 'Today · 2:14 PM', status: 'draft',     skus: 4,  units: 46,  value: 1820, current: true },
  { id: 'i01', ref: 'INT-0047', title: 'Good Smile pre-orders',    supplier: 'Good Smile Co.', date: 'Yesterday',       status: 'draft',     skus: 3,  units: 18,  value: 1244 },
  { id: 'i02', ref: 'INT-0046', title: 'Tamiya paints & tools',    supplier: 'GSI / Tamiya',   date: 'May 24',          status: 'committed', skus: 11, units: 132, value: 2870 },
  { id: 'i03', ref: 'INT-0045', title: 'Kotobukiya weekly',        supplier: 'Kotobukiya',     date: 'May 21',          status: 'committed', skus: 6,  units: 41,  value: 1990 },
  { id: 'i04', ref: 'INT-0044', title: 'Bandai — RG/MG drop',      supplier: 'Bandai Spirits', date: 'May 19',          status: 'committed', skus: 9,  units: 88,  value: 4310 },
  { id: 'i05', ref: 'INT-0043', title: 'Counter return / regrade', supplier: 'In-store',       date: 'May 16',          status: 'committed', skus: 2,  units: 5,   value: 188 },
];

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
