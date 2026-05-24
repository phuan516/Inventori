import type { Category, Grade, Product, StatusType } from './types';

export const CATEGORIES: Category[] = ['Gunpla', 'Scale Models', 'Figures', 'Accessories', 'Tools'];
export const GRADES: Grade[] = ['HG', 'RG', 'MG', 'PG', 'SD', '—'];

export const SEED: Product[] = [
  { id: 'p01', sku: 'BAN-2554145', name: 'RG Nu Gundam Ver.Ka',         cat: 'Gunpla',       grade: 'RG', mfr: 'Bandai',     series: "Char's Counterattack", stock: 2,  low: 3, price: 89.99,  cost: 52.00,  hue: 215 },
  { id: 'p02', sku: 'BAN-2587319', name: 'MG Barbatos Lupus Rex',        cat: 'Gunpla',       grade: 'MG', mfr: 'Bandai',     series: 'Iron-Blooded Orphans', stock: 0,  low: 2, price: 64.99,  cost: 38.50,  hue: 25  },
  { id: 'p03', sku: 'GSC-G94821',  name: 'Nendoroid Frieren',            cat: 'Figures',      grade: '—',  mfr: 'Good Smile', series: 'Frieren',              stock: 14, low: 4, price: 74.99,  cost: 41.00,  hue: 95  },
  { id: 'p04', sku: 'BAN-2590011', name: 'HG Gundam Aerial Rebuild',     cat: 'Gunpla',       grade: 'HG', mfr: 'Bandai',     series: 'Witch from Mercury',   stock: 6,  low: 5, price: 28.99,  cost: 14.25,  hue: 320 },
  { id: 'p05', sku: 'KOT-PP932',   name: 'Frame Arms Girl Gourai',       cat: 'Figures',      grade: '—',  mfr: 'Kotobukiya', series: 'Frame Arms Girl',      stock: 1,  low: 3, price: 58.50,  cost: 33.00,  hue: 180 },
  { id: 'p06', sku: 'BAN-2620044', name: 'PG Unleashed RX-78-2',         cat: 'Gunpla',       grade: 'PG', mfr: 'Bandai',     series: 'One Year War',         stock: 3,  low: 2, price: 349.99, cost: 215.00, hue: 0   },
  { id: 'p07', sku: 'BAN-2606107', name: 'HG Gouf Custom',               cat: 'Gunpla',       grade: 'HG', mfr: 'Bandai',     series: '08th MS Team',         stock: 22, low: 4, price: 24.99,  cost: 12.00,  hue: 240 },
  { id: 'p08', sku: 'GSC-M11203',  name: 'figma Makima',                 cat: 'Figures',      grade: '—',  mfr: 'Good Smile', series: 'Chainsaw Man',         stock: 4,  low: 2, price: 89.99,  cost: 49.00,  hue: 15  },
  { id: 'p09', sku: 'TAM-25198',   name: 'Tamiya 1/48 Mustang P-51D',    cat: 'Scale Models', grade: '—',  mfr: 'Tamiya',     series: 'Aircraft',             stock: 8,  low: 3, price: 42.50,  cost: 22.00,  hue: 60  },
  { id: 'p10', sku: 'BAN-2588041', name: 'SD Gundam Cross Silhouette',   cat: 'Gunpla',       grade: 'SD', mfr: 'Bandai',     series: 'SD',                   stock: 18, low: 6, price: 14.99,  cost: 7.50,   hue: 280 },
  { id: 'p11', sku: 'MR-MH001',    name: 'Mr. Hobby Aqueous Set · 18',   cat: 'Tools',        grade: '—',  mfr: 'GSI Creos',  series: 'Paint',                stock: 5,  low: 4, price: 78.00,  cost: 46.00,  hue: 130 },
  { id: 'p12', sku: 'TAM-87038',   name: 'Tamiya Extra Thin Cement',     cat: 'Tools',        grade: '—',  mfr: 'Tamiya',     series: 'Adhesive',             stock: 2,  low: 6, price: 6.99,   cost: 3.10,   hue: 50  },
  { id: 'p13', sku: 'BAN-2607193', name: 'MG Wing Gundam Zero EW',       cat: 'Gunpla',       grade: 'MG', mfr: 'Bandai',     series: 'Wing',                 stock: 7,  low: 3, price: 79.99,  cost: 47.00,  hue: 200 },
  { id: 'p14', sku: 'KOT-PP878',   name: 'Megami Device Asra Archer',    cat: 'Figures',      grade: '—',  mfr: 'Kotobukiya', series: 'Megami Device',        stock: 3,  low: 3, price: 89.00,  cost: 52.00,  hue: 350 },
  { id: 'p15', sku: 'BAN-2554136', name: 'RG Strike Freedom',            cat: 'Gunpla',       grade: 'RG', mfr: 'Bandai',     series: 'SEED',                 stock: 9,  low: 4, price: 44.99,  cost: 24.50,  hue: 50  },
  { id: 'p16', sku: 'GSC-N04102',  name: 'Nendoroid Hatsune Miku',       cat: 'Figures',      grade: '—',  mfr: 'Good Smile', series: 'Vocaloid',             stock: 11, low: 5, price: 64.99,  cost: 36.00,  hue: 165 },
  { id: 'p17', sku: 'TAM-32599',   name: 'Tamiya 1/35 Tiger I Initial',  cat: 'Scale Models', grade: '—',  mfr: 'Tamiya',     series: 'Armor',                stock: 0,  low: 2, price: 58.00,  cost: 32.00,  hue: 80  },
  { id: 'p18', sku: 'BAN-5063385', name: 'HG Char Zaku II',              cat: 'Gunpla',       grade: 'HG', mfr: 'Bandai',     series: 'One Year War',         stock: 15, low: 5, price: 17.99,  cost: 8.40,   hue: 10  },
];

export function statusOf(p: Product): StatusType {
  if (p.stock === 0) return 'out';
  if (p.stock <= p.low) return 'low';
  return 'ok';
}
