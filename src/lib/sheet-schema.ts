// Single source of truth for column headers. Sales col N (Status) holds 'UNDO' for undone markers.
// Expected header names must match what is in the actual Google Sheet for colMap() to be resilient.
export const SALES_HEADERS = [
  'ID', 'Date', 'Time', 'Customer', 'SKU', 'Name', 'Qty', 'Unit Price',
  'Discount JSON', 'Effective Price', 'Line Total', 'Sale Discount JSON', 'Total', 'Status',
];

export const HOLD_HEADERS = [
  'ID', 'Date', 'Time', 'Customer', 'SKU', 'Name', 'Qty', 'Unit Price',
  'Discount JSON', 'Effective Price', 'Line Total', 'Sale Discount JSON', 'Total',
];

export const PRODUCT_HEADERS = [
  'SKU', 'UPC', 'Name', 'Category', 'Manufacturer', 'Series', 'Stock', 'Low Stock', 'Price', 'Cost', 'Hue',
];

export const INTAKE_HEADERS = [
  'SKU', 'UPC', 'Name', 'Qty', 'Cost', 'Price', 'Mfr', 'Cat', 'Grade', 'Series', 'Hue', 'Matched', 'Low',
];

// Build a name→index map from an actual sheet header row; tolerates manual column reordering.
// Falls back to the canonical headers if the sheet row is empty (e.g. new sheet).
export function colMap(headerRow: string[], fallback?: string[]): Record<string, number> {
  const h = headerRow.length ? headerRow : (fallback ?? []);
  return Object.fromEntries(h.map((name, i) => [name.trim(), i]));
}

// Convert a column index to a spreadsheet letter (0→'A', 6→'G', etc.)
export function colLetter(idx: number): string {
  return String.fromCharCode(65 + idx);
}
