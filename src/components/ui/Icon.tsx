type P = { s?: number };

export const Icon = {
  search:    ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14" strokeLinecap="round"/></svg>,
  plus:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  minus:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8h10"/></svg>,
  scan:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M3 5V3h2M11 3h2v2M13 11v2h-2M5 13H3v-2"/><path d="M5.5 5.5v5M8 5.5v5M10.5 5.5v5"/></svg>,
  box:       ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="m2 5 6-3 6 3v6l-6 3-6-3V5Z"/><path d="m2 5 6 3 6-3M8 8v6"/></svg>,
  cog:       ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3"/></svg>,
  chart:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 14V2M2 14h12"/><path d="M5 11V8M8 11V5M11 11V7"/></svg>,
  bell:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 2v1M4 6.5a4 4 0 1 1 8 0c0 3 1 4 1 4H3s1-1 1-4Z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/></svg>,
  filter:    ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M2 3h12l-4.5 6v4l-3 1V9L2 3Z"/></svg>,
  x:         ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m4 4 8 8M12 4l-8 8"/></svg>,
  check:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8 3 3 6-6.5"/></svg>,
  chev:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m6 4 4 4-4 4"/></svg>,
  chevDown:  ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m4 6 4 4 4-4"/></svg>,
  trash:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 4h10M6 4V2.5h4V4M5 4l.7 9.5a1 1 0 0 0 1 .9h2.6a1 1 0 0 0 1-.9L11 4"/></svg>,
  arrowLeft: ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M13 8H3M7 4 3 8l4 4"/></svg>,
  logout:    ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M9 2H3v12h6M11 5l3 3-3 3M14 8H6"/></svg>,
  sheet:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M2 6h12M6 6v8"/></svg>,
  inbox:     ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M2 9.5 4 3h8l2 6.5V13H2zM2 9.5h3.5l1 2h3l1-2H14"/></svg>,
  edit:      ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2.5 13.5 5l-8 8H3v-2.5l8-8Z"/><path d="M9.5 4 12 6.5"/></svg>,
};

import type { ReactElement } from 'react';
export type IconComponent = (props: P) => ReactElement;
