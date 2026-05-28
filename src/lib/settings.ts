export interface AppSettings {
  categories: string[];
  manufacturers: string[];
  series: string[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  categories: ['Gunpla', 'Scale Models', 'Figures', 'Accessories', 'Tools'],
  manufacturers: ['Bandai', 'Good Smile', 'Kotobukiya', 'Tamiya', 'GSI Creos'],
  series: [],
};

const KEY = 'inventori_settings';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const p = JSON.parse(raw) as Partial<AppSettings>;
    return {
      categories:    p.categories    ?? DEFAULT_SETTINGS.categories,
      manufacturers: p.manufacturers ?? DEFAULT_SETTINGS.manufacturers,
      series:        p.series        ?? DEFAULT_SETTINGS.series,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
