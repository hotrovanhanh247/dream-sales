'use client';
import { useEffect, useMemo, useState } from 'react';
import type { SalesMonth, SalesMember } from './types';
import {
  SALES_POSITIONS,
  SALES_POSITION_KEYS,
  POSITION_RANK,
  salesMonthKeys,
  type SalesPositionKey,
} from './constants';

const STORE_PREFIX = 'dreamSalesCalc:v1';
const genId = (): string =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * Calculator state, scoped to the currently signed-in APP account (no Google
 * login). Data is persisted in the browser's localStorage, keyed per account,
 * so each logged-in user keeps their own scenarios on this device.
 */
export function useSales(accountId: string | null) {
  const [salesMonths, setSalesMonths] = useState<SalesMonth[]>([]);
  const [salesMembers, setSalesMembers] = useState<SalesMember[]>([]);
  const [salesActivePosition, setSalesActivePosition] = useState<SalesPositionKey>('gdkd');
  const [salesActiveMonth, setSalesActiveMonth] = useState<string>(() => salesMonthKeys()[0]);

  const monthsKey = accountId ? `${STORE_PREFIX}:${accountId}:salesMonths` : null;
  const membersKey = accountId ? `${STORE_PREFIX}:${accountId}:salesMembers` : null;

  // Load this account's data from localStorage whenever the account changes.
  useEffect(() => {
    if (!monthsKey || !membersKey) {
      setSalesMonths([]);
      setSalesMembers([]);
      return;
    }
    try {
      const raw = localStorage.getItem(monthsKey);
      setSalesMonths(raw ? (JSON.parse(raw) as SalesMonth[]) : []);
    } catch { setSalesMonths([]); }
    try {
      const raw = localStorage.getItem(membersKey);
      setSalesMembers(raw ? (JSON.parse(raw) as SalesMember[]) : []);
    } catch { setSalesMembers([]); }
  }, [monthsKey, membersKey]);

  const saveMonths = (next: SalesMonth[]) => {
    setSalesMonths(next);
    try { if (monthsKey) localStorage.setItem(monthsKey, JSON.stringify(next)); } catch { /* quota / private mode */ }
  };
  const saveMembers = (next: SalesMember[]) => {
    setSalesMembers(next);
    try { if (membersKey) localStorage.setItem(membersKey, JSON.stringify(next)); } catch { /* quota / private mode */ }
  };

  const salesKey = (ym: string, pos: SalesPositionKey) => `${ym}|${pos}`;
  const salesByKey = useMemo(() => {
    const map: Record<string, SalesMonth> = {};
    for (const m of salesMonths) map[salesKey(m.yearMonth, m.position as SalesPositionKey)] = m;
    return map;
  }, [salesMonths]);

  const retailRevenueAOf = (m: SalesMonth | undefined): number =>
    m?.retailRevenueA ?? m?.retailRevenue ?? 0;
  const retailRevenueBOf = (m: SalesMonth | undefined): number => m?.retailRevenueB ?? 0;

  const getEffectiveRetail = (
    ym: string,
    position: SalesPositionKey,
    kind: 'A' | 'B'
  ): { value: number; isOwn: boolean; sourceMonth: string; endMonth?: string } => {
    const ownDoc = salesByKey[salesKey(ym, position)];
    const ownVal = kind === 'A' ? retailRevenueAOf(ownDoc) : retailRevenueBOf(ownDoc);
    if (ownVal > 0) {
      const recurring = kind === 'A' ? !!ownDoc?.retailRevenueARecurring : !!ownDoc?.retailRevenueBRecurring;
      const endMonth = kind === 'A' ? ownDoc?.retailRevenueAEndMonth : ownDoc?.retailRevenueBEndMonth;
      return { value: ownVal, isOwn: true, sourceMonth: ym, endMonth: recurring ? endMonth : undefined };
    }
    let best: SalesMonth | null = null;
    for (const sm of salesMonths) {
      if (sm.position !== position) continue;
      if (sm.yearMonth > ym) continue;
      const recurring = kind === 'A' ? sm.retailRevenueARecurring : sm.retailRevenueBRecurring;
      const v = kind === 'A' ? retailRevenueAOf(sm) : retailRevenueBOf(sm);
      const endMonth = kind === 'A' ? sm.retailRevenueAEndMonth : sm.retailRevenueBEndMonth;
      if (!recurring || v <= 0) continue;
      if (endMonth && endMonth < ym) continue;
      if (!best || sm.yearMonth > best.yearMonth) best = sm;
    }
    if (best) {
      const v = kind === 'A' ? retailRevenueAOf(best) : retailRevenueBOf(best);
      const endMonth = kind === 'A' ? best.retailRevenueAEndMonth : best.retailRevenueBEndMonth;
      return { value: v, isOwn: false, sourceMonth: best.yearMonth, endMonth };
    }
    return { value: 0, isOwn: true, sourceMonth: ym };
  };

  const getApplicableServiceCosts = (ym: string, position: SalesPositionKey) => {
    const out: Array<{ cost: SalesMonth['serviceCosts'][number]; sourceMonth: string; isOwn: boolean }> = [];
    for (const sm of salesMonths) {
      if (sm.position !== position) continue;
      const list = sm.serviceCosts || [];
      for (const c of list) {
        if (c.recurring) {
          const startOk = sm.yearMonth <= ym;
          const endOk = !c.endMonth || c.endMonth >= ym;
          if (startOk && endOk) out.push({ cost: c, sourceMonth: sm.yearMonth, isOwn: sm.yearMonth === ym });
        } else {
          if (sm.yearMonth === ym) out.push({ cost: c, sourceMonth: sm.yearMonth, isOwn: true });
        }
      }
    }
    return out;
  };

  const computeSalesMonth = (ym: string, position: SalesPositionKey) => {
    const m = salesByKey[salesKey(ym, position)];
    const pos = SALES_POSITIONS[position];
    const posRank = POSITION_RANK[position];

    const retailA = getEffectiveRetail(ym, position, 'A').value;
    const retailB = getEffectiveRetail(ym, position, 'B').value;
    const retail = retailA + retailB;

    const tierRetail = (offset: number): number => {
      const r = posRank + offset;
      if (r >= SALES_POSITION_KEYS.length) return 0;
      const tp = SALES_POSITION_KEYS[r];
      return getEffectiveRetail(ym, tp, 'A').value + getEffectiveRetail(ym, tp, 'B').value;
    };
    const f1 = tierRetail(1);
    const f2 = tierRetail(2);
    const f3 = tierRetail(3);

    const retailCommission = retail * pos.retailPct / 100;
    const f1Commission = f1 * pos.f1Pct / 100;
    const f2Commission = f2 * pos.f2Pct / 100;
    const f3Commission = f3 * pos.f3Pct / 100;
    const totalCommission = retailCommission + f1Commission + f2Commission + f3Commission;
    const baseSalary = m?.hasBaseSalary !== false ? pos.baseSalary : 0;
    let serviceAmountCost = 0;
    let servicePercentCost = 0;
    const applicable = getApplicableServiceCosts(ym, position);
    if (applicable.length === 0 && (m?.serviceCostPct || 0) > 0) {
      servicePercentCost = retailA * (m?.serviceCostPct || 0) / 100;
    } else {
      for (const { cost } of applicable) {
        if (cost.type === 'amount') serviceAmountCost += cost.value || 0;
        else servicePercentCost += retailA * (cost.value || 0) / 100;
      }
    }
    const serviceCost = serviceAmountCost + servicePercentCost;
    const fixedCostTotal = (m?.fixedCosts || []).reduce((s, x) => s + (x.amount || 0), 0);
    const totalCost = serviceCost + fixedCostTotal;
    const totalRevenue = retail + f1 + f2 + f3;
    const profit = totalCommission + baseSalary - totalCost;
    return {
      retailA, retailB, retailRevenue: retail, f1Revenue: f1, f2Revenue: f2, f3Revenue: f3, totalRevenue,
      retailCommission, f1Commission, f2Commission, f3Commission, totalCommission,
      baseSalary, serviceCost, serviceAmountCost, servicePercentCost, fixedCostTotal, totalCost, profit, position,
    };
  };

  const upsertSalesMonth = async (yearMonth: string, patch: Partial<SalesMonth>) => {
    if (!accountId) return;
    const existing = salesByKey[salesKey(yearMonth, salesActivePosition)];
    if (existing) {
      saveMonths(salesMonths.map(m => (m.id === existing.id ? { ...m, ...patch } : m)));
    } else {
      const base: Omit<SalesMonth, 'id'> = {
        yearMonth,
        position: salesActivePosition,
        hasBaseSalary: true,
        retailRevenueA: 0,
        retailRevenueB: 0,
        subordinates: [],
        serviceCosts: [],
        fixedCosts: [],
      };
      const created = { ...base, ...patch, id: genId() } as SalesMonth;
      saveMonths([...salesMonths, created]);
    }
  };

  const addSalesMember = async (member: Omit<SalesMember, 'id'>) => {
    if (!accountId) return;
    const created: SalesMember = {
      id: genId(),
      position: member.position,
      count: member.count,
      createdAt: Date.now(),
      ...(member.name ? { name: member.name } : {}),
      ...(member.parentId ? { parentId: member.parentId } : {}),
    } as SalesMember;
    saveMembers([...salesMembers, created]);
  };

  const deleteSalesMember = async (id: string) => {
    if (!accountId) return;
    const toDelete = new Set<string>();
    const collect = (rootId: string) => {
      if (toDelete.has(rootId)) return; // guard against cyclic parentId data
      toDelete.add(rootId);
      salesMembers.filter(x => x.parentId === rootId).forEach(c => collect(c.id));
    };
    collect(id);
    saveMembers(salesMembers.filter(m => !toDelete.has(m.id)));
  };

  return {
    salesMonths,
    salesMembers,
    salesActivePosition,
    setSalesActivePosition,
    salesActiveMonth,
    setSalesActiveMonth,
    salesByKey,
    salesKey,
    retailRevenueAOf,
    retailRevenueBOf,
    getEffectiveRetail,
    getApplicableServiceCosts,
    computeSalesMonth,
    upsertSalesMonth,
    addSalesMember,
    deleteSalesMember,
  };
}
