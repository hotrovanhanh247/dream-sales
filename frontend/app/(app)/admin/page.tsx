'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, Package, Users, UserCheck } from 'lucide-react';
import { get, fmtVND, RANK_LABELS } from '@/lib/api';

interface AdminDash {
  month: string;
  ctvByRank: { rank: string; count: number }[];
  totalCtv: number; activeCtv: number; monthRevenue: number; monthCombos: number;
  salaryFund: { ctvRevenue: number; salaryFundCap: number; totalFixedSalary: number; usagePercent: number; warning: string };
}

const WARN_COLOR: Record<string, string> = { OK: 'text-emerald-600', WARNING: 'text-amber-600', CRITICAL: 'text-rose-600' };

export default function AdminDashboard() {
  const [d, setD] = useState<AdminDash | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { get<AdminDash>('/api/admin/dashboard').then(setD).catch(e => setErr(e.message)); }, []);

  if (err) return <div className="text-rose-600">{err}</div>;
  if (!d) return <div className="text-slate-400">Đang tải…</div>;

  const sf = d.salaryFund;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Tổng quan quản trị</h1><p className="text-slate-500 text-sm">Tháng {d.month}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={TrendingUp} label="Doanh thu CTV" value={fmtVND(d.monthRevenue)} />
        <Stat icon={Package} label="Combo tháng" value={d.monthCombos} />
        <Stat icon={Users} label="Tổng CTV" value={d.totalCtv} />
        <Stat icon={UserCheck} label="CTV hoạt động" value={d.activeCtv} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold mb-4">CTV theo hạng</h2>
          <div className="space-y-2">
            {d.ctvByRank.map(r => (
              <div key={r.rank} className="flex justify-between text-sm border-b border-slate-100 last:border-0 py-1.5">
                <span className="text-slate-600">{RANK_LABELS[r.rank] || r.rank}</span>
                <span className="font-medium">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold mb-4">Quỹ lương cứng (≤ 5% doanh thu)</h2>
          <div className="space-y-2 text-sm">
            <Row label="Trần quỹ lương (5%)" value={fmtVND(sf.salaryFundCap)} />
            <Row label="Tổng lương cứng" value={fmtVND(sf.totalFixedSalary)} />
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="font-bold">Sử dụng</span>
              <span className={`font-bold ${WARN_COLOR[sf.warning]}`}>{sf.usagePercent}% · {sf.warning}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Icon size={16} /> {label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-600">{label}</span><span className="font-medium">{value}</span></div>;
}
