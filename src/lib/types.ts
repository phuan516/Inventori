export type Category = 'Gunpla' | 'Scale Models' | 'Figures' | 'Accessories' | 'Tools';
export type Grade = 'HG' | 'RG' | 'MG' | 'PG' | 'SD' | '—';
export type StatusType = 'ok' | 'low' | 'out';
export type StatusFilter = 'all' | StatusType;
export type SortOption = 'updated' | 'name' | 'stockAsc' | 'stockDesc' | 'priceDesc';
export type PillTone = 'ok' | 'warn' | 'danger' | 'brand' | 'mute';
export type BtnKind = 'primary' | 'ghost' | 'subtle' | 'danger';

export interface Product {
  sku: string;
  upc: string;
  name: string;
  cat: string;
  mfr: string;
  series: string;
  stock: number;
  low: number;
  price: number;
  cost: number;
  hue: number;
}

export interface User {
  name: string;
  email: string;
  initials: string;
  tone: string;
}

export interface TicketLine {
  sku: string;
  name: string;
  price: number;
  qty: number;
}

export interface Sale {
  id: string;
  createdAt: string;
  lines: { sku: string; name: string; qty: number; price: number }[];
  total: number;
  unitCount: number;
  customer?: string;
  note?: string;
  recordedBy: string;
}
