type P = { s?: number };

export const Icon = {
  search:    ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14" strokeLinecap="round"/></svg>,
  plus:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  minus:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8h10"/></svg>,
  scan:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M3 5V3h2M11 3h2v2M13 11v2h-2M5 13H3v-2"/><path d="M5.5 5.5v5M8 5.5v5M10.5 5.5v5"/></svg>,
  box:       ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="m2 5 6-3 6 3v6l-6 3-6-3V5Z"/><path d="m2 5 6 3 6-3M8 8v6"/></svg>,
  cog:       ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"><path d="M7.06 2.07 8.94 2.07 8.7 3.55 11.5 5.17 12.66 4.23 13.6 5.85 12.2 6.39 12.2 9.61 13.6 10.15 12.66 11.78 11.5 10.83 8.7 12.45 8.94 13.93 7.06 13.93 7.3 12.45 4.5 10.83 3.34 11.78 2.4 10.15 3.8 9.61 3.8 6.39 2.4 5.85 3.34 4.23 4.5 5.17 7.3 3.55Z"/><circle cx="8" cy="8" r="2"/></svg>,
  chart:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 14V2M2 14h12"/><path d="M5 11V8M8 11V5M11 11V7"/></svg>,
  bell:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 2v1M4 6.5a4 4 0 1 1 8 0c0 3 1 4 1 4H3s1-1 1-4Z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/></svg>,
  filter:    ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M2 3h12l-4.5 6v4l-3 1V9L2 3Z"/></svg>,
  x:         ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m4 4 8 8M12 4l-8 8"/></svg>,
  check:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8 3 3 6-6.5"/></svg>,
  chev:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m6 4 4 4-4 4"/></svg>,
  chevLeft:  ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m10 4-4 4 4 4"/></svg>,
  chevDown:  ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m4 6 4 4 4-4"/></svg>,
  trash:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 4h10M6 4V2.5h4V4M5 4l.7 9.5a1 1 0 0 0 1 .9h2.6a1 1 0 0 0 1-.9L11 4"/></svg>,
  arrowLeft: ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M13 8H3M7 4 3 8l4 4"/></svg>,
  logout:    ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M9 2H3v12h6M11 5l3 3-3 3M14 8H6"/></svg>,
  sheet:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M2 6h12M6 6v8"/></svg>,
  inbox:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M2 9.5 4 3h8l2 6.5V13H2zM2 9.5h3.5l1 2h3l1-2H14"/></svg>,
  edit:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2.5 13.5 5l-8 8H3v-2.5l8-8Z"/><path d="M9.5 4 12 6.5"/></svg>,
  tag:       ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M2 2h5.5l6.5 6.5-5.5 5.5L2 7.5V2Z"/><circle cx="5" cy="5" r="1"/></svg>,
  cart:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"><path d="M2 2h1.6l1.2 8.2h7L13.4 5H4.4"/><circle cx="6.2" cy="13.2" r="1.1"/><circle cx="11.6" cy="13.2" r="1.1"/></svg>,
  user:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="5.5" r="2.6"/><path d="M3 13.5c.6-2.6 2.6-4 5-4s4.4 1.4 5 4"/></svg>,
  receipt:   ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M3.5 1.5h9v13l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1V1.5Z"/><path d="M5.5 5h5M5.5 8h5M5.5 11h3"/></svg>,
  clock:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.2L10 10"/></svg>,
  enter:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v5H4M7 5 4 8l3 3"/></svg>,
};

import type { ReactElement } from 'react';
export type IconComponent = (props: P) => ReactElement;
