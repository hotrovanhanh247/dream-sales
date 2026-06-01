'use client';
import { useEffect, useState } from 'react';
import { get, fmtVND } from '@/lib/api';

interface MgmtResp {
  month: string;
  summary: { f1: number; f2: number; f3: number; total: number };
  records: { id: number; level: number; amount: string; fromUser: { name: string; rank: string } }[];
}
interface BrkResp {
  month: string; eligible: boolean;
  summary: { level1: number; level2: number; level3: number; total: number };
  records: { id: number; level: number; amount: string; fromUser: { name: string; rank: string } }[];
}

export default function FeesPage() {
  const [mgmt, setMgmt] = useState<MgmtResp | null>(null);
  const [brk, setBrk] = useState<BrkResp | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    get<MgmtResp>('/api/ctv/management-fees').then(setMgmt).catch(e => setErr(e.message));
    get<BrkResp>('/api/ctv/breakaway-fees').then(setBrk).catch(() => {});
  }, []);

  if (err) return <div className="text-rose-600">{err}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Phí quản lý & thoát ly</h1>
        <p className="text-slate-500 text-sm">Các khoản CCB Mart chi trả cho cấp trên trong tháng.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Phí quản lý nhóm (F1/F2/F3)</h2>
          <span className="text-sm text-slate-400">{mgmt?.month}</span>
        </div>
        {!mgmt ? <p className="text-slate-400 text-sm">Đang tải…</p> : (
          <>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[['F1 (10%)', mgmt.summary.f1], ['F2 (5%)', mgmt.summary.f2], ['F3 (3%)', mgmt.summary.f3], ['Tổng', mgmt.summary.total]].map(([l, v]) => (
                <div key={l as string} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="text-xs text-slate-400">{l}</div>
                  <div className="font-bold">{fmtVND(v as number)}</div>
                </div>
              ))}
            </div>
            {mgmt.records.length === 0
              ? <p className="text-sm text-slate-400 italic">Chưa có phí quản lý tháng này.</p>
              : <FeeTable rows={mgmt.records} />}
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Phí thoát ly (giai đoạn 1)</h2>
          <span className="text-sm text-slate-400">{brk?.month}</span>
        </div>
        {!brk ? <p className="text-slate-400 text-sm">Đang tải…</p> : !brk.eligible ? (
          <p className="text-sm text-slate-400 italic">Bạn chưa thuộc diện nhận phí thoát ly.</p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[['Cấp 1', brk.summary.level1], ['Cấp 2', brk.summary.level2], ['Cấp 3', brk.summary.level3], ['Tổng', brk.summary.total]].map(([l, v]) => (
                <div key={l as string} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="text-xs text-slate-400">{l}</div>
                  <div className="font-bold">{fmtVND(v as number)}</div>
                </div>
              ))}
            </div>
            {brk.records.length === 0
              ? <p className="text-sm text-slate-400 italic">Chưa có phí thoát ly tháng này.</p>
              : <FeeTable rows={brk.records} />}
          </>
        )}
      </div>
    </div>
  );
}

function FeeTable({ rows }: { rows: { id: number; level: number; amount: string; fromUser: { name: string; rank: string } }[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-slate-400 border-b border-slate-100">
          <th className="py-2 font-medium">Từ</th><th className="py-2 font-medium">Cấp</th><th className="py-2 font-medium text-right">Số tiền</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id} className="border-b border-slate-50 last:border-0">
            <td className="py-2">{r.fromUser.name} <span className="text-xs text-slate-400">({r.fromUser.rank})</span></td>
            <td className="py-2">F{r.level}</td>
            <td className="py-2 text-right font-medium">{fmtVND(Number(r.amount))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
