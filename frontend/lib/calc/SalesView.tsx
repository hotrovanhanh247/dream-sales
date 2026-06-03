'use client';
import { motion } from 'motion/react';
import { Calendar, Plus, Trash2, Users, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import type { SalesMonth, SalesSubordinate, SalesFixedCost, SalesServiceCost, SalesServiceCostType } from './types';
import { Card, CommitInput, cn, fmtVND, formatNumberDisplay } from '../ui';
import {
  SALES_POSITIONS,
  SALES_POSITION_KEYS,
  POSITION_RANK,
  SALES_TIER_LABELS,
  SALES_START_MONTH,
  SALES_START_YEAR,
  SALES_MONTH_COUNT,
  salesMonthKeys,
  salesMonthLabel,
} from './constants';
import { OrgRosterEditor } from './OrgRosterEditor';
import { OrgTree } from './OrgTree';
import { useSales } from './useSales';

export function SalesView({ accountId }: { accountId: string }) {
  const {
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
  } = useSales(accountId);

  return (
    <motion.div
      key="sales"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Sales commission</h2>
          <p className="text-slate-500 text-sm hidden md:block">Tính hoa hồng, chi phí và lợi nhuận theo tháng (T{SALES_START_MONTH}/{SALES_START_YEAR} → +{SALES_MONTH_COUNT} tháng).</p>
        </div>
      </div>

      <Card className="p-3 md:p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {SALES_POSITION_KEYS.map(k => {
            const p = SALES_POSITIONS[k];
            const active = salesActivePosition === k;
            const headcount = salesMembers
              .filter(m => m.position === k)
              .reduce((s, x) => s + (x.count || 1), 0);
            return (
              <button
                key={k}
                type="button"
                onClick={() => setSalesActivePosition(k)}
                className={cn(
                  'px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left',
                  active ? `${p.bg} text-white border-transparent` : `bg-white ${p.text} border-slate-200 hover:bg-slate-50`
                )}
              >
                <div className="font-black text-sm">{p.short}</div>
                <div className={cn('text-[10px] font-medium mt-0.5', active ? 'text-white/80' : 'text-slate-400')}>
                  Bán lẻ {p.retailPct}%{p.f1Pct > 0 ? ` · F1 ${p.f1Pct}%` : ''}{p.f2Pct > 0 ? ` · F2 ${p.f2Pct}%` : ''}{p.f3Pct > 0 ? ` · F3 ${p.f3Pct}%` : ''}
                </div>
                <div className={cn('text-[10px] font-medium mt-0.5', active ? 'text-white/90' : 'text-slate-500')}>
                  {headcount} người
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {(() => {
        const allMonths = salesMonthKeys();
        const computed = allMonths.map(ym => {
          const m = salesByKey[salesKey(ym, salesActivePosition)];
          return { ym, m, c: computeSalesMonth(ym, salesActivePosition) };
        });
        const activeC = computed.find(x => x.ym === salesActiveMonth)?.c
          || computeSalesMonth(salesActiveMonth, salesActivePosition);
        const totals = computed.reduce((acc, x) => {
          acc.revenue += x.c.totalRevenue;
          acc.commission += x.c.totalCommission;
          acc.base += x.c.baseSalary;
          acc.cost += x.c.totalCost;
          acc.profit += x.c.profit;
          return acc;
        }, { revenue: 0, commission: 0, base: 0, cost: 0, profit: 0 });
        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-6 items-start">
              <div className="lg:col-span-3 space-y-3 md:space-y-6">
                <Card className="p-3 md:p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Doanh thu</p>
                      </div>
                      <h3 className="text-lg md:text-xl font-black mt-1 text-indigo-700">{fmtVND(activeC.totalRevenue)}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">T{salesMonthLabel(salesActiveMonth)}</p>
                    </div>
                    <div className="flex flex-col md:border-l md:border-slate-200 md:pl-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">HH + Lương</p>
                      </div>
                      <h3 className="text-lg md:text-xl font-black mt-1 text-emerald-700">{fmtVND(activeC.totalCommission + activeC.baseSalary)}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">HH {fmtVND(activeC.totalCommission)}</p>
                    </div>
                    <div className="flex flex-col md:border-l md:border-slate-200 md:pl-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Chi phí</p>
                      </div>
                      <h3 className="text-lg md:text-xl font-black mt-1 text-rose-600">{fmtVND(activeC.totalCost)}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">DV + cố định</p>
                    </div>
                    <div className="flex flex-col md:border-l md:border-slate-200 md:pl-4">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('w-2 h-2 rounded-full', activeC.profit >= 0 ? 'bg-amber-500' : 'bg-slate-700')} />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Lợi nhuận</p>
                      </div>
                      <h3 className={cn('text-lg md:text-xl font-black mt-1', activeC.profit >= 0 ? 'text-amber-600' : 'text-slate-700')}>{fmtVND(activeC.profit)}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">HH − CP</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-600" />
                    Doanh thu / Hoa hồng / Chi phí / Lợi nhuận theo tháng
                  </h3>
                  {(() => {
                    const max = Math.max(1, ...computed.map(x => Math.max(x.c.totalRevenue, x.c.totalCommission + x.c.baseSalary, x.c.totalCost, Math.abs(x.c.profit))));
                    const w = 880;
                    const h = 280;
                    const padL = 56;
                    const padR = 16;
                    const padT = 16;
                    const padB = 40;
                    const innerW = w - padL - padR;
                    const innerH = h - padT - padB;
                    const n = computed.length;
                    const slot = innerW / n;
                    const groupGap = 0.20;
                    const groupW = slot * (1 - groupGap);
                    const barW = groupW / 4;
                    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ y: padT + innerH - f * innerH, v: max * f }));
                    return (
                      <div className="overflow-x-auto">
                        <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[720px]" preserveAspectRatio="none">
                          {yTicks.map((tk, i) => (
                            <g key={i}>
                              <line x1={padL} x2={w - padR} y1={tk.y} y2={tk.y} stroke="#e2e8f0" strokeDasharray="3 3" />
                              <text x={padL - 8} y={tk.y + 3} textAnchor="end" className="fill-slate-400 text-[10px]">{fmtVND(tk.v)}</text>
                            </g>
                          ))}
                          {computed.map((x, i) => {
                            const x0 = padL + i * slot + (slot - groupW) / 2;
                            const bars: { label: string; val: number; color: string }[] = [
                              { label: 'DT', val: x.c.totalRevenue, color: '#6366f1' },
                              { label: 'HH', val: x.c.totalCommission + x.c.baseSalary, color: '#10b981' },
                              { label: 'CP', val: x.c.totalCost, color: '#f43f5e' },
                              { label: 'LN', val: Math.max(0, x.c.profit), color: '#f59e0b' },
                            ];
                            return (
                              <g key={x.ym}>
                                {bars.map((b, j) => {
                                  const bh = (b.val / max) * innerH;
                                  return (
                                    <rect key={j} x={x0 + j * barW} y={padT + innerH - bh} width={barW * 0.85} height={bh} fill={b.color} rx={1.5}>
                                      <title>{b.label}: {fmtVND(b.val)}</title>
                                    </rect>
                                  );
                                })}
                                <text x={x0 + groupW / 2} y={h - 16} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">{salesMonthLabel(x.ym)}</text>
                              </g>
                            );
                          })}
                        </svg>
                        <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-slate-500 justify-center">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#6366f1' }} />Doanh thu</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#10b981' }} />Hoa hồng + Lương</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#f43f5e' }} />Chi phí</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#f59e0b' }} />Lợi nhuận</span>
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              </div>
              <div className="lg:col-span-2">
                <Card className="p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" />
                    Sơ đồ tổ chức
                    <span className={cn('ml-1 px-2 py-0.5 rounded-md text-[11px]', SALES_POSITIONS[salesActivePosition].bgSoft, SALES_POSITIONS[salesActivePosition].text)}>
                      {SALES_POSITIONS[salesActivePosition].short}
                    </span>
                  </h3>

                  <OrgRosterEditor
                    position={salesActivePosition}
                    members={salesMembers}
                    onAdd={addSalesMember}
                    onDelete={deleteSalesMember}
                  />

                  <div className="mt-5 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Cây tổ chức</h4>
                    <OrgTree members={salesMembers} />
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Calendar size={14} className="text-slate-400 ml-0.5" />
              {allMonths.map(ym => (
                <button
                  key={ym}
                  onClick={() => setSalesActiveMonth(ym)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                    salesActiveMonth === ym ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {salesMonthLabel(ym)}
                </button>
              ))}
            </div>

            {(() => {
              const ym = salesActiveMonth;
              const m = salesByKey[salesKey(ym, salesActivePosition)];
              const c = computeSalesMonth(ym, salesActivePosition);
              const effA = getEffectiveRetail(ym, salesActivePosition, 'A');
              const effB = getEffectiveRetail(ym, salesActivePosition, 'B');
              const ownA = retailRevenueAOf(m);
              const ownB = retailRevenueBOf(m);
              const recurringA = !!m?.retailRevenueARecurring;
              const recurringB = !!m?.retailRevenueBRecurring;
              const endA = m?.retailRevenueAEndMonth || allMonths[allMonths.length - 1];
              const endB = m?.retailRevenueBEndMonth || allMonths[allMonths.length - 1];
              const pos = SALES_POSITIONS[salesActivePosition];
              const subs = m?.subordinates || [];
              const fixedCosts = m?.fixedCosts || [];
              const allowedTiers: ('f1' | 'f2' | 'f3')[] = pos.f3Pct > 0 ? ['f1', 'f2', 'f3'] : pos.f2Pct > 0 ? ['f1', 'f2'] : pos.f1Pct > 0 ? ['f1'] : [];
              const tierPct = (t: 'f1' | 'f2' | 'f3') => t === 'f1' ? pos.f1Pct : t === 'f2' ? pos.f2Pct : pos.f3Pct;
              const addFixedCost = () => {
                const next: SalesFixedCost[] = [...fixedCosts, { id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, label: '', amount: 0 }];
                upsertSalesMonth(ym, { fixedCosts: next });
              };
              const updateFixedCost = (id: string, patch: Partial<SalesFixedCost>) => {
                const next = fixedCosts.map(f => f.id === id ? { ...f, ...patch } : f);
                upsertSalesMonth(ym, { fixedCosts: next });
              };
              const removeFixedCost = (id: string) => {
                const next = fixedCosts.filter(f => f.id !== id);
                upsertSalesMonth(ym, { fixedCosts: next });
              };
              const ownServiceCosts = m?.serviceCosts || [];
              const applicableServiceCosts = getApplicableServiceCosts(ym, salesActivePosition);
              const inheritedServiceCosts = applicableServiceCosts.filter(x => !x.isOwn);
              const addServiceCost = (type: SalesServiceCostType) => {
                const next: SalesServiceCost[] = [...ownServiceCosts, { id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, label: '', type, value: 0, recurring: true, endMonth: allMonths[allMonths.length - 1] }];
                upsertSalesMonth(ym, { serviceCosts: next });
              };
              const updateServiceCost = (id: string, patch: Partial<SalesServiceCost>) => {
                const next = ownServiceCosts.map(s => s.id === id ? { ...s, ...patch } : s);
                upsertSalesMonth(ym, { serviceCosts: next });
              };
              const removeServiceCost = (id: string) => {
                const next = ownServiceCosts.filter(s => s.id !== id);
                upsertSalesMonth(ym, { serviceCosts: next });
              };
              const removeInheritedServiceCost = (sourceMonth: string, id: string) => {
                const sm = salesByKey[salesKey(sourceMonth, salesActivePosition)];
                if (!sm) return;
                const next = (sm.serviceCosts || []).filter(s => s.id !== id);
                upsertSalesMonth(sourceMonth, { serviceCosts: next });
              };
              const updateInheritedServiceCost = (sourceMonth: string, id: string, patch: Partial<SalesServiceCost>) => {
                const sm = salesByKey[salesKey(sourceMonth, salesActivePosition)];
                if (!sm) return;
                const next = (sm.serviceCosts || []).map(s => s.id === id ? { ...s, ...patch } : s);
                upsertSalesMonth(sourceMonth, { serviceCosts: next });
              };
              return (
                <Card className="p-5 md:p-6 space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-base md:text-lg font-bold">Tháng {salesMonthLabel(ym)}</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 uppercase font-bold tracking-wider">Lợi nhuận</span>
                      <span className={cn('font-black text-base md:text-lg', c.profit >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{fmtVND(c.profit)}</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={m?.hasBaseSalary !== false}
                      onChange={e => upsertSalesMonth(ym, { hasBaseSalary: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">Lương cứng</p>
                      <p className="text-[11px] text-slate-500">{pos.short} = {fmtVND(pos.baseSalary)}/tháng</p>
                    </div>
                  </label>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-xs font-bold uppercase text-slate-400">Doanh thu bán lẻ</p>
                      <p className="text-xs text-slate-500">
                        Tổng <span className="font-black text-base text-indigo-700">{fmtVND(c.retailA + c.retailB)}</span>
                        <span className="text-[10px] text-slate-400 ml-1">(A {fmtVND(c.retailA)} + B {fmtVND(c.retailB)})</span>
                      </p>
                    </div>

                    <div className="border-2 border-indigo-200 bg-indigo-50/30 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">A</div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">Có chịu chi phí dịch vụ</p>
                            <p className="text-[10px] text-slate-500">Hoa hồng {pos.retailPct}% = <span className="font-bold text-emerald-600">{fmtVND(c.retailA * pos.retailPct / 100)}</span></p>
                          </div>
                        </div>
                        <div className="w-44">
                          <CommitInput
                            asNumber
                            step="1000"
                            value={ownA}
                            onCommit={v => {
                              const num = Number(v) || 0;
                              const patch: Partial<SalesMonth> = { retailRevenueA: num };
                              if (num > 0 && ownA === 0) {
                                patch.retailRevenueARecurring = true;
                                patch.retailRevenueAEndMonth = allMonths[allMonths.length - 1];
                              }
                              upsertSalesMonth(ym, patch);
                            }}
                          />
                        </div>
                      </div>

                      {ownA > 0 && (
                        <div className="flex items-center gap-2 flex-wrap text-[10px]">
                          <div className="flex bg-slate-100 rounded-lg p-0.5 font-bold">
                            <button type="button" onClick={() => upsertSalesMonth(ym, { retailRevenueARecurring: false, retailRevenueAEndMonth: undefined })} className={cn('px-2 py-1 rounded', !recurringA ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500')}>1 lần</button>
                            <button type="button" onClick={() => upsertSalesMonth(ym, { retailRevenueARecurring: true, retailRevenueAEndMonth: endA })} className={cn('px-2 py-1 rounded', recurringA ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500')}>Lặp lại</button>
                          </div>
                          {recurringA && (
                            <>
                              <span className="text-slate-500">đến</span>
                              <select
                                value={endA}
                                onChange={e => upsertSalesMonth(ym, { retailRevenueAEndMonth: e.target.value })}
                                className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white"
                              >
                                {allMonths.filter(om => om >= ym).map(om => (
                                  <option key={om} value={om}>{salesMonthLabel(om)}</option>
                                ))}
                              </select>
                            </>
                          )}
                        </div>
                      )}
                      {ownA === 0 && !effA.isOwn && effA.value > 0 && (
                        <div className="flex items-center gap-2 flex-wrap text-[11px] bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                          <span className="font-bold text-amber-700">↑ Lặp lại từ T{salesMonthLabel(effA.sourceMonth)}</span>
                          <span className="font-bold text-slate-800">{fmtVND(effA.value)}</span>
                          {effA.endMonth && <span className="text-amber-700">đến T{salesMonthLabel(effA.endMonth)}</span>}
                          <span className="ml-auto text-[10px] text-slate-500">Nhập số khác để ghi đè</span>
                        </div>
                      )}

                      <div className="border-t border-indigo-200 pt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-slate-500">Chi phí dịch vụ</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-rose-600">{fmtVND(c.serviceCost)}</span>
                            <button type="button" onClick={() => addServiceCost('amount')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                              <Plus size={12} />Phí cố định
                            </button>
                            <button type="button" onClick={() => addServiceCost('percent')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                              <Plus size={12} />% DT A
                            </button>
                          </div>
                        </div>
                        {ownServiceCosts.length === 0 && inheritedServiceCosts.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">Chưa có chi phí dịch vụ.</p>
                        ) : (
                          <div className="space-y-2">
                            {ownServiceCosts.map(sc => {
                              const computedAmt = sc.type === 'amount' ? sc.value : c.retailA * sc.value / 100;
                              return (
                                <div key={sc.id} className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <CommitInput
                                      placeholder="Tên phí (vd: Marketing Q3)"
                                      value={sc.label}
                                      onCommit={v => updateServiceCost(sc.id, { label: v })}
                                      className="flex-1"
                                    />
                                    <div className="flex bg-slate-100 rounded-lg p-0.5">
                                      <button type="button" onClick={() => updateServiceCost(sc.id, { type: 'amount' })} className={cn('px-2 py-1 rounded text-[11px] font-bold', sc.type === 'amount' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500')}>đ</button>
                                      <button type="button" onClick={() => updateServiceCost(sc.id, { type: 'percent' })} className={cn('px-2 py-1 rounded text-[11px] font-bold', sc.type === 'percent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500')}>%</button>
                                    </div>
                                    <CommitInput
                                      asNumber
                                      step={sc.type === 'percent' ? '0.1' : '1000'}
                                      value={sc.value || 0}
                                      onCommit={v => updateServiceCost(sc.id, { value: Number(v) || 0 })}
                                      className="w-32"
                                    />
                                    <button type="button" onClick={() => removeServiceCost(sc.id)} className="text-slate-300 hover:text-rose-500 p-1.5">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex bg-slate-100 rounded-lg p-0.5 text-[10px] font-bold">
                                      <button type="button" onClick={() => updateServiceCost(sc.id, { recurring: false, endMonth: undefined })} className={cn('px-2 py-1 rounded', !sc.recurring ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500')}>1 lần</button>
                                      <button type="button" onClick={() => updateServiceCost(sc.id, { recurring: true, endMonth: sc.endMonth || allMonths[allMonths.length - 1] })} className={cn('px-2 py-1 rounded', sc.recurring ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500')}>Lặp lại</button>
                                    </div>
                                    {sc.recurring && (
                                      <>
                                        <span className="text-[10px] text-slate-500">đến</span>
                                        <select
                                          value={sc.endMonth || ''}
                                          onChange={e => updateServiceCost(sc.id, { endMonth: e.target.value })}
                                          className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white"
                                        >
                                          {allMonths.filter(om => om >= ym).map(om => (
                                            <option key={om} value={om}>{salesMonthLabel(om)}</option>
                                          ))}
                                        </select>
                                      </>
                                    )}
                                    <span className="ml-auto text-[11px] font-bold text-rose-600">{fmtVND(computedAmt)}</span>
                                  </div>
                                </div>
                              );
                            })}
                            {inheritedServiceCosts.map(({ cost: sc, sourceMonth }) => {
                              const computedAmt = sc.type === 'amount' ? sc.value : c.retailA * sc.value / 100;
                              return (
                                <div key={`${sourceMonth}-${sc.id}`} className="bg-amber-50/40 rounded-xl p-3 border border-amber-200 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Lặp từ T{salesMonthLabel(sourceMonth)}</span>
                                    <span className="text-xs font-bold text-slate-800 flex-1 truncate">{sc.label || '(chưa đặt tên)'}</span>
                                    <span className="text-[11px] text-slate-500">{sc.type === 'amount' ? `${formatNumberDisplay(sc.value)} đ` : `${sc.value}% DT A`}</span>
                                    <span className="text-[11px] font-bold text-rose-600">{fmtVND(computedAmt)}</span>
                                    <button type="button" onClick={() => removeInheritedServiceCost(sourceMonth, sc.id)} className="text-slate-300 hover:text-rose-500 p-1" title="Xóa khỏi mọi tháng">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500">
                                    <span>Lặp lại đến</span>
                                    <select
                                      value={sc.endMonth || ''}
                                      onChange={e => updateInheritedServiceCost(sourceMonth, sc.id, { endMonth: e.target.value })}
                                      className="text-[11px] font-bold px-2 py-1 rounded-lg border border-amber-200 bg-white"
                                    >
                                      {allMonths.filter(om => om >= sourceMonth).map(om => (
                                        <option key={om} value={om}>{salesMonthLabel(om)}</option>
                                      ))}
                                    </select>
                                    <span className="text-amber-700">· Sửa ở đây sẽ áp cho mọi tháng kỳ này còn hiệu lực.</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-2 border-emerald-200 bg-emerald-50/30 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">B</div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">Tự bán (không qua dịch vụ)</p>
                            <p className="text-[10px] text-slate-500">Hoa hồng {pos.retailPct}% = <span className="font-bold text-emerald-600">{fmtVND(c.retailB * pos.retailPct / 100)}</span></p>
                          </div>
                        </div>
                        <div className="w-44">
                          <CommitInput
                            asNumber
                            step="1000"
                            value={ownB}
                            onCommit={v => {
                              const num = Number(v) || 0;
                              const patch: Partial<SalesMonth> = { retailRevenueB: num };
                              if (num > 0 && ownB === 0) {
                                patch.retailRevenueBRecurring = true;
                                patch.retailRevenueBEndMonth = allMonths[allMonths.length - 1];
                              }
                              upsertSalesMonth(ym, patch);
                            }}
                          />
                        </div>
                      </div>

                      {ownB > 0 && (
                        <div className="flex items-center gap-2 flex-wrap text-[10px]">
                          <div className="flex bg-slate-100 rounded-lg p-0.5 font-bold">
                            <button type="button" onClick={() => upsertSalesMonth(ym, { retailRevenueBRecurring: false, retailRevenueBEndMonth: undefined })} className={cn('px-2 py-1 rounded', !recurringB ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500')}>1 lần</button>
                            <button type="button" onClick={() => upsertSalesMonth(ym, { retailRevenueBRecurring: true, retailRevenueBEndMonth: endB })} className={cn('px-2 py-1 rounded', recurringB ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500')}>Lặp lại</button>
                          </div>
                          {recurringB && (
                            <>
                              <span className="text-slate-500">đến</span>
                              <select
                                value={endB}
                                onChange={e => upsertSalesMonth(ym, { retailRevenueBEndMonth: e.target.value })}
                                className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white"
                              >
                                {allMonths.filter(om => om >= ym).map(om => (
                                  <option key={om} value={om}>{salesMonthLabel(om)}</option>
                                ))}
                              </select>
                            </>
                          )}
                        </div>
                      )}
                      {ownB === 0 && !effB.isOwn && effB.value > 0 && (
                        <div className="flex items-center gap-2 flex-wrap text-[11px] bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                          <span className="font-bold text-amber-700">↑ Lặp lại từ T{salesMonthLabel(effB.sourceMonth)}</span>
                          <span className="font-bold text-slate-800">{fmtVND(effB.value)}</span>
                          {effB.endMonth && <span className="text-amber-700">đến T{salesMonthLabel(effB.endMonth)}</span>}
                          <span className="ml-auto text-[10px] text-slate-500">Nhập số khác để ghi đè</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {allowedTiers.length > 0 && (
                    <div className="space-y-2">
                      {allowedTiers.map((t, i) => {
                        const offset = i + 1;
                        const posRank = POSITION_RANK[salesActivePosition];
                        const tierRank = posRank + offset;
                        const tierPos = tierRank < SALES_POSITION_KEYS.length ? SALES_POSITION_KEYS[tierRank] : null;
                        const tierShort = tierPos ? SALES_POSITIONS[tierPos].short : '—';
                        const tierColor = tierPos ? SALES_POSITIONS[tierPos] : null;
                        const tierTotal = t === 'f1' ? c.f1Revenue : t === 'f2' ? c.f2Revenue : c.f3Revenue;
                        const tierCommission = t === 'f1' ? c.f1Commission : t === 'f2' ? c.f2Commission : c.f3Commission;
                        const memberCount = tierPos ? salesMembers.filter(mb => mb.position === tierPos).reduce((s, x) => s + (x.count || 1), 0) : 0;
                        return (
                          <div key={t} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{SALES_TIER_LABELS[t]}</span>
                              <span className="text-xs text-slate-500">{tierPct(t)}%</span>
                              {tierColor && (
                                <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded', tierColor.bgSoft, tierColor.text)}>
                                  {tierShort}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">{memberCount} người</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs ml-auto">
                              <span className="text-slate-500">DT <span className="font-bold text-slate-700">{fmtVND(tierTotal)}</span></span>
                              <span className="text-emerald-600 font-bold">HH {fmtVND(tierCommission)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="border border-slate-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-slate-500">Chi phí cố định</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-rose-600">{fmtVND(c.fixedCostTotal)}</span>
                        <button type="button" onClick={addFixedCost} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                          <Plus size={12} />Thêm
                        </button>
                      </div>
                    </div>
                    {fixedCosts.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Chưa có khoản chi phí cố định nào.</p>
                    ) : (
                      <div className="space-y-2">
                        {fixedCosts.map(f => (
                          <div key={f.id} className="flex items-center gap-2">
                            <CommitInput
                              placeholder="Tên chi phí (vd: thuê văn phòng)"
                              value={f.label}
                              onCommit={v => updateFixedCost(f.id, { label: v })}
                              className="flex-1"
                            />
                            <CommitInput
                              asNumber
                              step="1000"
                              placeholder="Số tiền"
                              value={f.amount || 0}
                              onCommit={v => updateFixedCost(f.id, { amount: Number(v) || 0 })}
                              className="w-40"
                            />
                            <button type="button" onClick={() => removeFixedCost(f.id)} className="text-slate-300 hover:text-rose-500 p-1.5">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </Card>
              );
            })()}

            <Card className="p-4 md:p-5">
              <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2 flex-wrap">
                <PieChartIcon size={18} className="text-indigo-600" />
                Portfolio quản lý gồm bản thân
                <span className="text-[10px] font-normal text-slate-400 normal-case">(Bán lẻ + F1/F2/F3 · {SALES_POSITIONS[salesActivePosition].short})</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3 md:p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase text-slate-500">Hàng tháng</p>
                    <span className="text-[11px] font-bold text-slate-400">T{salesMonthLabel(salesActiveMonth)}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Doanh thu</p>
                      </div>
                      <h4 className="text-base md:text-lg font-black mt-1 text-indigo-700">{fmtVND(activeC.totalRevenue)}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">BL-A {fmtVND(activeC.retailA)} · BL-B {fmtVND(activeC.retailB)}{activeC.f1Revenue > 0 ? ` · F1 ${fmtVND(activeC.f1Revenue)}` : ''}{activeC.f2Revenue > 0 ? ` · F2 ${fmtVND(activeC.f2Revenue)}` : ''}{activeC.f3Revenue > 0 ? ` · F3 ${fmtVND(activeC.f3Revenue)}` : ''}</p>
                    </div>
                    <div className="md:border-l md:border-slate-200 md:pl-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">HH + Lương</p>
                      </div>
                      <h4 className="text-base md:text-lg font-black mt-1 text-emerald-700">{fmtVND(activeC.totalCommission + activeC.baseSalary)}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">HH {fmtVND(activeC.totalCommission)}{activeC.baseSalary > 0 ? ` + Lương ${fmtVND(activeC.baseSalary)}` : ''}</p>
                    </div>
                    <div className="md:border-l md:border-slate-200 md:pl-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Chi phí</p>
                      </div>
                      <h4 className="text-base md:text-lg font-black mt-1 text-rose-600">{fmtVND(activeC.totalCost)}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">DV {fmtVND(activeC.serviceCost)} + CĐ {fmtVND(activeC.fixedCostTotal)}</p>
                    </div>
                    <div className="md:border-l md:border-slate-200 md:pl-4">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('w-2 h-2 rounded-full', activeC.profit >= 0 ? 'bg-amber-500' : 'bg-slate-700')} />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Lợi nhuận</p>
                      </div>
                      <h4 className={cn('text-base md:text-lg font-black mt-1', activeC.profit >= 0 ? 'text-amber-600' : 'text-slate-700')}>{fmtVND(activeC.profit)}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">HH+L − CP</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 md:p-4 rounded-xl bg-indigo-50/40 border border-indigo-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase text-indigo-700">Tổng cả năm</p>
                    <span className="text-[11px] font-bold text-indigo-500/70">{SALES_MONTH_COUNT} tháng</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Doanh thu</p>
                      </div>
                      <h4 className="text-base md:text-lg font-black mt-1 text-indigo-700">{fmtVND(totals.revenue)}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{SALES_MONTH_COUNT} tháng</p>
                    </div>
                    <div className="md:border-l md:border-indigo-200 md:pl-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">HH + Lương</p>
                      </div>
                      <h4 className="text-base md:text-lg font-black mt-1 text-emerald-700">{fmtVND(totals.commission + totals.base)}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">HH {fmtVND(totals.commission)} + L {fmtVND(totals.base)}</p>
                    </div>
                    <div className="md:border-l md:border-indigo-200 md:pl-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Chi phí</p>
                      </div>
                      <h4 className="text-base md:text-lg font-black mt-1 text-rose-600">{fmtVND(totals.cost)}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">DV + cố định</p>
                    </div>
                    <div className="md:border-l md:border-indigo-200 md:pl-4">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('w-2 h-2 rounded-full', totals.profit >= 0 ? 'bg-amber-500' : 'bg-slate-700')} />
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Lợi nhuận</p>
                      </div>
                      <h4 className={cn('text-base md:text-lg font-black mt-1', totals.profit >= 0 ? 'text-amber-600' : 'text-slate-700')}>{fmtVND(totals.profit)}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">HH+L − CP</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        );
      })()}
    </motion.div>
  );
}