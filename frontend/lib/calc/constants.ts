import type { SalesMember, SalesPosition } from './types';

export type SalesPositionKey = SalesPosition;

export const SALES_POSITIONS: Record<SalesPositionKey, {
  key: SalesPositionKey;
  label: string;
  short: string;
  baseSalary: number;
  retailPct: number;
  f1Pct: number;
  f2Pct: number;
  f3Pct: number;
  bg: string;
  text: string;
  bgSoft: string;
}> = {
  gdkd:   { key: 'gdkd',   label: 'Giám đốc kinh doanh',     short: 'GĐKD',   baseSalary: 30_000_000, retailPct: 38, f1Pct: 10, f2Pct: 5, f3Pct: 3, bg: 'bg-indigo-600', text: 'text-indigo-600', bgSoft: 'bg-indigo-50' },
  gdvung: { key: 'gdvung', label: 'Giám đốc vùng',           short: 'GĐ Vùng', baseSalary: 18_000_000, retailPct: 35, f1Pct: 10, f2Pct: 5, f3Pct: 0, bg: 'bg-violet-600', text: 'text-violet-600', bgSoft: 'bg-violet-50' },
  tp:     { key: 'tp',     label: 'Trưởng phòng kinh doanh', short: 'TP',     baseSalary: 10_000_000, retailPct: 30, f1Pct: 10, f2Pct: 0, f3Pct: 0, bg: 'bg-amber-500',  text: 'text-amber-600',  bgSoft: 'bg-amber-50' },
  pp:     { key: 'pp',     label: 'Phó phòng',               short: 'PP',     baseSalary:  5_000_000, retailPct: 20, f1Pct: 0,  f2Pct: 0, f3Pct: 0, bg: 'bg-slate-500',  text: 'text-slate-600',  bgSoft: 'bg-slate-50' },
  ctv:    { key: 'ctv',    label: 'Cộng tác viên',           short: 'CTV',    baseSalary: 0,          retailPct: 20, f1Pct: 0,  f2Pct: 0, f3Pct: 0, bg: 'bg-emerald-600', text: 'text-emerald-600', bgSoft: 'bg-emerald-50' },
};

export const SALES_POSITION_KEYS: SalesPositionKey[] = ['gdkd', 'gdvung', 'tp', 'pp', 'ctv'];

export const POSITION_RANK: Record<SalesPositionKey, number> = { gdkd: 0, gdvung: 1, tp: 2, pp: 3, ctv: 4 };

export const compareMembers = (a: SalesMember, b: SalesMember): number => {
  const ra = POSITION_RANK[a.position as SalesPositionKey] - POSITION_RANK[b.position as SalesPositionKey];
  if (ra !== 0) return ra;
  return (a.name || '').localeCompare(b.name || '', 'vi', { numeric: true, sensitivity: 'base' });
};

export const SALES_TIER_LABELS: Record<'f1' | 'f2' | 'f3', string> = { f1: 'F1', f2: 'F2', f3: 'F3' };

export const SALES_START_YEAR = 2026;
export const SALES_START_MONTH = 6;
export const SALES_MONTH_COUNT = 12;

export function salesMonthKeys(): string[] {
  const out: string[] = [];
  for (let i = 0; i < SALES_MONTH_COUNT; i++) {
    const m = ((SALES_START_MONTH - 1 + i) % 12) + 1;
    const y = SALES_START_YEAR + Math.floor((SALES_START_MONTH - 1 + i) / 12);
    out.push(`${y}-${m.toString().padStart(2, '0')}`);
  }
  return out;
}

export function salesMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-');
  return `${m}/${y.slice(2)}`;
}

export function countSubtree(parentId: string, members: SalesMember[]): number {
  let total = 0;
  for (const c of members.filter(x => x.parentId === parentId)) {
    total += (c.count || 1) + countSubtree(c.id, members);
  }
  return total;
}
