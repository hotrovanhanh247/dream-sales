'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, Package, Users, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { get, fmtVND, RANK_LABELS } from '@/lib/api';

interface Dashboard {
  currentRevenue: number; currentCombos: number; lastRevenue: number; revenueGrowth: string;
  totalCustomers: number; teamSize: number; rank: string;
  commission: {
    selfCommission: number; directCommission: number; indirect2Commission: number;
    indirect3Commission: number; fixedSalary: number; totalIncome: number;
  };
  chartData: { month: string; revenue: number; combos: number }[];
  kpi: { maintenance: { requirements: Req[] }; promotion: { targetRank: string; requirements: Req[]; note?: string } | null };
}
interface Req { label: string; current: number; target: number }

function Stat({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Icon size={16} /> {label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

function ReqBar({ r }: { r: Req }) {
  const pct = Math.min(100, Math.round((r.current / r.target) * 100));
  const ok = r.current >= r.target;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{r.label}</span>
        <span className={ok ? 'text-emerald-600 font-medium' : 'text-slate-500'}>{r.current}/{r.target}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${ok ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [d, setD] = useState<Dashboard | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => { get<Dashboard>('/api/ctv/dashboard').then(setD).catch(e => setErr(e.message)); }, []);

  if (err) return <div className="text-rose-600">{err}</div>;
  if (!d) return <div className="text-slate-400">Đang tải…</div>;

  const c = d.commission;
  const rows = [
    ['Hoa hồng bán cá nhân', c.selfCommission],
    ['Hoa hồng F1 (trực tiếp)', c.directCommission],
    ['Hoa hồng F2 (gián tiếp)', c.indirect2Commission],
    ['Hoa hồng F3 (gián tiếp)', c.indirect3Commission],
    ['Lương cứng', c.fixedSalary],
  ] as [string, number][];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <p className="text-slate-500 text-sm">Hạng hiện tại: <b>{RANK_LABELS[d.rank] || d.rank}</b></p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={TrendingUp} label="Doanh thu tháng" value={fmtVND(d.currentRevenue)} sub={`Tăng trưởng ${d.revenueGrowth}%`} />
        <Stat icon={Package} label="Combo tháng" value={d.currentCombos} />
        <Stat icon={Users} label="Nhóm trực tiếp" value={d.teamSize} />
        <Stat icon={UserCheck} label="Khách hàng" value={d.totalCustomers} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold mb-4">Thu nhập tháng này</h2>
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([label, val]) => (
                <tr key={label} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 text-slate-600">{label}</td>
                  <td className="py-2 text-right font-medium">{fmtVND(val)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200">
                <td className="py-2 font-bold">Tổng thu nhập</td>
                <td className="py-2 text-right font-bold text-indigo-600">{fmtVND(c.totalIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold mb-4">Doanh thu 6 tháng</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(m) => m.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1_000_000}tr`} width={40} />
              <Tooltip formatter={(v: any) => fmtVND(Number(v))} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold mb-4">Duy trì hạng</h2>
          <div className="space-y-3">
            {d.kpi.maintenance.requirements.length === 0
              ? <p className="text-sm text-slate-400">Không có yêu cầu duy trì.</p>
              : d.kpi.maintenance.requirements.map((r, i) => <ReqBar key={i} r={r} />)}
          </div>
        </div>
        {d.kpi.promotion && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-bold mb-1">Thăng hạng → {RANK_LABELS[d.kpi.promotion.targetRank] || d.kpi.promotion.targetRank}</h2>
            {d.kpi.promotion.note && <p className="text-xs text-amber-600 mb-3">{d.kpi.promotion.note}</p>}
            <div className="space-y-3">
              {d.kpi.promotion.requirements.map((r, i) => <ReqBar key={i} r={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
