// Single source of truth for column headers across sales and hold sheets.
// Sales col N (Status) holds 'UNDO' for undone sales markers.
export const SALES_HEADERS = [
  'ID', 'Date', 'Time', 'Customer', 'SKU', 'Name', 'Qty', 'Unit Price',
  'Discount JSON', 'Effective Price', 'Line Total', 'Sale Discount JSON', 'Total', 'Status',
];

export const HOLD_HEADERS = [
  'ID', 'Date', 'Time', 'Customer', 'SKU', 'Name', 'Qty', 'Unit Price',
  'Discount JSON', 'Effective Price', 'Line Total', 'Sale Discount JSON', 'Total',
];
