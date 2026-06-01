'use client';
import { useEffect, useState } from 'react';
import { get, post, patch, RANK_LABELS } from '@/lib/api';

interface Ctv {
  id: number; email: string; name: string; phone?: string; rank: string;
  parentId: number | null; isActive: boolean; isBusinessHousehold: boolean;
}
const RANKS = ['CTV', 'PP', 'TP', 'GDV', 'GDKD'];

export default function AdminCtvPage() {
  const [ctvs, setCtvs] = useState<Ctv[]>([]);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ email: '', name: '', phone: '', password: '', rank: 'CTV', parentId: '' });
  const [busy, setBusy] = useState(false);

  const load = () => get<{ ctvs: Ctv[] }>('/api/admin/ctv').then(r => setCtvs(r.ctvs)).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      await post('/api/admin/ctv', {
        email: form.email, name: form.name, phone: form.phone, password: form.password,
        rank: form.rank, parentId: form.parentId ? Number(form.parentId) : null,
      });
      setForm({ email: '', name: '', phone: '', password: '', rank: 'CTV', parentId: '' });
      load();
    } catch (e: any) { setErr(e?.details?.join(', ') || e.message); }
    finally { setBusy(false); }
  };

  const changeRank = async (id: number, newRank: string) => {
    await patch(`/api/admin/ctv/${id}/rank`, { newRank }).then(load).catch(e => setErr(e.message));
  };
  const toggle = async (id: number) => {
    await patch(`/api/admin/ctv/${id}/toggle-active`).then(load).catch(e => setErr(e.message));
  };

  const nameOf = (id: number | null) => ctvs.find(c => c.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý CTV</h1>
      {err && <div className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 text-sm">{err}</div>}

      <form onSubmit={create} className="bg-white rounded-2xl border border-slate-200 p-5 grid md:grid-cols-3 gap-3">
        <h2 className="font-bold md:col-span-3">Thêm CTV mới</h2>
        <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input className="input" placeholder="Họ tên" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="SĐT" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <input className="input" type="password" placeholder="Mật khẩu (≥8)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <select className="input" value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })}>
          {RANKS.map(r => <option key={r} value={r}>{RANK_LABELS[r]}</option>)}
        </select>
        <select className="input" value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })}>
          <option value="">— Không có cấp trên —</option>
          {ctvs.map(c => <option key={c.id} value={c.id}>{c.name} ({c.rank})</option>)}
        </select>
        <button disabled={busy} className="md:col-span-3 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">
          {busy ? 'Đang tạo…' : 'Tạo CTV'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="py-2 font-medium">Tên</th><th className="py-2 font-medium">Email</th>
              <th className="py-2 font-medium">Cấp trên</th><th className="py-2 font-medium">Hạng</th>
              <th className="py-2 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {ctvs.map(c => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0">
                <td className="py-2 font-medium">{c.name}</td>
                <td className="py-2 text-slate-500">{c.email}</td>
                <td className="py-2 text-slate-500">{nameOf(c.parentId)}</td>
                <td className="py-2">
                  <select value={c.rank} onChange={e => changeRank(c.id, e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-xs">
                    {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="py-2">
                  <button onClick={() => toggle(c.id)} className={`text-xs px-2 py-1 rounded-lg ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {c.isActive ? 'Hoạt động' : 'Đã khoá'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
