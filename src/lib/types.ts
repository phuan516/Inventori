export type Category = 'Gunpla' | 'Scale Models' | 'Figures' | 'Accessories' | 'Tools';
export type Grade = 'HG' | 'RG' | 'MG' | 'PG' | 'SD' | '—';
export type StatusType = 'ok' | 'low' | 'out';
export type StatusFilter = 'all' | StatusType;
export type SortOption = 'updated' | 'name' | 'stockAsc' | 'stockDesc' | 'priceDesc';
export type PillTone = 'ok' | 'warn' | 'danger' | 'brand' | 'mute';
export type BtnKind = 'primary' | 'ghost' | 'subtle' | 'danger';

export interface Product {
  id: string;
  sku: string;
  name: string;
  cat: string;
  grade: Grade;
  mfr: string;
  series: string;
  stock: number;
  low: number;
  price: number;
  cost: number;
  hue: number;
  barcode: string;
}

export interface User {
  name: string;
  email: string;
  initials: string;
  tone: string;
}
