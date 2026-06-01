'use client';
import { useEffect, useState } from 'react';
import { get, fmtVND, RANK_LABELS } from '@/lib/api';

interface Cfg { id: number; tier: string; selfSalePct: string; directPct: string; indirect2Pct: string; indirect3Pct: string; fixedSalary: string }
interface ReportRow {
  ctvId: number; name: string; rank: string;
  selfCommission: number; directCommission: number; indirect2Commission: number;
  indirect3Commission: number; fixedSalary: number; totalIncome: number;
}

const pct = (s: string) => `${(Number(s) * 100).toFixed(0)}%`;

export default function CommissionPage() {
  const [cfg, setCfg] = useState<Cfg[]>([]);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    get<{ ctvConfig: Cfg[] }>('/api/admin/config/commission').then(r => setCfg(r.ctvConfig)).catch(e => setErr(e.message));
    get<{ rows: ReportRow[] }>('/api/admin/commission/report').then(r => setRows(r.rows)).catch(e => setErr(e.message));
  }, []);

  const order = ['CTV', 'PP', 'TP', 'GDV', 'GDKD'];
  const sortedCfg = [...cfg].sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cấu hình hoa hồng</h1>
      {err && <div className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 text-sm">{err}</div>}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 overflow-x-auto">
        <h2 className="font-bold mb-4">Tỷ lệ theo hạng</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="py-2 font-medium">Hạng</th><th className="py-2 font-medium">Bán cá nhân</th>
              <th className="py-2 font-medium">F1</th><th className="py-2 font-medium">F2</th>
              <th className="py-2 font-medium">F3</th><th className="py-2 font-medium text-right">Lương cứng</th>
            </tr>
          </thead>
          <tbody>
            {sortedCfg.map(c => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0">
                <td className="py-2 font-medium">{RANK_LABELS[c.tier] || c.tier}</td>
                <td className="py-2">{pct(c.selfSalePct)}</td>
                <td className="py-2">{pct(c.directPct)}</td>
                <td className="py-2">{pct(c.indirect2Pct)}</td>
                <td className="py-2">{pct(c.indirect3Pct)}</td>
                <td className="py-2 text-right">{fmtVND(Number(c.fixedSalary))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 overflow-x-auto">
        <h2 className="font-bold mb-4">Báo cáo hoa hồng tháng này</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="py-2 font-medium">CTV</th><th className="py-2 font-medium">Hạng</th>
              <th className="py-2 font-medium text-right">Bán</th><th className="py-2 font-medium text-right">F1</th>
              <th className="py-2 font-medium text-right">F2</th><th className="py-2 font-medium text-right">F3</th>
              <th className="py-2 font-medium text-right">Lương</th><th className="py-2 font-medium text-right">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.ctvId} className="border-b border-slate-50 last:border-0">
                <td className="py-2 font-medium">{r.name}</td>
                <td className="py-2">{r.rank}</td>
                <td className="py-2 text-right">{fmtVND(r.selfCommission)}</td>
                <td className="py-2 text-right">{fmtVND(r.directCommission)}</td>
                <td className="py-2 text-right">{fmtVND(r.indirect2Commission)}</td>
                <td className="py-2 text-right">{fmtVND(r.indirect3Commission)}</td>
                <td className="py-2 text-right">{fmtVND(r.fixedSalary)}</td>
                <td className="py-2 text-right font-bold text-indigo-600">{fmtVND(r.totalIncome)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
