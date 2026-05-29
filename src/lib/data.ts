import type { Category, Grade, Product, StatusType } from './types';

export const CATEGORIES: Category[] = ['Gunpla', 'Scale Models', 'Figures', 'Accessories', 'Tools'];
export const GRADES: Grade[] = ['HG', 'RG', 'MG', 'PG', 'SD', '—'];

export function statusOf(p: Product): StatusType {
  if (p.stock === 0) return 'out';
  if (p.stock <= p.low) return 'low';
  return 'ok';
}
