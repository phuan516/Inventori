type P = { s?: number };

export const IIcon = {
  file:    ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M4 1.5h5L13 5.5V14.5H4z" transform="translate(-.5 0)"/><path d="M9 1.5V5h4"/></svg>,
  inbox:   ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M2 9.5 4 3h8l2 6.5V13H2zM2 9.5h3.5l1 2h3l1-2H14"/></svg>,
  alert:   ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2.5 14.5 13.5H1.5zM8 6.5v3.2"/><circle cx="8" cy="11.8" r=".3" fill="currentColor"/></svg>,
  enter:   ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3v4a2 2 0 0 1-2 2H3M6 6 3 9l3 3"/></svg>,
  bolt:    ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"><path d="M9 1.5 3.5 9H8l-1 5.5L12.5 7H8z"/></svg>,
  sparkle: ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5c.4 2.7 1.8 4.1 4.5 4.5C9.8 6.4 8.4 7.8 8 10.5 7.6 7.8 6.2 6.4 3.5 6 6.2 5.6 7.6 4.2 8 1.5Z"/></svg>,
  truck:   ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 4h9v7H1zM10 7h3l2 2v2h-5"/><circle cx="4" cy="12.5" r="1.2"/><circle cx="12" cy="12.5" r="1.2"/></svg>,
  back:    ({ s = 16 }: P) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8H3M7 4 3 8l4 4"/></svg>,
};
