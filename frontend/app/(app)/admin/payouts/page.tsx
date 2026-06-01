'use client';
import { useEffect, useState, useCallback } from 'react';
import { Coins, Play } from 'lucide-react';
import { get, post, fmtVND } from '@/lib/api';

interface MgmtRec { id: number; level: number; amount: string; fromUser: { name: string; rank: string }; toUser: { name: string; rank: string } }
interface BrkLog { id: number; status: string; breakawayAt: string; user: { name: string; rank: string }; oldParent: { name: string }; newParent: { name: string } }

export default function PayoutsPage() {
  const [mgmt, setMgmt] = useState<MgmtRec[]>([]);
  const [logs, setLogs] = useState<BrkLog[]>([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    get<{ records: MgmtRec[] }>('/api/admin/management-fees').then(r => setMgmt(r.records)).catch(e => setErr(e.message));
    get<{ logs: BrkLog[] }>('/api/admin/breakaway/logs').then(r => setLogs(r.logs)).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (path: string, label: string) => {
    setMsg(''); setErr('');
    try { const r = await post<{ created: number }>(path); setMsg(`${label}: tạo ${r.created} bản ghi.`); load(); }
    catch (e: any) { setErr(e.message); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Chi trả</h1><p className="text-slate-500 text-sm">Chạy tính phí quản lý & phí thoát ly theo tháng (idempotent).</p></div>
      {msg && <div className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{msg}</div>}
      {err && <div className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 text-sm">{err}</div>}

      <div className="flex gap-3 flex-wrap">
        <button onClick={() => run('/api/admin/management-fees/run', 'Phí quản lý')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700">
          <Play size={16} /> Chạy phí quản lý (F1/F2/F3)
        </button>
        <button onClick={() => run('/api/admin/breakaway/fees/run', 'Phí thoát ly')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700">
          <Play size={16} /> Chạy phí thoát ly
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 overflow-x-auto">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Coins size={18} /> Phí quản lý tháng này</h2>
        {mgmt.length === 0 ? <p className="text-sm text-slate-400 italic">Chưa có bản ghi — bấm “Chạy phí quản lý”.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="py-2 font-medium">Từ (cấp dưới)</th><th className="py-2 font-medium">Đến (cấp trên)</th>
              <th className="py-2 font-medium">Cấp</th><th className="py-2 font-medium text-right">Số tiền</th>
            </tr></thead>
            <tbody>
              {mgmt.map(r => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2">{r.fromUser.name} <span className="text-xs text-slate-400">({r.fromUser.rank})</span></td>
                  <td className="py-2">{r.toUser.name} <span className="text-xs text-slate-400">({r.toUser.rank})</span></td>
                  <td className="py-2">F{r.level}</td>
                  <td className="py-2 text-right font-medium">{fmtVND(Number(r.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 overflow-x-auto">
        <h2 className="font-bold mb-4">Nhật ký thoát ly</h2>
        {logs.length === 0 ? <p className="text-sm text-slate-400 italic">Chưa có ai thoát ly.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="py-2 font-medium">CTV</th><th className="py-2 font-medium">Cấp trên cũ</th>
              <th className="py-2 font-medium">Cấp trên mới</th><th className="py-2 font-medium">Trạng thái</th>
            </tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2">{l.user.name} <span className="text-xs text-slate-400">({l.user.rank})</span></td>
                  <td className="py-2 text-slate-500">{l.oldParent.name}</td>
                  <td className="py-2 text-slate-500">{l.newParent.name}</td>
                  <td className="py-2"><span className={`text-xs px-2 py-1 rounded-lg ${l.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
